<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use App\Support\PaymentConfig;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PaymentSettingsController extends Controller
{
    public function show(): JsonResponse
    {
        $settings = PaymentSetting::current();

        return response()->json([
            'settings' => $this->toAdminArray($settings),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'stripeEnabled' => ['sometimes', 'boolean'],
            'payOnFitmentEnabled' => ['sometimes', 'boolean'],
            'defaultPaymentMethod' => ['sometimes', 'string', Rule::in(['pay_on_fitment', 'stripe'])],
            'stripePublishableKey' => ['nullable', 'string', 'max:255'],
            'stripeSecretKey' => ['nullable', 'string', 'max:255'],
            'stripeWebhookSecret' => ['nullable', 'string', 'max:255'],
            'clearStripeSecretKey' => ['sometimes', 'boolean'],
            'clearStripeWebhookSecret' => ['sometimes', 'boolean'],
        ]);

        $settings = PaymentSetting::current();

        if (array_key_exists('stripeEnabled', $validated)) {
            $settings->stripe_enabled = $validated['stripeEnabled'];
        }
        if (array_key_exists('payOnFitmentEnabled', $validated)) {
            $settings->pay_on_fitment_enabled = $validated['payOnFitmentEnabled'];
        }
        if (array_key_exists('defaultPaymentMethod', $validated)) {
            $settings->default_payment_method = $validated['defaultPaymentMethod'];
        }
        if (array_key_exists('stripePublishableKey', $validated)) {
            $settings->stripe_publishable_key = $validated['stripePublishableKey'] ?: null;
        }
        if (! empty($validated['clearStripeSecretKey'])) {
            $settings->stripe_secret_key = null;
        } elseif (! empty($validated['stripeSecretKey'])) {
            $settings->storeStripeSecretKey($validated['stripeSecretKey']);
        }
        if (! empty($validated['clearStripeWebhookSecret'])) {
            $settings->stripe_webhook_secret = null;
        } elseif (! empty($validated['stripeWebhookSecret'])) {
            $settings->storeStripeWebhookSecret($validated['stripeWebhookSecret']);
        }

        if (! $settings->stripe_enabled && ! $settings->pay_on_fitment_enabled) {
            $settings->pay_on_fitment_enabled = true;
        }

        $settings->save();

        return response()->json([
            'settings' => $this->toAdminArray($settings->fresh()),
            'checkout' => PaymentConfig::forCheckout(),
        ]);
    }

    private function toAdminArray(PaymentSetting $settings): array
    {
        $hasSecret = ! empty($settings->getAttributes()['stripe_secret_key']) || config('payments.stripe_secret');
        $hasWebhook = ! empty($settings->getAttributes()['stripe_webhook_secret']) || config('payments.stripe_webhook_secret');

        return [
            'stripeEnabled' => $settings->stripe_enabled,
            'payOnFitmentEnabled' => $settings->pay_on_fitment_enabled,
            'defaultPaymentMethod' => $settings->default_payment_method,
            'stripePublishableKey' => $settings->stripe_publishable_key ?? '',
            'stripeSecretKeyConfigured' => $hasSecret,
            'stripeWebhookSecretConfigured' => $hasWebhook,
            'stripePublishableKeyPreview' => $this->maskKey($settings->publishableKey()),
        ];
    }

    private function maskKey(?string $key): ?string
    {
        if (! $key || strlen($key) < 12) {
            return $key;
        }

        return substr($key, 0, 8).'…'.substr($key, -4);
    }
}
