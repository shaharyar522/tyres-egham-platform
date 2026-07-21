import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useBasket } from "@/store/basket";
import { useBasketCatalog } from "@/lib/api/use-basket-catalog";
import { useBasketTotals } from "@/lib/hooks/use-basket-totals";
import { formatServiceLinePrice, getServiceSelection } from "@/lib/service-pricing";
import { formatGBP } from "@/lib/utils";
import type { PaymentMethod } from "@/types";

export function OrderSummary({ paymentMethod = "pay_on_fitment" }: { paymentMethod?: PaymentMethod }) {
  const { items, serviceIds, serviceSelections, slot } = useBasket();
  const totals = useBasketTotals();
  const voucher = totals.voucher;
  const { skuMap, brandMap, selectedServices, isLoading } = useBasketCatalog();
  const services = selectedServices.filter((service) => serviceIds.includes(service.id));

  return (
    <Card>
      <CardContent className="p-4">
        <p className="font-display text-base font-extrabold">Order summary</p>

        <div className="mt-3 space-y-2">
          {items.map((item) => {
            const sku = skuMap.get(item.skuId);
            const brand = sku ? brandMap.get(sku.brandId) ?? null : null;
            if (!sku || !brand) {
              return (
                <div key={item.skuId} className="text-sm text-muted-foreground">
                  {isLoading ? "Loading tyre details..." : `Tyre ${item.skuId}`}
                </div>
              );
            }
            const tier = sku.quantityTiers.filter((t) => item.qty >= t.qty).sort((a, b) => b.qty - a.qty)[0];
            const unit = tier?.pricePerTyre ?? sku.pricePerTyre;
            return (
              <div key={item.skuId} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="line-clamp-1 font-semibold">{brand.name} {sku.modelName}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {sku.width}/{sku.profile}R{sku.rim} × {item.qty}
                  </p>
                </div>
                <span className="font-semibold">{formatGBP(unit * item.qty)}</span>
              </div>
            );
          })}

          {services.length > 0 && (
            <>
              <Separator />
              {services.map((s) => {
                const selection = getServiceSelection(serviceSelections, s.id);
                const optionLabel = selection?.optionKey && s.pricingOptions
                  ? s.pricingOptions.options.find((o) => o.key === selection.optionKey)?.label
                  : null;
                return (
                  <div key={s.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="line-clamp-2 min-w-0">
                      {s.name}
                      {optionLabel ? <span className="block text-[11px] text-muted-foreground">{optionLabel}</span> : null}
                    </span>
                    <Badge variant={s.priceFrom === "free" ? "free" : "muted"} className="shrink-0 text-[10px]">
                      {formatServiceLinePrice(s, selection)}
                    </Badge>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <Separator className="my-3" />

        <div className="space-y-1.5 text-sm">
          <SummaryRow label="Subtotal" value={formatGBP(totals.subtotal)} />
          {totals.voucherDiscount > 0 && (
            <SummaryRow label={`Voucher ${voucher?.code}`} value={`- ${formatGBP(totals.voucherDiscount)}`} highlight />
          )}
          {totals.servicesTotal > 0 && (
            <SummaryRow label="Services" value={formatGBP(totals.servicesTotal)} />
          )}
          <SummaryRow label="Fitting & valves" value="Included" muted />
          <SummaryRow label="Disposal" value="Included" muted />
        </div>

        <Separator className="my-3" />

        <div className="flex items-baseline justify-between">
          <span className="font-display text-base font-bold">Total</span>
          <span className="font-display text-2xl font-extrabold">{formatGBP(totals.total)}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          {paymentMethod === "stripe"
            ? "Card payment taken at checkout to confirm your slot."
            : "Pay at the workshop on the day of fitting."}
        </p>

        {slot && (
          <>
            <Separator className="my-3" />
            <div className="rounded-lg bg-muted/40 p-3 text-sm">
              <p className="text-xs font-bold uppercase text-muted-foreground">Fitting slot</p>
              <p className="mt-1 font-semibold">{slot.date}</p>
              <p className="text-muted-foreground">{slot.time}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value, highlight, muted }: { label: string; value: string; highlight?: boolean; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={muted ? "text-muted-foreground" : highlight ? "text-emerald-700" : ""}>{label}</span>
      <span className={`font-semibold ${highlight ? "text-emerald-700" : ""}`}>{value}</span>
    </div>
  );
}
