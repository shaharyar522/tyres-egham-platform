import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Check, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FunnelStepper } from "@/components/domain/funnel-stepper";
import { OrderSummary } from "@/components/domain/order-summary";
import { SlotPicker } from "@/components/domain/slot-picker";
import { PaymentMethodPicker } from "@/components/domain/payment-method-picker";
import { StripePaymentForm } from "@/components/domain/stripe-payment-form";
import { useBasket } from "@/store/basket";
import { createBooking, createStripePaymentIntent, usePaymentConfigQuery } from "@/lib/api/queries";
import { useBasketTotals } from "@/lib/hooks/use-basket-totals";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import type { BookingRecord, PaymentMethod } from "@/types";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, serviceIds, serviceSelections, voucher, notes, setNotes, slot, setSlot, clearBasket } = useBasket();
  const totals = useBasketTotals();
  const paymentConfigQuery = usePaymentConfigQuery();
  const paymentConfig = paymentConfigQuery.data;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("pay_on_fitment");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [stripeSession, setStripeSession] = useState<{
    clientSecret: string;
    reference: string;
    paymentIntentId: string;
    booking: BookingRecord;
  } | null>(null);

  useEffect(() => {
    if (paymentConfig?.defaultPaymentMethod) {
      setPaymentMethod(paymentConfig.defaultPaymentMethod);
    }
  }, [paymentConfig?.defaultPaymentMethod]);

  if (items.length === 0) {
    navigate("/basket");
    return null;
  }

  const methods = paymentConfig?.methods ?? ["pay_on_fitment"];
  const effectiveMethod = methods.includes(paymentMethod) ? paymentMethod : (methods[0] ?? "pay_on_fitment");

  const canSubmit =
    !!slot?.time &&
    !!slot.date &&
    !!name.trim() &&
    !!email.trim() &&
    !!phone.trim() &&
    acceptedTerms &&
    methods.length > 0;

  const buildPayload = () => ({
    customerName: name.trim(),
    customerEmail: email.trim(),
    customerPhone: phone.trim(),
    slot: slot!,
    notes: notes.trim() || undefined,
    voucherCode: voucher?.code,
    items,
    serviceIds,
    serviceSelections,
    totals: {
      subtotal: totals.subtotal,
      voucherDiscount: totals.voucherDiscount,
      servicesTotal: totals.servicesTotal,
      total: totals.total,
    },
    paymentMethod: effectiveMethod,
  });

  const finishCheckout = (
    reference: string,
    accessToken: string,
    booking: BookingRecord | null,
    emailSent: boolean,
  ) => {
    sessionStorage.setItem(
      "eg-tyres-confirm",
      JSON.stringify({
        ref: reference,
        token: accessToken,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        slot,
        notes,
        booking,
        emailSent,
      }),
    );
    clearBasket();
    navigate(`/booking/confirmation?ref=${reference}&token=${accessToken}`);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !slot) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      if (effectiveMethod === "stripe") {
        const result = await createStripePaymentIntent(buildPayload());
        setStripeSession({
          clientSecret: result.clientSecret,
          reference: result.booking.reference,
          paymentIntentId: result.paymentIntentId,
          booking: result.booking,
        });
        return;
      }

      const result = await createBooking(buildPayload());
      const accessToken =
        new URL(result.manageUrl, window.location.origin).searchParams.get("token") ?? "";
      finishCheckout(result.booking.reference, accessToken, result.booking, result.emailSent ?? false);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : "Could not confirm your booking. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const termsText =
    effectiveMethod === "stripe"
      ? "I have confirmed that the tyre size, load index and speed rating match my vehicle. I understand fitting is by appointment and I will pay now by card to confirm my booking."
      : "I have confirmed that the tyre size, load index and speed rating match my vehicle. I understand fitting is by appointment and I will pay at the workshop on the day of fitting.";

  return (
    <div className="container py-6 lg:py-10">
      <FunnelStepper current="checkout" className="mb-8 max-w-xl" />

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Checkout</h1>

          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="font-display text-base font-bold">Choose your fitting slot</p>
              </div>
              <SlotPicker value={slot} onChange={setSlot} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="font-display text-base font-bold">Your details</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name" className="mb-1.5 block">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email" className="mb-1.5 block">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="phone" className="mb-1.5 block">Mobile</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07..." required />
                </div>
              </div>
            </CardContent>
          </Card>

          {paymentConfigQuery.isLoading && (
            <p className="text-sm text-muted-foreground">Loading payment options?</p>
          )}

          {methods.length > 0 && !stripeSession && (
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-primary" />
                  <p className="font-display text-base font-bold">Payment</p>
                </div>
                <PaymentMethodPicker methods={methods} value={effectiveMethod} onChange={setPaymentMethod} />
              </CardContent>
            </Card>
          )}

          {stripeSession && paymentConfig?.stripePublishableKey && (
            <Card>
              <CardContent className="space-y-4 p-5">
                <p className="font-display text-base font-bold">Card payment</p>
                <p className="text-sm text-muted-foreground">
                  Booking reference <span className="font-mono font-semibold">{stripeSession.reference}</span>
                </p>
                <StripePaymentForm
                  publishableKey={paymentConfig.stripePublishableKey}
                  clientSecret={stripeSession.clientSecret}
                  bookingReference={stripeSession.reference}
                  paymentIntentId={stripeSession.paymentIntentId}
                  onSuccess={({ reference, token, emailSent }) => {
                    finishCheckout(reference, token, stripeSession.booking, emailSent);
                  }}
                  onError={(msg) => setSubmitError(msg)}
                />
              </CardContent>
            </Card>
          )}

          {!stripeSession && (
            <>
              <Card>
                <CardContent className="space-y-3 p-5">
                  <Label htmlFor="notes" className="text-sm font-bold">Booking notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="e.g. Locking wheel nut location, additional work to investigate, vehicle access notes..."
                  />
                </CardContent>
              </Card>

              <Card className="border-amber-300 bg-amber-50">
                <CardContent className="space-y-3 p-5 text-sm text-amber-900">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => setAcceptedTerms((v) => !v)}
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
                        acceptedTerms ? "border-amber-800 bg-amber-800 text-amber-50" : "border-amber-700 bg-white",
                      )}
                      aria-label="Accept terms"
                    >
                      {acceptedTerms && <Check className="h-3 w-3" />}
                    </button>
                    <p>{termsText}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {submitError && <p className="text-sm text-destructive">{submitError}</p>}

          {!stripeSession && (
            <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
              <Button variant="ghost" asChild>
                <Link to="/basket/services"><ArrowLeft className="h-4 w-4" /> Back to services</Link>
              </Button>
              <Button type="submit" variant="cta" size="lg" disabled={!canSubmit || submitting} className="gap-2">
                <ShieldCheck className="h-5 w-5" />
                {submitting
                  ? effectiveMethod === "stripe"
                    ? "Preparing payment?"
                    : "Securing slot?"
                  : effectiveMethod === "stripe"
                    ? "Continue to payment"
                    : "Confirm booking"}
              </Button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary paymentMethod={effectiveMethod} />
        </aside>
      </form>
    </div>
  );
}
