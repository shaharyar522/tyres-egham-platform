<?php

namespace App\Support;

/**
 * Build public URLs for files on the public disk.
 *
 * On the live host the SPA owns the web root, so /storage/... is rewritten to
 * index.html. Serve through /api/media/{path} instead (MediaController).
 */
class PublicMediaUrl
{
    public static function for(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $relative = ltrim(str_replace('\\', '/', $path), '/');

        return rtrim((string) config('app.url'), '/').'/api/media/'.$relative;
    }
}
