<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class MediaController extends Controller
{
    /**
     * Serve files from the public storage disk via /api/media/{path}.
     * Needed on hosts where the SPA owns the web root and /storage is not reachable.
     */
    public function __invoke(string $path): BinaryFileResponse
    {
        $path = str_replace('\\', '/', $path);

        if (str_contains($path, '..')) {
            abort(404);
        }

        $disk = Storage::disk('public');

        if (! $disk->exists($path)) {
            abort(404);
        }

        return response()->file($disk->path($path), [
            'Cache-Control' => 'public, max-age=604800',
        ]);
    }
}
