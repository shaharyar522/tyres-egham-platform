import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ResultCard } from "@/components/domain/result-card";
import { HomeCtaLink } from "@/components/home/home-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiTyreSearchQuery } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

const SCROLL_STEP = 360;
const CARD_WIDTH = "w-[min(100%,20.5rem)] sm:w-[20.5rem]";
/** Fetch extra so we still have enough after filtering to express/24h stock. */
const FETCH_PER_PAGE = 36;
const DISPLAY_LIMIT = 12;

export function LatestTyresSlider({ className }: { className?: string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const tyresQuery = useApiTyreSearchQuery({ browse: true, perPage: FETCH_PER_PAGE });
  const tyres = (tyresQuery.data?.results ?? [])
    .filter((sku) => sku.isAvailableWithin24h)
    .slice(0, DISPLAY_LIMIT);

  const updateScrollButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth > 8;
    setHasOverflow(overflow);
    setCanScrollLeft(overflow && el.scrollLeft > 4);
    setCanScrollRight(overflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || tyres.length === 0) return;

    updateScrollButtons();
    el.addEventListener("scroll", updateScrollButtons, { passive: true });
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      observer.disconnect();
    };
  }, [tyres.length, updateScrollButtons]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.85, SCROLL_STEP);
    el.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  if (tyresQuery.isLoading) {
    return (
      <div className={cn("relative", className)} aria-busy="true" aria-label="Loading latest tyres">
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[28rem] w-[20.5rem] shrink-0 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (tyresQuery.isError || tyres.length === 0) {
    return null;
  }

  const showNav = hasOverflow;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        {showNav && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={cn(
                "absolute left-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-opacity hover:bg-[#f8f8f8] sm:h-11 sm:w-11",
                !canScrollLeft && "cursor-default opacity-40",
              )}
              aria-label="Previous tyres"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={cn(
                "absolute right-0 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-opacity hover:bg-[#f8f8f8] sm:h-11 sm:w-11",
                !canScrollRight && "cursor-default opacity-40",
              )}
              aria-label="Next tyres"
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}

        <div
          ref={scrollRef}
          className={cn(
            "flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-1",
            "[-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory [&::-webkit-scrollbar]:hidden",
            showNav && "px-12 sm:px-14",
          )}
          role="list"
          aria-label="Express fitting tyres available within 24 hours"
        >
          {tyres.map((sku) => (
            <div
              key={sku.id}
              role="listitem"
              className={cn(CARD_WIDTH, "shrink-0 snap-start")}
            >
              <ResultCard sku={sku} layout="card" className="h-full" />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <HomeCtaLink to="/tyres" className="min-w-[12rem]">
          View all tyres
        </HomeCtaLink>
      </div>
    </div>
  );
}
