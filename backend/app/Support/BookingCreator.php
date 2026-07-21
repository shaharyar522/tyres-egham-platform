<?php

namespace App\Support;

use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Models\PaymentSetting;
use Illuminate\Support\Str;

class BookingCreator
{
    /**
     * @param  array{
     *   customerName: string,
     *   customerEmail: string,
     *   customerPhone: string,
     *   slot: array{date: string, time: string},
     *   notes?: ?string,
     *   serviceIds: array,
     *   serviceSelections?: array,
     *   paymentMethod: string,
     *   paymentStatus: string,
     *   status: string,
     *   stripePaymentIntentId?: ?string,
     *   amountPaid?: ?float,
     *   paidAt?: ?\DateTimeInterface,
     * }  $customer
     * @param  array  $totals  from CheckoutTotals::calculate
     */
    public static function create(array $customer, array $totals): Booking
    {
        AppointmentAvailability::assertAvailable(
            $customer['slot']['date'],
            $customer['slot']['time'],
        );

        return Booking::create([
            'reference' => static::uniqueReference(),
            'access_token' => Str::random(48),
            'customer_name' => $customer['customerName'],
            'customer_email' => $customer['customerEmail'],
            'customer_phone' => $customer['customerPhone'],
            'slot_date' => $customer['slot']['date'],
            'slot_time' => $customer['slot']['time'],
            'notes' => $customer['notes'] ?? null,
            'voucher_code' => $totals['voucherCode'],
            'subtotal' => $totals['subtotal'],
            'voucher_discount' => $totals['voucherDiscount'],
            'services_total' => $totals['servicesTotal'],
            'total' => $totals['total'],
            'items' => $totals['items'],
            'service_ids' => $customer['serviceIds'],
            'service_selections' => $customer['serviceSelections'] ?? null,
            'status' => $customer['status'],
            'payment_method' => $customer['paymentMethod'],
            'payment_status' => $customer['paymentStatus'],
            'stripe_payment_intent_id' => $customer['stripePaymentIntentId'] ?? null,
            'amount_paid' => $customer['amountPaid'] ?? null,
            'paid_at' => $customer['paidAt'] ?? null,
        ]);
    }

    public static function confirmPaid(Booking $booking, float $amount): Booking
    {
        $booking->update([
            'payment_status' => 'paid',
            'status' => 'confirmed',
            'amount_paid' => $amount,
            'paid_at' => now(),
        ]);

        return $booking->fresh();
    }

    public static function sendConfirmation(Booking $booking): bool
    {
        return OutboundMail::send(
            new BookingConfirmationMail($booking),
            $booking->customer_email,
            'booking-confirmation',
        );
    }

    private static function uniqueReference(): string
    {
        do {
            $reference = 'EG-'.strtoupper(Str::random(6));
        } while (Booking::query()->where('reference', $reference)->exists());

        return $reference;
    }
}
