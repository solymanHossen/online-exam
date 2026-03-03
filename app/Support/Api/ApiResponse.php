<?php

namespace App\Support\Api;

use Illuminate\Http\JsonResponse;

final class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = 200,
        ?string $requestId = null,
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], $status);
    }

    public static function error(
        string $message = 'Request failed.',
        array $errors = [],
        int $status = 400,
        ?string $requestId = null,
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
            'meta' => [
                'request_id' => $requestId,
                'timestamp' => now()->toIso8601String(),
            ],
        ], $status);
    }
}
