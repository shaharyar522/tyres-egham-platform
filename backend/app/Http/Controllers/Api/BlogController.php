<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentArticle;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;

class BlogController extends Controller
{
    public function index(): JsonResponse
    {
        $articles = ContentArticle::query()
            ->where('namespace', 'blog')
            ->published()
            ->orderByDesc('published_at')
            ->get()
            ->map(fn (ContentArticle $article) => FrontendApi::article($article))
            ->values();

        return response()->json(['articles' => $articles]);
    }

    public function show(string $slug): JsonResponse
    {
        $article = ContentArticle::query()
            ->where('namespace', 'blog')
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        return response()->json([
            'article' => FrontendApi::articleDetail($article),
        ]);
    }
}
