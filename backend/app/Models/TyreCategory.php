<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class TyreCategory extends Model
{
    protected $guarded = [];

    public function tyreSkus(): HasMany
    {
        return $this->hasMany(TyreSku::class);
    }
}
