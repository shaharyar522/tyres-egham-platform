<?php

namespace App\Contracts;

use App\Models\VehicleProfile;
use Illuminate\Support\Collection;

interface FitmentResolverInterface
{
    public function resolve(VehicleProfile $profile): Collection;
}
