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

/** Shared chrome for home page + header Find tyres dropdown. */
const HOME = {
  surface: "bg-white",
  border: "border-[#E0E0E0]",
  divider: "border-[#E8E8E8]",
  activeTabBg: "bg-[#f8f8f8]",
  text: "text-[#1A1A1A]",
  muted: "text-[#8A8A8A]",
  inactiveTab: "text-[#333333]",
  red: "text-[#A80000]",
  redBg: "bg-[#A80000]",
  button:
    "bg-[#C8102E] text-white hover:bg-[#A80000] disabled:cursor-not-allowed disabled:bg-[#C8102E] disabled:text-white disabled:opacity-100",
} as const;

const PANEL_MIN_H = "min-h-[13.5rem]";
/** Desktop: compact fixed box. Mobile: grow with content so nothing is clipped. */
const HOME_PANEL_H = "min-h-0 sm:h-[12rem] sm:min-h-[12rem]";
const HEADER_PANEL_H = "min-h-0 sm:h-[13.5rem] sm:min-h-[13.5rem]";
const PANEL_SURFACE = "bg-[#f8f8f8]";
/** Compact right-pane padding — smaller bottom gap. */
const HOME_PANE_PAD = "px-3 pt-3 pb-3 sm:px-3.5 sm:pt-3.5 sm:pb-2.5";

