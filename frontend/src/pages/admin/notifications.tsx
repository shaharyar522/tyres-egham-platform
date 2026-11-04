import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAdminNotificationSettingsQuery,
  useAdminSaveNotificationSettingsMutation,
  useAdminTestMailMutation,
} from "@/lib/admin/queries";
import { AdminSettingsFormSkeleton } from "@/components/admin/admin-skeletons";
import { ApiError } from "@/lib/api/client";

export default function AdminNotificationsPage() {
  const settingsQuery = useAdminNotificationSettingsQuery();
  const saveMutation = useAdminSaveNotificationSettingsMutation();
  const testMailMutation = useAdminTestMailMutation();
  const settings = settingsQuery.data?.settings;

  const [appointmentReminderEnabled, setAppointmentReminderEnabled] = useState(true);
  const [appointmentHours, setAppointmentHours] = useState(24);
  const [paymentReminderEnabled, setPaymentReminderEnabled] = useState(true);
  const [paymentHours, setPaymentHours] = useState(48);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setAppointmentReminderEnabled(settings.appointmentReminderEnabled);
    setAppointmentHours(settings.appointmentReminderHoursBefore);
    setPaymentReminderEnabled(settings.paymentReminderEnabled);
    setPaymentHours(settings.paymentReminderHoursBefore);
  }, [settings]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await saveMutation.mutateAsync({
        appointmentReminderEnabled,
        appointmentReminderHoursBefore: appointmentHours,
        paymentReminderEnabled,
        paymentReminderHoursBefore: paymentHours,
      });
      setMessage("Notification settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Email notifications</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Automated email reminders for customers. Runs every 15 minutes via{" "}
        <code className="rounded bg-muted px-1 text-xs">php artisan schedule:work</code> (local) or server cron in production.
      </p>

      {settingsQuery.isLoading ? (
        <AdminSettingsFormSkeleton cards={2} className="mt-6 max-w-2xl" />
      ) : (
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Appointment reminder</p>
            <p className="text-sm text-muted-foreground">
              Sent before the fitting slot with date, time, workshop details, and manage link.
            </p>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={appointmentReminderEnabled}
                onCheckedChange={(v) => setAppointmentReminderEnabled(v === true)}
              />
              <span className="text-sm font-semibold">Enable appointment reminders</span>
            </label>
            <div>
              <Label htmlFor="appt-hours" className="mb-1.5 block">
                Hours before appointment
              </Label>
              <Input
                id="appt-hours"
                type="number"
                min={1}
                max={168}
                value={appointmentHours}
                onChange={(e) => setAppointmentHours(Number(e.target.value))}
                disabled={!appointmentReminderEnabled}
              />
              <p className="mt-1 text-xs text-muted-foreground">Default: 24 (day-before style)</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Payment reminder</p>
            <p className="text-sm text-muted-foreground">
              For pay-on-fitment bookings still marked unpaid — reminds customer to pay at the workshop.
            </p>
            <label className="flex items-center gap-3">
              <Checkbox
                checked={paymentReminderEnabled}
                onCheckedChange={(v) => setPaymentReminderEnabled(v === true)}
              />
              <span className="text-sm font-semibold">Enable payment reminders</span>
            </label>
            <div>
              <Label htmlFor="pay-hours" className="mb-1.5 block">
                Hours before appointment
              </Label>
              <Input
                id="pay-hours"
                type="number"
                min={1}
                max={168}
                value={paymentHours}
                onChange={(e) => setPaymentHours(Number(e.target.value))}
                disabled={!paymentReminderEnabled}
              />
              <p className="mt-1 text-xs text-muted-foreground">Default: 48</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Send test email</p>
            <p className="text-sm text-muted-foreground">
              Uses the latest booking as a template and sends a confirmation via SMTP, then sendmail if SMTP fails
              (common on Namecheap/cPanel).
            </p>
            <div>
              <Label htmlFor="test-email" className="mb-1.5 block">
                Recipient
              </Label>
              <Input
                id="test-email"
                type="email"
                placeholder="you@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={testMailMutation.isPending || !testEmail.trim()}
              onClick={async () => {
                setMessage(null);
                setError(null);
                try {
                  const result = await testMailMutation.mutateAsync(testEmail.trim());
                  setMessage(
                    `${result.message}${result.mailer ? ` (mailer: ${result.mailer}, host: ${result.smtpHost}:${result.smtpPort})` : ""}`,
                  );
                } catch (err) {
                  setError(err instanceof ApiError ? err.message : "Could not send test email.");
                }
              }}
            >
              {testMailMutation.isPending ? "Sending…" : "Send test confirmation"}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-muted bg-muted/20">
          <CardContent className="p-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Already sent by email</p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Booking confirmation (on create / after Stripe payment)</li>
              <li>Reschedule and cancellation notices</li>
            </ul>
            <p className="mt-3">
              Test reminders manually:{" "}
              <code className="rounded bg-muted px-1 text-xs">php artisan bookings:send-reminders --dry-run</code>
            </p>
          </CardContent>
        </Card>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save notification settings"}
        </Button>
      </form>
      )}
    </div>
  );
}
