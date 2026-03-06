<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$models = scandir('app/Models');
$discrepancies = [];

foreach ($models as $file) {
    if ($file === '.' || $file === '..') continue;
    
    $modelClass = 'App\\Models\\' . str_replace('.php', '', $file);
    if (!class_exists($modelClass)) continue;
    
    $ref = new ReflectionClass($modelClass);
    if ($ref->isAbstract()) continue;
    
    $model = new $modelClass();
    $table = $model->getTable();
    $columns = Illuminate\Support\Facades\Schema::getColumnListing($table);
    
    if (empty($columns)) {
        $discrepancies[$modelClass][] = "Table '$table' does not exist or has no columns.";
        continue;
    }

    $fillable = $model->getFillable();
    $guarded = $model->getGuarded();
    
    // 1. Fillable missing or extra
    $ignoreCols = ['id', 'created_at', 'updated_at', 'deleted_at', 'remember_token'];
    $expectedFillable = array_diff($columns, $ignoreCols);
    if ($model->getKeyName() !== 'id') {
        $expectedFillable = array_diff($expectedFillable, [$model->getKeyName()]);
    }
    
    // Compare fillable
    $extraFillable = array_diff($fillable, $columns);
    if (!empty($extraFillable)) {
        $discrepancies[$modelClass][] = "Extra \$fillable fields (not in table): " . implode(', ', $extraFillable);
    }
    
    $missingFillable = array_diff($expectedFillable, $fillable);
    // If empty fillable and guarded = ['*'], they are not using fillable
    if (empty($fillable) && $guarded === ['*']) {
        $discrepancies[$modelClass][] = "No \$fillable defined. Missing: " . implode(', ', $missingFillable);
    } elseif (!empty($fillable)) {
        // Some columns might be foreign keys or defaults they don't want mass assignable, but let's note them
        if (!empty($missingFillable)) {
            $discrepancies[$modelClass][] = "Missing \$fillable fields (exist in table): " . implode(', ', $missingFillable);
        }
    }

    // 2. Casts
    $casts = $model->getCasts();
    // basic check: look at DB types
    foreach ($columns as $col) {
        $type = Illuminate\Support\Facades\Schema::getColumnType($table, $col);
        if ($type === 'json' && !array_key_exists($col, $casts)) {
            $discrepancies[$modelClass][] = "Missing cast for JSON column '$col'";
        }
        if ($type === 'boolean' && !array_key_exists($col, $casts)) {
            $discrepancies[$modelClass][] = "Missing cast for boolean column '$col'";
        }
        if (in_array($type, ['date', 'datetime']) && !in_array($col, ['created_at', 'updated_at', 'deleted_at']) && !array_key_exists($col, $casts)) {
            $discrepancies[$modelClass][] = "Missing cast for date/datetime column '$col'";
        }
    }

    // Check invalid casts (casting fields that dont exist)
    foreach (array_keys($casts) as $castCol) {
        if (!in_array($castCol, $columns) && $castCol !== 'id' && !str_contains($castCol, '->')) { // not a model accessor / virtual? and not column?
            // Actually it could be accessor or relation, but strict check:
             $discrepancies[$modelClass][] = "Cast defined for non-existent table column: '$castCol'";
        }
    }

    // 3. Relationships check
    $methods = $ref->getMethods(ReflectionMethod::IS_PUBLIC);
    foreach ($methods as $method) {
        if ($method->class !== $modelClass) continue;
        if ($method->getNumberOfParameters() > 0) continue;
        
        try {
            $ret = $method->invoke($model);
            if ($ret instanceof Illuminate\Database\Eloquent\Relations\BelongsTo) {
                $fk = $ret->getForeignKeyName();
                if (!in_array($fk, $columns)) {
                    $discrepancies[$modelClass][] = "BelongsTo relationship '{$method->name}()' relies on missing foreign key '$fk'";
                }
            } elseif ($ret instanceof Illuminate\Database\Eloquent\Relations\HasMany || $ret instanceof Illuminate\Database\Eloquent\Relations\HasOne) {
                // To check HasMany/HasOne properly, we need the related table schema
                $relTable = $ret->getRelated()->getTable();
                $fk = $ret->getForeignKeyName();
                $relCols = Illuminate\Support\Facades\Schema::getColumnListing($relTable);
                // The related table should contain the foreign key. But what if $relTable doesn't exist yet in loop? 
                if (!empty($relCols) && !in_array($fk, $relCols)) {
                    $discrepancies[$modelClass][] = "HasMany/HasOne relationship '{$method->name}()' relies on missing foreign key '$fk' in table '$relTable'";
                }
            }
        } catch (\Exception $e) {
            // ignore
        }
    }

    // 4. SoftDeletes
    $usesSoftDeletes = in_array('Illuminate\Database\Eloquent\SoftDeletes', class_uses_recursive($modelClass));
    $hasDeletedAt = in_array('deleted_at', $columns);
    
    if ($usesSoftDeletes && !$hasDeletedAt) {
        $discrepancies[$modelClass][] = "Model uses SoftDeletes trait, but 'deleted_at' column is missing in migration/table.";
    } elseif (!$usesSoftDeletes && $hasDeletedAt) {
        $discrepancies[$modelClass][] = "Table has 'deleted_at' column, but Model is missing SoftDeletes trait.";
    }
}

echo json_encode($discrepancies, JSON_PRETTY_PRINT);
