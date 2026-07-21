<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Support\FrontendApi;
use App\Support\SiteConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function index(): JsonResponse
    {
        $query = CustomerReview::query()->where('status', 'approved');

        $reviews = (clone $query)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (CustomerReview $review) => FrontendApi::review($review))
            ->values();

        $average = round((float) ((clone $query)->avg('rating') ?? 0), 1);

        return response()->json([
            'reviews' => $reviews,
            'stats' => [
                'count' => $reviews->count(),
                'averageRating' => $average,
                'googleReviewCount' => SiteConfig::settings()->google_review_count,
                'googleReviewRating' => (float) SiteConfig::settings()->google_review_rating,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customerName' => ['required', 'string', 'max:120'],
            'customerEmail' => ['nullable', 'email', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'title' => ['required', 'string', 'max:200'],
            'body' => ['required', 'string', 'min:20', 'max:5000'],
        ]);

        $review = CustomerReview::create([
            'customer_name' => $validated['customerName'],
            'customer_email' => $validated['customerEmail'] ?? null,
            'rating' => $validated['rating'],
            'title' => $validated['title'],
            'body' => $validated['body'],
            'source' => 'in_site',
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Thank you — your review has been received and will appear after moderation.',
            'review' => FrontendApi::review($review),
        ], 201);
    }
}
