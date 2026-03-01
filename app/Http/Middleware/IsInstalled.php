<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IsInstalled
{
    /**
     * Block installer routes once the app is already configured.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('testing')) {
            return $next($request);
        }

        $isInstalled = file_exists(storage_path('installed'));

        if ($isInstalled) {
            return redirect('/');
        }

        return $next($request);
    }
}
