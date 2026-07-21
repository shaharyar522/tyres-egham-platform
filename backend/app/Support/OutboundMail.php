<?php

namespace App\Support;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class OutboundMail
{
    public static function send(Mailable $mailable, string $recipient, string $context = 'mail'): bool
    {
        if (! config('mail.bookings.enabled', true)) {
            Log::info('Outbound mail skipped (disabled)', ['context' => $context, 'to' => $recipient]);

            return false;
        }

        try {
            $bcc = config('mail.bookings.bcc');
            if (is_string($bcc) && $bcc !== '') {
                $mailable->bcc($bcc);
            }

            $replyTo = config('mail.bookings.reply_to');
            if (is_string($replyTo) && $replyTo !== '') {
                $mailable->replyTo($replyTo);
            }

            Mail::to($recipient)->send($mailable);

            return true;
        } catch (\Throwable $e) {
            Log::warning('Outbound mail failed', [
                'context' => $context,
                'to' => $recipient,
                'mailer' => config('mail.default'),
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    public static function driverLabel(): string
    {
        return (string) config('mail.default', 'log');
    }
}
