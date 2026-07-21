<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'items' => 'array',
            'service_ids' => 'array',
            'service_selections' => 'array',
            'subtotal' => 'float',
            'voucher_discount' => 'float',
            'services_total' => 'float',
            'total' => 'float',
            'amount_paid' => 'float',
            'paid_at' => 'datetime',
            'appointment_reminder_sent_at' => 'datetime',
            'payment_reminder_sent_at' => 'datetime',
        ];
    }
}
