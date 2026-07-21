import { useMemo } from "react";
import { useBasket } from "@/store/basket";
import { useBasketCatalog } from "@/lib/api/use-basket-catalog";
import { getServiceSelection, resolveServicePrice } from "@/lib/service-pricing";

export function useBasketTotals() {
  const { totals: base, voucher, serviceSelections } = useBasket();
  const { selectedServices } = useBasketCatalog();

  return useMemo(() => {
    const servicesTotal = selectedServices.reduce((sum, service) => {
      const selection = getServiceSelection(serviceSelections, service.id);
      const price = resolveServicePrice(service, selection);
      return sum + (price ?? 0);
    }, 0);
    const total = Math.max(0, base.subtotal - base.voucherDiscount + servicesTotal);
    return { ...base, servicesTotal, total, voucher };
  }, [base, selectedServices, serviceSelections, voucher]);
}
