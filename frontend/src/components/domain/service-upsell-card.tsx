import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { formatServiceLinePrice, optionPriceLabel, serviceUpsellBadgeLabel } from "@/lib/service-pricing";
import type { Service, ServiceSelection } from "@/types";

interface ServiceUpsellCardProps {
  service: Service;
  selected: boolean;
  selection?: ServiceSelection;
  onToggle: () => void;
  onSelectionChange: (selection: ServiceSelection) => void;
}

export function ServiceUpsellCard({
  service,
  selected,
  selection,
  onToggle,
  onSelectionChange,
}: ServiceUpsellCardProps) {
  const hasPricingOptions = !!service.pricingOptions?.options?.length;
  const activeOption = hasPricingOptions
    ? service.pricingOptions!.options.find((o) => o.key === selection?.optionKey)
    : undefined;

  return (
    <div
      className={cn(
        "flex flex-col items-start gap-2 rounded-xl border-2 bg-card p-5 text-left transition-all",
        selected
          ? "border-primary bg-primary/5 shadow-elev-1"
          : "border-border hover:border-primary/40 hover:shadow-card-hover",
      )}
    >
      <button type="button" onClick={onToggle} className="w-full text-left">
        <div className="flex w-full items-start justify-between gap-2">
          <div>
            <p className="font-display text-base font-bold">{service.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{service.durationMinutes} min</p>
          </div>
          <Badge variant={service.priceFrom === "free" ? "free" : "default"} className="text-[10px]">
            {serviceUpsellBadgeLabel(service)}
          </Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{service.shortDescription}</p>
        <div className="mt-3 flex items-center gap-2 text-xs">
          <span
            className={cn(
              "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
              selected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background",
            )}
          >
            {selected && <Check className="h-3 w-3" />}
          </span>
          <span className="font-semibold">{selected ? "Added" : "Add to booking"}</span>
        </div>
      </button>

      {selected && hasPricingOptions && (
        <div className="mt-2 w-full space-y-3 border-t border-border/60 pt-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Distance from workshop</p>
          <div className="space-y-2">
            {service.pricingOptions!.options.map((option) => {
              const isActive = selection?.optionKey === option.key;
              return (
                <label
                  key={option.key}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
                    isActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`service-${service.id}-distance`}
                      checked={isActive}
                      onChange={() => onSelectionChange({ optionKey: option.key })}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="font-medium">{option.label}</span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                    {optionPriceLabel(option)}
                  </span>
                </label>
              );
            })}
          </div>

          {activeOption?.requiresCustomPrice && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs text-amber-900">
                {activeOption.discussionMessage ??
                  "Price of extra miles will be discussed by our team. Enter the agreed amount below once confirmed."}
              </p>
              <div className="space-y-1">
                <Label htmlFor={`service-${service.id}-custom-price`} className="text-xs">
                  Agreed price (£)
                </Label>
                <Input
                  id={`service-${service.id}-custom-price`}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="e.g. 125"
                  value={selection?.customPrice ?? ""}
                  onChange={(e) => {
                    const raw = e.target.value;
                    onSelectionChange({
                      optionKey: activeOption.key,
                      customPrice: raw === "" ? undefined : Number(raw),
                    });
                  }}
                  className="h-9 bg-white"
                />
              </div>
            </div>
          )}

          {selection?.optionKey && (
            <p className="text-xs text-muted-foreground">
              Line price: <span className="font-semibold text-foreground">{formatServiceLinePrice(service, selection)}</span>
              {activeOption?.requiresCustomPrice && !selection.customPrice && " (not added to total until agreed price is entered)"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
