import type { BrandTier } from "@/types";

export function brandTierLabel(tier: BrandTier): string {
  switch (tier) {
    case "premium":
      return "Premium";
    case "mid_range":
      return "Mid-Range";
    case "budget":
      return "Budget";
    default:
      return tier;
  }
}
