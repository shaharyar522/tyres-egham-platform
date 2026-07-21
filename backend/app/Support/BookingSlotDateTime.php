<?php

namespace App\Support;

use App\Models\Booking;
use Carbon\Carbon;

class BookingSlotDateTime
{
    public static function startsAt(Booking $booking): Carbon
    {
        $date = AppointmentAvailability::parseDisplayDate($booking->slot_date);
        [$hour, $minute] = array_pad(explode(':', $booking->slot_time), 2, 0);

        return $date->setTime((int) $hour, (int) $minute, 0);
    }
}
