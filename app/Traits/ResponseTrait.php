<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ResponseTrait
{
    /**
     * Send a success response.
     */
    protected function successResponse(string $message = 'Success', mixed $data = [], int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $code);
    }

    /**
     * Send an error response.
     */
    protected function errorResponse(string $message = 'Error', mixed $errors = [], int $code = 400): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $code);
    }

    /**
     * Send a resource response.
     */
    protected function resourceResponse(JsonResource|ResourceCollection $resource, string $message = 'Success', int $code = 200): JsonResponse
    {
        return $resource->additional([
            'success' => true,
            'message' => $message,
        ])->response()->setStatusCode($code);
    }
}
