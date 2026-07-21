import type { BrandTier } from "@/types";

export function brandTierLabel(tier: BrandTier): string {
  switch (tier) {
    case "premium":
      return "Premium";
    case "mid_range":
      return "Budget";
    case "budget":
      return "Budget";
    default:
      return tier;
  }
}
