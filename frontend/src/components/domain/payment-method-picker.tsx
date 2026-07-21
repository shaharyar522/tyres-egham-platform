import { Banknote, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

type PaymentMethodPickerProps = {
  methods: PaymentMethod[];
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

const labels: Record<PaymentMethod, { title: string; description: string; icon: typeof CreditCard }> = {
  stripe: {
    title: "Pay now by card",
    description: "Secure payment powered by Stripe. Your slot is confirmed once payment succeeds.",
    icon: CreditCard,
  },
  pay_on_fitment: {
    title: "Pay on fitment",
    description: "Reserve your slot now and pay at the workshop on the day of fitting (cash or card).",
    icon: Banknote,
  },
};

export function PaymentMethodPicker({ methods, value, onChange }: PaymentMethodPickerProps) {
  if (methods.length <= 1) {
    const method = methods[0];
    if (!method) return null;
    const meta = labels[method];
    const Icon = meta.icon;
    return (
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <Icon className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-display text-sm font-bold">{meta.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {methods.map((method) => {
        const meta = labels[method];
        const Icon = meta.icon;
        const selected = value === method;
        return (
          <button
            key={method}
            type="button"
            onClick={() => onChange(method)}
            className={cn(
              "rounded-lg border p-4 text-left transition-all",
              selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/40",
            )}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("mt-0.5 h-5 w-5", selected ? "text-primary" : "text-muted-foreground")} />
              <div>
                <p className="font-display text-sm font-bold">{meta.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{meta.description}</p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
