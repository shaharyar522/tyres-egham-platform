<?php

namespace App\Services;

use App\Models\FitmentPosition;
use App\Models\FitmentSet;
use App\Models\TyreSku;
use App\Support\FrontendApi;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

class CatalogueMatchService
{
    public function searchManual(array $filters): array
    {
        $query = TyreSku::query()->with(['brand', 'category'])->where('stock', '>', 0);

        foreach (['width', 'profile', 'rim'] as $field) {
            if (! empty($filters[$field])) {
                $query->where($field, (int) $filters[$field]);
            }
        }

        if (! empty($filters['brand'])) {
            $brand = strtolower((string) $filters['brand']);
            $query->whereHas('brand', fn ($brandQuery) => $brandQuery->where('slug', $brand));
        }

        if (! empty($filters['tyreCategory'])) {
            $category = strtolower((string) $filters['tyreCategory']);
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', $category));
        }

        if (! empty($filters['offersOnly'])) {
            $query->where('has_active_offer', true);
        }

        $perPage = $this->resolvePerPage($filters);
        $page = max(1, (int) ($filters['page'] ?? 1));

        $paginator = $query
            ->orderBy('brand_id')
            ->orderBy('price_per_tyre')
            ->paginate($perPage, ['*'], 'page', $page);

        return [
            'filters' => $filters,
            'total' => $paginator->total(),
            'results' => collect($paginator->items())->map(fn (TyreSku $sku) => FrontendApi::tyreSku($sku))->values(),
            'meta' => [
                'currentPage' => $paginator->currentPage(),
                'lastPage' => $paginator->lastPage(),
                'perPage' => $paginator->perPage(),
            ],
        ];
    }

