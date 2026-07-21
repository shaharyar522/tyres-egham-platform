<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class TyreSku extends Model
{
    public $incrementing = false;

    protected $keyType = 'int';

    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'brand_id' => 'integer',
            'tyre_category_id' => 'integer',
            'width' => 'integer',
            'profile' => 'integer',
            'rim' => 'integer',
            'load_index' => 'integer',
            'review_count' => 'integer',
            'stock' => 'integer',
            'eu_label' => 'array',
            'oe_approvals' => 'array',
            'quantity_tiers' => 'array',
            'badges' => 'array',
            'price_per_tyre' => 'decimal:2',
            'star_rating' => 'decimal:1',
            'is_extra_load' => 'boolean',
            'is_run_flat' => 'boolean',
            'is_winter' => 'boolean',
            'is_all_season' => 'boolean',
            'is_ev_rated' => 'boolean',
            'is_van' => 'boolean',
            'is_4x4' => 'boolean',
            'is_available_within_24h' => 'boolean',
            'has_active_offer' => 'boolean',
        ];
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(TyreCategory::class, 'tyre_category_id');
    }
}
