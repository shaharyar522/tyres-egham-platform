<?php

namespace App\Support;

use Illuminate\Mail\Mailable;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Throwable;

class OutboundMail
{
    public static function send(Mailable $mailable, string $recipient, string $context = 'mail'): bool
    {
        if (! config('mail.bookings.enabled', true)) {
            Log::info('Outbound mail skipped (disabled)', ['context' => $context, 'to' => $recipient]);

            return false;
        }

        foreach (self::mailersToTry() as $mailerName) {
            if (self::attempt($mailable, $recipient, $context, $mailerName, withBcc: true)) {
                return true;
            }

            // BCC can make some cPanel relays reject the message — retry without it.
            if (self::hasBcc() && self::attempt($mailable, $recipient, $context, $mailerName, withBcc: false)) {
                Log::warning('Outbound mail sent without BCC after BCC attempt failed', [
                    'context' => $context,
                    'to' => $recipient,
                    'mailer' => $mailerName,
                ]);

                return true;
            }
        }

        Log::warning('Outbound mail failed', [
            'context' => $context,
            'to' => $recipient,
            'mailer' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'try' => self::mailersToTry(),
        ]);

        return false;
    }

    private static function attempt(
        Mailable $mailable,
        string $recipient,
        string $context,
        string $mailerName,
        bool $withBcc,
    ): bool {
        try {
            $message = clone $mailable;

            if ($withBcc) {
                $bcc = config('mail.bookings.bcc');
                if (is_string($bcc) && trim($bcc) !== '') {
                    $message->bcc(trim($bcc));
                }
            }

            $replyTo = config('mail.bookings.reply_to');
            if (is_string($replyTo) && trim($replyTo) !== '') {
                $message->replyTo(trim($replyTo));
            }

            Mail::mailer($mailerName)->to($recipient)->send($message);

            Log::info('Outbound mail sent', [
                'context' => $context,
                'to' => $recipient,
                'mailer' => $mailerName,
                'host' => config('mail.mailers.smtp.host'),
                'bcc' => $withBcc && self::hasBcc(),
            ]);

            return true;
        } catch (Throwable $e) {
            Log::warning('Outbound mail attempt failed', [
                'context' => $context,
                'to' => $recipient,
                'mailer' => $mailerName,
                'host' => config('mail.mailers.smtp.host'),
                'port' => config('mail.mailers.smtp.port'),
                'scheme' => config('mail.mailers.smtp.scheme'),
                'username' => config('mail.mailers.smtp.username'),
                'with_bcc' => $withBcc,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }

    private static function hasBcc(): bool
    {
        $bcc = config('mail.bookings.bcc');

        return is_string($bcc) && trim($bcc) !== '';
    }

    /**
     * @return list<string>
     */
    public static function mailersToTry(): array
    {
        $default = (string) config('mail.default', 'smtp');

        // Opt-in sendmail fallback for cPanel/Namecheap live only.
        $fallbackSendmail = filter_var(env('MAIL_FALLBACK_SENDMAIL', false), FILTER_VALIDATE_BOOL);

        if (! $fallbackSendmail || in_array($default, ['failover', 'sendmail', 'log', 'array'], true)) {
            return [$default];
        }

        return array_values(array_unique([$default, 'sendmail']));
    }

    public static function driverLabel(): string
    {
        return implode(' → ', self::mailersToTry());
    }
}
