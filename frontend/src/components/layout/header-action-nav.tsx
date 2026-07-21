import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Phone, ShoppingCart } from "lucide-react";
import { TyreSearchMegaPanel } from "@/components/domain/tyre-search-mega-panel";
import { useBasket } from "@/store/basket";
import { useSite } from "@/lib/site";
import { isTyreSearchOverlayTarget } from "@/lib/radix-overlay";
import { cn } from "@/lib/utils";

const SKEW = "-14deg";

const actionItemClass =
  "relative flex h-full items-center bg-transparent text-white outline-none transition-colors hover:text-primary";

function ActionSeparator() {
  return (
    <span className="mx-1 flex shrink-0 self-stretch px-1 sm:mx-2 sm:px-2" aria-hidden="true">
      <span className="h-full w-px bg-white/35" style={{ transform: `skewX(${SKEW})` }} />
    </span>
  );
}

export function HeaderActionNav({
  className,
  onMenuOpenChange,
}: {
  className?: string;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const site = useSite();
  const { totals } = useBasket();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    onMenuOpenChange?.(open);
  }, [open, onMenuOpenChange]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as EventTarget | null;
      if (isTyreSearchOverlayTarget(target)) return;
      if (rootRef.current?.contains(target as Node)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative z-50 hidden h-full lg:flex", className)}>
      <div className="flex h-full items-stretch overflow-visible">
        <div className="relative flex h-full">
          <button
            type="button"
            aria-expanded={open}
            aria-haspopup="dialog"
            onClick={() => setOpen((prev) => !prev)}
            className={cn(actionItemClass, open && "text-primary")}
          >
            <div className="flex h-full items-center px-3 sm:px-4" style={{ transform: `skewX(${SKEW})` }}>
              <span
                className="inline-flex items-center gap-1.5 font-display text-sm font-bold uppercase not-italic tracking-wide"
                style={{ transform: `skewX(14deg)` }}
              >
                Find tyres
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </span>
            </div>
          </button>

          {open && (
            <div
              className="absolute right-0 top-full z-50 w-[min(calc(100vw-1.5rem),780px)]"
              role="dialog"
              aria-label="Find tyres"
            >
              {/* Accents the dropdown as hanging from the black header bar */}
              <div className="h-1 w-full bg-primary" aria-hidden="true" />
              <TyreSearchMegaPanel variant="header" />
            </div>
          )}
        </div>

        <ActionSeparator />

        <a href={`tel:${site.phoneTel}`} className={actionItemClass}>
          <div className="flex h-full items-center px-3 sm:px-4" style={{ transform: `skewX(${SKEW})` }}>
            <span
              className="inline-flex items-center gap-2 font-display text-sm font-bold uppercase not-italic tracking-wide"
              style={{ transform: `skewX(14deg)` }}
            >
              <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline">Call us</span>
              <span className="xl:hidden">{site.phone}</span>
            </span>
          </div>
        </a>

        <ActionSeparator />

        <Link to="/basket" className={actionItemClass} aria-label={`Basket (${totals.itemCount})`}>
          <div className="flex h-full items-center px-3 sm:px-4" style={{ transform: `skewX(${SKEW})` }}>
            <span
              className="relative inline-flex items-center gap-2 font-display text-sm font-bold uppercase not-italic tracking-wide"
              style={{ transform: `skewX(14deg)` }}
            >
              <ShoppingCart className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="hidden xl:inline">Cart</span>
              {totals.itemCount > 0 && (
                <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold not-italic text-primary-foreground">
                  {totals.itemCount}
                </span>
              )}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
