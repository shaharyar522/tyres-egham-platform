<?php

namespace App\Mail;

use App\Models\Booking;
use App\Support\BookingMailData;
use App\Support\SiteConfig;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class BookingConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Booking $booking) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your '.SiteConfig::settings()->business_name.' booking — '.$this->booking->reference,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'mail.booking-confirmation',
            with: [
                'booking' => $this->booking,
                'manageUrl' => BookingMailData::manageUrl($this->booking),
                'lineItems' => BookingMailData::lineItems($this->booking),
                'services' => BookingMailData::serviceLabels($this->booking),
                'workshop' => BookingMailData::workshop(),
            ],
        );
    }
}
