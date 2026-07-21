<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FitmentSet extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'is_staggered' => 'boolean',
            'confidence' => 'decimal:2',
            'provider_queried_at' => 'datetime',
        ];
    }

    public function vehicleProfile(): BelongsTo
    {
        return $this->belongsTo(VehicleProfile::class);
    }

    public function positions(): HasMany
    {
        return $this->hasMany(FitmentPosition::class);
    }
}
