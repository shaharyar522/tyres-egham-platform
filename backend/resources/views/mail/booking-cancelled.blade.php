<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Booking cancelled</title>
</head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#18181b;background:#f4f4f5;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e4e4e7;">
        <p style="margin:0;font-size:13px;color:#64748b;text-transform:uppercase;">Booking cancelled</p>
        <h1 style="margin:8px 0 16px;font-size:22px;">Hi {{ $booking->customer_name }}</h1>
        <p style="margin:0 0 16px;line-height:1.6;color:#3f3f46;">
            Your appointment <strong style="font-family:monospace;">{{ $booking->reference }}</strong> for {{ $booking->slot_date }} at {{ $booking->slot_time }} has been cancelled as requested.
        </p>
        <p style="margin:0;font-size:14px;color:#71717a;">
            To book again, visit our website or call {{ $workshop['phone'] }}.
        </p>
        <p style="margin:16px 0 0;font-size:14px;color:#71717a;">{{ $workshop['name'] }}</p>
    </div>
</body>
</html>
