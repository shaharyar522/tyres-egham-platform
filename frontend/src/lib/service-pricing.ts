import type { Service, ServicePricingOption, ServiceSelection } from "@/types";

/** Services offered during checkout (basket upsell step). */
export function getCheckoutVisibleServices(services: Service[]): Service[] {
  return services.filter((service) => service.upsellInBasket);
}

export function getServiceSelection(
  selections: Record<string, ServiceSelection>,
  serviceId: number,
): ServiceSelection | undefined {
  return selections[String(serviceId)];
}

export function resolveServicePrice(
  service: Service,
  selection?: ServiceSelection | null,
): number | null {
  if (service.priceFrom === "free") return 0;

  if (!service.pricingOptions?.options?.length) {
    return typeof service.priceFrom === "number" ? service.priceFrom : 0;
  }

  if (!selection?.optionKey) return null;

  const option = service.pricingOptions.options.find((o) => o.key === selection.optionKey);
  if (!option) return null;

  if (option.requiresCustomPrice) {
    const custom = selection.customPrice;
    return custom != null && custom > 0 ? custom : null;
  }

  return option.price;
}

export function formatServiceLinePrice(
  service: Service,
  selection?: ServiceSelection | null,
): string {
  const price = resolveServicePrice(service, selection);
  if (price != null) {
    return `£${price}`;
  }

  if (selection?.optionKey && service.pricingOptions) {
    const option = service.pricingOptions.options.find((o) => o.key === selection.optionKey);
    if (option?.requiresCustomPrice) {
      return option.priceHint ?? "£100+";
    }
  }

  if (service.priceFrom === "free") return "FREE";
  return typeof service.priceFrom === "number" ? `£${service.priceFrom}` : "—";
}

export function serviceUpsellBadgeLabel(service: Service): string {
  if (service.priceFrom === "free") return "FREE";
  if (service.pricingOptions?.options?.length) {
    return `From £${service.priceFrom}`;
  }
  return `£${service.priceFrom}`;
}

export function optionPriceLabel(option: ServicePricingOption): string {
  if (option.requiresCustomPrice) {
    return option.priceHint ?? `£${option.price}+`;
  }
  return `£${option.price}`;
}
