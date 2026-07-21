import { useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { confirmStripePayment } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/client";

type StripePaymentFormProps = {
  publishableKey: string;
  clientSecret: string;
  bookingReference: string;
  paymentIntentId: string;
  onSuccess: (result: { reference: string; token: string; emailSent: boolean }) => void;
  onError: (message: string) => void;
};

let stripePromise: Promise<Stripe | null> | null = null;

function getStripe(publishableKey: string) {
  if (!stripePromise) {
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

function PayForm({
  bookingReference,
  paymentIntentId,
  onSuccess,
  onError,
}: Omit<StripePaymentFormProps, "publishableKey" | "clientSecret">) {
  const stripe = useStripe();
  const elements = useElements();
  const [paying, setPaying] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setPaying(true);
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });
      if (error) {
        onError(error.message ?? "Payment failed.");
        return;
      }
      const intentId = paymentIntent?.id ?? paymentIntentId;
      const result = await confirmStripePayment(bookingReference, intentId);
      const token =
        new URL(result.manageUrl, window.location.origin).searchParams.get("token") ?? "";
      onSuccess({
        reference: result.booking.reference,
        token,
        emailSent: result.emailSent ?? false,
      });
    } catch (err) {
      onError(err instanceof ApiError ? err.message : "Payment could not be completed.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="space-y-4">
      <PaymentElement />
      <Button type="button" variant="cta" size="lg" className="w-full" disabled={!stripe || paying} onClick={pay}>
        {paying ? "Processing payment…" : "Pay and confirm booking"}
      </Button>
    </div>
  );
}

export function StripePaymentForm({
  publishableKey,
  clientSecret,
  bookingReference,
  paymentIntentId,
  onSuccess,
  onError,
}: StripePaymentFormProps) {
  const stripe = getStripe(publishableKey);

  return (
    <Elements stripe={stripe} options={{ clientSecret }}>
      <PayForm
        bookingReference={bookingReference}
        paymentIntentId={paymentIntentId}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}
