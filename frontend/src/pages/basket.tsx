import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingCart, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { FunnelStepper } from "@/components/domain/funnel-stepper";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { useBasket } from "@/store/basket";
import { useBasketCatalog } from "@/lib/api/use-basket-catalog";
import { formatGBP } from "@/lib/utils";
import { OrderSummary } from "@/components/domain/order-summary";

export default function BasketPage() {
  const navigate = useNavigate();
  const { items, updateQty, removeItem, voucher, voucherError, applyVoucher, clearVoucher, totals } = useBasket();
  const { skuMap, brandMap, vouchers, isLoading, isError } = useBasketCatalog();
  const [voucherInput, setVoucherInput] = useState(voucher?.code ?? "");

  if (items.length === 0) {
    return (
      <div className="container py-16 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Your basket is empty</h1>
        <p className="mt-2 text-muted-foreground">Find tyres for your vehicle and we will hold them for fitting.</p>
        <Button asChild className="mt-4" size="lg" variant="cta">
          <Link to="/">Find tyres</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-6 lg:py-10">
      <FunnelStepper current="basket" className="mb-8 max-w-xl" />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Your basket</h1>

          {isError && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                Live item details are temporarily unavailable. Your basket is still preserved, but some product information may be limited until the API reconnects.
              </CardContent>
            </Card>
          )}

          {items.map((item) => {
            const sku = skuMap.get(item.skuId);
            const brand = sku ? brandMap.get(sku.brandId) ?? null : null;

            if (!sku || !brand) {
              return (
                <Card key={item.skuId}>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">
                      {isLoading ? "Loading tyre details..." : `Tyre ${item.skuId} is currently unavailable.`}
                    </div>
                  </CardContent>
                </Card>
              );
            }

            const tier = sku.quantityTiers.filter((t) => item.qty >= t.qty).sort((a, b) => b.qty - a.qty)[0];
            const unit = tier?.pricePerTyre ?? sku.pricePerTyre;
            return (
              <Card key={item.skuId}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    <BrandLogoMark brand={brand} size="lg" />
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-xs font-bold uppercase text-muted-foreground">{brand.name}</p>
                      <h3 className="font-display text-lg font-bold leading-tight">
                        <Link to={`/tyresearch/details/${sku.id}/${sku.slug}`} className="hover:text-primary">
                          {sku.modelName}
                        </Link>
                      </h3>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {sku.width}/{sku.profile}R{sku.rim} {sku.loadIndex}{sku.speedRating}{sku.isExtraLoad && " XL"}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center gap-1 rounded-md border bg-background">
                          <Button variant="ghost" size="icon" onClick={() => updateQty(sku.id, item.qty - 1)} aria-label="Decrease">
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="min-w-8 text-center font-display font-bold">{item.qty}</span>
                          <Button variant="ghost" size="icon" onClick={() => updateQty(sku.id, item.qty + 1)} aria-label="Increase">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="text-right">
                          <p className="font-display text-lg font-extrabold">{formatGBP(unit * item.qty)}</p>
                          <p className="text-xs text-muted-foreground">{formatGBP(unit)} each</p>
                        </div>

                        <Button variant="ghost" size="sm" onClick={() => removeItem(sku.id)} className="text-destructive">
                          <Trash2 className="h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <Card>
            <CardContent className="p-4">
              <Label htmlFor="voucher" className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
                <Tag className="h-4 w-4 text-primary" /> Voucher code
              </Label>
              <div className="flex gap-2">
                <Input
                  id="voucher"
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                  placeholder="e.g. MICH26FA"
                  className="font-mono"
                />
                {voucher ? (
                  <Button variant="outline" onClick={() => { clearVoucher(); setVoucherInput(""); }}>Remove</Button>
                ) : (
                  <Button onClick={() => applyVoucher(voucherInput, vouchers)} variant="outline">Apply</Button>
                )}
              </div>
              {voucherError && <p className="mt-2 text-xs text-destructive">{voucherError}</p>}
              {voucher && (
                <p className="mt-2 text-xs font-semibold text-emerald-700">
                  {voucher.description} - applied
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
          <Button onClick={() => navigate("/basket/services")} variant="cta" size="lg" className="mt-4 w-full gap-2">
            Continue to services <ArrowRight className="h-4 w-4" />
          </Button>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Total to pay at workshop: <strong>{formatGBP(totals.total)}</strong>
          </p>
        </aside>
      </div>
    </div>
  );
}
