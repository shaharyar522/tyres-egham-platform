<?php

namespace App\Support;

use App\Models\Service;

class ServicePricing
{
    /**
     * @param  array{optionKey?: string, customPrice?: float|int|string}|null  $selection
     */
    public static function linePrice(Service $service, ?array $selection): float
    {
        if ($service->is_free) {
            return 0.0;
        }

        $options = $service->pricing_options;
        if (! is_array($options) || ($options['options'] ?? []) === []) {
            return (float) ($service->price_from ?? 0);
        }

        if (! $selection || empty($selection['optionKey'])) {
            return 0.0;
        }

        $option = collect($options['options'])->firstWhere('key', (string) $selection['optionKey']);
        if (! $option) {
            return 0.0;
        }

        if (! empty($option['requiresCustomPrice'])) {
            $custom = $selection['customPrice'] ?? null;

            return ($custom !== null && (float) $custom > 0) ? (float) $custom : 0.0;
        }

        return (float) ($option['price'] ?? 0);
    }

    /**
     * @param  array<int|string, array{optionKey?: string, customPrice?: float|int|string, serviceId?: int}>  $raw
     * @return array<string, array{optionKey: string, customPrice?: float}>
     */
    public static function normalizeSelections(array $raw): array
    {
        $normalized = [];

        foreach ($raw as $key => $value) {
            if (! is_array($value)) {
                continue;
            }

            $serviceId = is_numeric($key) ? (int) $key : ($value['serviceId'] ?? null);
            if (! $serviceId) {
                continue;
            }

            $optionKey = (string) ($value['optionKey'] ?? '');
            if ($optionKey === '') {
                continue;
            }

            $entry = ['optionKey' => $optionKey];
            if (array_key_exists('customPrice', $value) && $value['customPrice'] !== null && $value['customPrice'] !== '') {
                $entry['customPrice'] = (float) $value['customPrice'];
            }

            $normalized[(string) $serviceId] = $entry;
        }

        return $normalized;
    }
}
