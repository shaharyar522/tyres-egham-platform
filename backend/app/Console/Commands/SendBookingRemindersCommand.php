<?php

namespace App\Console\Commands;

use App\Support\BookingReminderService;
use Illuminate\Console\Command;

class SendBookingRemindersCommand extends Command
{
    protected $signature = 'bookings:send-reminders {--dry-run : List reminders that would be sent without sending email}';

    protected $description = 'Send appointment and payment reminder emails for upcoming bookings';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $counts = BookingReminderService::make()->sendDueReminders($dryRun);

        $prefix = $dryRun ? 'Would send' : 'Sent';
        $this->info("{$prefix} {$counts['appointment']} appointment reminder(s).");
        $this->info("{$prefix} {$counts['payment']} payment reminder(s).");

        return self::SUCCESS;
    }
}
