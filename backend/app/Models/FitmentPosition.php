<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FitmentPosition extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'is_extra_load' => 'boolean',
            'is_run_flat' => 'boolean',
            'is_winter' => 'boolean',
            'is_all_season' => 'boolean',
            'is_ev_rated' => 'boolean',
            'is_van' => 'boolean',
            'is_4x4' => 'boolean',
        ];
    }

    public function fitmentSet(): BelongsTo
    {
        return $this->belongsTo(FitmentSet::class);
    }
}
