<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Support\OutboundMail;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MailTestController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:190'],
        ]);

        $booking = Booking::query()->orderByDesc('id')->first();
        if (! $booking) {
            return response()->json([
                'sent' => false,
                'message' => 'No bookings exist yet. Create a test booking first, then retry.',
            ], 422);
        }

        $sent = OutboundMail::send(
            new BookingConfirmationMail($booking),
            $validated['email'],
            'admin-mail-test',
        );

        return response()->json([
            'sent' => $sent,
            'message' => $sent
                ? 'Test email sent. Check inbox and spam.'
                : 'Send failed. Check storage/logs/laravel.log for "Outbound mail".',
            'mailer' => OutboundMail::driverLabel(),
            'smtpHost' => config('mail.mailers.smtp.host'),
            'smtpPort' => config('mail.mailers.smtp.port'),
            'from' => config('mail.from.address'),
            'bookingReference' => $booking->reference,
        ], $sent ? 200 : 502);
    }
}
