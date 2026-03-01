<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Services\EnvironmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Inertia\Inertia;
use Inertia\Response;

class SystemUtilityController extends Controller
{
    protected EnvironmentService $environmentService;

    public function __construct(EnvironmentService $environmentService)
    {
        $this->environmentService = $environmentService;
    }

    /**
     * Render the UI for System Utilities
     */
    public function index(): Response
    {
        return Inertia::render('Admin/Settings/SystemUtilities', [
            'queueConnection' => config('queue.default', 'sync'),
            'appDebug' => config('app.debug', false),
        ]);
    }

    /**
     * Create the storage symlink (critical for cPanel shared hosting without SSH)
     */
    public function linkStorage(): JsonResponse
    {
        try {
            Artisan::call('storage:link');

            return response()->json(['message' => 'Storage link created successfully.']);
        } catch (\Throwable $e) {
            $message = strtolower($e->getMessage());
            $isSymlinkRestricted = str_contains($message, 'symlink')
                || str_contains($message, 'disabled')
                || str_contains($message, 'not permitted')
                || str_contains($message, 'operation not permitted');

            if ($isSymlinkRestricted) {
                return response()->json([
                    'message' => 'Symlink creation is restricted on this hosting plan.',
                    'warning' => 'Symlink creation is restricted on this hosting plan. The app is still usable, but public file links may require manual hosting setup. Please contact your host or use a cPanel file manager workaround.',
                ]);
            }

            return response()->json([
                'message' => 'Could not create storage link automatically on this server.',
                'warning' => 'Could not create storage link automatically on this server. Please run "php artisan storage:link" manually when shell access is available.',
            ]);
        }
    }

    /**
     * Clear application caches
     */
    public function clearCaches(): JsonResponse
    {
        try {
            Artisan::call('optimize:clear');

            return response()->json(['message' => 'All caches cleared successfully.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to clear caches: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update .env settings such as Queue Connection
     */
    public function updateEnvSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'queue_connection' => 'required|in:sync,database',
        ]);

        $success = $this->environmentService->setEnvironmentValue('QUEUE_CONNECTION', $validated['queue_connection']);

        if ($success) {
            // Must clear config cache after .env update
            Artisan::call('config:clear');

            return response()->json(['message' => 'Queue connection updated successfully.']);
        }

        return response()->json([
            'message' => 'Automatic .env update failed due to hosting restrictions.',
            'warning' => 'Please edit the .env file manually and set QUEUE_CONNECTION to your preferred value (sync or database). Ensure the .env file is writable (usually 0644).',
        ]);
    }

}
