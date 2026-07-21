<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Fitting bay capacity per time slot
    |--------------------------------------------------------------------------
    */
    'capacity_per_slot' => (int) env('APPOINTMENT_CAPACITY_PER_SLOT', 2),

    /*
    |--------------------------------------------------------------------------
    | How many calendar days ahead customers can book (starting tomorrow)
    |--------------------------------------------------------------------------
    */
    'days_ahead' => (int) env('APPOINTMENT_DAYS_AHEAD', 8),

    /*
    |--------------------------------------------------------------------------
    | Weekdays with no appointments (0 = Sunday, 6 = Saturday)
    |--------------------------------------------------------------------------
    */
    'closed_weekdays' => array_map('intval', explode(',', env('APPOINTMENT_CLOSED_WEEKDAYS', '0'))),

    /*
    |--------------------------------------------------------------------------
    | Minimum hours before a slot can be booked (same-day edge cases)
    |--------------------------------------------------------------------------
    */
    'min_lead_hours' => (int) env('APPOINTMENT_MIN_LEAD_HOURS', 2),

];
