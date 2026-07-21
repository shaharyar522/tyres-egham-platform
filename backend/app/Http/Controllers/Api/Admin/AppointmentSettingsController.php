<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppointmentSetting;
use App\Support\AppointmentConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        return response()->json([
            'settings' => AppointmentConfig::forAdmin(),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'capacityPerSlot' => ['required', 'integer', 'min:1', 'max:20'],
            'daysAhead' => ['required', 'integer', 'min:1', 'max:30'],
            'closedWeekdays' => ['required', 'array'],
            'closedWeekdays.*' => ['integer', 'min:0', 'max:6'],
            'minLeadHours' => ['required', 'integer', 'min:0', 'max:72'],
        ]);

        $settings = AppointmentSetting::current();
        $settings->capacity_per_slot = $validated['capacityPerSlot'];
        $settings->days_ahead = $validated['daysAhead'];
        $settings->closed_weekdays = array_values(array_unique($validated['closedWeekdays']));
        $settings->min_lead_hours = $validated['minLeadHours'];
        $settings->save();

        return response()->json([
            'settings' => AppointmentConfig::forAdmin(),
        ]);
    }
}
