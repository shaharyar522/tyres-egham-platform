import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TyreSearchWidget } from "@/components/domain/tyre-search-widget";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

export default function AreasServedPage() {
  const { slug } = useParams();
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();
  const areas = bootstrapQuery.data?.areas ?? [];
  const selected = slug ? areas.find((area) => area.slug === slug) ?? null : null;

  usePageMeta(
    selected
      ? {
          title: `Tyres in ${selected.name} | ${site.businessName}`,
          description: `Tyre fitting for ${selected.name} (${selected.postcodePrefix}) with ${site.businessName}.`,
          canonicalPath: `/areas-served/${selected.slug}`,
        }
      : {
          title: `Areas we serve | ${site.businessName}`,
          description: `Local tyre fitting coverage from ${site.businessName} across Egham and surrounding areas.`,
          canonicalPath: "/areas-served",
        },
  );

  if (bootstrapQuery.isLoading) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Loading areas</h1>
        <p className="mt-2 text-muted-foreground">Fetching coverage areas.</p>
      </div>
    );
  }

  if (slug && !selected) {
    return (
      <div className="container py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Area not found</h1>
        <p className="mt-2 text-muted-foreground">We could not find that area page.</p>
        <Button asChild className="mt-4" variant="cta"><Link to="/areas-served">Back to all areas</Link></Button>
      </div>
    );
  }

  if (selected) {
    return (
      <div className="container py-10">
        <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Tyres in {selected.name}</h1>
        <p className="mt-2 text-muted-foreground">
          Local fitting coverage for {selected.name} ({selected.postcodePrefix}). Same-day and next-day appointments subject to bay capacity.
        </p>

        <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <p className="font-display text-lg font-bold">Search tyres for your vehicle</p>
            <p className="mb-4 text-sm text-muted-foreground">Book online and choose your preferred workshop slot.</p>
            <TyreSearchWidget variant="compact" />
          </CardContent>
        </Card>

        <div className="mt-6 flex flex-wrap gap-2">
          {areas.filter((a) => a.id !== selected.id).slice(0, 10).map((a) => (
            <Link
              key={a.id}
              to={`/areas-served/${a.slug}`}
              className="rounded-full border bg-background px-3 py-1.5 text-sm hover:border-primary/40 hover:text-primary"
            >
              {a.name}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Areas we cover</h1>
      <p className="mt-2 text-muted-foreground">
        We cover {areas.length} local areas around Egham, Staines, Windsor, Woking, and surrounding postcodes.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {areas.map((area) => (
          <Link
            key={area.id}
            to={`/areas-served/${area.slug}`}
            className="rounded-lg border bg-card p-3 text-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-card"
          >
            <p className="font-semibold">{area.name}</p>
            <p className="text-xs text-muted-foreground">{area.postcodePrefix}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
