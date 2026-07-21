<?php

namespace App\Support;

use App\Models\PaymentSetting;

class PaymentConfig
{
    public static function forCheckout(): array
    {
        $settings = PaymentSetting::current();
        $stripeEnabled = $settings->stripe_enabled && static::stripeConfigured($settings);
        $payOnFitmentEnabled = $settings->pay_on_fitment_enabled;

        $methods = [];
        if ($payOnFitmentEnabled) {
            $methods[] = 'pay_on_fitment';
        }
        if ($stripeEnabled) {
            $methods[] = 'stripe';
        }

        $default = $settings->default_payment_method;
        if (! in_array($default, $methods, true)) {
            $default = $methods[0] ?? 'pay_on_fitment';
        }

        return [
            'methods' => $methods,
            'stripeEnabled' => $stripeEnabled,
            'payOnFitmentEnabled' => $payOnFitmentEnabled,
            'stripePublishableKey' => $stripeEnabled ? $settings->publishableKey() : null,
            'defaultPaymentMethod' => $default,
        ];
    }

    public static function assertMethodEnabled(string $method): void
    {
        $config = static::forCheckout();
        if (! in_array($method, $config['methods'], true)) {
            abort(422, 'This payment method is not available.');
        }
    }

    private static function stripeConfigured(PaymentSetting $settings): bool
    {
        return $settings->publishableKey() && $settings->stripeSecretKey();
    }
}
