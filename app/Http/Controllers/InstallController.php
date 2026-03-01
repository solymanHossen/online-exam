<?php

namespace App\Http\Controllers;

use App\Http\Requests\Install\ProcessAdminRequest;
use App\Http\Requests\Install\ProcessDatabaseRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class InstallController extends Controller
{
    /**
     * Step 1: Welcome
     */
    public function welcome()
    {
        return Inertia::render('Install/Welcome');
    }

    /**
     * Step 2: System Requirements
     */
    public function requirements()
    {
        $requirements = [
            'PHP >= 8.2' => version_compare(PHP_VERSION, '8.2.0', '>='),
            'OpenSSL' => extension_loaded('openssl'),
            'PDO' => extension_loaded('pdo'),
            'Mbstring' => extension_loaded('mbstring'),
            'Tokenizer' => extension_loaded('tokenizer'),
            'XML' => extension_loaded('xml'),
            'Ctype' => extension_loaded('ctype'),
            'JSON' => extension_loaded('json'),
            'BCMath' => extension_loaded('bcmath'),
            'cURL' => extension_loaded('curl'),
        ];

        $allPassed = !in_array(false, array_values($requirements), true);

        return Inertia::render('Install/Requirements', [
            'requirements' => $requirements,
            'allPassed' => $allPassed,
        ]);
    }

    /**
     * Step 3: Directory Permissions
     */
    public function permissions()
    {
        $permissions = [
            'storage/app/' => is_writable(storage_path('app')),
            'storage/framework/' => is_writable(storage_path('framework')),
            'storage/logs/' => is_writable(storage_path('logs')),
            'bootstrap/cache/' => is_writable(base_path('bootstrap/cache')),
            '.env' => is_writable(base_path('.env')),
        ];

        $allPassed = !in_array(false, array_values($permissions), true);

        return Inertia::render('Install/Permissions', [
            'permissions' => $permissions,
            'allPassed' => $allPassed,
        ]);
    }

    /**
     * Step 4: Database Settings (View)
     */
    public function database()
    {
        return Inertia::render('Install/Database');
    }

    /**
     * Process Database configuration
     */
    public function processDatabase(ProcessDatabaseRequest $request)
    {
        $validated = $request->validated();

        // Attempt Connection securely
        try {
            DB::purge();
            config(['database.connections.mysql.host' => $validated['db_host']]);
            config(['database.connections.mysql.port' => $validated['db_port']]);
            config(['database.connections.mysql.database' => $validated['db_database']]);
            config(['database.connections.mysql.username' => $validated['db_username']]);
            config(['database.connections.mysql.password' => $validated['db_password'] ?? null]);

            DB::connection('mysql')->getPdo();

            // Overwrite ENV file securely
            $envWrite = $this->setEnvFile([
                'DB_CONNECTION' => 'mysql',
                'DB_HOST' => $validated['db_host'],
                'DB_PORT' => (string) $validated['db_port'],
                'DB_DATABASE' => $validated['db_database'],
                'DB_USERNAME' => $validated['db_username'],
                'DB_PASSWORD' => $validated['db_password'] ?? '',
            ]);

            if (!$envWrite['success']) {
                return back()
                    ->withInput()
                    ->withErrors(['env' => $envWrite['message']]);
            }

            return redirect()->route('install.migrations');

        } catch (\Throwable $e) {
            return back()->withErrors(['connection' => 'Could not connect to the database. Please check your configuration. Error: ' . $e->getMessage()]);
        }
    }

    /**
     * Step 5: Run Migrations (View)
     */
    public function migrations()
    {
        return Inertia::render('Install/Migrations');
    }

    /**
     * Execute Migrations
     */
    public function runMigrations()
    {
        try {
            Artisan::call('migrate:fresh', ['--force' => true]);
            Artisan::call('db:seed', ['--force' => true]);

            return redirect()->route('install.admin');
        } catch (\Exception $e) {
            return back()->withErrors(['migration' => 'Failed to migrate database: ' . $e->getMessage()]);
        }
    }

    /**
     * Step 6: Admin Setup (View)
     */
    public function admin()
    {
        return Inertia::render('Install/Admin');
    }

    /**
     * Process Admin Creation
     */
    public function processAdmin(ProcessAdminRequest $request)
    {
        $validated = $request->validated();

        try {
            // Re-purge DB cache to ensure the models know we migrated
            DB::purge();

            // Delete previously seeded users to give them a clean instance
            User::truncate();

            $adminRole = Role::firstOrCreate(['name' => 'admin']);

            $user = User::create([
                'role_id' => $adminRole->id,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            // Create Installed file
            file_put_contents(storage_path('installed'), 'installed at ' . date('Y-m-d H:i:s'));

            try {
                Artisan::call('storage:link');
                return redirect()->route('install.complete')->with('success', 'Installation completed successfully.');
            } catch (\Throwable $e) {
                $message = strtolower($e->getMessage());
                $isSymlinkRestricted = str_contains($message, 'symlink')
                    || str_contains($message, 'disabled')
                    || str_contains($message, 'not permitted')
                    || str_contains($message, 'operation not permitted');

                if ($isSymlinkRestricted) {
                    return redirect()->route('install.complete')->with('warning', 'Installation successful, but this hosting environment restricts symlink creation. If media files are not accessible, contact your host for a public storage mapping workaround.');
                }

                return redirect()->route('install.complete')->with('warning', 'Installation successful, but automatic storage linking failed. Please run "php artisan storage:link" manually when possible.');
            }

        } catch (\Throwable $e) {
            return back()->withErrors(['admin' => 'Failed to create admin: ' . $e->getMessage()]);
        }
    }

    /**
     * Final Step: Complete
     */
    public function complete()
    {
        return Inertia::render('Install/Complete');
    }

    /**
     * Environment Manipulation Utility
     */
    protected function setEnvFile(array $data): array
    {
        $path = base_path('.env');
        $manualInstructions = 'Automatic .env update failed due to hosting restrictions. Please update your .env manually with the database values from this step and ensure the .env file is writable (typically 0644).';

        if (!File::exists($path) && !File::copy(base_path('.env.example'), $path)) {
            return [
                'success' => false,
                'message' => $manualInstructions,
            ];
        }

        if (!is_writable($path)) {
            return [
                'success' => false,
                'message' => $manualInstructions,
            ];
        }

        $envFile = file_get_contents($path);

        if ($envFile === false) {
            return [
                'success' => false,
                'message' => $manualInstructions,
            ];
        }

        foreach ($data as $key => $value) {
            $normalizedValue = str_replace(["\r", "\n"], '', (string) $value);
            $pattern = '/^' . preg_quote($key, '/') . '=.*/m';

            // Remove the old entry
            $envFile = preg_replace($pattern, "{$key}={$normalizedValue}", $envFile);

            // Add it if it wasn't replaced (meaning it didn't exist)
            if (strpos($envFile, "{$key}={$normalizedValue}") === false) {
                $envFile .= "\n{$key}={$normalizedValue}";
            }
        }

        if (file_put_contents($path, $envFile) === false) {
            return [
                'success' => false,
                'message' => $manualInstructions,
            ];
        }

        return [
            'success' => true,
            'message' => 'Environment file updated successfully.',
        ];
    }
}
