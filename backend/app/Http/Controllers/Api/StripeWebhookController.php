<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentSetting;
use App\Support\BookingCreator;
use App\Support\StripeGateway;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $settings = PaymentSetting::current();
        $secret = $settings->stripeWebhookSecret();
        if (! $secret) {
            abort(400, 'Webhook not configured.');
        }

        $payload = $request->getContent();
        $gateway = StripeGateway::fromSecret($settings->stripeSecretKey());
        if (! $gateway || ! $gateway->verifyWebhookSignature($payload, $request->header('Stripe-Signature'), $secret)) {
            abort(400, 'Invalid signature.');
        }

        $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
        $type = $event['type'] ?? '';

        if ($type === 'payment_intent.succeeded') {
            $intent = $event['data']['object'] ?? [];
            $reference = $intent['metadata']['booking_reference'] ?? null;
            if ($reference) {
                $booking = Booking::query()->where('reference', $reference)->first();
                if ($booking && $booking->payment_status !== 'paid') {
                    $booking = BookingCreator::confirmPaid($booking, (float) $booking->total);
                    BookingCreator::sendConfirmation($booking);
                }
            }
        }

        return response('ok', 200);
    }
}
