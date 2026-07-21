<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\BookingMailData;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingRescheduledMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Booking $booking,
        public array $previousSlot,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Booking rescheduled — '.$this->booking->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.booking-rescheduled',
            with: [
                'booking' => $this->booking,
                'previousSlot' => $this->previousSlot,
                'manageUrl' => BookingMailData::manageUrl($this->booking),
                'workshop' => BookingMailData::workshop(),
            ],
        );
    }
}
