import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ExternalLink, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  useAdminBookingQuery,
  useAdminCancelBookingMutation,
  useAdminResendConfirmationMutation,
  useAdminUpdateBookingMutation,
} from "@/lib/admin/queries";
import { AdminBookingDetailSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";
import { formatGBP } from "@/lib/utils";

export default function AdminBookingDetailPage() {
  const { reference = "" } = useParams();
  const bookingQuery = useAdminBookingQuery(reference);
  const updateMutation = useAdminUpdateBookingMutation(reference);
  const cancelMutation = useAdminCancelBookingMutation(reference);
  const resendMutation = useAdminResendConfirmationMutation(reference);

  const booking = bookingQuery.data?.booking;
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!booking) return;
    setNotes(booking.notes ?? "");
    setPaymentStatus(booking.paymentStatus ?? "unpaid");
  }, [booking]);

  if (bookingQuery.isLoading) {
    return <AdminBookingDetailSkeleton />;
  }

  if (bookingQuery.isError || !booking) {
    return (
      <div>
        <p className="text-destructive">Booking not found.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/admin/bookings">Back to bookings</Link>
        </Button>
      </div>
    );
  }

  const save = async () => {
    setError(null);
    setMessage(null);
    try {
      const result = await updateMutation.mutateAsync({ notes, paymentStatus });
      setMessage(result.message ?? "Saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save.");
    }
  };

  const cancel = async () => {
    const ok = await confirm({
      title: "Cancel this booking?",
      description: "The customer will be emailed and this appointment will be marked as cancelled.",
      confirmLabel: "Cancel booking",
      variant: "destructive",
    });
    if (!ok) return;
    setError(null);
    try {
      const result = await cancelMutation.mutateAsync();
      setMessage(result.message ?? "Cancelled.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not cancel.");
    }
  };

  const resend = async () => {
    setError(null);
    try {
      const result = await resendMutation.mutateAsync();
      setMessage(result.message ?? "Email sent.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not send email.");
    }
  };

  return (
    <div>
      <ConfirmDialog />
      <Button variant="ghost" asChild className="mb-4 -ml-2">
        <Link to="/admin/bookings">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to bookings
        </Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold font-mono">{booking.reference}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="secondary" className="capitalize">{booking.status}</Badge>
            <Badge variant="outline" className="capitalize">{booking.paymentMethod?.replace("_", " ")}</Badge>
            <Badge variant={booking.paymentStatus === "paid" ? "default" : "outline"} className="capitalize">
              {booking.paymentStatus}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {booking.manageUrl && (
            <Button variant="outline" size="sm" asChild>
              <Link to={booking.manageUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Customer link
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={resend} disabled={resendMutation.isPending || booking.status === "cancelled"}>
            <Mail className="mr-2 h-4 w-4" />
            {resendMutation.isPending ? "Sending..." : "Resend confirmation"}
          </Button>
          {booking.status !== "cancelled" && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={cancel} disabled={cancelMutation.isPending}>
              <XCircle className="mr-2 h-4 w-4" />
              {cancelMutation.isPending ? "Cancelling..." : "Cancel booking"}
            </Button>
          )}
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-emerald-700">{message}</p>}
      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">Customer</p>
            <p>{booking.customerName}</p>
            <p className="text-sm text-muted-foreground">{booking.customerEmail}</p>
            <p className="text-sm">{booking.customerPhone}</p>
            <Separator />
            <p className="font-display font-bold">Appointment</p>
            <p className="text-lg font-semibold">{booking.slot.date}</p>
            <p className="text-muted-foreground">{booking.slot.time}</p>
            {booking.createdAt && (
              <p className="text-xs text-muted-foreground">Booked {new Date(booking.createdAt).toLocaleString("en-GB")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">Admin actions</p>
            <div>
              <Label className="mb-1.5 block">Payment status</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes" className="mb-1.5 block">Booking notes</Label>
              <Textarea id="notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <Button onClick={save} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
            <Separator />
            <p className="text-xs text-muted-foreground">
              Reminders:{" "}
              {booking.appointmentReminderSentAt
                ? `appointment ${new Date(booking.appointmentReminderSentAt).toLocaleString("en-GB")}`
                : "appointment not sent"}
              {" · "}
              {booking.paymentReminderSentAt
                ? `payment ${new Date(booking.paymentReminderSentAt).toLocaleString("en-GB")}`
                : "payment not sent"}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <p className="font-display font-bold">Order</p>
            <div className="mt-4 space-y-2">
              {(booking.lineItems ?? []).map((line) => (
                <div key={line.skuId} className="flex justify-between gap-4 text-sm">
                  <span>
                    {line.label}
                    {line.size && <span className="text-muted-foreground"> ({line.size})</span>}
                    {" "}x {line.qty}
                  </span>
                  <span className="font-semibold">{formatGBP(line.lineTotal)}</span>
                </div>
              ))}
            </div>
            {(booking.services ?? []).length > 0 && (
              <>
                <Separator className="my-3" />
                <p className="text-xs font-bold uppercase text-muted-foreground">Services</p>
                {booking.services?.map((s) => (
                  <div key={s.id} className="flex justify-between text-sm">
                    <span>{s.name}</span>
                    <span>{s.priceFrom === "free" ? "FREE" : formatGBP(s.priceFrom as number)}</span>
                  </div>
                ))}
              </>
            )}
            <Separator className="my-3" />
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatGBP(booking.totals.subtotal)}</span>
              </div>
              {booking.totals.voucherDiscount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Voucher {booking.voucherCode}</span>
                  <span>- {formatGBP(booking.totals.voucherDiscount)}</span>
                </div>
              )}
              {booking.totals.servicesTotal > 0 && (
                <div className="flex justify-between">
                  <span>Services</span>
                  <span>{formatGBP(booking.totals.servicesTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>{formatGBP(booking.totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
