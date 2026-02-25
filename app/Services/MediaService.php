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
        // 1. Strict MIME Type Validation
        $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (! in_array($file->getMimeType(), $allowedMimes)) {
            throw new \InvalidArgumentException('Invalid file type detected. Only images are allowed.');
        }

        // 2. Strict Extension Validation
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
        $extension = strtolower($file->getClientOriginalExtension());
        if (! in_array($extension, $allowedExtensions)) {
            throw new \InvalidArgumentException('Invalid image extension.');
        }

        // 3. Prevent Double Extension Attacks (e.g., shell.php.png)
        $dangerousExtensions = ['php', 'php3', 'php4', 'php5', 'phtml', 'exe', 'sh', 'js', 'html', 'htm', 'jar'];
        $parts = explode('.', $file->getClientOriginalName());
        foreach ($parts as $part) {
            if (in_array(strtolower($part), $dangerousExtensions)) {
                throw new \InvalidArgumentException('Filename contains malicious double extensions.');
            }
        }

        // 4. Verify Image Signature (Ensure it's actually an image and not a disguised script)
        if (! @getimagesize($file->getRealPath())) {
            throw new \InvalidArgumentException('File contents do not match a valid image signature.');
        }

        // 5. Generate secure, unpredictable filename ignoring client input
        $filename = Str::random(40).'.'.$extension;

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
