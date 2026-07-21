<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContentArticle;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContentArticleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $namespace = $request->string('namespace')->toString() ?: 'content';

        $articles = ContentArticle::query()
            ->where('namespace', $namespace)
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
            ->where('slug', $slug)
            ->published()
            ->firstOrFail();

        return response()->json([
            'article' => FrontendApi::articleDetail($article),
        ]);
    }
}
