<?php

namespace App\Services;

use Illuminate\Support\Facades\File;

class EnvironmentService
{
    /**
     * Update an environment variable in the .env file safely without breaking formatting.
     *
     * @param string $key
     * @param string $value
     * @return bool
     */
    public function setEnvironmentValue(string $key, string $value): bool
    {
        $path = app()->environmentFilePath();

        if (!File::exists($path)) {
            return false;
        }

        // Quote the value if it has spaces
        if (preg_match('/\s/', $value)) {
            $value = '"' . $value . '"';
        }

        $envFile = File::get($path);

        // Check if the key exists
        $pattern = "/^{$key}=.*/m";

        if (preg_match($pattern, $envFile)) {
            // Replace existing key
            $envFile = preg_replace($pattern, "{$key}={$value}", $envFile);
        } else {
            // Append new key
            $envFile .= "\n{$key}={$value}\n";
        }

        return File::put($path, $envFile) !== false;
    }
}
