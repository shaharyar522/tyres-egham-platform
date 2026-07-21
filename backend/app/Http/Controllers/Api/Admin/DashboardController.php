<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\Brand;
use App\Models\ContentArticle;
use App\Models\CustomerReview;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'stats' => [
                'skus' => TyreSku::count(),
                'brands' => Brand::count(),
                'categories' => TyreCategory::count(),
                'articles' => ContentArticle::count(),
                'pages' => ContentArticle::where('namespace', 'page')->count(),
                'bookings' => Booking::count(),
                'pendingReviews' => CustomerReview::where('status', 'pending')->count(),
            ],
        ]);
    }
}
