import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Calendar, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  useApiBookingQuery,
  useCancelBookingMutation,
  useRescheduleBookingMutation,
} from "@/lib/api/queries";
import { ApiError } from "@/lib/api/client";
import { formatGBP } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useSite } from "@/lib/site";
import { SlotPicker } from "@/components/domain/slot-picker";

/** Customer self-service actions on Manage your booking — hidden in UI; set true to show again. */
const SHOW_CUSTOMER_SELF_SERVICE_ACTIONS = false;

export default function BookingManagePage() {
  const site = useSite();
  const [params] = useSearchParams();
  const ref = params.get("ref") ?? "";
  const token = params.get("token") ?? "";
  const bookingQuery = useApiBookingQuery(ref, token);
  const rescheduleMutation = useRescheduleBookingMutation(ref, token);
  const cancelMutation = useCancelBookingMutation(ref, token);
  const booking = bookingQuery.data?.booking;

  const [editMode, setEditMode] = useState(false);
  const [slot, setSlot] = useState<{ date: string; time: string } | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isCancelled = booking?.status === "cancelled";

  const startReschedule = () => {
    if (!booking) return;
    setSlot({ date: booking.slot.date, time: booking.slot.time });
    setNotes(booking.notes ?? "");
    setEditMode(true);
    setMessage(null);
    setError(null);
  };

  const saveReschedule = async () => {
    if (!slot?.date || !slot.time) {
      setError("Please choose a date and time.");
      return;
    }
    setError(null);
    try {
      const result = await rescheduleMutation.mutateAsync({
        slot,
        notes: notes.trim() || undefined,
      });
      setMessage(result.message ?? "Appointment rescheduled.");
      setEditMode(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not reschedule.");
    }
  };

  const confirmCancel = async () => {
    if (!window.confirm("Cancel this booking permanently? You can book again online anytime.")) return;
    setError(null);
    try {
      const result = await cancelMutation.mutateAsync();
      setMessage(result.message ?? "Booking cancelled.");
      setEditMode(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel booking.");
    }
  };

  if (!ref || !token) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Invalid link</h1>
        <p className="mt-2 text-muted-foreground">
          Open this page from your confirmation email — it includes a secure token.
        </p>
        <Button asChild className="mt-6">
          <Link to="/contact-us">Contact us</Link>
        </Button>
      </div>
    );
  }

  if (bookingQuery.isLoading) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading your booking</h1>
        <p className="mt-2 text-muted-foreground">Verifying your secure link…</p>
      </div>
    );
  }

  if (bookingQuery.isError || !booking) {
    return (
      <div className="container max-w-xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Booking not found</h1>
        <p className="mt-2 text-muted-foreground">
          This link may have expired or the reference is incorrect. Call us if you need help.
        </p>
        <Button asChild className="mt-6">
          <Link to="/contact-us">Contact us</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="flex items-center gap-2 text-primary">
        <ShieldCheck className="h-6 w-6" />
        <p className="font-display text-sm font-bold uppercase tracking-wide">Self-service booking</p>
      </div>

      <h1 className="mt-2 font-display text-3xl font-extrabold">Manage booking</h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <p className="font-mono text-sm text-muted-foreground">Reference: {booking.reference}</p>
        <Badge variant={isCancelled ? "destructive" : "secondary"} className="capitalize">
          {booking.status}
        </Badge>
      </div>

      {message && (
        <p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </p>
      )}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <p className="font-display text-sm font-bold uppercase">Your slot</p>
            </div>
            <p className="font-display text-xl font-extrabold">{booking.slot.date}</p>
            <p className="text-sm text-muted-foreground">{booking.slot.time}</p>
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

      {!isCancelled && (
        <Card
          className={cn("mt-6", !SHOW_CUSTOMER_SELF_SERVICE_ACTIONS && "hidden")}
          aria-hidden={!SHOW_CUSTOMER_SELF_SERVICE_ACTIONS}
        >
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Reschedule or cancel</p>
            {!editMode ? (
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={startReschedule}>
                  Change appointment
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  onClick={confirmCancel}
                  disabled={cancelMutation.isPending}
                >
                  {cancelMutation.isPending ? "Cancelling…" : "Cancel booking"}
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Pick a new date and time (same live availability as checkout).</p>
                <SlotPicker value={slot} onChange={setSlot} excludeReference={ref} />
                <div>
                  <Label htmlFor="notes">Booking notes</Label>
                  <Textarea
                    id="notes"
                    className="mt-1"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={saveReschedule}
                    disabled={rescheduleMutation.isPending || !slot?.time}
                  >
                    {rescheduleMutation.isPending ? "Saving…" : "Confirm new slot"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setEditMode(false)}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {isCancelled && (
        <Card className="mt-6 border-muted">
          <CardContent className="p-5 text-sm text-muted-foreground">
            This booking was cancelled.{" "}
            <Link to="/" className="font-semibold text-primary underline">
              Book new tyres
            </Link>{" "}
            or call{" "}
            <a href={`tel:${site.phoneTel}`} className="font-semibold underline">
              {site.phone}
            </a>
            .
          </CardContent>
        </Card>
      )}

      <Card className="mt-6">
        <CardContent className="space-y-3 p-5 text-sm">
          <p className="font-display text-base font-bold">Contact</p>
          <Separator />
          <p>{booking.customerName}</p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            {booking.customerEmail}
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {booking.customerPhone}
          </p>
          {booking.notes && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Notes</p>
              <p className="mt-1 whitespace-pre-wrap">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5">
          <p className="font-display text-base font-bold">Order summary</p>
          <Separator className="my-4" />
          <ul className="space-y-2 text-sm">
            {booking.items.map((item) => (
              <li key={item.skuId} className="flex justify-between gap-4">
                <span className="text-muted-foreground">
                  Tyre SKU #{item.skuId}
                  {item.snapshot?.brandSlug ? ` (${item.snapshot.brandSlug})` : ""} x {item.qty}
                </span>
                <span className="font-medium">
                  {item.snapshot
                    ? formatGBP((item.snapshot.pricePerTyre ?? 0) * item.qty)
                    : "-"}
                </span>
              </li>
            ))}
          </ul>
          <Separator className="my-4" />
          <div className="flex justify-between text-sm">
            <span>Estimated total (pay on fitting day)</span>
            <span className="font-display font-bold">{formatGBP(booking.totals.total)}</span>
          </div>
          {booking.voucherCode && (
            <p className="mt-2 text-xs text-muted-foreground">Voucher applied: {booking.voucherCode}</p>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild variant="outline">
          <Link to="/">Back to homepage</Link>
        </Button>
        <Button asChild variant="cta">
          <Link to={`/booking/confirmation?ref=${ref}&token=${token}`}>View confirmation</Link>
        </Button>
      </div>
    </div>
  );
}
