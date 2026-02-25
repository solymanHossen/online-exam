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
            'queueConnection' => env('QUEUE_CONNECTION', 'sync'),
            'appDebug' => env('APP_DEBUG', false),
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
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create storage link: '.$e->getMessage()], 500);
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
            return response()->json(['message' => 'Failed to clear caches: '.$e->getMessage()], 500);
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

        return response()->json(['message' => 'Failed to update .env file. Ensure permissions are correct.'], 500);
    }

    /**
     * Dedicated method to process a batch of queue jobs triggered via Web/Cron
     */
    public function processQueue(): JsonResponse
    {
        try {
            // stop-when-empty ensures the process dies after finishing, preventing timeout crashes in HTTP
            Artisan::call('queue:work', ['--stop-when-empty' => true]);
            $output = Artisan::output();

            return response()->json(['message' => 'Queue processed successfully.', 'output' => $output]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to process queue: '.$e->getMessage()], 500);
        }
    }
}
