import type { TyreCategory } from "@/types";

export const CATEGORIES: TyreCategory[] = [
  { id: 1, slug: "car", name: "Car Tyres", description: "Premium, mid-range and budget tyres for every saloon, hatchback and estate.", iconName: "Car" },
  { id: 2, slug: "4x4", name: "4x4 / SUV Tyres", description: "Robust tyres engineered for SUVs, off-road 4x4s and adventure vehicles.", iconName: "Truck" },
  { id: 3, slug: "van", name: "Van Tyres", description: "Reinforced tyres rated for commercial loads and high-mileage van use.", iconName: "TruckIcon" },
  { id: 4, slug: "run-flat", name: "Run Flat Tyres", description: "Self-supporting tyres that let you keep driving even after a puncture.", iconName: "ShieldCheck" },
  { id: 5, slug: "ev", name: "EV Tyres", description: "Low-rolling-resistance tyres optimised for electric vehicle range and torque.", iconName: "BatteryCharging" },
  { id: 6, slug: "all-season", name: "All Season Tyres", description: "M+S and 3PMSF-rated tyres that perform across the UK climate year-round.", iconName: "CloudSun" },
  { id: 7, slug: "winter", name: "Winter Tyres", description: "Cold-weather compounds for sub-7\u00b0C performance, snow and ice.", iconName: "Snowflake" },
  { id: 8, slug: "high-performance", name: "High Performance Tyres", description: "UHP and motorsport-derived tyres for sports cars and tuned vehicles.", iconName: "Gauge" },
];

export const getCategoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
