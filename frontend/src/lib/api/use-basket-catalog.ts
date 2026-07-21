import { useEffect, useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import type { Brand, TyreSku } from "@/types";
import { apiQueryKeys, getTyreDetail, useApiBootstrapQuery } from "@/lib/api/queries";
import { useBasket } from "@/store/basket";

export function useBasketCatalog() {
  const { items, serviceIds, syncItemSnapshot } = useBasket();
  const bootstrapQuery = useApiBootstrapQuery();
  const skuIds = useMemo(() => Array.from(new Set(items.map((item) => item.skuId))), [items]);

  const tyreQueries = useQueries({
    queries: skuIds.map((skuId) => ({
      queryKey: apiQueryKeys.tyreDetail(skuId),
      queryFn: () => getTyreDetail(skuId),
      enabled: skuIds.length > 0,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const skuMap = useMemo(() => {
    const map = new Map<number, TyreSku>();
    for (const query of tyreQueries) {
      if (query.data?.sku) {
        map.set(query.data.sku.id, query.data.sku);
      }
    }
    return map;
  }, [tyreQueries]);

  const brandMap = useMemo(() => {
    const map = new Map<number, Brand>();
    for (const brand of bootstrapQuery.data?.brands ?? []) {
      map.set(brand.id, brand);
    }
    return map;
  }, [bootstrapQuery.data?.brands]);

  const selectedServices = useMemo(
    () => (bootstrapQuery.data?.services ?? []).filter((service) => serviceIds.includes(service.id)),
    [bootstrapQuery.data?.services, serviceIds],
  );

  useEffect(() => {
    for (const item of items) {
      const sku = skuMap.get(item.skuId);
      if (!sku) continue;

      syncItemSnapshot(item.skuId, {
        brandId: sku.brandId,
        brandSlug: brandMap.get(sku.brandId)?.slug,
        pricePerTyre: sku.pricePerTyre,
        quantityTiers: sku.quantityTiers,
      });
    }
  }, [items, skuMap, brandMap, syncItemSnapshot]);

  return {
    skuMap,
    brandMap,
    selectedServices,
    vouchers: bootstrapQuery.data?.vouchers ?? [],
    isLoading: bootstrapQuery.isLoading || tyreQueries.some((query) => query.isLoading),
    isError: bootstrapQuery.isError || tyreQueries.some((query) => query.isError),
  };
}
