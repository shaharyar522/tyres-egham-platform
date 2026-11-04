import type { TyreCategorySlug, TyreSku } from "@/types";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";

/** Default image when a tyre SKU has no uploaded photo. */
export const TYRE_IMAGE_PLACEHOLDER = "/images/tyres/photo-not-available.png";

const categoryToImage: Record<TyreCategorySlug, string> = {
  car: TYRE_IMAGE_PLACEHOLDER,
  "4x4": TYRE_IMAGE_PLACEHOLDER,
  van: TYRE_IMAGE_PLACEHOLDER,
  "run-flat": TYRE_IMAGE_PLACEHOLDER,
  ev: TYRE_IMAGE_PLACEHOLDER,
  "all-season": TYRE_IMAGE_PLACEHOLDER,
  winter: TYRE_IMAGE_PLACEHOLDER,
  "high-performance": TYRE_IMAGE_PLACEHOLDER,
};

export function getTyreImageByCategory(category: TyreCategorySlug): string {
  return categoryToImage[category] ?? TYRE_IMAGE_PLACEHOLDER;
}

/** Placeholder when a stored product photo is missing or fails to load. */
export function getTyrePlaceholderForSku(_sku: TyreSku): string {
  return TYRE_IMAGE_PLACEHOLDER;
}

export function getTyreImageForSku(sku: TyreSku): string {
  const remote = resolvePublicAssetUrl(sku.imageUrl) ?? sku.imageUrl;
  if (remote) return remote;
  return getTyrePlaceholderForSku(sku);
}
