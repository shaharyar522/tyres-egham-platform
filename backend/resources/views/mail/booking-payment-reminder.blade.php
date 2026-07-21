<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Payment reminder</title>
</head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#18181b;background:#f4f4f5;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e4e4e7;">
        <p style="margin:0;font-size:13px;color:#64748b;text-transform:uppercase;">Payment reminder</p>
        <h1 style="margin:8px 0 16px;font-size:22px;">Hi {{ $booking->customer_name }}</h1>
        <p style="margin:0 0 16px;line-height:1.6;color:#3f3f46;">
            Your fitting is coming up on <strong>{{ $booking->slot_date }}</strong> at <strong>{{ $booking->slot_time }}</strong>.
            This booking is still marked as unpaid — please pay at the workshop when you arrive.
        </p>
        <p style="margin:0 0 20px;font-size:20px;font-weight:700;">Estimated total: £{{ number_format($booking->total, 2) }}</p>
        <p style="margin:0 0 20px;line-height:1.5;color:#3f3f46;">
            {{ $workshop['name'] }}<br>
            {{ $workshop['address'] }}, {{ $workshop['postcode'] }}<br>
            Tel: <a href="tel:{{ $workshop['phoneTel'] }}" style="color:#0f172a;">{{ $workshop['phone'] }}</a>
        </p>
        <p style="margin:0 0 20px;">
            <a href="{{ $manageUrl }}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">View booking</a>
        </p>
        <p style="margin:0;font-size:14px;color:#71717a;">
            Reference <span style="font-family:monospace;font-weight:600;">{{ $booking->reference }}</span>
        </p>
    </div>
</body>
</html>
