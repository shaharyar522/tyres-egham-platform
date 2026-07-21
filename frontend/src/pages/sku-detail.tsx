import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronRight, Minus, Plus, ShieldCheck, Star, FileText, PlayCircle, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { CutoffTimer } from "@/components/domain/cutoff-timer";
import { EuLabelBadges } from "@/components/domain/eu-label";
import { OeBadge } from "@/components/domain/oe-badge";
import { StarRating } from "@/components/domain/star-rating";
import { VoucherBanner } from "@/components/domain/voucher-banner";
import { ResultCard } from "@/components/domain/result-card";
import { useApiBootstrapQuery, useApiTyreDetailQuery, useApiTyreSearchQuery } from "@/lib/api/queries";
import { findVoucherForBrand } from "@/lib/vouchers";
import { useBasket } from "@/store/basket";
import { cn, formatGBP } from "@/lib/utils";
import { getTyreImageForSku, getTyrePlaceholderForSku } from "@/lib/tyre-images";

export default function SkuDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const idOrSlug = params.id ?? params.slug ?? "";
  const detailQuery = useApiTyreDetailQuery(idOrSlug);
  const bootstrapQuery = useApiBootstrapQuery();
  const sku = detailQuery.data?.sku;
  const brand = sku ? (bootstrapQuery.data?.brands ?? []).find((candidate) => Number(candidate.id) === Number(sku.brandId)) ?? null : null;
  const { addItem } = useBasket();

  const [qty, setQty] = useState(4);
  const [confirmed, setConfirmed] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  const relatedQuery = useApiTyreSearchQuery({
    width: sku?.width,
    profile: sku?.profile,
    rim: sku?.rim,
  });

  const tier = useMemo(() => {
    if (!sku) return null;
    return sku.quantityTiers.filter((t) => qty >= t.qty).sort((a, b) => b.qty - a.qty)[0] ?? null;
  }, [sku, qty]);

  if (detailQuery.isLoading || bootstrapQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading tyre</h1>
        <p className="mt-2 text-muted-foreground">Fetching live SKU data from the Phase 1 backend.</p>
      </div>
    );
  }

  if (!sku || !brand || detailQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Tyre not found</h1>
        <p className="mt-2 text-muted-foreground">We could not find the SKU you were looking for.</p>
        <Button asChild className="mt-4">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  const sizeLabel = `${sku.width}/${sku.profile}R${sku.rim} ${sku.loadIndex}${sku.speedRating}`;
  const unitPrice = tier?.pricePerTyre ?? sku.pricePerTyre;
  const subtotal = unitPrice * qty;
  const voucher = sku.hasActiveOffer ? findVoucherForBrand(bootstrapQuery.data?.vouchers ?? [], brand.slug) : null;
  const voucherSaving = voucher && qty >= voucher.minQty ? voucher.discountPerQty * qty : 0;
  const grandTotal = subtotal - voucherSaving;

  const related = (relatedQuery.data?.results ?? [])
    .filter((candidate) => Number(candidate.id) !== Number(sku.id) && (Number(candidate.brandId) === Number(sku.brandId) || candidate.category === sku.category))
    .slice(0, 3);

  const handleAdd = () => {
    if (!confirmed) return;
    addItem(sku.id, qty, {
      brandId: sku.brandId,
      brandSlug: brand.slug,
      pricePerTyre: sku.pricePerTyre,
      quantityTiers: sku.quantityTiers,
    });
    navigate("/basket");
  };

  return (
    <div className="container py-6 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/tyresearch/results" className="hover:text-foreground">Tyres</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`} className="hover:text-foreground">{brand.name}</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="line-clamp-1 text-foreground">{sku.modelName}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <Card className="overflow-hidden">
            <div className="relative flex aspect-square items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 p-8">
              <div className="absolute left-3 top-3 flex flex-col gap-1">
                {sku.badges.map((b) => (
                  <Badge key={b} variant="secondary" className="capitalize">
                    {b.replace("_", " ")}
                  </Badge>
                ))}
              </div>
              {showVideo && sku.videoUrl ? (
                <iframe
                  src={sku.videoUrl}
                  title={`${sku.modelName} video`}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <BrandLogoMark brand={brand} size="lg" />
                  <img
                    src={getTyreImageForSku(sku)}
                    alt={`${brand.name} ${sku.modelName} tyre`}
                    className="h-52 w-52 object-contain drop-shadow-xl"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getTyrePlaceholderForSku(sku);
                    }}
                  />
                  <p className="font-mono text-xs text-muted-foreground">{sizeLabel}{sku.isExtraLoad && " XL"}</p>
                </div>
              )}
            </div>
            {sku.videoUrl && (
              <div className="border-t p-3">
                <Button variant="outline" size="sm" onClick={() => setShowVideo((v) => !v)} className="gap-2">
                  <PlayCircle className="h-4 w-4" /> {showVideo ? "Hide video" : "Watch product video"}
                </Button>
              </div>
            )}
          </Card>

          <div className="mt-4 rounded-xl border bg-muted/30 p-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">EU Tyre Label</p>
            <EuLabelBadges label={sku.euLabel} />
            <button className="mt-3 inline-flex items-center gap-1 text-xs text-primary underline-offset-2 hover:underline">
              <FileText className="h-3.5 w-3.5" />
              Download full EU label PDF
            </button>
          </div>
        </section>

        <section>
          <div className="flex items-baseline gap-3">
            <p className="font-display text-sm font-bold uppercase tracking-tight text-muted-foreground">{brand.name}</p>
            <span className="text-xs text-muted-foreground">SKU {sku.manufacturerSku}</span>
          </div>
          <h1 className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{sku.modelName}</h1>
          <p className="mt-1 font-mono text-sm text-muted-foreground">{sizeLabel}{sku.isExtraLoad && " XL"}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <StarRating rating={sku.starRating} reviewCount={sku.reviewCount} size="md" />
            <CutoffTimer />
          </div>

          {sku.isAvailableWithin24h && (
            <div className="mt-4 flex items-center gap-3 rounded-lg border-2 border-emerald-300 bg-emerald-50 p-3 text-sm">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                <Zap className="h-5 w-5 fill-white" />
              </span>
              <div className="flex-1">
                <p className="font-semibold text-emerald-900">Express fitting - within 24 hours</p>
                <p className="text-xs text-emerald-800/80">In local stock and reserved for next-day fitting at our Egham workshop.</p>
              </div>
            </div>
          )}

          {sku.oeApprovals.length > 0 && (
            <div className="mt-4 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="mb-1 flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Vehicle-Manufacturer Approved
              </p>
              <div className="flex flex-wrap items-center gap-2">
                {sku.oeApprovals.map((a) => (
                  <OeBadge key={a.code} approval={a} className="bg-white" />
                ))}
                <span className="text-xs">{sku.oeApprovals[0]?.description}</span>
              </div>
            </div>
          )}

          {voucher && (
            <div className="mt-4">
              <VoucherBanner voucher={voucher} />
            </div>
          )}

          <Card className="mt-6 border-2 border-primary/20 shadow-elev-1">
            <CardContent className="p-5">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-sm font-bold uppercase text-muted-foreground">Quantity</p>
                <p className="text-xs text-muted-foreground">{sku.stock} in stock</p>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQty(n)}
                    className={cn(
                      "flex flex-col items-center rounded-lg border p-2 text-center text-sm transition-all",
                      qty === n
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:border-primary/40",
                    )}
                  >
                    <span className="font-display text-lg font-extrabold leading-none">{n}</span>
                    <span className="mt-0.5 text-[10px] uppercase opacity-80">{n === 1 ? "tyre" : "tyres"}</span>
                  </button>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-center gap-2">
                <Button size="icon" variant="outline" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="min-w-12 text-center font-display text-xl font-bold">{qty}</span>
                <Button size="icon" variant="outline" onClick={() => setQty((q) => Math.min(sku.stock, q + 1))} aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5 text-sm">
                {sku.quantityTiers.map((t) => (
                  <div key={t.qty} className="flex items-center justify-between">
                    <span>{t.qty} {t.qty === 1 ? "tyre" : "tyres"}</span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold">{formatGBP(t.pricePerTyre)} <span className="text-xs text-muted-foreground">each</span></span>
                      {t.saveLabel && <Badge variant="success" className="text-[10px]">{t.saveLabel}</Badge>}
                    </span>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-1.5 text-sm">
                <Row label={`Subtotal (${qty} \u00d7 ${formatGBP(unitPrice)})`} value={formatGBP(subtotal)} />
                {voucherSaving > 0 && <Row label={`Voucher ${voucher?.code}`} value={`- ${formatGBP(voucherSaving)}`} highlight />}
                <Row label="Fully fitted total" value={formatGBP(grandTotal)} bold />
                <p className="text-[11px] text-muted-foreground">Includes valves, balancing, and disposal of old tyres.</p>
              </div>

              <Separator className="my-4" />

              <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="fitment-confirm"
                    checked={confirmed}
                    onCheckedChange={(v) => setConfirmed(Boolean(v))}
                    className="mt-0.5"
                  />
                  <Label htmlFor="fitment-confirm" className="cursor-pointer text-sm leading-snug text-amber-900">
                    I confirm <strong className="font-mono">{sizeLabel}</strong> is the correct size for my vehicle.
                    <span className="block text-xs font-normal text-amber-800/80">Wrong size? <Link to="/" className="underline">Search again</Link></span>
                  </Label>
                </div>
              </div>

              <Button onClick={handleAdd} disabled={!confirmed} variant="cta" size="lg" className="mt-3 w-full gap-2">
                <ShoppingCart className="h-5 w-5" /> Add to basket
              </Button>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                <ShieldCheck className="-mt-0.5 mr-1 inline h-3 w-3 text-success" />
                Book now, pay when fitted - no upfront payment required.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      <Tabs defaultValue="specs" className="mt-12">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({sku.reviewCount})</TabsTrigger>
          <TabsTrigger value="brand">About {brand.name}</TabsTrigger>
        </TabsList>

        <TabsContent value="specs">
          <Card>
            <CardContent className="p-5">
              <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <SpecRow k="Brand" v={brand.name} />
                <SpecRow k="Model" v={sku.modelName} />
                <SpecRow k="Width" v={`${sku.width} mm`} />
                <SpecRow k="Profile" v={`${sku.profile}%`} />
                <SpecRow k="Rim Diameter" v={`R${sku.rim}`} />
                <SpecRow k="Load Index" v={String(sku.loadIndex)} />
                <SpecRow k="Speed Rating" v={sku.speedRating} />
                <SpecRow k="Extra Load" v={sku.isExtraLoad ? "Yes (XL)" : "No"} />
                <SpecRow k="Run Flat" v={sku.isRunFlat ? "Yes" : "No"} />
                <SpecRow k="EV Optimised" v={sku.isEvRated ? "Yes" : "No"} />
                <SpecRow k="EAN" v={sku.ean} />
                <SpecRow k="Manufacturer Code" v={sku.manufacturerSku} />
                <SpecRow k="Fuel Efficiency" v={sku.euLabel.fuelEfficiency} />
                <SpecRow k="Wet Grip" v={sku.euLabel.wetGrip} />
                <SpecRow k="Noise" v={`${sku.euLabel.externalNoise} dB (${sku.euLabel.noiseClass})`} />
                <SpecRow k="Stock" v={`${sku.stock} available`} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-display text-5xl font-extrabold">{sku.starRating.toFixed(1)}</p>
                  <StarRating rating={sku.starRating} showCount={false} size="md" />
                  <p className="mt-1 text-xs text-muted-foreground">{sku.reviewCount} reviews</p>
                </div>
                <div className="flex-1 space-y-1.5">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const pct = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : 1;
                    return (
                      <div key={stars} className="flex items-center gap-2 text-xs">
                        <span className="w-6 text-right text-muted-foreground">{stars}</span>
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Customer reviews shown here are sample placeholders for the prototype. In production, these will be loaded from real verified reviewers and Google reviews via the moderation pipeline.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="brand">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <BrandLogoMark brand={brand} size="lg" />
                <div>
                  <h3 className="font-display text-xl font-bold">{brand.name}</h3>
                  <p className="mt-1 text-sm capitalize text-muted-foreground">{brand.tier.replace("_", " ")} tier</p>
                  <p className="mt-3 text-sm">{brand.description}</p>
                  <Button asChild variant="outline" size="sm" className="mt-3">
                    <Link to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}>
                      All {brand.name} tyres
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-2xl font-extrabold">Customers also considered</h2>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <ResultCard key={s.id} sku={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({ label, value, bold, highlight }: { label: string; value: string; bold?: boolean; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between", bold && "border-t pt-2 font-display text-base font-extrabold")}>
      <span className={cn(highlight && "text-emerald-700")}>{label}</span>
      <span className={cn(highlight && "text-emerald-700 font-semibold")}>{value}</span>
    </div>
  );
}

function SpecRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-center justify-between border-b py-1.5 last:border-b-0">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}
