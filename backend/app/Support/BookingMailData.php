<?php

namespace App\Support;

use App\Models\Booking;
use App\Models\Service;

class BookingMailData
{
    public static function frontendUrl(): string
    {
        return rtrim((string) config('app.frontend_url', 'http://localhost:5175'), '/');
    }

    public static function manageUrl(Booking $booking): string
    {
        return self::frontendUrl().'/booking/manage?ref='.urlencode($booking->reference)
            .'&token='.urlencode($booking->access_token);
    }

    public static function workshop(): array
    {
        return SiteConfig::workshop();
    }

    /**
     * @return array<int, array{label: string, qty: int, lineTotal: string}>
     */
    public static function lineItems(Booking $booking): array
    {
        $lines = [];
        foreach ($booking->items ?? [] as $item) {
            $snapshot = $item['snapshot'] ?? [];
            $qty = (int) ($item['qty'] ?? 1);
            $unit = (float) ($snapshot['pricePerTyre'] ?? 0);
            $brand = $snapshot['brandSlug'] ?? null;
            $label = $brand ? ucfirst(str_replace('-', ' ', $brand)).' tyres' : 'Tyre SKU #'.($item['skuId'] ?? '?');
            $lines[] = [
                'label' => $label,
                'qty' => $qty,
                'lineTotal' => '£'.number_format($unit * $qty, 2),
            ];
        }

        return $lines;
    }

    /**
     * @return array<int, string>
     */
    public static function serviceLabels(Booking $booking): array
    {
        $ids = $booking->service_ids ?? [];
        if ($ids === []) {
            return [];
        }

        $selections = $booking->service_selections ?? [];

        return Service::query()
            ->whereIn('id', $ids)
            ->get()
            ->map(function (Service $service) use ($selections) {
                $selection = $selections[(string) $service->id] ?? $selections[$service->id] ?? null;
                if (! is_array($selection) || empty($selection['optionKey'])) {
                    return $service->name;
                }

                $options = $service->pricing_options['options'] ?? [];
                $option = collect($options)->firstWhere('key', (string) $selection['optionKey']);
                $label = $option['label'] ?? $selection['optionKey'];

                return "{$service->name} ({$label})";
            })
            ->all();
    }
}
