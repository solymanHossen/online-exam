<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaService extends BaseService
{
    /**
     * Upload an image to the specified directory.
     * Optionally could use Intervention Image here for compression.
     */
    public function uploadImage(UploadedFile $file, string $directory = 'images'): string
    {
        $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();

        // Store the file in public storage and return the URL
        $path = $file->storeAs($directory, $filename, 'public');

        return Storage::url($path);
    }

    /**
     * Delete an image from storage.
     */
    public function deleteImage(string $url): bool
    {
        // Extract the path from the URL
        $path = str_replace(Storage::url(''), '', $url);

        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }

        return false;
    }
}