    public function searchForFitment(string $registration, int $fitmentId, ?string $requestedPosition, array $filters): array
    {
        $fitmentSet = FitmentSet::query()
            ->with(['positions', 'vehicleProfile.make'])
            ->whereKey($fitmentId)
            ->whereHas('vehicleProfile', fn ($profileQuery) => $profileQuery->where('registration', strtoupper($registration)))
            ->first();

        if (! $fitmentSet) {
            throw (new ModelNotFoundException())->setModel(FitmentSet::class, [$fitmentId]);
        }

        $position = $this->resolvePosition($fitmentSet, $requestedPosition);
        $category = $filters['tyreCategory'] ?: $position->tyre_category_slug ?: $fitmentSet->tyre_category_slug;

        $query = TyreSku::query()
            ->with(['brand', 'category'])
            ->where('stock', '>', 0)
            ->where('width', $position->width)
            ->where('profile', $position->profile)
            ->where('rim', $position->rim);

        if ($position->load_index) {
            $query->where('load_index', '>=', $position->load_index);
        }

        if (! empty($filters['brand'])) {
            $brand = strtolower((string) $filters['brand']);
            $query->whereHas('brand', fn ($brandQuery) => $brandQuery->where('slug', $brand));
        }

        if (! empty($filters['offersOnly'])) {
            $query->where('has_active_offer', true);
        }

        if ($category) {
            $query->whereHas('category', fn ($categoryQuery) => $categoryQuery->where('slug', strtolower((string) $category)));
        }

        $this->applySpecialistRules($query, $position);

        /** @var EloquentCollection<int, TyreSku> $rawMatches */
        $rawMatches = $query->get();
        $matches = $rawMatches
            ->filter(fn (TyreSku $sku) => $this->matchesSpeedRequirement($sku->speed_rating, $position->speed_rating))
            ->sort(function (TyreSku $left, TyreSku $right) use ($position, $fitmentSet) {
                $leftScore = $this->compatibilityScore($left, $position, $fitmentSet);
                $rightScore = $this->compatibilityScore($right, $position, $fitmentSet);

                if ($leftScore !== $rightScore) {
                    return $rightScore <=> $leftScore;
                }

                $leftStars = (float) $left->star_rating;
                $rightStars = (float) $right->star_rating;
                if ($leftStars !== $rightStars) {
                    return $rightStars <=> $leftStars;
                }

                return (float) $left->price_per_tyre <=> (float) $right->price_per_tyre;
            })
            ->values()
            ->take(config('catalogue.search_limit', 120));

        return [
            'filters' => array_filter([
                'brand' => $filters['brand'] ?? null,
                'offersOnly' => ! empty($filters['offersOnly']),
                'vehicleRegistration' => strtoupper($registration),
                'fitmentId' => $fitmentId,
                'position' => $position->position,
                'tyreCategory' => $category,
            ], fn ($value) => $value !== null && $value !== ''),
            'total' => $matches->count(),
            'results' => $matches->map(fn (TyreSku $sku) => FrontendApi::tyreSku($sku))->values(),
            'matchMeta' => [
                'fitmentId' => $fitmentSet->id,
                'position' => $position->position,
                'positionLabel' => FrontendApi::fitmentPosition($position)['label'],
                'staggered' => (bool) $fitmentSet->is_staggered,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function resolvePerPage(array $filters): int
    {
        $max = max(12, (int) config('catalogue.max_per_page', 200));
        $default = max(12, (int) config('catalogue.browse_per_page', 48));

        if (! empty($filters['perPage'])) {
            return min($max, max(12, (int) $filters['perPage']));
        }

        $hasSize = ! empty($filters['width']) || ! empty($filters['profile']) || ! empty($filters['rim']);

        return $hasSize
            ? min($max, max(12, (int) config('catalogue.search_limit', 120)))
            : $default;
    }

    private function resolvePosition(FitmentSet $fitmentSet, ?string $requestedPosition): FitmentPosition
    {
        $positions = $fitmentSet->positions->values();

        return $positions->firstWhere('position', $requestedPosition)
            ?? $positions->firstWhere('position', 'all_round')
            ?? $positions->firstWhere('position', 'front')
            ?? $positions->first();
    }

    private function applySpecialistRules($query, FitmentPosition $position): void
    {
        foreach ([
            'is_extra_load',
            'is_run_flat',
            'is_winter',
            'is_all_season',
            'is_ev_rated',
            'is_van',
            'is_4x4',
        ] as $flag) {
            if ($position->{$flag}) {
                $query->where($flag, true);
            }
        }
    }

    private function compatibilityScore(TyreSku $sku, FitmentPosition $position, FitmentSet $fitmentSet): int
    {
        $score = 0;

        if (in_array('recommended', $sku->badges ?? [], true)) {
            $score += 35;
        }

        if ((bool) $sku->has_active_offer) {
            $score += 10;
        }

        if ((bool) $sku->is_available_within_24h) {
            $score += 10;
        }

        if ($position->oe_marking && $this->hasMatchingOeMarking($sku, (string) $position->oe_marking)) {
            $score += 30;
        }

        if ($this->matchesManufacturerOe($sku, $fitmentSet->vehicleProfile?->make?->name)) {
            $score += 15;
        }

        $requiredSpeed = $this->speedWeight($position->speed_rating);
        $skuSpeed = $this->speedWeight($sku->speed_rating);
        if ($requiredSpeed && $skuSpeed > $requiredSpeed) {
            $score += 5;
        }

        return $score;
    }

    private function hasMatchingOeMarking(TyreSku $sku, string $oeMarking): bool
    {
        return collect($sku->oe_approvals ?? [])
            ->contains(fn (array $approval) => strtoupper((string) ($approval['code'] ?? '')) === strtoupper($oeMarking));
    }

    private function matchesManufacturerOe(TyreSku $sku, ?string $makeName): bool
    {
        if (! filled($makeName)) {
            return false;
        }

        return collect($sku->oe_approvals ?? [])->contains(function (array $approval) use ($makeName) {
            $manufacturer = strtolower((string) ($approval['manufacturer'] ?? ''));

            return str_contains($manufacturer, strtolower($makeName));
        });
    }

    private function matchesSpeedRequirement(?string $skuSpeed, ?string $requiredSpeed): bool
    {
        $requiredWeight = $this->speedWeight($requiredSpeed);
        if (! $requiredWeight) {
            return true;
        }

        return $this->speedWeight($skuSpeed) >= $requiredWeight;
    }

    private function speedWeight(?string $speed): int
    {
        return match (strtoupper((string) $speed)) {
            'C' => 1,
            'G' => 2,
            'H' => 3,
            'Q' => 4,
            'R' => 5,
            'S' => 6,
            'T' => 7,
            'V' => 8,
            'W' => 9,
            'X' => 10,
            'Y' => 11,
            'Z', 'ZR' => 12,
            default => 0,
        };
    }
}
