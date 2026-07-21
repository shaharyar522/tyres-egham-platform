<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NotificationSetting extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'appointment_reminder_enabled' => 'boolean',
            'payment_reminder_enabled' => 'boolean',
            'appointment_reminder_hours_before' => 'integer',
            'payment_reminder_hours_before' => 'integer',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'appointment_reminder_enabled' => config('notifications.appointment_reminder_enabled', true),
                'appointment_reminder_hours_before' => config('notifications.appointment_reminder_hours_before', 24),
                'payment_reminder_enabled' => config('notifications.payment_reminder_enabled', true),
                'payment_reminder_hours_before' => config('notifications.payment_reminder_hours_before', 48),
            ],
        );
    }
}
