import { Link, useLocation, useParams } from "react-router-dom";
import { ChevronRight, Clock, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TyreSearchWidget } from "@/components/domain/tyre-search-widget";
import { useApiBootstrapQuery, useApiServiceQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { getCheckoutVisibleServices } from "@/lib/service-pricing";
import { useSite } from "@/lib/site";

export default function ServiceDetailPage() {
  const params = useParams();
  const location = useLocation();
  const site = useSite();
  const slug = params.slug ?? "";
  const serviceQuery = useApiServiceQuery(slug);
  const bootstrapQuery = useApiBootstrapQuery();
  const service = serviceQuery.data?.service;

  usePageMeta(
    service
      ? {
          title: `${service.name} | ${site.businessName}`,
          description: service.shortDescription || `${service.name} from ${site.businessName} in Egham.`,
          canonicalPath: location.pathname,
        }
      : { canonicalPath: location.pathname },
  );

  if (serviceQuery.isLoading || bootstrapQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading service</h1>
        <p className="mt-2 text-muted-foreground">Fetching service details.</p>
      </div>
    );
  }

  if (!service || serviceQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Service not found</h1>
        <Button asChild className="mt-4"><Link to="/">Go home</Link></Button>
      </div>
    );
  }

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link to="/services" className="hover:text-foreground">Services</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{service.name}</span>
        </nav>
      </div>

      <section className="container grid gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2">
            <Badge variant={service.priceFrom === "free" ? "free" : "default"}>
              {service.priceFrom === "free" ? "FREE" : `From £${service.priceFrom}`}
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> {service.durationMinutes} min
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{service.name}</h1>
          <p className="mt-3 text-base text-muted-foreground">{service.shortDescription}</p>

          <article className="prose prose-sm mt-6 max-w-none text-foreground">
            <p>{service.longDescription}</p>
          </article>

          <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-display text-base font-bold">Add this service to your tyre booking</p>
                <p className="text-sm text-muted-foreground">Save a separate visit - we will carry it out while we have your vehicle on the ramp.</p>
              </div>
              <Button asChild size="lg" variant="cta">
                <Link to="/">Find tyres now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="flex items-start gap-3 p-5">
              <Phone className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="text-sm">
                <p className="font-semibold">Need this service on its own?</p>
                <p className="text-muted-foreground">Call us on <a className="text-primary hover:underline" href={`tel:${site.phoneTel}`}>{site.phone}</a> and we will book you in.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Other services</p>
              <ul className="space-y-2">
                {getCheckoutVisibleServices(bootstrapQuery.data?.services ?? [])
                  .filter((s) => s.id !== service.id)
                  .map((s) => (
                  <li key={s.id}>
                    <Link to={`/services/details/${s.id}/${s.slug}`} className="flex items-center justify-between rounded-md border p-3 text-sm hover:border-primary/40 hover:bg-accent">
                      <span className="font-semibold">{s.name}</span>
                      <Badge variant={s.priceFrom === "free" ? "free" : "muted"} className="text-[10px]">
                        {s.priceFrom === "free" ? "FREE" : `\u00a3${s.priceFrom}`}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <div>
            <p className="mb-2 font-display text-sm font-bold uppercase tracking-wide">Find tyres for your vehicle</p>
            <TyreSearchWidget variant="compact" />
          </div>
        </aside>
      </section>
    </div>
  );
}
