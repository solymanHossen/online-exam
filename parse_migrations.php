<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

$tables = [];

// Quick parsing of migrations for explicit types
foreach (glob('database/migrations/*.php') as $file) {
    $content = file_get_contents($file);
    // Find schema creation
    if (preg_match('/Schema::create\(\'([a-z_]+)\'/', $content, $m)) {
        $table = $m[1];
        if (!isset($tables[$table])) $tables[$table] = [];
        preg_match_all('/\$table->([a-zA-Z0-9_]+)\(\'([a-zA-Z0-9_]+)\'/', $content, $colMatches, PREG_SET_ORDER);
        foreach ($colMatches as $col) {
            $tables[$table][$col[2]] = $col[1];
        }
    }
}

$results = [];
foreach (glob('app/Models/*.php') as $file) {
    $className = 'App\\Models\\' . basename($file, '.php');
    if (!class_exists($className)) continue;
    $ref = new ReflectionClass($className);
    if ($ref->isAbstract()) continue;
    $model = new $className;
    $table = $model->getTable();
    
    $casts = $model->getCasts();
    
    if (isset($tables[$table])) {
        foreach ($tables[$table] as $col => $type) {
            $isMissing = false;
            if ($type === 'boolean' && (!isset($casts[$col]) || $casts[$col] !== 'boolean')) $isMissing = 'boolean';
            if ($type === 'json' && !isset($casts[$col])) $isMissing = 'array/json'; // laravel casts to array
            if ($type === 'date' && !isset($casts[$col])) $isMissing = 'date';
            if (($type === 'timestamp' || $type === 'dateTime') && !isset($casts[$col]) && !in_array($col, ['created_at', 'updated_at', 'deleted_at'])) $isMissing = 'datetime';
            
            if ($isMissing) {
                $results[$className][] = "Missing cast for $type column '$col' (expected: $isMissing)";
            }
        }
    }
}
echo json_encode($results, JSON_PRETTY_PRINT);
