<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LookupPayload extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'success' => 'boolean',
            'raw_request' => 'array',
            'raw_response' => 'array',
            'normalized_payload' => 'array',
            'fetched_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function vehicleProfile(): BelongsTo
    {
        return $this->belongsTo(VehicleProfile::class);
    }
}
