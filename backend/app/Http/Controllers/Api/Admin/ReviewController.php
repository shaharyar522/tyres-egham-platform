<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\CustomerReview;
use App\Support\AdminPagination;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ReviewController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $status = $request->string('status')->toString();

        $query = CustomerReview::query()->orderByDesc('created_at');
        if ($status !== '') {
            $query->where('status', $status);
        }

        $paginator = $query->paginate(AdminPagination::perPage($request));

        return response()->json([
            'reviews' => collect($paginator->items())
                ->map(fn (CustomerReview $review) => array_merge(
                    FrontendApi::review($review),
                    ['status' => $review->status],
                ))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function update(Request $request, CustomerReview $review): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', Rule::in(['pending', 'approved', 'rejected'])],
        ]);

        $review->update(['status' => $validated['status']]);

        return response()->json([
            'review' => array_merge(FrontendApi::review($review), ['status' => $review->status]),
        ]);
    }
}
