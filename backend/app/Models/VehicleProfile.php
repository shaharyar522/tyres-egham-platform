<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class VehicleProfile extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'last_verified_at' => 'datetime',
        ];
    }

    public function make(): BelongsTo
    {
        return $this->belongsTo(VehicleMake::class, 'vehicle_make_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(VehicleModel::class, 'vehicle_model_id');
    }

    public function fitmentSets(): HasMany
    {
        return $this->hasMany(FitmentSet::class);
    }

    public function lookupPayloads(): HasMany
    {
        return $this->hasMany(LookupPayload::class);
    }
}
