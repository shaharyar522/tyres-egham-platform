<?php

namespace App\Support;

use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class StripeGateway
{
    public function __construct(private readonly string $secretKey) {}

    public static function fromSecret(?string $secret): ?self
    {
        if (! $secret) {
            return null;
        }

        return new self($secret);
    }

    /**
     * @param  array<string, mixed>  $metadata
     * @return array{id: string, client_secret: string, status: string}
     */
    public function createPaymentIntent(int $amountPence, string $currency, array $metadata, string $receiptEmail): array
    {
        $payload = [
            'amount' => $amountPence,
            'currency' => $currency,
            'automatic_payment_methods[enabled]' => 'true',
            'receipt_email' => $receiptEmail,
        ];
        foreach ($metadata as $key => $value) {
            $payload["metadata[{$key}]"] = $value;
        }

        $response = Http::withBasicAuth($this->secretKey, '')
            ->asForm()
            ->post('https://api.stripe.com/v1/payment_intents', $payload);

        if ($response->failed()) {
            throw new \RuntimeException('Stripe payment could not be started: '.$response->json('error.message', 'Unknown error'));
        }

        return $response->json();
    }

    /**
     * @return array{id: string, status: string, metadata?: array}
     */
    public function retrievePaymentIntent(string $id): array
    {
        $response = Http::withBasicAuth($this->secretKey, '')
            ->get("https://api.stripe.com/v1/payment_intents/{$id}");

        if ($response->failed()) {
            throw new \RuntimeException('Could not verify Stripe payment.');
        }

        return $response->json();
    }

    public function verifyWebhookSignature(string $payload, ?string $signatureHeader, string $webhookSecret): bool
    {
        if (! $signatureHeader) {
            return false;
        }

        $parts = [];
        foreach (explode(',', $signatureHeader) as $part) {
            [$key, $value] = array_pad(explode('=', trim($part), 2), 2, null);
            if ($key && $value) {
                $parts[$key] = $value;
            }
        }

        $timestamp = $parts['t'] ?? null;
        $signature = $parts['v1'] ?? null;
        if (! $timestamp || ! $signature) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > 300) {
            return false;
        }

        $signed = hash_hmac('sha256', $timestamp.'.'.$payload, $webhookSecret);

        return hash_equals($signed, $signature);
    }
}
