import type { Brand } from "@/types";

export const BRANDS: Brand[] = [
  { id: 1, slug: "michelin", name: "Michelin", tier: "premium", description: "Iconic French manufacturer renowned for long-life premium touring tyres.", recommendedFor: ["High-performance saloons", "Long-distance commuters"], hasActiveOffer: true },
  { id: 2, slug: "continental", name: "Continental", tier: "premium", description: "German engineering with class-leading wet-grip performance and OE-fitment heritage.", recommendedFor: ["Premium German marques", "Wet-weather safety"], hasActiveOffer: true },
  { id: 3, slug: "bridgestone", name: "Bridgestone", tier: "premium", description: "Japanese global brand with strong run-flat and EV-rated ranges.", recommendedFor: ["EV owners", "Run-flat fitments"], hasActiveOffer: false },
  { id: 4, slug: "pirelli", name: "Pirelli", tier: "premium", description: "F1-pedigree brand with bespoke OE markings for premium and sport vehicles.", recommendedFor: ["Sports cars", "OE-marked fitments"], hasActiveOffer: true },
  { id: 5, slug: "goodyear", name: "Goodyear", tier: "premium", description: "American engineering icon with strong all-season and touring credentials.", recommendedFor: ["All-season versatility", "Family saloons"], hasActiveOffer: false },
  { id: 6, slug: "dunlop", name: "Dunlop", tier: "premium", description: "British-rooted brand with sport and touring expertise across saloons and SUVs.", recommendedFor: ["Hot hatches", "Touring saloons"], hasActiveOffer: false },
  { id: 7, slug: "yokohama", name: "Yokohama", tier: "premium", description: "Japanese manufacturer with strong UHP and motorsport-derived technology.", recommendedFor: ["Performance enthusiasts", "Sport SUVs"], hasActiveOffer: false },
  { id: 8, slug: "vredestein", name: "Vredestein", tier: "premium", description: "Italian-designed Dutch heritage brand specialising in winter and all-season.", recommendedFor: ["Winter conditions", "Compact European cars"], hasActiveOffer: false },
  { id: 9, slug: "hankook", name: "Hankook", tier: "mid_range", description: "Korean OE supplier offering premium-grade performance at mid-range pricing.", recommendedFor: ["Daily drivers", "Family SUVs"], hasActiveOffer: true },
  { id: 10, slug: "falken", name: "Falken", tier: "mid_range", description: "Japanese heritage with strong UHP and 4x4 ranges and growing OE relationships.", recommendedFor: ["4x4 fitments", "Sporty hatchbacks"], hasActiveOffer: true },
  { id: 11, slug: "kumho", name: "Kumho", tier: "mid_range", description: "Korean manufacturer balancing comfort, mileage, and price.", recommendedFor: ["Comfort-focused saloons", "Budget-conscious commuters"], hasActiveOffer: false },
  { id: 12, slug: "toyo", name: "Toyo", tier: "mid_range", description: "Japanese brand known for off-road and high-performance ranges.", recommendedFor: ["4x4 and SUV", "Track-focused builds"], hasActiveOffer: false },
  { id: 13, slug: "uniroyal", name: "Uniroyal", tier: "mid_range", description: "Wet-weather specialist with British heritage in rain-grade compounds.", recommendedFor: ["UK climate", "Family hatchbacks"], hasActiveOffer: false },
  { id: 14, slug: "general-tire", name: "General Tire", tier: "mid_range", description: "Continental sister brand offering robust touring performance.", recommendedFor: ["Tourers", "SUVs"], hasActiveOffer: false },
  { id: 15, slug: "firestone", name: "Firestone", tier: "mid_range", description: "Bridgestone-owned heritage brand with broad mid-range coverage.", recommendedFor: ["Family fleets", "Daily commuting"], hasActiveOffer: false },
  { id: 16, slug: "bfgoodrich", name: "BFGoodrich", tier: "mid_range", description: "All-terrain and 4x4 specialist with motorsport pedigree.", recommendedFor: ["Off-road 4x4", "Light commercials"], hasActiveOffer: false },
  { id: 17, slug: "avon", name: "Avon", tier: "mid_range", description: "Cooper-Tire-owned British brand with motorcycle and saloon focus.", recommendedFor: ["Saloons", "Motorcycles"], hasActiveOffer: false },
  { id: 18, slug: "nexen", name: "Nexen", tier: "mid_range", description: "Korean brand growing rapidly with EV and all-season ranges.", recommendedFor: ["EV daily drivers", "All-season versatility"], hasActiveOffer: true },
  { id: 19, slug: "maxxis", name: "Maxxis", tier: "mid_range", description: "Taiwanese manufacturer strong in 4x4 and light-truck applications.", recommendedFor: ["Light commercials", "Adventure 4x4"], hasActiveOffer: false },
  { id: 20, slug: "matador", name: "Matador", tier: "budget", description: "Continental-owned value brand offering reliable everyday performance.", recommendedFor: ["Budget-conscious daily use"], hasActiveOffer: false },
  { id: 21, slug: "barum", name: "Barum", tier: "budget", description: "Czech budget brand under the Continental group.", recommendedFor: ["Cost-effective fleets"], hasActiveOffer: false },
  { id: 22, slug: "kormoran", name: "Kormoran", tier: "budget", description: "Michelin-group budget offering with solid wet-weather grip.", recommendedFor: ["Daily commuters"], hasActiveOffer: false },
  { id: 23, slug: "riken", name: "Riken", tier: "budget", description: "Michelin-affiliated value brand designed for European conditions.", recommendedFor: ["Compact city cars"], hasActiveOffer: false },
  { id: 24, slug: "sava", name: "Sava", tier: "budget", description: "Slovenian Goodyear-group brand offering practical value tyres.", recommendedFor: ["Everyday hatchbacks"], hasActiveOffer: false },
  { id: 25, slug: "debica", name: "Debica", tier: "budget", description: "Polish-built Goodyear-group budget brand with strong UK following.", recommendedFor: ["Budget commuters"], hasActiveOffer: false },
  { id: 26, slug: "autogrip", name: "Autogrip", tier: "budget", description: "Cost-efficient brand suitable for occasional use and second cars.", recommendedFor: ["Second cars", "Low mileage"], hasActiveOffer: false },
  { id: 27, slug: "linglong", name: "Linglong", tier: "budget", description: "Chinese manufacturer offering broad coverage at sharp price points.", recommendedFor: ["Cost-sensitive replacements"], hasActiveOffer: false },
  { id: 28, slug: "westlake", name: "Westlake", tier: "budget", description: "Affordable global brand with growing UK fitment coverage.", recommendedFor: ["Budget daily drivers"], hasActiveOffer: false },
  { id: 29, slug: "triangle", name: "Triangle", tier: "budget", description: "Chinese manufacturer with broad passenger and commercial range.", recommendedFor: ["Light commercials", "Value commuting"], hasActiveOffer: false },
];

export const getBrandById = (id: number) => BRANDS.find((b) => b.id === id);
export const getBrandBySlug = (slug: string) => BRANDS.find((b) => b.slug === slug);
export const brandsByTier = (tier: Brand["tier"]) => BRANDS.filter((b) => b.tier === tier);
