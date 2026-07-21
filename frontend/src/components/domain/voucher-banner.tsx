import { Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Voucher } from "@/types";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { HtmlContent } from "@/components/domain/html-content";
import { findVoucherForBrand } from "@/lib/vouchers";

interface VoucherBannerProps {
  brandId?: number;
  voucher?: Voucher;
  className?: string;
  compact?: boolean;
}

export function VoucherBanner({ brandId, voucher: explicitVoucher, className, compact }: VoucherBannerProps) {
  const bootstrapQuery = useApiBootstrapQuery();
  const brand = brandId !== undefined ? (bootstrapQuery.data?.brands ?? []).find((candidate) => candidate.id === brandId) : undefined;
  const voucher = explicitVoucher ?? (brand ? findVoucherForBrand(bootstrapQuery.data?.vouchers ?? [], brand.slug) : undefined);
  if (!voucher) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 text-amber-900",
        compact ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
        className,
      )}
      role="note"
      aria-label="Promotional offer"
    >
      <Tag className={cn(compact ? "h-3.5 w-3.5" : "h-4 w-4", "shrink-0")} />
      <div className="min-w-0 flex-1">
        <HtmlContent html={voucher.description} className="inline prose-p:font-semibold prose-p:my-0 prose-a:text-amber-900" />
        <span className="ml-1.5 inline-flex items-center rounded bg-amber-200 px-1.5 font-mono text-[11px] font-bold">
          {voucher.code}
        </span>
      </div>
    </div>
  );
}
