<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'id' => 'integer',
            'recommended_for' => 'array',
            'has_active_offer' => 'boolean',
        ];
    }

    public function tyreSkus(): HasMany
    {
        return $this->hasMany(TyreSku::class);
    }
}
