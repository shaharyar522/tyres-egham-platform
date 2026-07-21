import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Check, Mail, MapPin, Phone, Printer, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BookingRecord } from "@/types";

interface StoredConfirmation {
  ref: string;
  token: string;
  name: string;
  email: string;
  phone: string;
  slot: { date: string; time: string };
  notes: string;
  booking?: BookingRecord;
  emailSent?: boolean;
}

export default function ConfirmationPage() {
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "EG-DEMO";
  const token = params.get("token") ?? "";
  const storedRaw = sessionStorage.getItem("eg-tyres-confirm");
  const stored: StoredConfirmation | null = storedRaw ? JSON.parse(storedRaw) : null;
  const booking = stored?.booking ?? null;
  const slot = booking?.slot ?? stored?.slot;
  const email = stored?.email ?? booking?.customerEmail ?? "";
  const phone = stored?.phone ?? booking?.customerPhone ?? "";
  const notes = stored?.notes ?? booking?.notes ?? "";

  const manageHref = token
    ? `/booking/manage?ref=${encodeURIComponent(ref)}&token=${encodeURIComponent(token)}`
    : stored?.token
      ? `/booking/manage?ref=${encodeURIComponent(ref)}&token=${encodeURIComponent(stored.token)}`
      : `/booking/manage?ref=${encodeURIComponent(ref)}`;

  return (
    <div className="container max-w-3xl py-10">
      <div className="rounded-xl border-2 border-success/30 bg-success/5 p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success text-success-foreground">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-extrabold sm:text-display-lg">Booking confirmed</h1>
        <p className="mt-2 text-muted-foreground">
          {booking?.paymentStatus === "paid"
            ? `Payment received. ${stored?.emailSent ? `A confirmation email has been sent to ${email}.` : ""} Use the link below to manage your booking.`
            : stored?.emailSent
              ? `A confirmation email has been sent to ${email}. Pay at the workshop on the day of fitting. Use the link below to manage your booking.`
              : "Your booking is saved. Pay at the workshop on the day of fitting, or use the link below to manage it."}
        </p>
        {stored?.emailSent === false && email && (
          <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            We could not send a confirmation email to <strong>{email}</strong> right now. Your booking is still confirmed — save your reference number below. The workshop may contact you by phone.
          </p>
        )}
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-3 py-1 text-sm font-mono font-bold shadow-card">
          Reference: <span className="text-primary">{ref}</span>
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="font-display text-sm font-bold uppercase">Your slot</p>
            </div>
            {slot ? (
              <>
                <p className="font-display text-xl font-extrabold">{slot.date}</p>
                <p className="text-sm text-muted-foreground">{slot.time}</p>
              </>
            ) : (
              <p className="text-muted-foreground">A slot has been reserved for you.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <p className="font-display text-sm font-bold uppercase">Workshop</p>
            </div>
            <p className="text-sm">12 Station Road, Egham, Surrey</p>
            <p className="text-sm font-mono text-muted-foreground">TW20 9LF</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="font-display text-base font-bold">What happens next</p>
          <Separator className="my-4" />
          <ol className="space-y-3 text-sm">
            <Step n={1} title="Save your manage link" body="Bookmark the self-service page — you can return without logging in." />
            <Step n={2} title="Reminder before your slot" body="A reminder will arrive 24 hours and again 2 hours before your fitting." />
            <Step n={3} title="Arrive at the workshop" body="Bring your locking wheel-nut key (if relevant). Allow 45-60 mins for a 4-tyre fit." />
            <Step n={4} title="Pay when fitted" body="Settle the bill at the workshop on the day. Card, contactless and cash all accepted." />
          </ol>
        </CardContent>
      </Card>

      {(email || phone) && (
        <Card className="mt-6">
          <CardContent className="space-y-3 p-5 text-sm">
            <p className="font-display text-base font-bold">Your details</p>
            <Separator />
            {email && <Row icon={<Mail className="h-4 w-4 text-muted-foreground" />} value={email} />}
            {phone && <Row icon={<Phone className="h-4 w-4 text-muted-foreground" />} value={phone} />}
            {notes && (
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs font-bold uppercase text-muted-foreground">Booking notes</p>
                <p className="mt-1 whitespace-pre-wrap">{notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <p className="font-display text-base font-bold">Manage your booking</p>
              <p className="mt-1 text-sm text-muted-foreground">
                View your order summary and contact details. Reschedule and cancel via phone for now.
              </p>
              <Button asChild variant="default" size="sm" className="mt-3">
                <Link to={manageHref}>Open self-service</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button variant="outline" onClick={() => window.print()} className="gap-2">
          <Printer className="h-4 w-4" /> Print confirmation
        </Button>
        <Button asChild variant="ghost">
          <Link to="/">Back to homepage</Link>
        </Button>
      </div>
    </div>
  );
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xs font-bold text-primary-foreground">
        {n}
      </span>
      <div>
        <p className="font-semibold">{title}</p>
        <p className="text-muted-foreground">{body}</p>
      </div>
    </li>
  );
}

function Row({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span>{value}</span>
    </div>
  );
}


