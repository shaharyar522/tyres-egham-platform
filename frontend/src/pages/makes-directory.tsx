import { Link } from "react-router-dom";
import { ChevronRight, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApiBootstrapQuery } from "@/lib/api/queries";

export default function MakesDirectoryPage() {
  const bootstrapQuery = useApiBootstrapQuery();
  const makes = bootstrapQuery.data?.makes ?? [];
  const totalMakes = bootstrapQuery.data?.stats.makes;

  if (bootstrapQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading makes</h1>
        <p className="mt-2 text-muted-foreground">Fetching popular vehicle makes from the catalogue.</p>
      </div>
    );
  }

  if (bootstrapQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load makes</h1>
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
          <span className="text-foreground">Popular makes</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Popular vehicle makes</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Jump straight to tyres we commonly fit on these marques. Search by registration is paused while we focus on size and category flows.
          </p>
          {typeof totalMakes === "number" && (
            <p className="mt-2 text-sm text-muted-foreground">
              Catalogue tracks <span className="font-medium text-foreground">{totalMakes}</span> vehicle makes; this page highlights the most requested.
            </p>
          )}
        </div>
      </section>

      <div className="container py-12">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {makes.map((make) => (
            <Link key={make.id} to={`/tyre/make/${make.id}/${make.slug}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Car className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display text-lg font-bold">{make.name}</p>
                    {make.topModels.length > 0 && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Includes {make.topModels.slice(0, 3).join(", ")}
                        {make.topModels.length > 3 ? "…" : ""}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
