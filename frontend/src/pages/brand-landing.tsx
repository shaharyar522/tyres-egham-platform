import { Link, useParams } from "react-router-dom";
import { ChevronRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TyreSearchWidget } from "@/components/domain/tyre-search-widget";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { HtmlContent } from "@/components/domain/html-content";
import { ResultCard } from "@/components/domain/result-card";
import { VoucherBanner } from "@/components/domain/voucher-banner";
import { useApiBootstrapQuery, useApiBrandQuery, useApiTyreSearchQuery } from "@/lib/api/queries";
import { findVoucherForBrand } from "@/lib/vouchers";
import { brandTierLabel } from "@/lib/brand-tiers";
import { formatGBP } from "@/lib/utils";

export default function BrandLandingPage() {
  const params = useParams();
  const routeSlug = params.slug ?? "";
  const brandSlug = routeSlug.replace(/-tyres$/, "");
  const brandQuery = useApiBrandQuery(brandSlug);
  const bootstrapQuery = useApiBootstrapQuery();
  const brand = brandQuery.data?.brand;
  const brandSkusQuery = useApiTyreSearchQuery({ brand: brand?.slug, perPage: 200 });
  const brandSkus = brandSkusQuery.data?.results ?? [];
  const voucher = brand ? findVoucherForBrand(bootstrapQuery.data?.vouchers ?? [], brand.slug) : null;

  if (brandQuery.isLoading || bootstrapQuery.isLoading || brandSkusQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading brand</h1>
        <p className="mt-2 text-muted-foreground">Fetching live brand catalogue data from the Phase 1 backend.</p>
      </div>
    );
  }

  if (!brand || brandQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Brand not found</h1>
        <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  const minPrice = brandSkus.length ? Math.min(...brandSkus.map((s) => s.pricePerTyre)) : null;
  const tierName = brandTierLabel(brand.tier);
  const otherBrands = (bootstrapQuery.data?.brands ?? []).filter((b) => b.tier === brand.tier && b.id !== brand.id).slice(0, 6);

  const skusByCategory = (bootstrapQuery.data?.categories ?? []).map((cat) => ({
    cat,
    skus: brandSkus.filter((s) => s.category === cat.slug).slice(0, 6),
  })).filter((g) => g.skus.length > 0);

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/brands" className="hover:text-foreground">Brands</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{brand.name}</span>
        </nav>
      </div>

      <section className="border-b bg-gradient-to-br from-primary via-primary to-brand-dark py-10 text-primary-foreground">
        <div className="container grid gap-8 lg:grid-cols-2">
          <div>
            <BrandLogoMark brand={brand} size="xl" className="mb-4 h-20 w-20 border-white/20 bg-white p-2" />
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> {tierName} brand
            </span>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl lg:text-display-lg">
              {brand.name} Tyres
            </h1>
            <HtmlContent
              html={brand.description}
              className="prose-invert mt-3 max-w-xl text-balance text-base text-white/85 prose-p:text-white/85 prose-headings:text-white"
            />
            <ul className="mt-4 flex flex-wrap items-center gap-2">
              {brand.recommendedFor.map((rf) => (
                <li key={rf} className="rounded-full border border-white/30 bg-white/5 px-3 py-1 text-xs">
                  {rf}
                </li>
              ))}
            </ul>
            {minPrice !== null && (
              <p className="mt-5 font-display text-base">
                <span className="text-white/70">Prices from</span>{" "}
                <span className="font-display text-2xl font-extrabold">
                  {formatGBP(minPrice, { withPence: false })}
                </span>{" "}
                <span className="text-white/70">per tyre, fully fitted</span>
              </p>
            )}
          </div>

          <div className="lg:justify-self-end">
            <TyreSearchWidget />
          </div>
        </div>
      </section>

      {voucher && (
        <section className="border-b bg-amber-50">
          <div className="container py-4">
            <VoucherBanner voucher={voucher} />
          </div>
        </section>
      )}

      <section className="container py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold sm:text-3xl">Recommended {brand.name} tyres by category</h2>
            <p className="mt-1 text-sm text-muted-foreground">Selected by our fitters based on application, customer feedback and OE fitments.</p>
          </div>
          {brandSkus.length > 0 && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/tyresearch/results?brand=${brand.slug}`}>View all {brand.name} tyres ({brandSkusQuery.data?.total ?? brandSkus.length})</Link>
            </Button>
          )}
        </div>

        <div className="mt-8 space-y-10">
          {skusByCategory.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>We don't currently stock {brand.name} tyres in your size, but we can usually source any size within 24 hours - call us on 01784 436000.</p>
              </CardContent>
            </Card>
          ) : (
            skusByCategory.map(({ cat, skus }) => (
              <div key={cat.id}>
                <h3 className="mb-3 font-display text-xl font-bold">{cat.name}</h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {skus.map((sku) => (
                    <ResultCard key={sku.id} sku={sku} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="border-t bg-muted/30 py-12">
        <div className="container">
          <h2 className="font-display text-xl font-extrabold">Other {tierName.toLowerCase()} brands we recommend</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
            {otherBrands.map((b) => (
              <Link
                key={b.id}
                to={`/tyre/brand/${b.id}/${b.slug}-tyres`}
                className="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card-hover"
              >
                <BrandLogoMark brand={b} size="sm" />
                <span className="truncate">{b.name}</span>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span>Looking for {brand.name} tyres in <strong>Egham, Staines or Windsor</strong>? We deliver and fit across our 88-postcode local catchment.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
