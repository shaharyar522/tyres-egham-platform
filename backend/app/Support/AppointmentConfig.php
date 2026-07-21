<?php

namespace App\Support;

use App\Models\AppointmentSetting;

class AppointmentConfig
{
    public static function settings(): AppointmentSetting
    {
        return AppointmentSetting::current();
    }

    public static function forAdmin(): array
    {
        $settings = self::settings();

        return [
            'capacityPerSlot' => $settings->capacity_per_slot,
            'daysAhead' => $settings->days_ahead,
            'closedWeekdays' => $settings->closedWeekdaysList(),
            'minLeadHours' => $settings->min_lead_hours,
            'slotTimes' => BookingSlots::TIMES,
        ];
    }
}
