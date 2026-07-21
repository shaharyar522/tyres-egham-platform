<?php

namespace App\Support;

use App\Models\VehicleProfile;

/**
 * Human-readable vehicle string for fitment-provider lookups (Phase 3),
 * aligned with FrontendApi::vehicleProfile display naming.
 */
final class VehicleFitmentDescription
{
    public static function fromProfile(VehicleProfile $profile): string
    {
        $makeName = $profile->make?->name ?? $profile->dvla_make_text ?? '';
        $modelName = $profile->model?->name ?? $profile->dvla_model_text ?? '';

        return trim(collect([
            $profile->year_of_manufacture,
            $makeName,
            $modelName,
            $profile->derivative,
        ])->filter()->implode(' '));
    }
}
