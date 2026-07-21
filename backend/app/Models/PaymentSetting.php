<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;

class PaymentSetting extends Model
{
    protected $guarded = [];

    protected function casts(): array
    {
        return [
            'stripe_enabled' => 'boolean',
            'pay_on_fitment_enabled' => 'boolean',
        ];
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'stripe_enabled' => false,
                'pay_on_fitment_enabled' => true,
                'default_payment_method' => 'pay_on_fitment',
            ],
        );
    }

    public function storeStripeSecretKey(?string $plain): void
    {
        $this->attributes['stripe_secret_key'] = $plain ? Crypt::encryptString($plain) : null;
    }

    public function storeStripeWebhookSecret(?string $plain): void
    {
        $this->attributes['stripe_webhook_secret'] = $plain ? Crypt::encryptString($plain) : null;
    }

    public function stripeSecretKey(): ?string
    {
        if (empty($this->attributes['stripe_secret_key'])) {
            return config('payments.stripe_secret') ?: null;
        }

        try {
            return Crypt::decryptString($this->attributes['stripe_secret_key']);
        } catch (\Throwable) {
            return null;
        }
    }

    public function stripeWebhookSecret(): ?string
    {
        if (empty($this->attributes['stripe_webhook_secret'])) {
            return config('payments.stripe_webhook_secret') ?: null;
        }

        try {
            return Crypt::decryptString($this->attributes['stripe_webhook_secret']);
        } catch (\Throwable) {
            return null;
        }
    }

    public function publishableKey(): ?string
    {
        return $this->stripe_publishable_key ?: config('payments.stripe_publishable') ?: null;
    }
}
