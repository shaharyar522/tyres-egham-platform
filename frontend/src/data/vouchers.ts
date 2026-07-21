import type { Voucher } from "@/types";

export const VOUCHERS: Voucher[] = [
  {
    code: "MICH26FA",
    brandSlug: "michelin",
    brandName: "Michelin",
    minQty: 4,
    discountPerQty: 12.5,
    validFrom: "2026-04-01",
    validTo: "2026-06-30",
    description: "Save \u00a350 when you buy 4 selected Michelin tyres.",
  },
  {
    code: "COMAY26",
    brandSlug: "continental",
    brandName: "Continental",
    minQty: 4,
    discountPerQty: 15,
    validFrom: "2026-05-01",
    validTo: "2026-05-31",
    description: "\u00a360 cashback on a set of 4 Continental tyres.",
  },
  {
    code: "GOOD26",
    brandSlug: "goodyear",
    brandName: "Goodyear",
    minQty: 2,
    discountPerQty: 8,
    validFrom: "2026-03-01",
    validTo: "2026-07-31",
    description: "\u00a316 off when you buy 2 or more Goodyear tyres.",
  },
  {
    code: "PIRELLI4",
    brandSlug: "pirelli",
    brandName: "Pirelli",
    minQty: 4,
    discountPerQty: 17.5,
    validFrom: "2026-04-15",
    validTo: "2026-06-15",
    description: "\u00a370 off a full set of qualifying Pirelli tyres.",
  },
  {
    code: "FALK4SAVE",
    brandSlug: "falken",
    brandName: "Falken",
    minQty: 4,
    discountPerQty: 7,
    validFrom: "2026-04-01",
    validTo: "2026-08-31",
    description: "\u00a328 saving on a set of 4 Falken tyres.",
  },
  {
    code: "HANK2DEAL",
    brandSlug: "hankook",
    brandName: "Hankook",
    minQty: 2,
    discountPerQty: 6,
    validFrom: "2026-04-01",
    validTo: "2026-12-31",
    description: "\u00a312 off when you buy 2 or more Hankook tyres.",
  },
];

export const findVoucherForBrand = (brandSlug: string) =>
  VOUCHERS.find((v) => v.brandSlug === brandSlug && new Date(v.validTo) >= new Date());

export const findVoucherByCode = (code: string) =>
  VOUCHERS.find((v) => v.code.toLowerCase() === code.toLowerCase().trim());
