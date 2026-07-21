<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Booking confirmed</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#18181b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
        <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
                <tr>
                    <td style="background:#0f172a;padding:24px 28px;">
                        <p style="margin:0;font-size:13px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.05em;">Booking confirmed</p>
                        <h1 style="margin:8px 0 0;font-size:22px;color:#ffffff;">Thanks, {{ $booking->customer_name }}</h1>
                        <p style="margin:12px 0 0;font-size:14px;color:#cbd5e1;">
                            Reference <strong style="color:#fff;font-family:monospace;">{{ $booking->reference }}</strong>
                        </p>
                    </td>
                </tr>
                <tr>
                    <td style="padding:28px;">
                        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;color:#3f3f46;">
                            @if ($booking->payment_method === 'stripe' && $booking->payment_status === 'paid')
                                Your fitting appointment is reserved and payment has been received. We look forward to seeing you.
                            @else
                                Your fitting appointment is reserved. Please pay at the workshop on the day of fitting.
                            @endif
                        </p>

                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;margin-bottom:20px;">
                            <tr>
                                <td style="padding:16px 18px;">
                                    <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;">Your slot</p>
                                    <p style="margin:0;font-size:18px;font-weight:700;color:#0f172a;">{{ $booking->slot_date }}</p>
                                    <p style="margin:4px 0 0;font-size:15px;color:#475569;">{{ $booking->slot_time }}</p>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                            <tr>
                                <td style="padding-bottom:8px;font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;">Workshop</td>
                            </tr>
                            <tr>
                                <td style="font-size:14px;line-height:1.5;color:#3f3f46;">
                                    {{ $workshop['address'] }}<br>
                                    {{ $workshop['postcode'] }}<br>
                                    Tel: <a href="tel:{{ $workshop['phoneTel'] }}" style="color:#0f172a;">{{ $workshop['phone'] }}</a>
                                </td>
                            </tr>
                        </table>

                        @if (count($lineItems) > 0)
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;border-top:1px solid #e4e4e7;">
                            <tr>
                                <td style="padding-top:16px;font-size:12px;font-weight:700;text-transform:uppercase;color:#64748b;">Order summary</td>
                            </tr>
                            @foreach ($lineItems as $line)
                            <tr>
                                <td style="padding:8px 0;font-size:14px;color:#3f3f46;">{{ $line['label'] }} × {{ $line['qty'] }}</td>
                                <td align="right" style="padding:8px 0;font-size:14px;font-weight:600;color:#0f172a;">{{ $line['lineTotal'] }}</td>
                            </tr>
                            @endforeach
                            @if ($booking->voucher_code)
                            <tr>
                                <td colspan="2" style="padding:8px 0;font-size:13px;color:#16a34a;">Voucher {{ $booking->voucher_code }} applied</td>
                            </tr>
                            @endif
                            <tr>
                                <td style="padding-top:12px;font-size:14px;font-weight:700;color:#0f172a;">Estimated total</td>
                                <td align="right" style="padding-top:12px;font-size:16px;font-weight:700;color:#0f172a;">£{{ number_format($booking->total, 2) }}</td>
                            </tr>
                        </table>
                        @endif

                        @if (count($services) > 0)
                        <p style="margin:0 0 20px;font-size:14px;color:#3f3f46;">
                            <strong>Services:</strong> {{ implode(', ', $services) }}
                        </p>
                        @endif

                        @if ($booking->notes)
                        <p style="margin:0 0 20px;font-size:14px;color:#3f3f46;">
                            <strong>Your notes:</strong><br>{{ $booking->notes }}
                        </p>
                        @endif

                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td align="center" style="padding:8px 0 4px;">
                                    <a href="{{ $manageUrl }}"
                                       style="display:inline-block;background:#dc2626;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:8px;">
                                        Manage your booking
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-top:12px;font-size:12px;color:#71717a;line-height:1.5;">
                                    Use this secure link to view your booking — no account or password needed.
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
                <tr>
                    <td style="padding:16px 28px;background:#fafafa;border-top:1px solid #e4e4e7;font-size:12px;color:#71717a;line-height:1.5;">
                        Questions? Call {{ $workshop['phone'] }} or reply to this email.<br>
                        {{ $workshop['name'] }} — independent local tyre fitter since 2003.
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
