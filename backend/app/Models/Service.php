<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'price_from' => 'decimal:2',
            'is_free' => 'boolean',
            'upsell_in_basket' => 'boolean',
            'pricing_options' => 'array',
        ];
    }
}
