import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { useAdminBookingsQuery, useAdminUpdateBookingPaymentMutation } from "@/lib/admin/queries";
import { useAdminListPage } from "@/lib/admin/pagination";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { formatGBP } from "@/lib/utils";
import type { BookingRecord } from "@/types";

function paymentBadge(booking: BookingRecord) {
  const method = booking.paymentMethod ?? "pay_on_fitment";
  const status = booking.paymentStatus ?? "unpaid";
  if (status === "paid") {
    return <Badge className="bg-emerald-600">Paid</Badge>;
  }
  if (status === "pending") {
    return <Badge variant="secondary">Payment pending</Badge>;
  }
  if (method === "pay_on_fitment") {
    return <Badge variant="outline">Pay on fitment</Badge>;
  }
  return <Badge variant="destructive">Unpaid</Badge>;
}

export default function AdminBookingsPage() {
  const { page, setPage } = useAdminListPage();
  const bookingsQuery = useAdminBookingsQuery({ page });
  const paymentMutation = useAdminUpdateBookingPaymentMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const bookings = bookingsQuery.data?.bookings ?? [];
  const meta = bookingsQuery.data?.meta;

  const markPaid = async (reference: string) => {
    const ok = await confirm({
      title: "Mark booking as paid?",
      description: `Confirm payment received for booking ${reference}.`,
      confirmLabel: "Mark as paid",
    });
    if (!ok) return;
    await paymentMutation.mutateAsync({ reference, paymentStatus: "paid" });
  };

  return (
    <div>
      <ConfirmDialog />
      <h1 className="font-display text-2xl font-extrabold">Bookings</h1>
      <p className="mt-1 text-sm text-muted-foreground">Online appointments — payment status and manage links.</p>

      {bookingsQuery.isError && (
        <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
          <p className="font-semibold text-destructive">Could not load bookings</p>
          <p className="mt-1 text-muted-foreground">
            {bookingsQuery.error instanceof Error ? bookingsQuery.error.message : "Request failed."}{" "}
            Try signing out and back in if your session expired.
          </p>
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => bookingsQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {bookingsQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" count={6} />
      ) : (
      <div className="mt-6 space-y-3">
        {!bookingsQuery.isError && meta && meta.total > 0 && (
          <p className="text-sm text-muted-foreground">{meta.total} booking(s)</p>
        )}
        {bookings.length === 0 && !bookingsQuery.isError && (
          <p className="text-sm text-muted-foreground">No bookings yet.</p>
        )}
        {bookings.map((b) => (
          <Card key={b.reference}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link to={`/admin/bookings/${b.reference}`} className="font-mono font-bold hover:underline">
                    {b.reference}
                  </Link>
                  <Badge variant="secondary" className="capitalize">{b.status}</Badge>
                  {paymentBadge(b)}
                  {b.paymentMethod === "stripe" && <Badge variant="outline">Stripe</Badge>}
                </div>
                <p className="mt-1 text-sm">
                  {b.customerName} · {b.slot.date} at {b.slot.time}
                </p>
                <p className="text-xs text-muted-foreground">{b.customerEmail}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Link to={`/admin/bookings/${b.reference}`} className="text-xs text-primary hover:underline">
                  View details
                </Link>
                <p className="font-display font-bold">{formatGBP(b.totals.total)}</p>
                {b.paymentStatus !== "paid" && b.paymentMethod === "pay_on_fitment" && b.status !== "cancelled" && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={paymentMutation.isPending}
                    onClick={() => markPaid(b.reference)}
                  >
                    Mark paid
                  </Button>
                )}
                {b.manageUrl && (
                  <Link to={b.manageUrl} className="text-xs text-primary hover:underline" target="_blank" rel="noreferrer">
                    Customer manage link
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={bookingsQuery.isFetching}
      />
    </div>
  );
}
