<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\BookingMailData;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingAppointmentReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reminder: your fitting appointment — '.$this->booking->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.booking-appointment-reminder',
            with: [
                'booking' => $this->booking,
                'manageUrl' => BookingMailData::manageUrl($this->booking),
                'workshop' => BookingMailData::workshop(),
            ],
        );
    }
}
