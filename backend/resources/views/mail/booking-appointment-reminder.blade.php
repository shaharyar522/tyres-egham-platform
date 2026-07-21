<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Appointment reminder</title>
</head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#18181b;background:#f4f4f5;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e4e4e7;">
        <p style="margin:0;font-size:13px;color:#64748b;text-transform:uppercase;">Appointment reminder</p>
        <h1 style="margin:8px 0 16px;font-size:22px;">Hi {{ $booking->customer_name }}</h1>
        <p style="margin:0 0 16px;line-height:1.6;color:#3f3f46;">
            This is a friendly reminder of your tyre fitting appointment at {{ $workshop['name'] }}.
        </p>
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Your slot</p>
        <p style="margin:0 0 4px;font-size:18px;font-weight:700;">{{ $booking->slot_date }}</p>
        <p style="margin:0 0 20px;font-size:16px;color:#475569;">{{ $booking->slot_time }}</p>
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Workshop</p>
        <p style="margin:0 0 20px;line-height:1.5;color:#3f3f46;">
            {{ $workshop['address'] }}<br>
            {{ $workshop['postcode'] }}<br>
            Tel: <a href="tel:{{ $workshop['phoneTel'] }}" style="color:#0f172a;">{{ $workshop['phone'] }}</a>
        </p>
        @if ($booking->payment_method === 'pay_on_fitment' && $booking->payment_status !== 'paid')
        <p style="margin:0 0 20px;padding:12px 14px;background:#fef3c7;border-radius:8px;font-size:14px;color:#92400e;">
            Please bring payment for your order on the day (cash or card). Estimated total:
            <strong>£{{ number_format($booking->total, 2) }}</strong>.
        </p>
        @endif
        @if ($booking->notes)
        <p style="margin:0 0 20px;font-size:14px;color:#3f3f46;">
            <strong>Your notes:</strong><br>{{ $booking->notes }}
        </p>
        @endif
        <p style="margin:0 0 20px;">
            <a href="{{ $manageUrl }}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">View or change booking</a>
        </p>
        <p style="margin:0;font-size:14px;color:#71717a;">
            Reference <span style="font-family:monospace;font-weight:600;">{{ $booking->reference }}</span>
        </p>
    </div>
</body>
</html>
