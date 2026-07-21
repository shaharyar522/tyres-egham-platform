<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContentArticle;
use App\Support\AdminPagination;
use App\Support\ContentAsset;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ContentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $namespace = $request->string('namespace')->toString();

        $query = ContentArticle::query()->orderByDesc('updated_at');
        if ($namespace !== '') {
            $query->where('namespace', $namespace);
        }

        $paginator = $query->paginate(AdminPagination::perPage($request));

        return response()->json([
            'articles' => collect($paginator->items())
                ->map(fn (ContentArticle $article) => FrontendApi::articleDetail($article))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(ContentArticle $content): JsonResponse
    {
        return response()->json([
            'article' => FrontendApi::articleDetail($content),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);

        $article = ContentArticle::create($validated);

        return response()->json([
            'article' => FrontendApi::articleDetail($article),
        ], 201);
    }

    public function update(Request $request, ContentArticle $content): JsonResponse
    {
        $validated = $this->validatedPayload($request, $content->id);
        $content->update($validated);

        return response()->json([
            'article' => FrontendApi::articleDetail($content->fresh()),
        ]);
    }

    public function destroy(ContentArticle $content): JsonResponse
    {
        ContentAsset::delete($content->featured_image_path);
        ContentAsset::delete($content->og_image_path);
        $content->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    public function updateMedia(Request $request, ContentArticle $content): JsonResponse
    {
        $validated = $request->validate([
            'featuredImage' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'ogImage' => ['nullable', 'file', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'removeFeaturedImage' => ['sometimes', 'boolean'],
            'removeOgImage' => ['sometimes', 'boolean'],
        ]);

        if (! empty($validated['removeFeaturedImage'])) {
            ContentAsset::delete($content->featured_image_path);
            $content->featured_image_path = null;
        } elseif ($request->hasFile('featuredImage')) {
            ContentAsset::delete($content->featured_image_path);
            $content->featured_image_path = ContentAsset::store($request->file('featuredImage'), 'featured-'.$content->id);
        }

        if (! empty($validated['removeOgImage'])) {
            ContentAsset::delete($content->og_image_path);
            $content->og_image_path = null;
        } elseif ($request->hasFile('ogImage')) {
            ContentAsset::delete($content->og_image_path);
            $content->og_image_path = ContentAsset::store($request->file('ogImage'), 'og-'.$content->id);
        }

        $content->save();

        return response()->json([
            'article' => FrontendApi::articleDetail($content->fresh()),
        ]);
    }

    private function validatedPayload(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'namespace' => ['required', 'string', 'max:32', Rule::in(['content', 'blog', 'page', 'tyreinfo'])],
            'slug' => ['required', 'string', 'max:120', Rule::unique('content_articles', 'slug')->ignore($ignoreId)],
            'title' => ['required', 'string', 'max:255'],
            'excerpt' => ['required', 'string', 'max:1000'],
            'category' => ['required', 'string', 'max:64'],
            'readMinutes' => ['nullable', 'integer', 'min:1', 'max:60'],
            'publishedAt' => ['nullable', 'date'],
            'imageEmoji' => ['nullable', 'string', 'max:16'],
            'body' => ['nullable', 'string'],
            'metaTitle' => ['nullable', 'string', 'max:255'],
            'metaDescription' => ['nullable', 'string', 'max:1000'],
            'metaKeywords' => ['nullable', 'string', 'max:255'],
            'robots' => ['nullable', 'string', 'max:64'],
        ]);

        return [
            'namespace' => $validated['namespace'],
            'slug' => Str::slug($validated['slug']),
            'title' => $validated['title'],
            'excerpt' => $validated['excerpt'],
            'category' => $validated['category'],
            'read_minutes' => $validated['readMinutes'] ?? 3,
            'published_at' => $validated['publishedAt'] ?? now()->toDateString(),
            'image_emoji' => $validated['imageEmoji'] ?? null,
            'body' => $validated['body'] ?? '',
            'meta_title' => $validated['metaTitle'] ?? null,
            'meta_description' => $validated['metaDescription'] ?? null,
            'meta_keywords' => $validated['metaKeywords'] ?? null,
            'robots' => $validated['robots'] ?? null,
        ];
    }
}
