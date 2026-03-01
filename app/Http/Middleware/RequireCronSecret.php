<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RequireCronSecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredSecret = (string) config('services.cron.secret', '');

        if ($configuredSecret === '') {
            abort(503, 'Cron secret is not configured.');
        }

        $providedSecret = (string) (
            $request->header('X-Cron-Token')
            ?? $request->header('X-CRON-TOKEN')
            ?? $request->header('X-App-Cron-Secret')
            ?? $request->query('token')
            ?? ''
        );

        if ($providedSecret === '' || !hash_equals($configuredSecret, $providedSecret)) {
            abort(403, 'Forbidden');
        }

        return $next($request);
    }
}
