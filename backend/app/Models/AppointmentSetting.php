<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AppointmentSetting extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'closed_weekdays' => 'array',
            'capacity_per_slot' => 'integer',
            'days_ahead' => 'integer',
            'min_lead_hours' => 'integer',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'capacity_per_slot' => (int) config('appointments.capacity_per_slot', 2),
                'days_ahead' => (int) config('appointments.days_ahead', 8),
                'closed_weekdays' => config('appointments.closed_weekdays', [0]),
                'min_lead_hours' => (int) config('appointments.min_lead_hours', 2),
            ],
        );
    }

    /**
     * @return array<int, int>
     */
    public function closedWeekdaysList(): array
    {
        $days = $this->closed_weekdays ?? [0];

        return array_values(array_map('intval', $days));
    }
}
