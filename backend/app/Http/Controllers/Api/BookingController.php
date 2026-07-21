<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\BookingCancelledMail;
use App\Mail\BookingRescheduledMail;
use App\Models\Booking;
use App\Support\AppointmentAvailability;
use App\Support\BookingCreator;
use App\Support\BookingReminderService;
use App\Support\BookingSlots;
use App\Support\CheckoutTotals;
use App\Support\FrontendApi;
use App\Support\OutboundMail;
use App\Support\PaymentConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        PaymentConfig::assertMethodEnabled('pay_on_fitment');

        $validated = $request->validate([
            'customerName' => ['required', 'string', 'max:120'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'customerPhone' => ['required', 'string', 'max:32'],
            'slot' => ['required', 'array'],
            'slot.date' => ['required', 'string', 'max:32'],
            'slot.time' => ['required', 'string', 'max:8'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'voucherCode' => ['nullable', 'string', 'max:32'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.skuId' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:8'],
            'serviceIds' => ['nullable', 'array'],
            'serviceIds.*' => ['integer'],
            'serviceSelections' => ['nullable', 'array'],
            'serviceSelections.*.optionKey' => ['required_with:serviceSelections.*', 'string', 'max:16'],
            'serviceSelections.*.customPrice' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'paymentMethod' => ['nullable', 'string', Rule::in(['pay_on_fitment'])],
        ]);

        $totals = CheckoutTotals::calculate(
            $validated['items'],
            $validated['serviceIds'] ?? [],
            $validated['voucherCode'] ?? null,
            $validated['serviceSelections'] ?? [],
        );

        $booking = BookingCreator::create([
            'customerName' => $validated['customerName'],
            'customerEmail' => $validated['customerEmail'],
            'customerPhone' => $validated['customerPhone'],
            'slot' => $validated['slot'],
            'notes' => $validated['notes'] ?? null,
            'serviceIds' => $validated['serviceIds'] ?? [],
            'serviceSelections' => $validated['serviceSelections'] ?? [],
            'paymentMethod' => 'pay_on_fitment',
            'paymentStatus' => 'unpaid',
            'status' => 'confirmed',
        ], $totals);

        $emailSent = BookingCreator::sendConfirmation($booking);

        return response()->json([
            'booking' => FrontendApi::booking($booking),
            'manageUrl' => '/booking/manage?ref='.$booking->reference.'&token='.$booking->access_token,
            'emailSent' => $emailSent,
        ], 201);
    }

    public function show(Request $request, string $reference): JsonResponse
    {
        $booking = $this->resolveBooking($request, $reference);

        return response()->json([
            'booking' => FrontendApi::booking($booking),
        ]);
    }

    public function update(Request $request, string $reference): JsonResponse
    {
        $booking = $this->resolveBooking($request, $reference);

        if ($booking->status === 'cancelled') {
            throw ValidationException::withMessages([
                'booking' => 'This booking has been cancelled and cannot be changed online.',
            ]);
        }

        $validated = $request->validate([
            'slot' => ['required', 'array'],
            'slot.date' => ['required', 'string', 'max:32'],
            'slot.time' => ['required', 'string', Rule::in(BookingSlots::TIMES)],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        AppointmentAvailability::assertAvailable(
            $validated['slot']['date'],
            $validated['slot']['time'],
            $booking->reference,
        );

        $previousSlot = [
            'date' => $booking->slot_date,
            'time' => $booking->slot_time,
        ];

        $booking->update([
            'slot_date' => $validated['slot']['date'],
            'slot_time' => $validated['slot']['time'],
            'notes' => array_key_exists('notes', $validated) ? ($validated['notes'] ?? null) : $booking->notes,
            'status' => $booking->status === 'pending_payment' ? 'pending_payment' : 'confirmed',
        ]);

        BookingReminderService::make()->resetRemindersForReschedule($booking->fresh());

        OutboundMail::send(
            new BookingRescheduledMail($booking->fresh(), $previousSlot),
            $booking->customer_email,
            'booking-reschedule',
        );

        return response()->json([
            'booking' => FrontendApi::booking($booking->fresh()),
            'message' => 'Your appointment has been rescheduled.',
        ]);
    }

    public function cancel(Request $request, string $reference): JsonResponse
    {
        $booking = $this->resolveBooking($request, $reference);

        if ($booking->status === 'cancelled') {
            throw ValidationException::withMessages([
                'booking' => 'This booking is already cancelled.',
            ]);
        }

        $booking->update(['status' => 'cancelled']);

        OutboundMail::send(
            new BookingCancelledMail($booking->fresh()),
            $booking->customer_email,
            'booking-cancel',
        );

        return response()->json([
            'booking' => FrontendApi::booking($booking->fresh()),
            'message' => 'Your booking has been cancelled.',
        ]);
    }

    private function resolveBooking(Request $request, string $reference): Booking
    {
        $token = (string) ($request->query('token') ?? $request->input('token', ''));
        if ($token === '') {
            abort(403, 'Access token required.');
        }

        return Booking::query()
            ->where('reference', $reference)
            ->where('access_token', $token)
            ->firstOrFail();
    }
}
