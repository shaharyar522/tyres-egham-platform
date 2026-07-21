<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TyrePatternListing extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'price_from_gbp' => 'decimal:2',
            'rating_out_of_5' => 'decimal:1',
            'synced_at' => 'datetime',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }
}
