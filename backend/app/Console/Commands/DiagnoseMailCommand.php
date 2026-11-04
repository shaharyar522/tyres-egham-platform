<?php

namespace App\Console\Commands;

use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Support\OutboundMail;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

class DiagnoseMailCommand extends Command
{
    protected $signature = 'mail:diagnose
        {email? : Optional address to send a real test booking email to}';

    protected $description = 'Show live mail config and test SMTP/sendmail (for cPanel debugging)';

    public function handle(): int
    {
        $smtp = config('mail.mailers.smtp');
        $password = (string) ($smtp['password'] ?? '');

        $this->info('Mail configuration');
        $this->table(['Key', 'Value'], [
            ['default', (string) config('mail.default')],
            ['try order', OutboundMail::driverLabel()],
            ['from', (string) config('mail.from.address')],
            ['reply_to', (string) config('mail.bookings.reply_to')],
            ['bcc', (string) (config('mail.bookings.bcc') ?: '(none)')],
            ['bookings_enabled', config('mail.bookings.enabled') ? 'true' : 'false'],
            ['smtp.host', (string) ($smtp['host'] ?? '')],
            ['smtp.port', (string) ($smtp['port'] ?? '')],
            ['smtp.scheme', (string) ($smtp['scheme'] ?? '')],
            ['smtp.username', (string) ($smtp['username'] ?? '')],
            ['smtp.password_len', (string) strlen($password)],
            ['smtp.password_has_$', str_contains($password, '$') ? 'yes' : 'no'],
            ['sendmail.path', (string) config('mail.mailers.sendmail.path')],
            ['verify_peer_disabled', empty($smtp['stream']) ? 'no' : 'yes'],
        ]);

        $this->newLine();
        $this->info('Transport probes (no email content)');

        foreach (['smtp', 'sendmail'] as $mailer) {
            try {
                Mail::mailer($mailer);
                $this->line("  <info>✓</info> mailer [{$mailer}] resolves");
            } catch (Throwable $e) {
                $this->line("  <error>✗</error> mailer [{$mailer}] — ".$e->getMessage());
            }
        }

        $email = $this->argument('email');
        if (! $email) {
            $this->newLine();
            $this->comment('Re-run with an email to send a real test: php artisan mail:diagnose you@example.com');

            return self::SUCCESS;
        }

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $booking = Booking::query()->orderByDesc('id')->first();
        if (! $booking) {
            $this->error('No bookings found to use as a test template.');

            return self::FAILURE;
        }

        $this->newLine();
        $this->info("Sending test confirmation for {$booking->reference} → {$email}");
        $sent = OutboundMail::send(new BookingConfirmationMail($booking), $email, 'mail-diagnose');

        if ($sent) {
            $this->info('Sent OK. Check inbox and spam for the message.');

            return self::SUCCESS;
        }

        $this->error('Send failed. Tail storage/logs/laravel.log for "Outbound mail".');
        $this->line('Recommended live .env for Namecheap/cPanel:');
        $this->line('  MAIL_MAILER=smtp');
        $this->line('  MAIL_HOST=localhost');
        $this->line('  MAIL_PORT=465');
        $this->line('  MAIL_SCHEME=smtps');
        $this->line('  MAIL_VERIFY_PEER=false');
        $this->line('  MAIL_SENDMAIL_PATH="/usr/sbin/sendmail -t -i"');

        return self::FAILURE;
    }
}
