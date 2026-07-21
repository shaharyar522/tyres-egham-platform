<?php

return [
    'appointment_reminder_enabled' => env('NOTIFY_APPOINTMENT_REMINDER', true),
    'appointment_reminder_hours_before' => (int) env('NOTIFY_APPOINTMENT_HOURS_BEFORE', 24),
    'payment_reminder_enabled' => env('NOTIFY_PAYMENT_REMINDER', true),
    'payment_reminder_hours_before' => (int) env('NOTIFY_PAYMENT_HOURS_BEFORE', 48),
];
