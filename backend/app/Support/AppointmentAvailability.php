<?php

namespace App\Support;

use App\Models\AppointmentBlock;
use App\Models\AppointmentSetting;
use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class AppointmentAvailability
{
    public static function capacity(): int
    {
        return max(1, (int) AppointmentSetting::current()->capacity_per_slot);
    }

    public static function daysAhead(): int
    {
        return max(1, min(30, (int) AppointmentSetting::current()->days_ahead));
    }

    /**
     * @return array<int, int>
     */
    public static function closedWeekdays(): array
    {
        return AppointmentSetting::current()->closedWeekdaysList();
    }

    public static function minLeadHours(): int
    {
        return max(0, (int) AppointmentSetting::current()->min_lead_hours);
    }

    public static function formatDisplayDate(Carbon $date): string
    {
        return $date->format('D, j M');
    }

    public static function parseDisplayDate(string $displayDate): Carbon
    {
        $parsed = Carbon::createFromFormat('D, j M', trim($displayDate));
        $parsed->year(now()->year);

        if ($parsed->lt(now()->startOfDay()->subDay())) {
            $parsed->addYear();
        }

        return $parsed->startOfDay();
    }

    public static function availability(?string $excludeBookingReference = null): array
    {
        $capacity = self::capacity();
        $daysAhead = self::daysAhead();
        $closedWeekdays = self::closedWeekdays();
        $minLead = now()->addHours(self::minLeadHours());

        $booked = self::bookedCounts($excludeBookingReference);
        $blocks = self::blockedSlots();

        $days = [];
        $start = now()->startOfDay()->addDay();

        for ($i = 0; $i < $daysAhead; $i++) {
            $date = $start->copy()->addDays($i);

            if (in_array((int) $date->dayOfWeek, $closedWeekdays, true)) {
                continue;
            }

            $dateIso = $date->toDateString();
            $displayDate = self::formatDisplayDate($date);
            $times = [];

            foreach (BookingSlots::TIMES as $time) {
                if (self::isBlocked($blocks, $dateIso, $time)) {
                    continue;
                }

                $slotStart = $date->copy()->setTimeFromTimeString($time);
                if ($slotStart->lt($minLead)) {
                    continue;
                }

                $key = $displayDate.'|'.$time;
                $taken = (int) ($booked[$key] ?? 0);
                $remaining = max(0, $capacity - $taken);

                if ($remaining === 0) {
                    continue;
                }

                $times[] = [
                    'time' => $time,
                    'remaining' => $remaining,
                ];
            }

            if ($times !== []) {
                $days[] = [
                    'date' => $displayDate,
                    'dateIso' => $dateIso,
                    'weekday' => $date->format('D'),
                    'day' => (int) $date->format('j'),
                    'month' => $date->format('M'),
                    'times' => $times,
                ];
            }
        }

        return [
            'days' => $days,
            'meta' => [
                'capacityPerSlot' => $capacity,
                'daysAhead' => $daysAhead,
                'times' => BookingSlots::TIMES,
            ],
        ];
    }

    public static function assertAvailable(string $displayDate, string $time, ?string $excludeBookingReference = null): void
    {
        if (! BookingSlots::isValidTime($time)) {
            throw ValidationException::withMessages([
                'slot.time' => 'Invalid appointment time.',
            ]);
        }

        $availability = self::availability($excludeBookingReference);

        foreach ($availability['days'] as $day) {
            if ($day['date'] !== $displayDate) {
                continue;
            }

            foreach ($day['times'] as $slot) {
                if ($slot['time'] === $time) {
                    return;
                }
            }
        }

        throw ValidationException::withMessages([
            'slot' => 'That appointment slot is no longer available. Please choose another time.',
        ]);
    }

    private static function bookedCounts(?string $excludeBookingReference): Collection
    {
        $query = Booking::query()->where('status', '!=', 'cancelled');

        if ($excludeBookingReference) {
            $query->where('reference', '!=', $excludeBookingReference);
        }

        return $query
            ->selectRaw('slot_date, slot_time, COUNT(*) as total')
            ->groupBy('slot_date', 'slot_time')
            ->get()
            ->mapWithKeys(fn ($row) => [$row->slot_date.'|'.$row->slot_time => (int) $row->total]);
    }

    private static function blockedSlots(): Collection
    {
        return AppointmentBlock::query()
            ->get()
            ->groupBy(fn (AppointmentBlock $block) => $block->block_date->toDateString());
    }

    private static function isBlocked(Collection $blocks, string $dateIso, string $time): bool
    {
        $dayBlocks = $blocks->get($dateIso);
        if (! $dayBlocks) {
            return false;
        }

        foreach ($dayBlocks as $block) {
            if ($block->slot_time === '' || $block->slot_time === $time) {
                return true;
            }
        }

        return false;
    }
}
