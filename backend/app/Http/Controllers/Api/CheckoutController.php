<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\PaymentSetting;
use App\Support\BookingCreator;
use App\Support\CheckoutTotals;
use App\Support\FrontendApi;
use App\Support\PaymentConfig;
use App\Support\StripeGateway;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class CheckoutController extends Controller
{
    public function paymentConfig(): JsonResponse
    {
        return response()->json(PaymentConfig::forCheckout());
    }

    public function prepare(Request $request): JsonResponse
    {
        $validated = $this->validatedBasket($request);
        $totals = CheckoutTotals::calculate(
            $validated['items'],
            $validated['serviceIds'] ?? [],
            $validated['voucherCode'] ?? null,
            $validated['serviceSelections'] ?? [],
        );

        return response()->json(['totals' => [
            'subtotal' => $totals['subtotal'],
            'voucherDiscount' => $totals['voucherDiscount'],
            'servicesTotal' => $totals['servicesTotal'],
            'total' => $totals['total'],
        ]]);
    }

    public function stripePaymentIntent(Request $request): JsonResponse
    {
        PaymentConfig::assertMethodEnabled('stripe');

        $validated = $this->validatedBasket($request);
        $validated = array_merge($validated, $request->validate([
            'customerName' => ['required', 'string', 'max:120'],
            'customerEmail' => ['required', 'email', 'max:255'],
            'customerPhone' => ['required', 'string', 'max:32'],
            'slot' => ['required', 'array'],
            'slot.date' => ['required', 'string', 'max:32'],
            'slot.time' => ['required', 'string', 'max:8'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]));

        $totals = CheckoutTotals::calculate(
            $validated['items'],
            $validated['serviceIds'] ?? [],
            $validated['voucherCode'] ?? null,
            $validated['serviceSelections'] ?? [],
        );

        $settings = PaymentSetting::current();
        $stripe = StripeGateway::fromSecret($settings->stripeSecretKey());
        if (! $stripe) {
            abort(422, 'Stripe is not configured.');
        }

        $amountPence = (int) round($totals['total'] * 100);
        if ($amountPence < 50) {
            abort(422, 'Order total is too low for card payment.');
        }

        $booking = BookingCreator::create([
            'customerName' => $validated['customerName'],
            'customerEmail' => $validated['customerEmail'],
            'customerPhone' => $validated['customerPhone'],
            'slot' => $validated['slot'],
            'notes' => $validated['notes'] ?? null,
            'serviceIds' => $validated['serviceIds'] ?? [],
            'serviceSelections' => $validated['serviceSelections'] ?? [],
            'paymentMethod' => 'stripe',
            'paymentStatus' => 'pending',
            'status' => 'pending_payment',
        ], $totals);

        $intent = $stripe->createPaymentIntent(
            $amountPence,
            'gbp',
            ['booking_reference' => $booking->reference],
            $booking->customer_email,
        );

        $booking->update(['stripe_payment_intent_id' => $intent['id']]);

        return response()->json([
            'clientSecret' => $intent['client_secret'],
            'paymentIntentId' => $intent['id'],
            'booking' => FrontendApi::booking($booking->fresh()),
            'manageUrl' => '/booking/manage?ref='.$booking->reference.'&token='.$booking->access_token,
        ], 201);
    }

    public function confirmStripe(Request $request, string $reference): JsonResponse
    {
        $validated = $request->validate([
            'paymentIntentId' => ['required', 'string', 'max:255'],
        ]);

        $booking = Booking::query()->where('reference', $reference)->firstOrFail();

        if ($booking->payment_status === 'paid') {
            return response()->json([
                'booking' => FrontendApi::booking($booking),
                'emailSent' => false,
                'message' => 'Payment already recorded.',
            ]);
        }

        if ($booking->payment_method !== 'stripe' || $booking->stripe_payment_intent_id !== $validated['paymentIntentId']) {
            abort(422, 'Payment does not match this booking.');
        }

        $settings = PaymentSetting::current();
        $stripe = StripeGateway::fromSecret($settings->stripeSecretKey());
        if (! $stripe) {
            abort(422, 'Stripe is not configured.');
        }

        $intent = $stripe->retrievePaymentIntent($validated['paymentIntentId']);
        if (($intent['status'] ?? '') !== 'succeeded') {
            abort(422, 'Payment has not completed yet.');
        }

        $booking = BookingCreator::confirmPaid($booking, (float) $booking->total);
        $emailSent = BookingCreator::sendConfirmation($booking);

        return response()->json([
            'booking' => FrontendApi::booking($booking),
            'manageUrl' => '/booking/manage?ref='.$booking->reference.'&token='.$booking->access_token,
            'emailSent' => $emailSent,
            'message' => 'Payment received. Your booking is confirmed.',
        ]);
    }

    private function validatedBasket(Request $request): array
    {
        return $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.skuId' => ['required', 'integer'],
            'items.*.qty' => ['required', 'integer', 'min:1', 'max:8'],
            'serviceIds' => ['nullable', 'array'],
            'serviceIds.*' => ['integer'],
            'serviceSelections' => ['nullable', 'array'],
            'serviceSelections.*.optionKey' => ['required_with:serviceSelections.*', 'string', 'max:16'],
            'serviceSelections.*.customPrice' => ['nullable', 'numeric', 'min:0', 'max:99999'],
            'voucherCode' => ['nullable', 'string', 'max:32'],
        ]);
    }
}
