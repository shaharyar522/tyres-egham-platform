import type { VehicleMake } from "@/types";

export const MAKES: VehicleMake[] = [
  { id: 1, slug: "audi", name: "Audi", topModels: ["A1", "A3", "A4", "A6", "Q3", "Q5", "Q7", "RS3"] },
  { id: 2, slug: "bmw", name: "BMW", topModels: ["1 Series", "2 Series", "3 Series", "5 Series", "X1", "X3", "X5", "M3"] },
  { id: 3, slug: "mercedes-benz", name: "Mercedes-Benz", topModels: ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE"] },
  { id: 4, slug: "volkswagen", name: "Volkswagen", topModels: ["Polo", "Golf", "Passat", "Tiguan", "T-Roc", "ID.3", "ID.4"] },
  { id: 5, slug: "ford", name: "Ford", topModels: ["Fiesta", "Focus", "Kuga", "Puma", "Mondeo", "Transit"] },
  { id: 6, slug: "vauxhall", name: "Vauxhall", topModels: ["Corsa", "Astra", "Insignia", "Mokka", "Grandland", "Vivaro"] },
  { id: 7, slug: "toyota", name: "Toyota", topModels: ["Aygo", "Yaris", "Corolla", "RAV4", "C-HR", "Hilux"] },
  { id: 8, slug: "nissan", name: "Nissan", topModels: ["Micra", "Qashqai", "Juke", "X-Trail", "Leaf"] },
  { id: 9, slug: "kia", name: "Kia", topModels: ["Picanto", "Ceed", "Sportage", "Niro", "EV6"] },
  { id: 10, slug: "hyundai", name: "Hyundai", topModels: ["i10", "i20", "Tucson", "Kona", "IONIQ 5"] },
  { id: 11, slug: "tesla", name: "Tesla", topModels: ["Model 3", "Model Y", "Model S", "Model X"] },
  { id: 12, slug: "land-rover", name: "Land Rover", topModels: ["Defender", "Discovery", "Range Rover Sport", "Range Rover Evoque"] },
];

export const getMakeBySlug = (slug: string) => MAKES.find((m) => m.slug === slug);
