<?php

namespace App\Support;

use App\Mail\BookingAppointmentReminderMail;
use App\Mail\BookingPaymentReminderMail;
use App\Models\Booking;
use App\Models\NotificationSetting;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class BookingReminderService
{
    public function __construct(private readonly NotificationSetting $settings) {}

    public static function make(): self
    {
        return new self(NotificationSetting::current());
    }

    /**
     * @return array{appointment: int, payment: int}
     */
    public function sendDueReminders(bool $dryRun = false): array
    {
        $counts = ['appointment' => 0, 'payment' => 0];

        if ($this->settings->appointment_reminder_enabled) {
            foreach ($this->appointmentRemindersDue() as $booking) {
                if ($dryRun) {
                    $counts['appointment']++;
                    continue;
                }
                if ($this->sendAppointmentReminder($booking)) {
                    $counts['appointment']++;
                }
            }
        }

        if ($this->settings->payment_reminder_enabled) {
            foreach ($this->paymentRemindersDue() as $booking) {
                if ($dryRun) {
                    $counts['payment']++;
                    continue;
                }
                if ($this->sendPaymentReminder($booking)) {
                    $counts['payment']++;
                }
            }
        }

        return $counts;
    }

    /**
     * @return Collection<int, Booking>
     */
    public function appointmentRemindersDue(): Collection
    {
        $hours = max(1, (int) $this->settings->appointment_reminder_hours_before);
        $window = $this->slotWindow($hours);

        return $this->activeBookings()
            ->filter(fn (Booking $booking) => $booking->appointment_reminder_sent_at === null)
            ->filter(fn (Booking $booking) => $this->slotInWindow($booking, $window))
            ->values();
    }

    /**
     * @return Collection<int, Booking>
     */
    public function paymentRemindersDue(): Collection
    {
        $hours = max(1, (int) $this->settings->payment_reminder_hours_before);
        $window = $this->slotWindow($hours);

        return $this->activeBookings()
            ->filter(fn (Booking $booking) => $booking->payment_reminder_sent_at === null)
            ->filter(fn (Booking $booking) => $booking->payment_method === 'pay_on_fitment')
            ->filter(fn (Booking $booking) => $booking->payment_status === 'unpaid')
            ->filter(fn (Booking $booking) => $this->slotInWindow($booking, $window))
            ->values();
    }

    public function sendAppointmentReminder(Booking $booking): bool
    {
        $sent = OutboundMail::send(
            new BookingAppointmentReminderMail($booking),
            $booking->customer_email,
            'booking-appointment-reminder',
        );

        if ($sent) {
            $booking->update(['appointment_reminder_sent_at' => now()]);
        }

        return $sent;
    }

    public function sendPaymentReminder(Booking $booking): bool
    {
        $sent = OutboundMail::send(
            new BookingPaymentReminderMail($booking),
            $booking->customer_email,
            'booking-payment-reminder',
        );

        if ($sent) {
            $booking->update(['payment_reminder_sent_at' => now()]);
        }

        return $sent;
    }

    public function resetRemindersForReschedule(Booking $booking): void
    {
        $booking->update([
            'appointment_reminder_sent_at' => null,
            'payment_reminder_sent_at' => null,
        ]);
    }

    /**
     * @return Collection<int, Booking>
     */
    private function activeBookings(): Collection
    {
        return Booking::query()
            ->whereNotIn('status', ['cancelled'])
            ->whereIn('status', ['confirmed', 'pending_payment'])
            ->get();
    }

    /**
     * @return array{from: Carbon, to: Carbon}
     */
    private function slotWindow(int $hoursBefore): array
    {
        $target = now()->addHours($hoursBefore);

        return [
            'from' => $target->copy()->subMinutes(30),
            'to' => $target->copy()->addMinutes(30),
        ];
    }

    /**
     * @param  array{from: Carbon, to: Carbon}  $window
     */
    private function slotInWindow(Booking $booking, array $window): bool
    {
        try {
            $starts = BookingSlotDateTime::startsAt($booking);
        } catch (\Throwable) {
            return false;
        }

        if ($starts->lte(now())) {
            return false;
        }

        return $starts->between($window['from'], $window['to']);
    }
}
