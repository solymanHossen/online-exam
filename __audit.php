<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$modelsPath = app_path('Models');
$models = array_diff(scandir($modelsPath), ['.', '..']);

foreach ($models as $modelFile) {
    if (pathinfo($modelFile, PATHINFO_EXTENSION) !== 'php') continue;
    
    $className = "App\\Models\\" . basename($modelFile, '.php');
    if (!class_exists($className)) continue;
    
    $model = new $className();
    $table = $model->getTable();
    
    echo "Model: $className\n";
    echo "Table: $table\n";
    
    try {
        $columns = Illuminate\Support\Facades\Schema::getColumnListing($table);
        echo "DB Columns: " . implode(', ', $columns) . "\n";
    } catch (\Exception $e) {
        echo "No DB table found or DB not connected.\n";
    }
    
    echo "Fillable: " . implode(', ', $model->getFillable()) . "\n";
    echo "Casts: " . json_encode($model->getCasts()) . "\n";
    
    $traits = class_uses_recursive($className);
    echo "SoftDeletes: " . (in_array("Illuminate\\Database\\Eloquent\\SoftDeletes", $traits) ? 'Yes' : 'No') . "\n";
    
    echo "\n";
}