export function TyreSearchMegaPanel({
  className,
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "home" | "header";
}) {
  const isHome = variant === "home" || variant === "header";
  const isHeader = variant === "header";
  const contentPad = isHome ? "gap-3 p-5 sm:p-6" : "gap-3 p-4 sm:p-5";
  const formPad = isHome ? "gap-4 p-5 sm:gap-5 sm:p-6" : "gap-4 p-4 sm:gap-5 sm:p-5";
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

  const heading =
    panelView === "vrn"
      ? "Search By Registration"
      : panelView === "size"
        ? "Search By Size"
        : "Shop By Brand";

  if (isHome) {
    return (
      <div data-tyre-search-mega-panel className={cn("w-full", className)}>
        {!isHeader && (
          <h2
            className={cn(
              "mb-3 flex min-h-[1.75rem] items-center font-display text-[22px] font-bold leading-tight tracking-[-0.01em] sm:mb-3.5 sm:text-[24px]",
              HOME.text,
            )}
          >
            {heading}
          </h2>
        )}

        <div
          className={cn(
            "flex flex-col overflow-hidden sm:flex-row",
            HOME.surface,
            isHeader
              ? cn(HEADER_PANEL_H, "rounded-b-xl border border-t-0 border-black/15 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.45)]")
              : cn(HOME_PANEL_H, HOME.border, "border-y sm:rounded-md sm:border sm:shadow-sm"),
          )}
        >
          <aside
            className={cn(
              "grid w-full shrink-0 grid-cols-3 border-b sm:flex sm:h-full sm:w-[16rem] sm:min-w-[16rem] sm:flex-col sm:border-b-0 sm:border-r",
              isHeader && "sm:w-[13.5rem] sm:min-w-[13.5rem]",
              HOME.surface,
              HOME.divider,
            )}
            aria-label="Search options"
          >
            <HomePanelTab active={panelView === "vrn"} onClick={() => selectPanel("vrn")} icon={<Car className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={1.75} />}>
              <span className="sm:hidden">Reg</span>
              <span className="hidden sm:inline">By Registration</span>
            </HomePanelTab>
            <HomePanelTab active={panelView === "size"} onClick={() => selectPanel("size")} icon={<Gauge className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={1.75} />}>
              <span className="sm:hidden">Size</span>
              <span className="hidden sm:inline">By Size</span>
            </HomePanelTab>
            <HomePanelTab active={panelView === "brands"} onClick={() => selectPanel("brands")} icon={<Tag className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" strokeWidth={1.75} />}>
              <span className="sm:hidden">Brand</span>
              <span className="hidden sm:inline">By Brand</span>
            </HomePanelTab>
          </aside>

          {/* Mobile: flow layout. Desktop: absolute panes share fixed panel height. */}
          <div className="relative min-h-0 min-w-0 flex-1 bg-[#f8f8f8] sm:min-h-0">
            <div
              className={cn(
                "flex flex-col gap-2",
                HOME_PANE_PAD,
                panelView === "brands" ? "relative" : "hidden",
                "sm:absolute sm:inset-0 sm:overflow-hidden",
                panelView === "brands"
                  ? "sm:visible sm:opacity-100"
                  : "sm:invisible sm:pointer-events-none sm:opacity-0 sm:flex",
              )}
              aria-hidden={panelView !== "brands"}
            >
              <div className="flex shrink-0 flex-col gap-1">
                {isHeader && (
                  <h3 className={cn("font-display text-lg font-bold leading-tight", HOME.text)}>{heading}</h3>
                )}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2">
                  <p className="text-sm font-normal leading-snug text-[#5C5C5C] sm:text-[15px]">
                    Browse tyres from premium and budget manufacturers.
                  </p>
                  <Link
                    to="/brands"
                    tabIndex={panelView === "brands" ? 0 : -1}
                    className={cn("shrink-0 text-sm font-semibold underline-offset-2 hover:underline sm:text-[15px]", HOME.red)}
                  >
                    View all brands
                  </Link>
                </div>
              </div>
              <BrandSlider
                brands={panelBrands}
                active={panelView === "brands"}
                className="min-w-0 shrink-0"
                fadeFrom="from-[#f8f8f8]"
                embeddedInPanel
              />
            </div>

            <form
              onSubmit={handlePanelSubmit}
              className={cn(
                "flex flex-col",
                HOME_PANE_PAD,
                panelView === "vrn" ? "relative" : "hidden",
                "sm:absolute sm:inset-0 sm:overflow-hidden sm:flex",
                panelView === "vrn"
                  ? "sm:visible sm:opacity-100"
                  : "sm:invisible sm:pointer-events-none sm:opacity-0",
              )}
              aria-hidden={panelView !== "vrn"}
            >
              <div className="shrink-0">
                {isHeader && (
                  <h3 className={cn("mb-1 font-display text-lg font-bold leading-tight", HOME.text)}>{heading}</h3>
                )}
                <p className="text-sm font-normal leading-snug text-[#5C5C5C] sm:text-[15px]">
                  Enter your number plate to find matching tyres.
                </p>
              </div>
              <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2.5">
                <div className="relative w-full min-w-0">
                  <span
                    className={cn(
                      "pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center font-display text-[12px] font-bold uppercase tracking-wide text-white sm:w-12 sm:text-[13px]",
                      HOME.redBg,
                    )}
                  >
                    GB
                  </span>
                  <input
                    type="text"
                    value={search.vrn}
                    onChange={(e) => search.setVrn(e.target.value.toUpperCase())}
                    placeholder="e.g. AB12 CDE"
                    maxLength={8}
                    autoComplete="off"
                    tabIndex={panelView === "vrn" ? 0 : -1}
                    className={cn(
                      "h-11 w-full min-w-0 border border-[#D6D6D6] bg-white pl-12 pr-3 font-display text-sm font-semibold uppercase tracking-[0.08em] text-[#1A1A1A] outline-none sm:pl-14 sm:pr-4 sm:text-[15px] sm:tracking-[0.14em]",
                      "placeholder:font-display placeholder:font-medium placeholder:normal-case placeholder:tracking-normal placeholder:text-[#5A6578]",
                      "focus-visible:border-[#A80000]/50 focus-visible:ring-2 focus-visible:ring-[#A80000]/15",
                    )}
                    aria-label="Vehicle registration"
                  />
                </div>
                <div className="mt-auto flex justify-stretch sm:justify-end">
                  <button
                    type="submit"
                    disabled={!search.canSubmitVrn}
                    tabIndex={panelView === "vrn" ? 0 : -1}
                    aria-label="FIND TYRES"
                    className={cn(
                      "inline-flex h-11 w-full items-center justify-center rounded-[4px] px-7 font-display text-[15px] font-bold uppercase tracking-[0.12em] transition-colors sm:h-10 sm:w-auto sm:min-w-[9.5rem]",
                      HOME.button,
                    )}
                  >
                    FIND TYRES
                  </button>
                </div>
              </div>
            </form>

            <form
              onSubmit={handlePanelSubmit}
              className={cn(
                "flex flex-col",
                HOME_PANE_PAD,
                panelView === "size" ? "relative" : "hidden",
                "sm:absolute sm:inset-0 sm:overflow-hidden sm:flex",
                panelView === "size"
                  ? "sm:visible sm:opacity-100"
                  : "sm:invisible sm:pointer-events-none sm:opacity-0",
              )}
              aria-hidden={panelView !== "size"}
            >
              <div className="shrink-0">
                {isHeader && (
                  <h3 className={cn("mb-1 font-display text-lg font-bold leading-tight", HOME.text)}>{heading}</h3>
                )}
                <p className="text-sm font-normal leading-snug text-[#5C5C5C] sm:text-[15px]">
                  Select width, profile and rim size from your sidewall.
                </p>
              </div>
              <div className="mt-2 flex min-h-0 flex-1 flex-col gap-2.5">
                <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                  <TyreSizeSelect
                    variant="panel"
                    label="Width"
                    value={search.width}
                    onChange={search.setWidth}
                    options={TYRE_WIDTHS.map(String)}
                    className="min-w-0 [&_select]:border-[#E0E0E0] [&_select]:bg-white [&_span]:text-[#8A8A8A]"
                  />
                  <TyreSizeSelect
                    variant="panel"
                    label="Ratio"
                    value={search.profile}
                    onChange={search.setProfile}
                    options={TYRE_PROFILES.map(String)}
                    className="min-w-0 [&_select]:border-[#E0E0E0] [&_select]:bg-white [&_span]:text-[#8A8A8A]"
                  />
                  <TyreSizeSelect
                    variant="panel"
                    label="Rim"
                    value={search.rim}
                    onChange={search.setRim}
                    options={TYRE_RIMS.map(String)}
                    className="min-w-0 [&_select]:border-[#E0E0E0] [&_select]:bg-white [&_span]:text-[#8A8A8A]"
                  />
                  <TyreSizeSelect
                    variant="panel"
                    label="Speed"
                    value={search.speed}
                    onChange={search.setSpeed}
                    options={[...TYRE_SPEEDS]}
                    optionLabels={TYRE_SPEEDS.map((s) => (s === "any" ? "Any" : s))}
                    className="min-w-0 [&_select]:border-[#E0E0E0] [&_select]:bg-white [&_span]:text-[#8A8A8A]"
                  />
                </div>
                <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                  <TyreSizeHelpDialog className="text-sm text-[#5C5C5C] hover:text-[#A80000] sm:text-[15px]" />
                  <button
                    type="submit"
                    tabIndex={panelView === "size" ? 0 : -1}
                    aria-label="FIND TYRES"
                    className={cn(
                      "inline-flex h-11 w-full shrink-0 items-center justify-center rounded-[4px] px-7 font-display text-[15px] font-bold uppercase tracking-[0.12em] transition-colors sm:h-10 sm:w-auto sm:min-w-[9.5rem]",
                      HOME.button,
                    )}
                  >
                    FIND TYRES
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

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
          "grid w-full shrink-0 grid-cols-3 gap-0 border-b border-black/10 sm:flex sm:w-60 sm:min-w-[15rem] sm:flex-col sm:justify-start sm:gap-0 sm:self-stretch sm:border-b-0 sm:border-r",
          PANEL_SURFACE,
        )}
        aria-label="Search options"
      >
        <PanelTab active={panelView === "vrn"} onClick={() => selectPanel("vrn")} icon={<Car className="h-4 w-4 shrink-0" />}>
          <span className="sm:hidden">Reg</span>
          <span className="hidden sm:inline">By registration</span>
        </PanelTab>
        <PanelTab active={panelView === "size"} onClick={() => selectPanel("size")} icon={<Gauge className="h-4 w-4 shrink-0" />}>
          <span className="sm:hidden">Size</span>
          <span className="hidden sm:inline">By size</span>
        </PanelTab>
        <PanelTab active={panelView === "brands"} onClick={() => selectPanel("brands")} icon={<Tag className="h-4 w-4 shrink-0" />}>
          <span className="sm:hidden">Brand</span>
          <span className="hidden sm:inline">By brand</span>
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
              fadeFrom="from-[#f8f8f8]"
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
                  <div className="relative w-full min-w-0">
                    <span className="pointer-events-none absolute inset-y-0 left-0 z-10 flex w-11 items-center justify-center rounded-l bg-primary font-display text-xs font-bold text-white">
                      GB
                    </span>
                    <input
                      type="text"
                      value={search.vrn}
                      onChange={(e) => search.setVrn(e.target.value.toUpperCase())}
                      placeholder="e.g. AB12 CDE"
                      maxLength={8}
                      autoComplete="off"
                      className="h-11 w-full min-w-0 rounded border-2 border-black/20 bg-[#f8f8f8] pl-12 pr-3 text-center font-mono text-base font-bold uppercase tracking-widest outline-none focus-visible:border-black/40 focus-visible:ring-2 focus-visible:ring-black/15 sm:text-lg"
                      aria-label="Vehicle registration"
                    />
                  </div>
                  <div className="flex justify-stretch sm:justify-end">
                    <TyreSearchSubmitButton disabled={!search.canSubmitVrn} className="w-full sm:w-auto" />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:grid-cols-4">
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
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                    <TyreSizeHelpDialog className="text-muted-foreground hover:text-primary" />
                    <TyreSearchSubmitButton className="w-full shrink-0 sm:w-auto" />
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

function HomePanelTab({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-w-0 items-center justify-center gap-1.5 border-b border-r px-1.5 py-2.5 text-center font-sans text-[12px] font-semibold leading-tight transition-colors last:border-r-0 sm:h-full sm:w-full sm:justify-start sm:gap-2 sm:border-r-0 sm:px-5 sm:py-0 sm:pl-6 sm:text-left sm:text-[14px] sm:leading-none",
        "border-[#E8E8E8] sm:last:border-b-0",
        active
          ? cn(HOME.activeTabBg, HOME.red)
          : cn(HOME.surface, HOME.inactiveTab, "hover:bg-[#f8f8f8]"),
      )}
    >
      <span className={cn("inline-flex h-4 w-4 shrink-0 items-center justify-center sm:h-5 sm:w-5", active ? HOME.red : "text-[#777777]")}>
        {icon}
      </span>
      <span className="min-w-0 truncate sm:whitespace-nowrap sm:overflow-visible">{children}</span>
    </button>
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
        "flex min-w-0 flex-1 items-center justify-center gap-1 rounded-none text-center font-display text-[11px] font-bold uppercase tracking-wide transition-colors sm:w-full sm:justify-start sm:rounded-md sm:text-xs",
        compact ? "px-1.5 py-2 sm:px-2.5 sm:py-2" : "px-1.5 py-2.5 sm:px-3.5 sm:py-3",
        active
          ? "border border-primary/35 bg-black/[0.04] text-primary shadow-none ring-1 ring-primary/25 sm:border"
          : "border border-transparent bg-transparent text-foreground hover:bg-black/[0.04]",
      )}
    >
      {icon}
      <span className="min-w-0 truncate">{children}</span>
    </button>
  );
}
