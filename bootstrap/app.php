<?php

use App\Support\Api\ApiResponse;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Task 2: Webhook CSRF Exclusions
        $middleware->validateCsrfTokens(except: [
            'webhooks/payments/*',
        ]);

        $middleware->web(append: [
            \App\Http\Middleware\SecurityHeaders::class,
            \App\Http\Middleware\CheckInstallation::class,
            \App\Http\Middleware\SetLocale::class,
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\ForceJsonResponse::class,
            \App\Http\Middleware\SecurityHeaders::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'is-installed' => \App\Http\Middleware\IsInstalled::class,
            'cron.secret' => \App\Http\Middleware\RequireCronSecret::class,
            'security.headers' => \App\Http\Middleware\SecurityHeaders::class,
        ]);
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (Throwable $exception, Request $request) {
            if (! $request->is('api/*') && ! $request->expectsJson()) {
                return null;
            }

            if ($exception instanceof ValidationException) {
                return ApiResponse::error(
                    message: __('Validation failed.'),
                    errors: $exception->errors(),
                    status: 422,
                    requestId: $request->header('X-Request-Id')
                );
            }

            if ($exception instanceof AuthenticationException) {
                return ApiResponse::error(
                    message: __('Unauthenticated.'),
                    status: 401,
                    requestId: $request->header('X-Request-Id')
                );
            }

            if ($exception instanceof AuthorizationException) {
                return ApiResponse::error(
                    message: __('Forbidden.'),
                    status: 403,
                    requestId: $request->header('X-Request-Id')
                );
            }

            if ($exception instanceof ModelNotFoundException) {
                return ApiResponse::error(
                    message: __('Resource not found.'),
                    status: 404,
                    requestId: $request->header('X-Request-Id')
                );
            }

            if ($exception instanceof HttpExceptionInterface) {
                return ApiResponse::error(
                    message: $exception->getMessage() !== '' ? $exception->getMessage() : __('HTTP error.'),
                    status: $exception->getStatusCode(),
                    requestId: $request->header('X-Request-Id')
                );
            }

            if ($exception instanceof QueryException) {
                return ApiResponse::error(
                    message: __('A database error occurred.'),
                    status: 500,
                    requestId: $request->header('X-Request-Id')
                );
            }

            return ApiResponse::error(
                message: config('app.debug') ? $exception->getMessage() : __('Server error.'),
                status: 500,
                requestId: $request->header('X-Request-Id')
            );
        });
    })->create();
