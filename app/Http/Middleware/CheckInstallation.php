<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstallation
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        $isInstalled = file_exists(storage_path('installed'));

        if ($request->is('install*')) {
            if ($isInstalled) {
                return redirect('/');
            }

            return $next($request);
        }

        if (! $isInstalled) {
            // Avoid redirecting API routes or assets
            if ($request->wantsJson() || $request->is('build/*') || $request->is('api/*')) {
                return $next($request);
            }

            return redirect('/install');
        }

        return $next($request);
    }
}
