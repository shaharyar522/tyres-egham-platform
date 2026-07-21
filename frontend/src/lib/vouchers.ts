import type { Voucher } from "@/types";

export function findVoucherForBrand(vouchers: Voucher[], brandSlug: string) {
  return vouchers.find((voucher) => voucher.brandSlug === brandSlug && (!voucher.validTo || new Date(voucher.validTo) >= new Date()));
}

export function findVoucherByCode(vouchers: Voucher[], code: string) {
  return vouchers.find((voucher) => voucher.code.toLowerCase() === code.toLowerCase().trim());
}
