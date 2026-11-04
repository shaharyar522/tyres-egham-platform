import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Truck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { EuLabelBadges } from "@/components/domain/eu-label";
import { OeBadgeRow } from "@/components/domain/oe-badge";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import type { TyreSku } from "@/types";
import { cn, formatGBP } from "@/lib/utils";
import { getTyreImageForSku, getTyrePlaceholderForSku } from "@/lib/tyre-images";

export type ResultsViewMode = "card" | "list";

interface ResultCardProps {
  sku: TyreSku;
  className?: string;
  layout?: ResultsViewMode;
}

const badgeLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "info" }> = {
  best_buy: { label: "Best Buy", variant: "secondary" },
  specialist: { label: "Specialist", variant: "info" },
  recommended: { label: "Recommended", variant: "default" },
};

function useSkuResultMeta(sku: TyreSku) {
  const bootstrapQuery = useApiBootstrapQuery();
  const brand = (bootstrapQuery.data?.brands ?? []).find((candidate) => candidate.id === sku.brandId);
  const brandName = brand?.name ?? "Tyre brand";
  const detailPath = `/tyresearch/details/${sku.id}/${sku.slug}`;
  const sizeLabel = `${sku.width}/${sku.profile}R${sku.rim} ${sku.loadIndex}${sku.speedRating}`;
  const within24h = Boolean(sku.isAvailableWithin24h);
  const hasBadges = sku.badges.length > 0 || sku.oeApprovals.length > 0 || Boolean(sku.isPremium) || Boolean(sku.isSameDayDelivery);
  const tiers = sku.quantityTiers.slice(0, 4);
  const bestTierQty = tiers.reduce(
    (best, tier) => (tier.pricePerTyre < (best?.pricePerTyre ?? Infinity) ? tier : best),
    tiers[0],
  );

  return { brand, brandName, detailPath, sizeLabel, within24h, hasBadges, tiers, bestTierQty };
}

function ExpressBanner() {
  return (
    <div className="flex items-center gap-2 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-white">
      <Zap className="h-3.5 w-3.5 shrink-0 fill-white" aria-hidden />
      <span className="text-xs font-semibold tracking-wide">Express fitting · within 24 hours</span>
    </div>
  );
}

function StockIndicator({ sku, within24h }: { sku: TyreSku; within24h: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      <span
        className={cn(
          "h-1.5 w-1.5 shrink-0 rounded-full",
          sku.stock > 5 ? "bg-emerald-500" : sku.stock > 0 ? "bg-amber-500" : "bg-primary",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "font-medium",
          sku.stock > 0 ? "text-[#1c2748]" : "text-muted-foreground",
          within24h && sku.stock > 0 && "text-emerald-800",
        )}
      >
        {sku.stock > 0 ? `${sku.stock} in stock` : "Out of stock"}
      </span>
    </div>
  );
}

function QuantityTierPills({
  tiers,
  bestTierQty,
  className,
}: {
  tiers: TyreSku["quantityTiers"];
  bestTierQty: TyreSku["quantityTiers"][number] | undefined;
  className?: string;
}) {
  if (tiers.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)} role="list" aria-label="Quantity pricing">
      {tiers.map((tier) => {
        const isBest = bestTierQty && tier.qty === bestTierQty.qty && tiers.length > 1;
        return (
          <span
            key={tier.qty}
            role="listitem"
            className={cn(
              "rounded-lg border px-2 py-1 text-xs tabular-nums transition-colors",
              isBest
                ? "border-primary/35 bg-primary/10 font-semibold text-foreground"
                : "border-border/80 bg-[#f8f8f8] text-muted-foreground",
            )}
          >
            <span className="font-semibold text-foreground">{tier.qty}</span>
            <span className="mx-1 text-border">·</span>
            {formatGBP(tier.pricePerTyre)}
          </span>
        );
      })}
    </div>
  );
}

