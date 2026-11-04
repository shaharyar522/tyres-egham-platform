import { Link } from "react-router-dom";
import { ChevronRight, Gift, Percent, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { useApiBootstrapQuery, useApiBrandsIndexQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

function formatValidRange(from: string, to: string): string {
  try {
    const a = new Date(from).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const b = new Date(to).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${a} – ${b}`;
  } catch {
    return `${from} – ${to}`;
  }
}

export default function OffersPage() {
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();
  const brandsQuery = useApiBrandsIndexQuery();
  const vouchers = bootstrapQuery.data?.vouchers ?? [];
  const offerBrands = (brandsQuery.data?.brands ?? []).filter((b) => b.hasActiveOffer);

  usePageMeta({
    title: `Offers & vouchers | ${site.businessName}`,
    description: `Current tyre offers and brand vouchers from ${site.businessName}.`,
    canonicalPath: "/offers",
  });


  const loading = bootstrapQuery.isLoading || brandsQuery.isLoading;
  const error = bootstrapQuery.isError || brandsQuery.isError;

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading offers</h1>
        <p className="mt-2 text-muted-foreground">Fetching promotions from the catalogue API.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load offers</h1>
        <p className="mt-2 text-muted-foreground">Check the API is running and try again.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Offers</span>
        </nav>
      </div>

      <section className="border-b bg-gradient-to-br from-amber-50 via-white to-amber-50/50 py-10">
        <div className="container">
          <div className="flex items-center gap-2 text-amber-800">
            <Gift className="h-8 w-8" aria-hidden />
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Current offers</h1>
          </div>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Enter voucher codes at checkout (basket step 1). Terms vary by brand and minimum quantity — details on each card below.
          </p>
        </div>
      </section>

      <div className="container space-y-12 py-12">
        <section>
          <h2 className="font-display text-2xl font-bold">Voucher codes</h2>
          <p className="mt-1 text-sm text-muted-foreground">Stack with multi-buy pricing where shown on qualifying tyres.</p>
          {vouchers.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No active vouchers in the catalogue right now.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {vouchers.map((v) => {
                const allBrands = brandsQuery.data?.brands ?? [];
                const brand =
                  v.brandId != null
                    ? allBrands.find((b) => b.id === v.brandId) ?? (v.brandSlug ? allBrands.find((b) => b.slug === v.brandSlug) : undefined)
                    : v.brandSlug
                      ? allBrands.find((b) => b.slug === v.brandSlug)
                      : undefined;

                return (
                <Card key={v.code} className="border-amber-200/80 bg-amber-50/40">
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-sm font-bold tracking-wide">
                        {v.code}
                      </Badge>
                      {v.brandName && (
                        <span className="text-sm text-muted-foreground">for {v.brandName}</span>
                      )}
                    </div>
                    <p className="mt-3 text-sm">{v.description}</p>
                    <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      Min. {v.minQty} tyres · £{v.discountPerQty.toFixed(2)} off per tyre at checkout
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Valid {formatValidRange(v.validFrom, v.validTo)}
                    </p>
                    {brand && (
                      <Link
                        to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}
                        className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
                      >
                        Browse qualifying tyres
                      </Link>
                    )}
                  </CardContent>
                </Card>
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold">Brands with live promotions</h2>
          <p className="mt-1 text-sm text-muted-foreground">Spot an offer badge on result cards and SKU pages for these manufacturers.</p>
          {offerBrands.length === 0 ? (
            <p className="mt-4 text-muted-foreground">No brands are flagged with active offers in the catalogue.</p>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {offerBrands.map((brand) => (
                <Link key={brand.id} to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}>
                  <Card className="h-full transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-3 p-5">
                      <div className="flex items-center justify-between gap-2">
                        <BrandLogoMark brand={brand} size="md" />
                        <Percent className="h-5 w-5 text-amber-600" aria-hidden />
                      </div>
                      <p className="font-display text-lg font-bold">{brand.name}</p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{brand.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-6">
            <p className="font-display text-base font-bold">How to use a code</p>
            <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
              <li>Add qualifying tyres to your basket (check brand and minimum quantity).</li>
              <li>On basket step 1, enter the voucher code and apply.</li>
              <li>Complete booking — you pay when fitted at the workshop.</li>
            </ol>
            <Link to="/basket" className="mt-4 inline-block text-sm font-semibold text-primary hover:underline">Go to basket</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
