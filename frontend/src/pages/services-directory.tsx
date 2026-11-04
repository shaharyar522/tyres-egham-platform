import { Link } from "react-router-dom";
import { ChevronRight, Clock, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApiServicesIndexQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

export default function ServicesDirectoryPage() {
  const site = useSite();
  const servicesQuery = useApiServicesIndexQuery();
  const services = servicesQuery.data?.services ?? [];

  usePageMeta({
    title: `Services | ${site.businessName}`,
    description: `Workshop and mobile tyre services from ${site.businessName} in Egham — fitting, safety checks and more.`,
    canonicalPath: "/services",
  });


  if (servicesQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading services</h1>
        <p className="mt-2 text-muted-foreground">Fetching workshop services from the API.</p>
      </div>
    );
  }

  if (servicesQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load services</h1>
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
          <span className="text-foreground">Services</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Workshop services</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Add these when you book tyres, or ask us about standalone appointments.
          </p>
        </div>
      </section>

      <div className="container grid gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Link key={service.id} to={`/services/details/${service.id}/${service.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Wrench className="h-5 w-5" aria-hidden />
                  </div>
                  <Badge variant={service.priceFrom === "free" ? "free" : "default"}>
                    {service.priceFrom === "free" ? "FREE" : `From £${service.priceFrom}`}
                  </Badge>
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold">{service.name}</h2>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{service.shortDescription}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> About {service.durationMinutes} minutes
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
