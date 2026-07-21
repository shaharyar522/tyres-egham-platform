import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAdminPaymentSettingsQuery,
  useAdminSavePaymentSettingsMutation,
} from "@/lib/admin/queries";
import { AdminSettingsFormSkeleton } from "@/components/admin/admin-skeletons";
import { ApiError } from "@/lib/api/client";

export default function AdminPaymentSettingsPage() {
  const settingsQuery = useAdminPaymentSettingsQuery();
  const saveMutation = useAdminSavePaymentSettingsMutation();
  const settings = settingsQuery.data?.settings;

  const [stripeEnabled, setStripeEnabled] = useState(false);
  const [payOnFitmentEnabled, setPayOnFitmentEnabled] = useState(true);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<"pay_on_fitment" | "stripe">("pay_on_fitment");
  const [stripePublishableKey, setStripePublishableKey] = useState("");
  const [stripeSecretKey, setStripeSecretKey] = useState("");
  const [stripeWebhookSecret, setStripeWebhookSecret] = useState("");
  const [clearStripeSecret, setClearStripeSecret] = useState(false);
  const [clearWebhookSecret, setClearWebhookSecret] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    setStripeEnabled(settings.stripeEnabled);
    setPayOnFitmentEnabled(settings.payOnFitmentEnabled);
    setDefaultPaymentMethod(settings.defaultPaymentMethod);
    setStripePublishableKey(settings.stripePublishableKey ?? "");
  }, [settings]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      await saveMutation.mutateAsync({
        stripeEnabled,
        payOnFitmentEnabled,
        defaultPaymentMethod,
        stripePublishableKey: stripePublishableKey.trim() || null,
        stripeSecretKey: stripeSecretKey.trim() || undefined,
        stripeWebhookSecret: stripeWebhookSecret.trim() || undefined,
        clearStripeSecretKey: clearStripeSecret,
        clearStripeWebhookSecret: clearWebhookSecret,
      });
      setStripeSecretKey("");
      setStripeWebhookSecret("");
      setClearStripeSecret(false);
      setClearWebhookSecret(false);
      setMessage("Payment settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Payments</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Enable payment methods for checkout. Stripe keys can also be set in{" "}
        <code className="rounded bg-muted px-1 text-xs">.env</code> as a fallback.
      </p>

      {settingsQuery.isLoading ? (
        <AdminSettingsFormSkeleton cards={2} className="mt-6 max-w-2xl" />
      ) : (
      <form onSubmit={save} className="mt-6 max-w-2xl space-y-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Payment methods</p>

            <label className="flex items-center gap-3">
              <Checkbox checked={payOnFitmentEnabled} onCheckedChange={(v) => setPayOnFitmentEnabled(v === true)} />
              <span className="text-sm">
                <span className="font-semibold">Pay on fitment</span> - customer pays at the workshop on the day
              </span>
            </label>

            <label className="flex items-center gap-3">
              <Checkbox checked={stripeEnabled} onCheckedChange={(v) => setStripeEnabled(v === true)} />
              <span className="text-sm">
                <span className="font-semibold">Stripe (card)</span> - pay online at checkout
              </span>
            </label>

            <div>
              <Label className="mb-1.5 block">Default method at checkout</Label>
              <Select
                value={defaultPaymentMethod}
                onValueChange={(v) => setDefaultPaymentMethod(v as "pay_on_fitment" | "stripe")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {payOnFitmentEnabled && <SelectItem value="pay_on_fitment">Pay on fitment</SelectItem>}
                  {stripeEnabled && <SelectItem value="stripe">Stripe (card)</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display text-base font-bold">Stripe configuration</p>
            <p className="text-xs text-muted-foreground">
              Webhook endpoint: <code className="rounded bg-muted px-1">/api/stripe/webhook</code> on your API host
            </p>

            <div>
              <Label htmlFor="pk" className="mb-1.5 block">
                Publishable key
              </Label>
              <Input
                id="pk"
                value={stripePublishableKey}
                onChange={(e) => setStripePublishableKey(e.target.value)}
                placeholder="pk_test_..."
                autoComplete="off"
              />
            </div>

            <div>
              <Label htmlFor="sk" className="mb-1.5 block">
                Secret key
              </Label>
              <Input
                id="sk"
                type="password"
                value={stripeSecretKey}
                onChange={(e) => setStripeSecretKey(e.target.value)}
                placeholder={settings?.stripeSecretKeyConfigured ? "Leave blank to keep current" : "sk_test_..."}
                autoComplete="new-password"
              />
              {settings?.stripeSecretKeyConfigured && (
                <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={clearStripeSecret} onCheckedChange={(v) => setClearStripeSecret(v === true)} />
                  Clear stored secret key
                </label>
              )}
            </div>

            <div>
              <Label htmlFor="wh" className="mb-1.5 block">
                Webhook signing secret
              </Label>
              <Input
                id="wh"
                type="password"
                value={stripeWebhookSecret}
                onChange={(e) => setStripeWebhookSecret(e.target.value)}
                placeholder={settings?.stripeWebhookSecretConfigured ? "Leave blank to keep current" : "whsec_..."}
                autoComplete="new-password"
              />
              {settings?.stripeWebhookSecretConfigured && (
                <label className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Checkbox checked={clearWebhookSecret} onCheckedChange={(v) => setClearWebhookSecret(v === true)} />
                  Clear webhook secret
                </label>
              )}
            </div>
          </CardContent>
        </Card>

        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving..." : "Save payment settings"}
        </Button>
      </form>
      )}
    </div>
  );
}