function PriceBlock({ sku, within24h, compact }: { sku: TyreSku; within24h: boolean; compact?: boolean }) {
  return (
    <div className={cn("shrink-0 text-right", compact && "text-left lg:text-right")}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">From</p>
      <p
        className={cn(
          "font-display font-extrabold leading-none tracking-tight text-foreground",
          compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-[1.75rem]",
        )}
      >
        {formatGBP(sku.pricePerTyre)}
      </p>
      <p className={cn("mt-0.5 text-[11px] text-muted-foreground", within24h && compact && "text-emerald-900/80")}>
        per tyre, fitted
      </p>
    </div>
  );
}

function ProductBadges({ sku, hasBadges }: { sku: TyreSku; hasBadges: boolean }) {
  if (!hasBadges) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {sku.isPremium && (
        <Badge
          className="border-amber-300/80 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-0.5"
        >
          <Sparkles className="h-3 w-3 fill-amber-200 text-amber-200" />
          Premium
        </Badge>
      )}
      {sku.isSameDayDelivery && (
        <Badge
          className="border-sky-300/80 bg-gradient-to-r from-sky-600 via-sky-600 to-blue-600 text-white shadow-sm text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 px-2.5 py-0.5"
        >
          <Truck className="h-3 w-3" />
          Same-Day Delivery
        </Badge>
      )}
      {sku.badges.map((b) => (
        <Badge key={b} variant={badgeLabels[b]?.variant ?? "default"} className="text-[10px] font-semibold">
          {badgeLabels[b]?.label ?? b}
        </Badge>
      ))}
      <OeBadgeRow approvals={sku.oeApprovals} />
    </div>
  );
}

function ChooseTyreButton({ detailPath, className }: { detailPath: string; className?: string }) {
  return (
    <Button asChild size="lg" variant="cta" className={cn("gap-2", className)}>
      <Link to={detailPath}>
        Choose tyre
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </Button>
  );
}

/** Portrait frame matched to product photos (~3:4) so the full tyre fills the box without cropping. */
function TyreThumb({
  sku,
  brandName,
  detailPath,
  within24h,
  size = "card",
}: {
  sku: TyreSku;
  brandName: string;
  detailPath: string;
  within24h: boolean;
  size?: "card" | "list";
}) {
  return (
    <Link
      to={detailPath}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-xl border bg-[#eef1f5] transition-colors",
        "aspect-[3/4] group-hover:border-primary/25",
        size === "card" ? "w-[4.75rem] sm:w-[5.5rem]" : "w-24 sm:w-28",
        within24h ? "border-emerald-200" : "border-border/60",
      )}
      tabIndex={-1}
      aria-hidden
    >
      <img
        src={getTyreImageForSku(sku)}
        alt={`${brandName} ${sku.modelName}`}
        className="absolute inset-0 h-full w-full object-contain object-center p-0.5"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = getTyrePlaceholderForSku(sku);
        }}
      />
    </Link>
  );
}

export function ResultCard({ sku, className, layout = "card" }: ResultCardProps) {
  if (layout === "list") {
    return <ResultListRow sku={sku} className={className} />;
  }

  return <ResultCardGrid sku={sku} className={className} />;
}

