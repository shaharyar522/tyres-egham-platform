import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FunnelStepper } from "@/components/domain/funnel-stepper";
import { OrderSummary } from "@/components/domain/order-summary";
import { ServiceUpsellCard } from "@/components/domain/service-upsell-card";
import { useBasket } from "@/store/basket";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { getCheckoutVisibleServices, getServiceSelection } from "@/lib/service-pricing";
import { cn } from "@/lib/utils";

export default function ServicesUpsellPage() {
  const navigate = useNavigate();
  const { serviceIds, serviceSelections, toggleService, setServiceSelection, items } = useBasket();
  const bootstrapQuery = useApiBootstrapQuery();
  const services = getCheckoutVisibleServices(bootstrapQuery.data?.services ?? []);

  if (items.length === 0) {
    navigate("/basket");
    return null;
  }

  return (
    <div className="container py-6 lg:py-10">
      <FunnelStepper current="services" className="mb-8 max-w-xl" />

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Add a workshop service</h1>
            <p className="mt-1 text-sm text-muted-foreground">Optional add-ons to your fitting appointment - all carried out while we have your vehicle on the ramp.</p>
          </div>

          {bootstrapQuery.isError && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                Service add-ons are temporarily unavailable from the live API. You can still continue to checkout if needed.
              </CardContent>
            </Card>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {services.map((service) => {
              const selected = serviceIds.includes(service.id);
              const selection = getServiceSelection(serviceSelections, service.id);
              const hasPricingOptions = !!service.pricingOptions?.options?.length;

              if (hasPricingOptions) {
                return (
                  <ServiceUpsellCard
                    key={service.id}
                    service={service}
                    selected={selected}
                    selection={selection}
                    onToggle={() => {
                      if (selected) {
                        toggleService(service.id);
                      } else {
                        const defaultOption = service.pricingOptions!.options[0];
                        toggleService(service.id, { optionKey: defaultOption.key });
                      }
                    }}
                    onSelectionChange={(next) => {
                      if (!selected) {
                        toggleService(service.id, next);
                        return;
                      }
                      setServiceSelection(service.id, next);
                    }}
                  />
                );
              }

              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  className={cn(
                    "group flex flex-col items-start gap-2 rounded-xl border-2 bg-card p-5 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 shadow-elev-1"
                      : "border-border hover:border-primary/40 hover:shadow-card-hover",
                  )}
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-base font-bold">{service.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{service.durationMinutes} min</p>
                    </div>
                    <Badge variant={service.priceFrom === "free" ? "free" : "default"} className="text-[10px]">
                      {service.priceFrom === "free" ? "FREE" : `\u00a3${service.priceFrom}`}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs">
                    <span className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                      selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
                    )}>
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    <span className="font-semibold">{selected ? "Added" : "Add to booking"}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <Card className="border-dashed bg-muted/30">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              <p className="text-muted-foreground">
                Need a service we have not listed? Add a note at checkout and we will arrange it for you.
              </p>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <Button variant="ghost" asChild>
              <Link to="/basket"><ArrowLeft className="h-4 w-4" /> Back to basket</Link>
            </Button>
            <Button onClick={() => navigate("/basket/checkout")} variant="cta" size="lg" className="gap-2">
              Continue to checkout <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary />
        </aside>
      </div>
    </div>
  );
}
