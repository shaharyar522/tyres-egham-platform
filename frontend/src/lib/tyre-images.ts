import type { TyreCategorySlug, TyreSku } from "@/types";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";

const categoryToImage: Record<TyreCategorySlug, string> = {
  car: "/images/tyres/tyre-car.svg",
  "4x4": "/images/tyres/tyre-suv.svg",
  van: "/images/tyres/tyre-van.svg",
  "run-flat": "/images/tyres/tyre-car.svg",
  ev: "/images/tyres/tyre-car.svg",
  "all-season": "/images/tyres/tyre-car.svg",
  winter: "/images/tyres/tyre-winter.svg",
  "high-performance": "/images/tyres/tyre-car.svg",
};

export function getTyreImageByCategory(category: TyreCategorySlug): string {
  return categoryToImage[category] ?? "/images/tyres/tyre-car.svg";
}

/** Category / type placeholder when a stored product photo is missing. */
export function getTyrePlaceholderForSku(sku: TyreSku): string {
  if (sku.isVan) return "/images/tyres/tyre-van.svg";
  if (sku.is4x4) return "/images/tyres/tyre-suv.svg";
  if (sku.isWinter) return "/images/tyres/tyre-winter.svg";
  return getTyreImageByCategory(sku.category);
}

export function getTyreImageForSku(sku: TyreSku): string {
  const remote = resolvePublicAssetUrl(sku.imageUrl) ?? sku.imageUrl;
  if (remote) return remote;
  return getTyrePlaceholderForSku(sku);
}
