import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Car, Gauge, Tag } from "lucide-react";
import { BrandSlider } from "@/components/domain/brand-slider";
import {
  TYRE_PROFILES,
  TYRE_RIMS,
  TYRE_SPEEDS,
  TYRE_WIDTHS,
  TyreSearchSubmitButton,
  TyreSizeHelpDialog,
  TyreSizeSelect,
  useTyreSearchForm,
} from "@/components/domain/tyre-search-shared";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

type PanelView = "vrn" | "size" | "brands";

const BRAND_TIERS = [
  { key: "premium" as const, label: "Premium" },
  { key: "mid_range" as const, label: "Budget" },
] as const;

const PANEL_MIN_H = "min-h-[13.5rem]";
const PANEL_SURFACE = "bg-[#ECEAE9]";

export function TyreSearchMegaPanel({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "home";
}) {
  const isHome = variant === "home";
  const contentPad = isHome ? "gap-2 p-2 sm:p-3" : "gap-3 p-4 sm:p-5";
  const formPad = isHome ? "gap-3 p-2 sm:gap-3 sm:p-3" : "gap-4 p-4 sm:gap-5 sm:p-5";
  const search = useTyreSearchForm("vrn");
  const [panelView, setPanelView] = useState<PanelView>("vrn");
  const bootstrapQuery = useApiBootstrapQuery();
  const brands = bootstrapQuery.data?.brands ?? [];
  const brandsByTier = (tier: (typeof BRAND_TIERS)[number]["key"]) =>
    brands.filter((b) => b.tier === tier);
  const panelBrands = useMemo(
    () => BRAND_TIERS.flatMap(({ key }) => brandsByTier(key)),
    [brands],
  );

  const selectPanel = (view: PanelView) => {
    setPanelView(view);
    if (view === "vrn" || view === "size") {
      search.setMode(view);
    }
  };

  const handlePanelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (panelView === "vrn") {
      search.submitVrn();
    } else {
      search.submitSize();
    }
  };

  return (
    <div
      data-tyre-search-mega-panel
      className={cn(
        "flex flex-col text-foreground sm:flex-row",
        PANEL_SURFACE,
        PANEL_MIN_H,
        className,
      )}
    >
      <aside
        className={cn(
          "flex w-full shrink-0 flex-row gap-1 border-b border-black/10 sm:w-60 sm:min-w-[15rem]",
          "sm:flex-col sm:justify-start sm:gap-0 sm:self-stretch sm:border-b-0 sm:border-r",
          PANEL_SURFACE,
        )}
        aria-label="Search options"
      >
        <PanelTab compact={isHome} active={panelView === "vrn"} onClick={() => selectPanel("vrn")} icon={<Car className="h-4 w-4" />}>
          By registration
        </PanelTab>
        <PanelTab compact={isHome} active={panelView === "size"} onClick={() => selectPanel("size")} icon={<Gauge className="h-4 w-4" />}>
          By size
        </PanelTab>
        <PanelTab compact={isHome} active={panelView === "brands"} onClick={() => selectPanel("brands")} icon={<Tag className="h-4 w-4" />}>
          By brand
        </PanelTab>
      </aside>

      <div className={cn("flex min-h-0 min-w-0 flex-1 flex-col", PANEL_SURFACE)}>
        {panelView === "brands" ? (
          <div className={cn("flex h-full min-h-0 flex-col", contentPad)}>
            <div className="flex shrink-0 flex-wrap items-end justify-between gap-2">
              <div>
                <h3 className="font-display text-base font-bold uppercase italic sm:text-lg">Shop by brand</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Browse tyres from premium and budget manufacturers.
                </p>
              </div>
              <Link
                to="/brands"
                className="shrink-0 text-sm font-bold text-primary underline-offset-2 hover:underline"
              >
                View all brands
              </Link>
            </div>
            <BrandSlider
              brands={panelBrands}
              active={panelView === "brands"}
              className="min-h-0 flex-1"
              fadeFrom="from-[#ECEAE9]"
              embeddedInPanel
            />
          </div>
        ) : (
          <form onSubmit={handlePanelSubmit} className="flex h-full min-h-0 flex-col">
            <div className={cn("flex flex-1 flex-col", formPad)}>
              <div className="shrink-0">
                <h3 className="font-display text-base font-bold uppercase italic sm:text-lg">
                  {panelView === "vrn" ? "Search by registration" : "Search by tyre size"}
                </h3>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {panelView === "vrn"
                    ? "Enter your number plate to find matching tyres."
                    : "Select width, profile and rim size from your sidewall."}
                </p>
              </div>

              {panelView === "vrn" ? (
                <div className="flex flex-col gap-4">
                  <div className="relative w-full">
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center rounded-l bg-primary font-display text-xs font-bold text-white">
                      GB
                    </span>
                    <input
                      type="text"
                      value={search.vrn}
                      onChange={(e) => search.setVrn(e.target.value.toUpperCase())}
                      placeholder="AB12 CDE"
                      maxLength={8}
                      autoComplete="off"
                      className="h-11 w-full rounded border-2 border-black/20 bg-[#ECEAE9] pl-12 pr-3 text-center font-mono text-lg font-bold uppercase tracking-widest outline-none focus-visible:border-black/40 focus-visible:ring-2 focus-visible:ring-black/15"
                      aria-label="Vehicle registration"
                    />
                  </div>
                  <div className="flex justify-end">
                    <TyreSearchSubmitButton disabled={!search.canSubmitVrn} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid w-full grid-cols-4 gap-2.5">
                    <TyreSizeSelect
                      variant="panel"
                      label="Width"
                      value={search.width}
                      onChange={search.setWidth}
                      options={TYRE_WIDTHS.map(String)}
                      className="min-w-0"
                    />
                    <TyreSizeSelect
                      variant="panel"
                      label="Ratio"
                      value={search.profile}
                      onChange={search.setProfile}
                      options={TYRE_PROFILES.map(String)}
                      className="min-w-0"
                    />
                    <TyreSizeSelect
                      variant="panel"
                      label="Rim"
                      value={search.rim}
                      onChange={search.setRim}
                      options={TYRE_RIMS.map(String)}
                      className="min-w-0"
                    />
                    <TyreSizeSelect
                      variant="panel"
                      label="Speed"
                      value={search.speed}
                      onChange={search.setSpeed}
                      options={[...TYRE_SPEEDS]}
                      optionLabels={TYRE_SPEEDS.map((s) => (s === "any" ? "Any" : s))}
                      className="min-w-0"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <TyreSizeHelpDialog className="text-muted-foreground hover:text-primary" />
                    <TyreSearchSubmitButton className="shrink-0" />
                  </div>
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function PanelTab({
  active,
  onClick,
  children,
  icon,
  compact = false,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center gap-2 rounded-md text-left font-display text-xs font-bold uppercase tracking-wide transition-colors sm:w-full",
        compact ? "px-2 py-2 sm:px-2.5 sm:py-2" : "px-3 py-2.5 sm:px-3.5 sm:py-3",
        active
          ? "border border-primary/35 bg-black/[0.04] text-primary shadow-none ring-1 ring-primary/25"
          : "border border-transparent bg-transparent text-foreground hover:bg-black/[0.04]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
