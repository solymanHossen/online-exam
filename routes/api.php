<?php

use App\Support\Api\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::get('/health', function () {
        return ApiResponse::success([
            'status' => 'healthy',
            'app' => config('app.name'),
        ]);
    })->name('api.v1.health');

    Route::middleware('auth:sanctum')->get('/me', function (Request $request) {
        return ApiResponse::success(
            data: [
                'id' => $request->user()?->id,
                'name' => $request->user()?->name,
                'email' => $request->user()?->email,
            ],
            message: 'Authenticated user profile.'
        );
    })->name('api.v1.me');
});
