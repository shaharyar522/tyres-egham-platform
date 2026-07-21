<?php

namespace App\Support;

/**
 * Builds public browser URLs for files stored on the `public` disk.
 *
 * Live SPA + API under /api: browser must load assets via /api/media/...
 * (domain-root /storage/... hits the frontend and 404s).
 */
class PublicDiskUrl
{
    public static function for(?string $path): ?string
    {
        if (! $path) {
            return null;
        }

        $path = ltrim(str_replace('\\', '/', $path), '/');

        // Optional override, e.g. ASSET_URL=https://thetyresegham.co.uk/api/media
        $assetUrl = config('filesystems.disks.public.url');
        if (is_string($assetUrl) && str_contains($assetUrl, '/api/media')) {
            return rtrim($assetUrl, '/').'/'.$path;
        }

        $appUrl = rtrim((string) config('app.url'), '/');
        // Avoid /api/api/... if APP_URL already ends with /api
        $appUrl = preg_replace('#/api$#i', '', $appUrl) ?? $appUrl;
        $appUrl = rtrim($appUrl, '/');

        return $appUrl.'/api/media/'.$path;
    }
}
