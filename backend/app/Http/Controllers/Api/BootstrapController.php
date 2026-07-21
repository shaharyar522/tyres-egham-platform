<?php

namespace App\Http\Controllers\Api;

use App\Models\Area;
use App\Models\Brand;
use App\Models\ContentArticle;
use App\Models\Service;
use App\Models\TyreCategory;
use App\Models\TyreSku;
use App\Models\VehicleMake;
use App\Models\Voucher;
use App\Http\Controllers\Controller;
use App\Support\FrontendApi;
use App\Support\SiteConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BootstrapController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): JsonResponse
    {
        return response()->json([
            'site' => SiteConfig::forBootstrap(),
            'stats' => [
                'brands' => Brand::count(),
                'categories' => TyreCategory::count(),
                'makes' => VehicleMake::count(),
                'services' => Service::query()->where('upsell_in_basket', true)->count(),
                'areas' => Area::count(),
                'articles' => ContentArticle::count(),
                'skus' => TyreSku::count(),
            ],
            'brands' => Brand::query()
                ->whereHas('tyreSkus', fn ($skuQuery) => $skuQuery->where('stock', '>', 0))
                ->orderBy('name')
                ->get()
                ->map(fn (Brand $brand) => FrontendApi::brand($brand))
                ->values(),
            'categories' => TyreCategory::orderBy('id')->get()->map(fn (TyreCategory $category) => FrontendApi::category($category))->values(),
            'makes' => VehicleMake::orderBy('id')->take(10)->get()->map(fn (VehicleMake $make) => FrontendApi::vehicleMake($make))->values(),
            'services' => Service::query()
                ->where('upsell_in_basket', true)
                ->orderBy('id')
                ->get()
                ->map(fn (Service $service) => FrontendApi::service($service))
                ->values(),
            'areas' => Area::orderBy('id')->take(12)->get()->map(fn (Area $area) => FrontendApi::area($area))->values(),
            'content' => ContentArticle::query()
                ->where('namespace', 'blog')
                ->published()
                ->orderByDesc('published_at')
                ->take(6)
                ->get()
                ->map(fn (ContentArticle $article) => FrontendApi::article($article))
                ->values(),
            'vouchers' => Voucher::with('brand')->orderBy('id')->get()->map(fn (Voucher $voucher) => FrontendApi::voucher($voucher))->values(),
        ]);
    }
}
