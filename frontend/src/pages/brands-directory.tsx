import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { useApiBrandsIndexQuery } from "@/lib/api/queries";
import { brandTierLabel } from "@/lib/brand-tiers";
import type { Brand, BrandTier } from "@/types";

function groupByTier(brands: Brand[]): Record<BrandTier, Brand[]> {
  const out: Record<BrandTier, Brand[]> = { premium: [], mid_range: [], budget: [] };
  for (const b of brands) {
    out[b.tier].push(b);
  }
  return out;
}

const tierOrder: BrandTier[] = ["premium", "mid_range", "budget"];

export default function BrandsDirectoryPage() {
  const brandsQuery = useApiBrandsIndexQuery();
  const brands = brandsQuery.data?.brands ?? [];

  if (brandsQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading brands</h1>
        <p className="mt-2 text-muted-foreground">Fetching the full brand directory from the catalogue API.</p>
      </div>
    );
  }

  if (brandsQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load brands</h1>
        <p className="mt-2 text-muted-foreground">Check the API is running and try again.</p>
      </div>
    );
  }

  const grouped = groupByTier(brands);

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">All brands</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Tyre brands</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Browse our range by manufacturer. Each brand page lists live stock and current offers where available.
          </p>
        </div>
      </section>

      <div className="container space-y-12 py-12">
        {tierOrder.map((tier) => {
          const list = grouped[tier];
          if (list.length === 0) return null;
          return (
            <section key={tier}>
              <h2 className="font-display text-2xl font-bold">{brandTierLabel(tier)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {tier === "premium" && "OE suppliers and award-winning ranges."}
                {tier === "mid_range" && "Strong value without compromising safety."}
                {tier === "budget" && "Economy-focused patterns for older vehicles and light use."}
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {list.map((brand) => (
                  <Link key={brand.id} to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}>
                    <Card className="h-full transition-shadow hover:shadow-md">
                      <CardContent className="flex flex-col gap-3 p-5">
                        <BrandLogoMark brand={brand} size="md" />
                        <div>
                          <p className="font-display text-lg font-bold">{brand.name}</p>
                          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{brand.description}</p>
                        </div>
                        {brand.hasActiveOffer && (
                          <span className="text-xs font-semibold text-primary">Active offer</span>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
