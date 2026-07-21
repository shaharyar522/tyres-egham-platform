<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Model;

class VehicleMake extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'top_models' => 'array',
        ];
    }

    public function models(): HasMany
    {
        return $this->hasMany(VehicleModel::class);
    }
}
