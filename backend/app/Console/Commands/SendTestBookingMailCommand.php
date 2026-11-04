<?php

namespace App\Console\Commands;

use App\Mail\BookingConfirmationMail;
use App\Models\Booking;
use App\Support\OutboundMail;
use Illuminate\Console\Command;
class SendTestBookingMailCommand extends Command
{
    protected $signature = 'mail:test-booking
        {email? : Recipient address (defaults to latest booking customer email)}
        {--booking= : Booking reference to use instead of latest}';

    protected $description = 'Send a booking confirmation email to verify SMTP / mail configuration';

    public function handle(): int
    {
        $booking = $this->resolveBooking();
        if (! $booking) {
            return self::FAILURE;
        }

        $email = $this->argument('email') ?: $booking->customer_email;

        if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->error('Invalid email address.');

            return self::FAILURE;
        }

        $this->line('Mail driver: <info>'.OutboundMail::driverLabel().'</info>');
        $this->line('SMTP host: <info>'.(string) config('mail.mailers.smtp.host').':'.(string) config('mail.mailers.smtp.port').'</info>');
        $this->line('From: <info>'.(string) config('mail.from.address').'</info>');
        $this->line('Booking: <info>'.$booking->reference.'</info>');
        $this->line('Sending to: <info>'.$email.'</info>');

        $sent = OutboundMail::send(new BookingConfirmationMail($booking), $email, 'test-booking');

        if ($sent) {
            $this->info('Test email dispatched successfully.');
            if (config('mail.default') === 'log') {
                $this->warn('MAIL_MAILER=log — check storage/logs/laravel.log for the message body.');
            }

            return self::SUCCESS;
        }

        $this->error('Send failed. See storage/logs/laravel.log for details (search for "Outbound mail failed").');
        $this->line('On Namecheap/cPanel shared hosting, try MAIL_HOST=localhost with MAIL_VERIFY_PEER=false, then: php artisan config:clear');

        return self::FAILURE;
    }

    private function resolveBooking(): ?Booking
    {
        $reference = $this->option('booking');
        if ($reference) {
            $booking = Booking::query()->where('reference', $reference)->first();
            if (! $booking) {
                $this->error("Booking not found: {$reference}");

                return null;
            }

            return $booking;
        }

        $booking = Booking::query()->orderByDesc('id')->first();
        if (! $booking) {
            $this->error('No bookings in database. Place a test order via checkout first.');

            return null;
        }

        return $booking;
    }
}