function ResultCardGrid({ sku, className }: { sku: TyreSku; className?: string }) {
  const meta = useSkuResultMeta(sku);
  const { brand, brandName, detailPath, sizeLabel, within24h, hasBadges, tiers, bestTierQty } = meta;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-card transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-card-hover",
        within24h ? "border-emerald-300/80 ring-1 ring-emerald-200/60" : "border-border/80",
        className,
      )}
      aria-labelledby={`sku-${sku.id}-title`}
    >
      {within24h && <ExpressBanner />}

      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-5">
        <div className="flex gap-4">
          <TyreThumb sku={sku} brandName={brandName} detailPath={detailPath} within24h={within24h} size="card" />

          <div className="min-w-0 flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              {brand ? <BrandLogoMark brand={brand} size="sm" /> : null}
              <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                {brandName}
              </span>
            </div>

            <h3 id={`sku-${sku.id}-title`} className="font-display text-base font-bold leading-snug sm:text-lg">
              <Link
                to={detailPath}
                className="rounded-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {sku.modelName}
              </Link>
            </h3>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-medium text-foreground">
                {sizeLabel}
                {sku.isExtraLoad ? " XL" : ""}
              </span>
            </div>

            <p className="mt-1.5 truncate text-[10px] text-muted-foreground/80" title={sku.manufacturerSku}>
              SKU {sku.manufacturerSku}
            </p>
          </div>
        </div>

        <ProductBadges sku={sku} hasBadges={hasBadges} />

        <div className="rounded-xl bg-[#f8f8f8] p-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">EU tyre label</p>
          <EuLabelBadges label={sku.euLabel} compact />
        </div>
      </div>

      <footer
        className={cn(
          "mt-auto border-t px-4 py-4 sm:px-5",
          within24h ? "border-emerald-200/80 bg-emerald-50/50" : "border-border/60 bg-[#f8f8f8]",
        )}
      >
        <div className="flex items-end justify-between gap-4">
          <StockIndicator sku={sku} within24h={within24h} />
          <PriceBlock sku={sku} within24h={within24h} />
        </div>

        <QuantityTierPills tiers={tiers} bestTierQty={bestTierQty} className="mt-3" />

        <ChooseTyreButton detailPath={detailPath} className="mt-4 w-full" />
      </footer>
    </article>
  );
}

function ResultListRow({ sku, className }: { sku: TyreSku; className?: string }) {
  const meta = useSkuResultMeta(sku);
  const { brand, brandName, detailPath, sizeLabel, within24h, hasBadges, tiers, bestTierQty } = meta;

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-card transition-colors",
        "hover:border-primary/25 hover:shadow-card-hover",
        within24h ? "border-emerald-300/80 ring-1 ring-emerald-200/60" : "border-border/80",
        className,
      )}
      aria-labelledby={`sku-${sku.id}-title-list`}
    >
      {within24h && <ExpressBanner />}

      <div className="flex flex-col gap-4 p-4 lg:flex-row lg:items-stretch lg:gap-5 lg:p-5">
        <div className="flex min-w-0 flex-1 gap-4">
          <TyreThumb sku={sku} brandName={brandName} detailPath={detailPath} within24h={within24h} size="list" />

          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="mb-1.5 flex items-center gap-2">
                {brand ? <BrandLogoMark brand={brand} size="sm" /> : null}
                <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {brandName}
                </span>
              </div>

              <h3 id={`sku-${sku.id}-title-list`} className="font-display text-lg font-bold leading-snug">
                <Link
                  to={detailPath}
                  className="rounded-sm text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  {sku.modelName}
                </Link>
              </h3>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 font-mono text-xs font-medium text-foreground">
                  {sizeLabel}
                  {sku.isExtraLoad ? " XL" : ""}
                </span>
                <span className="truncate text-[10px] text-muted-foreground/80" title={sku.manufacturerSku}>
                  SKU {sku.manufacturerSku}
                </span>
              </div>
            </div>

            <ProductBadges sku={sku} hasBadges={hasBadges} />

            <div className="flex flex-wrap items-end gap-3">
              <EuLabelBadges label={sku.euLabel} compact />
            </div>
          </div>
        </div>

        <div
          className={cn(
            "flex shrink-0 flex-col gap-3 border-t pt-4 lg:w-56 lg:border-l lg:border-t-0 lg:pt-0 lg:pl-5 xl:w-64",
            within24h ? "border-emerald-200/80 lg:bg-emerald-50/30" : "border-border/60",
          )}
        >
          <div className="flex flex-wrap items-end justify-between gap-4 lg:flex-col lg:items-stretch">
            <PriceBlock sku={sku} within24h={within24h} compact />
            <StockIndicator sku={sku} within24h={within24h} />
          </div>

          <QuantityTierPills tiers={tiers} bestTierQty={bestTierQty} />

          <ChooseTyreButton detailPath={detailPath} className="w-full sm:w-auto lg:w-full" />
        </div>
      </div>
    </article>
  );
}
