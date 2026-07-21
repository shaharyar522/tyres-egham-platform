<?php

namespace App\Support;

use App\Models\Service;
use App\Models\TyreSku;
use App\Models\Voucher;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class CheckoutTotals
{
    /**
     * @param  array<int, array{skuId: int, qty: int, snapshot?: array}>  $items
     * @param  array<int, int>  $serviceIds
     * @param  array<int|string, array{optionKey?: string, customPrice?: float|int|string}>  $serviceSelections
     * @return array{
     *   subtotal: float,
     *   voucherDiscount: float,
     *   servicesTotal: float,
     *   total: float,
     *   items: array,
     *   voucherCode: ?string
     * }
     */
    public static function calculate(array $items, array $serviceIds, ?string $voucherCode, array $serviceSelections = []): array
    {
        if ($items === []) {
            throw ValidationException::withMessages(['items' => 'Your basket is empty.']);
        }

        $skuIds = collect($items)->pluck('skuId')->unique()->values();
        $skus = TyreSku::query()->with('brand')->whereIn('id', $skuIds)->get()->keyBy('id');

        $normalizedItems = [];
        $subtotal = 0.0;
        $itemCount = 0;

        foreach ($items as $item) {
            $skuId = (int) $item['skuId'];
            $qty = (int) $item['qty'];
            $sku = $skus->get($skuId);
            if (! $sku) {
                throw ValidationException::withMessages([
                    'items' => "Tyre SKU #{$skuId} is no longer available.",
                ]);
            }

            $unit = static::unitPrice($sku, $qty);
            $lineTotal = round($unit * $qty, 2);
            $subtotal += $lineTotal;
            $itemCount += $qty;

            $normalizedItems[] = [
                'skuId' => $skuId,
                'qty' => $qty,
                'snapshot' => [
                    'brandId' => $sku->brand_id,
                    'brandSlug' => $sku->brand?->slug,
                    'pricePerTyre' => (float) $sku->price_per_tyre,
                    'quantityTiers' => $sku->quantity_tiers ?? [],
                ],
            ];
        }

        $voucherDiscount = 0.0;
        $appliedVoucherCode = null;
        if ($voucherCode) {
            $voucher = static::resolveVoucher($voucherCode, $normalizedItems, $itemCount);
            $voucherDiscount = static::voucherDiscount($voucher, $normalizedItems, $itemCount);
            $appliedVoucherCode = $voucher->code;
        }

        $servicesTotal = static::servicesTotal($serviceIds, $serviceSelections);
        $total = max(0, round($subtotal - $voucherDiscount + $servicesTotal, 2));

        return [
            'subtotal' => round($subtotal, 2),
            'voucherDiscount' => round($voucherDiscount, 2),
            'servicesTotal' => round($servicesTotal, 2),
            'total' => $total,
            'items' => $normalizedItems,
            'voucherCode' => $appliedVoucherCode,
        ];
    }

    private static function unitPrice(TyreSku $sku, int $qty): float
    {
        $tiers = collect($sku->quantity_tiers ?? [])
            ->filter(fn ($tier) => ($tier['qty'] ?? 0) <= $qty)
            ->sortByDesc(fn ($tier) => $tier['qty'] ?? 0)
            ->first();

        return (float) ($tiers['pricePerTyre'] ?? $sku->price_per_tyre);
    }

    private static function resolveVoucher(string $code, array $items, int $itemCount): Voucher
    {
        $voucher = Voucher::query()
            ->with('brand')
            ->whereRaw('UPPER(code) = ?', [strtoupper(trim($code))])
            ->first();

        if (! $voucher) {
            throw ValidationException::withMessages([
                'voucherCode' => 'Voucher code is not valid.',
            ]);
        }

        $today = Carbon::today();
        if ($voucher->valid_from && $today->lt($voucher->valid_from)) {
            throw ValidationException::withMessages(['voucherCode' => 'This voucher is not active yet.']);
        }
        if ($voucher->valid_to && $today->gt($voucher->valid_to)) {
            throw ValidationException::withMessages(['voucherCode' => 'This voucher has expired.']);
        }

        if ($itemCount < (int) $voucher->min_qty) {
            throw ValidationException::withMessages([
                'voucherCode' => "This voucher requires at least {$voucher->min_qty} tyres.",
            ]);
        }

        if ($voucher->brand_id) {
            $brandSlug = $voucher->brand?->slug;
            $matches = collect($items)->contains(fn ($item) => ($item['snapshot']['brandSlug'] ?? null) === $brandSlug);
            if (! $matches) {
                throw ValidationException::withMessages([
                    'voucherCode' => 'This voucher does not apply to tyres in your basket.',
                ]);
            }
        }

        return $voucher;
    }

    private static function voucherDiscount(Voucher $voucher, array $items, int $itemCount): float
    {
        $qualifyingQty = $itemCount;
        if ($voucher->brand_id) {
            $brandSlug = $voucher->brand?->slug;
            $qualifyingQty = collect($items)
                ->filter(fn ($item) => ($item['snapshot']['brandSlug'] ?? null) === $brandSlug)
                ->sum('qty');
        }

        return round($qualifyingQty * (float) $voucher->discount_per_qty, 2);
    }

    private static function servicesTotal(array $serviceIds, array $serviceSelections = []): float
    {
        if ($serviceIds === []) {
            return 0.0;
        }

        $total = 0.0;
        $selections = ServicePricing::normalizeSelections($serviceSelections);
        $services = Service::query()->whereIn('id', $serviceIds)->get();
        foreach ($services as $service) {
            $selection = $selections[(string) $service->id] ?? null;
            $total += ServicePricing::linePrice($service, $selection);
        }

        return $total;
    }
}
