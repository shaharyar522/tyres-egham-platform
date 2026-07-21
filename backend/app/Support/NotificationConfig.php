<?php

namespace App\Support;

use App\Models\NotificationSetting;

class NotificationConfig
{
    public static function settings(): NotificationSetting
    {
        return NotificationSetting::current();
    }

    public static function forAdmin(): array
    {
        $settings = self::settings();

        return [
            'appointmentReminderEnabled' => $settings->appointment_reminder_enabled,
            'appointmentReminderHoursBefore' => $settings->appointment_reminder_hours_before,
            'paymentReminderEnabled' => $settings->payment_reminder_enabled,
            'paymentReminderHoursBefore' => $settings->payment_reminder_hours_before,
        ];
    }
}
