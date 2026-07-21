import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { cn } from "@/lib/utils";
import type { Brand } from "@/types";

const AUTO_SCROLL_MS = 3500;
const SCROLL_STEP_DEFAULT = 180;
const SCROLL_STEP_FEATURED = 260;

export function BrandSlider({
  brands,
  className,
  active = true,
  fadeFrom = "from-white",
  embeddedInPanel = false,
  cardVariant = "compact",
}: {
  brands: Brand[];
  className?: string;
  /** Re-measure when tab/panel becomes visible */
  active?: boolean;
  /** Tailwind gradient start colour for edge fades (e.g. from-muted/50 on grey sections) */
  fadeFrom?: string;
  /** Soft panel surface: used in Find Tyres mega-panel (white brand cards). */
  embeddedInPanel?: boolean;
  /** Larger logo cards for homepage / marketing sections. */
  cardVariant?: "compact" | "featured";
}) {
  const featured = cardVariant === "featured";
  const scrollStep = featured ? SCROLL_STEP_FEATURED : SCROLL_STEP_DEFAULT;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth > 8;
    setHasOverflow(overflow);
    setCanScrollLeft(overflow && el.scrollLeft > 4);
    setCanScrollRight(overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scheduleMeasure = useCallback(() => {
    requestAnimationFrame(() => {
      updateScrollButtons();
      requestAnimationFrame(updateScrollButtons);
    });
  }, [updateScrollButtons]);

  useEffect(() => {
    if (!active) return;
    scheduleMeasure();

    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      observer.disconnect();
    };
  }, [active, brands, scheduleMeasure, updateScrollButtons]);

  useEffect(() => {
    if (!active || brands.length === 0 || isPaused) return;

    const el = scrollRef.current;
    if (!el) return;

    const tick = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 8) return;

      if (el.scrollLeft >= maxScroll - 8) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: scrollStep, behavior: "smooth" });
      }
    };

    const id = window.setInterval(tick, AUTO_SCROLL_MS);
    return () => window.clearInterval(id);
  }, [active, brands, isPaused, scrollStep]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.7, scrollStep);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (brands.length === 0) {
    return null;
  }

  const showNav = hasOverflow;

  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 flex-col",
        featured ? "min-h-[12rem] justify-center py-2" : embeddedInPanel ? "h-[8.25rem] justify-start py-0" : "h-[7.5rem] justify-center",
        className,
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {showNav && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r via-white/70 to-transparent sm:w-12",
              fadeFrom,
            )}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className={cn(
              "absolute left-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-opacity sm:h-9 sm:w-9",
              embeddedInPanel
                ? "border-[#E0E0E0] bg-white text-[#555555] hover:bg-[#f8f8f8]"
                : "border-border bg-white text-foreground shadow-md hover:bg-muted",
              !canScrollLeft && "cursor-default opacity-40",
            )}
            aria-label="Previous brands"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>

          <div
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l via-white/70 to-transparent sm:w-12",
              fadeFrom,
            )}
            aria-hidden="true"
          />
          <button
            type="button"
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className={cn(
              "absolute right-1 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm transition-opacity sm:h-9 sm:w-9",
              embeddedInPanel
                ? "border-[#E0E0E0] bg-white text-[#555555] hover:bg-[#f8f8f8]"
                : "border-border bg-white text-foreground shadow-md hover:bg-muted",
              !canScrollRight && "cursor-default opacity-40",
            )}
            aria-label="Next brands"
          >
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className={cn(
          "flex h-full w-full min-w-0 items-stretch overflow-x-auto scroll-smooth",
          featured ? "gap-4 sm:gap-5 px-1" : embeddedInPanel ? "items-stretch gap-3 px-1" : "items-center gap-3 px-1",
          "[-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden",
          showNav && "px-9 sm:px-11",
        )}
        role="list"
        aria-label="Tyre brands"
      >
        {brands.map((brand) => (
          <Link
            key={brand.id}
            role="listitem"
            to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}
            className={cn(
              "flex shrink-0 snap-start flex-col items-center justify-center transition-colors",
              featured
                ? cn(
                    "min-h-[10.5rem] w-[9.5rem] gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-card sm:min-h-[11rem] sm:w-[10.5rem] sm:p-5 md:w-[11.5rem]",
                    "hover:border-primary/30 hover:shadow-elev-2",
                  )
                : embeddedInPanel
                  ? cn(
                      "h-[8.25rem] w-[7.75rem] gap-2 rounded-md border border-[#E0E0E0] bg-white px-2.5 py-3 shadow-none sm:w-[8.5rem]",
                      "hover:border-[#A80000]/35 hover:shadow-sm",
                    )
                  : cn(
                      "h-[6.75rem] w-[7.25rem] gap-2 rounded-lg border border-border/70 bg-white p-2.5 shadow-sm sm:w-[8rem]",
                      "hover:border-primary/35 hover:bg-muted/40",
                    ),
            )}
          >
            <BrandLogoMark
              brand={brand}
              size={featured ? "2xl" : "lg"}
              className={
                featured
                  ? "!h-[4.5rem] !w-full max-w-[7.5rem] !border-0 !bg-transparent !p-0 !shadow-none sm:!h-[5.25rem] sm:max-w-[8.5rem]"
                  : embeddedInPanel
                    ? "!h-[3.75rem] !w-full max-w-[6.5rem] !border-0 !bg-transparent !p-0 !shadow-none"
                    : "!h-14 !w-14 p-1"
              }
            />
            <span
              className={cn(
                "line-clamp-2 text-center font-bold leading-tight text-[#1A1A1A]",
                featured ? "text-sm" : embeddedInPanel ? "text-[12px] sm:text-[13px]" : "text-xs",
              )}
            >
              {brand.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
