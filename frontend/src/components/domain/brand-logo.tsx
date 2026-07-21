import { useEffect, useMemo, useState } from "react";
import { getBrandLogoSources } from "@/lib/brand-logos";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types";

const initialsFor = (name: string): string =>
  name
    .replace(/[^A-Za-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

const tierColors: Record<Brand["tier"], { bg: string; text: string }> = {
  premium: { bg: "bg-slate-900", text: "text-white" },
  mid_range: { bg: "bg-slate-700", text: "text-white" },
  budget: { bg: "bg-slate-500", text: "text-white" },
};

const sizeMap = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-7 w-7 text-[10px]",
  md: "h-10 w-10 text-xs",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
  "2xl": "h-24 w-24 text-xl",
} as const;

interface BrandLogoProps {
  brand: Brand & { logoUrl?: string | null };
  size?: keyof typeof sizeMap;
  className?: string;
  showName?: boolean;
}

export function BrandLogoMark({ brand, size = "md", className }: BrandLogoProps) {
  const sources = useMemo(() => getBrandLogoSources(brand), [brand.logoUrl, brand.slug]);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => {
    setSourceIndex(0);
  }, [brand.slug, brand.logoUrl]);

  const colors = tierColors[brand.tier];
  const currentSrc = sources[sourceIndex];

  if (currentSrc) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-md border border-black/5 bg-white p-1 shadow-sm",
          sizeMap[size],
          className,
        )}
        title={brand.name}
      >
        <img
          key={currentSrc}
          src={currentSrc}
          alt={`${brand.name} logo`}
          className="h-full w-full object-contain"
          loading="lazy"
          decoding="async"
          onError={() => setSourceIndex((i) => i + 1)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md font-display font-bold tracking-tight",
        sizeMap[size],
        colors.bg,
        colors.text,
        className,
      )}
      aria-label={`${brand.name} logo`}
      title={brand.name}
    >
      {initialsFor(brand.name)}
    </div>
  );
}

export function BrandLogoWordmark({ brand, size = "md", className, showName = true }: BrandLogoProps) {
  return (
    <div className={cn("inline-flex min-w-0 items-center gap-2", className)}>
      <BrandLogoMark brand={brand} size={size === "xl" ? "lg" : size === "xs" ? "xs" : "sm"} />
      {showName && (
        <span className="truncate font-display font-bold uppercase tracking-tight">{brand.name}</span>
      )}
    </div>
  );
}
