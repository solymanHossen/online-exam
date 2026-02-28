<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
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
    public function processDatabase(Request $request)
    {
        $request->validate([
            'db_host' => 'required|string',
            'db_port' => 'required|numeric',
            'db_database' => 'required|string',
            'db_username' => 'required|string',
            'db_password' => 'nullable|string',
        ]);

        // Attempt Connection securely
        try {
            DB::purge();
            config(['database.connections.mysql.host' => $request->db_host]);
            config(['database.connections.mysql.port' => $request->db_port]);
            config(['database.connections.mysql.database' => $request->db_database]);
            config(['database.connections.mysql.username' => $request->db_username]);
            config(['database.connections.mysql.password' => $request->db_password]);

            DB::connection('mysql')->getPdo();

            // Overwrite ENV file securely
            $this->setEnvFile([
                'DB_CONNECTION' => 'mysql',
                'DB_HOST' => $request->db_host,
                'DB_PORT' => $request->db_port,
                'DB_DATABASE' => $request->db_database,
                'DB_USERNAME' => $request->db_username,
                'DB_PASSWORD' => $request->db_password ?? '',
            ]);

            return redirect()->route('install.migrations');

        } catch (\Exception $e) {
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
    public function processAdmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            // Re-purge DB cache to ensure the models know we migrated
            DB::purge();

            // Delete previously seeded users to give them a clean instance
            User::truncate();

            $adminRole = Role::firstOrCreate(['name' => 'admin', 'display_name' => 'Administrator']);

            $user = User::create([
                'role_id' => $adminRole->id,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(),
            ]);

            // Create Installed file
            file_put_contents(storage_path('installed'), 'installed at ' . date('Y-m-d H:i:s'));

            try {
                Artisan::call('storage:link');
                return redirect()->route('install.complete')->with('success', 'Installation completed successfully.');
            } catch (\Exception $e) {
                return redirect()->route('install.complete')->with('warning', 'Installation successful, but could not create storage symlink. If images do not load, please run "php artisan storage:link" manually or use the System Utilities -> Link Storage menu.');
            }

        } catch (\Exception $e) {
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
    protected function setEnvFile($data)
    {
        $path = base_path('.env');

        if (!File::exists($path)) {
            File::copy(base_path('.env.example'), $path);
        }

        $envFile = file_get_contents($path);

        foreach ($data as $key => $value) {
            // Remove the old entry
            $envFile = preg_replace("/^{$key}=.*/m", "{$key}={$value}", $envFile);

            // Add it if it wasn't replaced (meaning it didn't exist)
            if (strpos($envFile, "{$key}={$value}") === false) {
                $envFile .= "\n{$key}={$value}";
            }
        }

        file_put_contents($path, $envFile);
    }
}
