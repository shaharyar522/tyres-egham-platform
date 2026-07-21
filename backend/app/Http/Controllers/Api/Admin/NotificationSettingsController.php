<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\NotificationSetting;
use App\Support\NotificationConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'settings' => NotificationConfig::forAdmin(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'appointmentReminderEnabled' => ['sometimes', 'boolean'],
            'appointmentReminderHoursBefore' => ['sometimes', 'integer', 'min:1', 'max:168'],
            'paymentReminderEnabled' => ['sometimes', 'boolean'],
            'paymentReminderHoursBefore' => ['sometimes', 'integer', 'min:1', 'max:168'],
        ]);

        $settings = NotificationSetting::current();

        if (array_key_exists('appointmentReminderEnabled', $validated)) {
            $settings->appointment_reminder_enabled = $validated['appointmentReminderEnabled'];
        }
        if (array_key_exists('appointmentReminderHoursBefore', $validated)) {
            $settings->appointment_reminder_hours_before = $validated['appointmentReminderHoursBefore'];
        }
        if (array_key_exists('paymentReminderEnabled', $validated)) {
            $settings->payment_reminder_enabled = $validated['paymentReminderEnabled'];
        }
        if (array_key_exists('paymentReminderHoursBefore', $validated)) {
            $settings->payment_reminder_hours_before = $validated['paymentReminderHoursBefore'];
        }

        $settings->save();

        return response()->json([
            'settings' => NotificationConfig::forAdmin(),
        ]);
    }
}
