<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (! Auth::check()) {
            return redirect('login');
        }

        $user = Auth::user();
        $acceptedRoles = collect(explode('|', $role))
            ->flatMap(fn (string $item) => explode(',', $item))
            ->map(fn (string $item) => Str::lower(trim($item)))
            ->filter()
            ->unique()
            ->values();

        if (! $user->is_active) {
            abort(403, 'Account is disabled.');
        }

        if ($acceptedRoles->isEmpty()) {
            abort(403, 'Unauthorized action.');
        }

        if (! $user->role || ! $acceptedRoles->contains(Str::lower($user->role->name))) {
            abort(403, 'Unauthorized action.');
        }

        return $next($request);
    }
}
