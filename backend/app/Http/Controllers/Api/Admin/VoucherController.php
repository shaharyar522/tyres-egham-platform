<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Voucher;
use App\Support\AdminPagination;
use App\Support\FrontendApi;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VoucherController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $paginator = Voucher::with('brand')
            ->orderBy('code')
            ->paginate(AdminPagination::perPage($request));

        return response()->json([
            'vouchers' => collect($paginator->items())
                ->map(fn (Voucher $voucher) => FrontendApi::voucher($voucher))
                ->values(),
            'meta' => AdminPagination::meta($paginator),
        ]);
    }

    public function show(Voucher $voucher): JsonResponse
    {
        $voucher->load('brand');

        return response()->json([
            'voucher' => FrontendApi::voucher($voucher),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatedPayload($request);

        $voucher = Voucher::create($validated);

        return response()->json([
            'voucher' => FrontendApi::voucher($voucher->load('brand')),
        ], 201);
    }

    public function update(Request $request, Voucher $voucher): JsonResponse
    {
        $validated = $this->validatedPayload($request, $voucher->id);
        $voucher->update($validated);

        return response()->json([
            'voucher' => FrontendApi::voucher($voucher->fresh()->load('brand')),
        ]);
    }

    public function destroy(Voucher $voucher): JsonResponse
    {
        $voucher->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    private function validatedPayload(Request $request, ?int $ignoreId = null): array
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:32', Rule::unique('vouchers', 'code')->ignore($ignoreId)],
            'brandId' => ['nullable', 'integer', 'exists:brands,id'],
            'minQty' => ['required', 'integer', 'min:1', 'max:8'],
            'discountPerQty' => ['required', 'numeric', 'min:0'],
            'validFrom' => ['required', 'date'],
            'validTo' => ['required', 'date', 'after_or_equal:validFrom'],
            'description' => ['required', 'string', 'max:500'],
        ]);

        return [
            'code' => strtoupper(trim($validated['code'])),
            'brand_id' => $validated['brandId'] ?? null,
            'min_qty' => $validated['minQty'],
            'discount_per_qty' => $validated['discountPerQty'],
            'valid_from' => $validated['validFrom'],
            'valid_to' => $validated['validTo'],
            'description' => $validated['description'],
        ];
    }
}
