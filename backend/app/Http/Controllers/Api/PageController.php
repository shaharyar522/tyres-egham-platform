<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentArticle;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;

class PageController extends Controller
{
    public function show(string $slug): JsonResponse
    {
        $page = ContentArticle::query()
            ->where('namespace', 'page')
            ->where('slug', $slug)
            ->firstOrFail();

        return response()->json([
            'page' => FrontendApi::page($page),
        ]);
    }
}
