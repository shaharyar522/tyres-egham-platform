<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentBlock extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'block_date' => 'date',
        ];
    }
}
