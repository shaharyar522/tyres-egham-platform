<?php

namespace App\Services;

use App\Contracts\FitmentResolverInterface;
use App\Models\VehicleProfile;
use Illuminate\Support\Collection;

class DatabaseFitmentResolver implements FitmentResolverInterface
{
    public function resolve(VehicleProfile $profile): Collection
    {
        $profile->loadMissing('fitmentSets.positions');

        return $profile->fitmentSets
            ->sortBy([
                ['is_primary', 'desc'],
                ['id', 'asc'],
            ])
            ->values()
            ->map(function ($fitmentSet) {
                $orderedPositions = $fitmentSet->positions
                    ->sortBy(fn ($position) => $this->positionWeight((string) $position->position))
                    ->values();

                $fitmentSet->setRelation('positions', $orderedPositions);

                return $fitmentSet;
            });
    }

    private function positionWeight(string $position): int
    {
        return match ($position) {
            'all_round' => 0,
            'front' => 1,
            'rear' => 2,
            'spare' => 3,
            default => 9,
        };
    }
}
