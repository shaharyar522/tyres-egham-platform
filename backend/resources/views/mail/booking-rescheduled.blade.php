<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Booking rescheduled</title>
</head>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;color:#18181b;background:#f4f4f5;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:28px;border:1px solid #e4e4e7;">
        <p style="margin:0;font-size:13px;color:#64748b;text-transform:uppercase;">Appointment updated</p>
        <h1 style="margin:8px 0 16px;font-size:22px;">Hi {{ $booking->customer_name }}</h1>
        <p style="margin:0 0 16px;line-height:1.6;color:#3f3f46;">
            Your fitting for reference <strong style="font-family:monospace;">{{ $booking->reference }}</strong> has been rescheduled.
        </p>
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">Previous slot</p>
        <p style="margin:0 0 16px;color:#71717a;">{{ $previousSlot['date'] }} at {{ $previousSlot['time'] }}</p>
        <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#64748b;text-transform:uppercase;">New slot</p>
        <p style="margin:0 0 20px;font-size:18px;font-weight:700;">{{ $booking->slot_date }} at {{ $booking->slot_time }}</p>
        <p style="margin:0 0 20px;">
            <a href="{{ $manageUrl }}" style="display:inline-block;background:#0f172a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Manage booking</a>
        </p>
        <p style="margin:0;font-size:14px;color:#71717a;">
            {{ $workshop['name'] }} · {{ $workshop['phone'] }}
        </p>
    </div>
</body>
</html>
