import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { ChevronRight, Filter, Info, LayoutGrid, List, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { ResultCard, type ResultsViewMode } from "@/components/domain/result-card";
import { TyreSearchWidget } from "@/components/domain/tyre-search-widget";
import { ApiError } from "@/lib/api/client";
import { useApiBootstrapQuery, useApiBrandsIndexQuery, useApiTyreSearchQuery, useApiVehicleLookupQuery } from "@/lib/api/queries";
import type { Brand, TyreSku, VehicleLookupFitmentPosition, VehicleLookupFitmentSet } from "@/types";
import { brandTierLabel } from "@/lib/brand-tiers";
import { canonicalPathFromLocation, usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

const gradeOrder = ["A", "B", "C", "D", "E"] as const;

type SortOption =
  | "default"
  | "price_asc"
  | "price_desc"
  | "budget_brands"
  | "mid_range_brands"
  | "premium_brands"
  | "fuel_efficiency"
  | "wet_grip"
  | "external_noise";

const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "default", label: "Default Sort Order" },
  { value: "price_asc", label: "Price - Low to High" },
  { value: "price_desc", label: "Price - High to Low" },
  { value: "budget_brands", label: "Budget Brands" },
  { value: "mid_range_brands", label: "Mid-Range Brands" },
  { value: "premium_brands", label: "Premium Brands" },
  { value: "fuel_efficiency", label: "Fuel Efficiency" },
  { value: "wet_grip", label: "Wet Grip" },
  { value: "external_noise", label: "External Noise" },
];

interface ActiveFilters {
  brandIds: number[];
  brandTiers: ("premium" | "mid_range" | "budget")[];
  specialist: {
    extraLoad: boolean;
    fourByFour: boolean;
    van: boolean;
    runFlat: boolean;
    winter: boolean;
    allSeason: boolean;
    ev: boolean;
  };
  priceMax: number;
  offersOnly: boolean;
  sameDayOnly: boolean;
  within24hOnly: boolean;
  premiumOnly: boolean;
}

const defaultFilters: ActiveFilters = {
  brandIds: [],
  brandTiers: [],
  specialist: { extraLoad: false, fourByFour: false, van: false, runFlat: false, winter: false, allSeason: false, ev: false },
  priceMax: 0,
  offersOnly: false,
  sameDayOnly: false,
  within24hOnly: false,
  premiumOnly: false,
};

export default function SearchResultsPage() {
  const location = useLocation();
  const site = useSite();
  const [params, setSearchParams] = useSearchParams();
  const isCatalogueHub = location.pathname === "/tyres";
  const vrn = (params.get("vrn") ?? "").replace(/\s+/g, "").toUpperCase();
  const width = Number(params.get("Width") ?? 0);
  const profile = Number(params.get("Profile") ?? 0);
  const rim = Number(params.get("Rim") ?? 0);
  const speed = (params.get("Speed") ?? "").toUpperCase();
  const categorySlug = params.get("TyreCategory") ?? "";
  const brandSlug = params.get("brand") ?? "";
  const isVrnSearch = Boolean(vrn);

  const [page, setPage] = useState(() => Math.max(1, Number(params.get("page") ?? 1)));
  const [sort, setSort] = useState<SortOption>("default");
  const [resultsView, setResultsView] = useState<ResultsViewMode>("list");
  const [filters, setFilters] = useState<ActiveFilters>(defaultFilters);

  const bootstrapQuery = useApiBootstrapQuery();
  const categoryForMeta = categorySlug
    ? (bootstrapQuery.data?.categories ?? []).find((c) => c.slug === categorySlug) ?? null
    : null;
  const brandForMeta = brandSlug
    ? (bootstrapQuery.data?.brands ?? []).find((b) => b.slug === brandSlug) ?? null
    : null;
  const searchCanonicalPath = canonicalPathFromLocation(location.pathname, location.search);

  usePageMeta({
    title: categoryForMeta
      ? `${categoryForMeta.name} | ${site.businessName}`
      : brandForMeta
        ? `${brandForMeta.name} tyres | ${site.businessName}`
        : width && profile && rim
          ? `${width}/${profile}R${rim} tyres | ${site.businessName}`
          : isCatalogueHub
            ? `All tyres | ${site.businessName}`
            : `Tyre search results | ${site.businessName}`,
    description: categoryForMeta?.description
      || (width && profile && rim
        ? `Compare ${width}/${profile}R${rim} tyres with fitting at ${site.businessName}.`
        : `Search and compare tyres with fitting at ${site.businessName} in Egham.`),
    canonicalPath: searchCanonicalPath,
  });

  const brandsQuery = useApiBrandsIndexQuery();
  const vehicleLookupQuery = useApiVehicleLookupQuery(vrn);
  const lookupVehicle = vehicleLookupQuery.data?.vehicle;
  const fitments = vehicleLookupQuery.data?.fitments ?? [];
  const [selectedFitmentId, setSelectedFitmentId] = useState<number | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<VehicleLookupFitmentPosition["position"]>("all_round");

  useEffect(() => {
    if (!vehicleLookupQuery.data) return;
    const nextFitment = vehicleLookupQuery.data.selectedFitment ?? vehicleLookupQuery.data.fitments[0] ?? null;
    setSelectedFitmentId(nextFitment?.id ?? null);
    setSelectedPosition(getDefaultPosition(nextFitment));
  }, [vehicleLookupQuery.data?.registration, vehicleLookupQuery.data?.selectedFitment?.id]);

  const selectedFitment = useMemo(
    () => fitments.find((fitment) => fitment.id === selectedFitmentId) ?? vehicleLookupQuery.data?.selectedFitment ?? fitments[0] ?? null,
    [fitments, selectedFitmentId, vehicleLookupQuery.data?.selectedFitment],
  );

  const activePosition = useMemo(
    () => resolveActivePosition(selectedFitment, selectedPosition),
    [selectedFitment, selectedPosition],
  );

  const effectiveWidth = activePosition?.width ?? width;
  const effectiveProfile = activePosition?.profile ?? profile;
  const effectiveRim = activePosition?.rim ?? rim;
  const effectiveCategorySlug = activePosition?.tyreCategory ?? selectedFitment?.tyreCategory ?? categorySlug;
  const fitmentSpeed = activePosition?.speedRating ?? "";
  const appliedSpeedFilter = isVrnSearch ? fitmentSpeed : speed;

  const usesCataloguePagination = isCatalogueHub || Boolean(brandSlug) || Boolean(effectiveCategorySlug) || Boolean(effectiveWidth);

  const tyreSearchParams = isVrnSearch
    ? selectedFitment
      ? {
          vehicleRegistration: vrn,
          fitmentId: selectedFitment.id,
          position: selectedPosition,
          brand: brandSlug || undefined,
          tyreCategory: effectiveCategorySlug || undefined,
          offersOnly: filters.offersOnly || undefined,
        }
      : {}
    : {
        browse: isCatalogueHub || undefined,
        width: effectiveWidth || undefined,
        profile: effectiveProfile || undefined,
        rim: effectiveRim || undefined,
        brand: brandSlug || undefined,
        tyreCategory: effectiveCategorySlug || undefined,
        offersOnly: filters.offersOnly || undefined,
        page: usesCataloguePagination ? page : undefined,
        perPage: isCatalogueHub ? 48 : effectiveWidth ? 120 : brandSlug || effectiveCategorySlug ? 96 : undefined,
      };

  const searchQuery = useApiTyreSearchQuery(tyreSearchParams);

  const brands = brandsQuery.data?.brands ?? bootstrapQuery.data?.brands ?? [];
  const searchMeta = searchQuery.data?.meta;
  const categories = bootstrapQuery.data?.categories ?? [];
  const baseResults = searchQuery.data?.results ?? [];
  const lookupApiError = vehicleLookupQuery.error instanceof ApiError ? vehicleLookupQuery.error : null;
  const lookupErrorDetails = getLookupErrorDetails(lookupApiError);

  const matched = useMemo(() => {
    let list = [...baseResults];

    if (appliedSpeedFilter) {
      list = list.filter((s) => matchesSpeedRequirement(s.speedRating, appliedSpeedFilter));
    }

    if (effectiveWidth) list = list.filter((s) => Number(s.width) === Number(effectiveWidth));
    if (effectiveProfile) list = list.filter((s) => Number(s.profile) === Number(effectiveProfile));
    if (effectiveRim) list = list.filter((s) => Number(s.rim) === Number(effectiveRim));

    if (filters.brandIds.length) list = list.filter((s) => filters.brandIds.includes(Number(s.brandId)));
    if (filters.brandTiers.length) {
      list = list.filter((s) => {
        const brand = brands.find((b) => Number(b.id) === Number(s.brandId));
        return brand ? filters.brandTiers.includes(brand.tier) : false;
      });
    }
    const sp = filters.specialist;
    if (sp.extraLoad) list = list.filter((s) => s.isExtraLoad);
    if (sp.fourByFour) list = list.filter((s) => s.is4x4);
    if (sp.van) list = list.filter((s) => s.isVan);
    if (sp.runFlat) list = list.filter((s) => s.isRunFlat);
    if (sp.winter) list = list.filter((s) => s.isWinter);
    if (sp.allSeason) list = list.filter((s) => s.isAllSeason);
    if (sp.ev) list = list.filter((s) => s.isEvRated);
    if (filters.priceMax > 0) list = list.filter((s) => s.pricePerTyre <= filters.priceMax);
    if (filters.offersOnly) list = list.filter((s) => s.hasActiveOffer);
    if (filters.sameDayOnly) list = list.filter((s) => Boolean(s.isSameDayDelivery));
    if (filters.within24hOnly) list = list.filter((s) => Boolean(s.isAvailableWithin24h));
    if (filters.premiumOnly) list = list.filter((s) => Boolean(s.isPremium));
    return list;
  }, [baseResults, effectiveWidth, effectiveProfile, effectiveRim, appliedSpeedFilter, filters, brands]);

  const sorted = useMemo(() => sortSkus(matched, sort, brands), [matched, sort, brands]);

  const tierBuckets = useMemo(() => {
    const tiers: Record<"premium" | "mid_range" | "budget", TyreSku[]> = { premium: [], mid_range: [], budget: [] };
    for (const sku of sorted) {
      if (sku.isPremium) {
        tiers.premium.push(sku);
      } else {
        const brand = brands.find((b) => Number(b.id) === Number(sku.brandId));
        if (brand) tiers[brand.tier].push(sku);
        else tiers.budget.push(sku);
      }
    }
    return tiers;
  }, [sorted, brands]);

  const recommended = useMemo(() => sorted.filter((s) => s.badges.includes("recommended")).slice(0, 3), [sorted]);

  const totalCount = sorted.length;
  const apiTotal = searchQuery.data?.total ?? totalCount;
  const cat = effectiveCategorySlug ? categories.find((category) => category.slug === effectiveCategorySlug) ?? null : null;
  const brandRecord = brandSlug ? brands.find((b) => b.slug === brandSlug) : null;

  useEffect(() => {
    setPage(1);
  }, [brandSlug, effectiveCategorySlug, effectiveWidth, effectiveProfile, effectiveRim, vrn, selectedFitmentId, selectedPosition, filters.offersOnly]);

  const goToPage = (nextPage: number) => {
    const clamped = Math.max(1, Math.min(nextPage, searchMeta?.lastPage ?? nextPage));
    setPage(clamped);
    if (isCatalogueHub) {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (clamped <= 1) {
          next.delete("page");
        } else {
          next.set("page", String(clamped));
        }
        return next;
      });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const headlineSize = effectiveWidth && effectiveProfile && effectiveRim
    ? `${effectiveWidth}/${effectiveProfile}R${effectiveRim}${appliedSpeedFilter ? ` ${appliedSpeedFilter}` : ""}`
    : null;
  const lookupFailed = isVrnSearch && vehicleLookupQuery.isError;
  const fitmentSummary = selectedFitment?.label ?? activePosition?.label ?? null;
  const sourceMessage = vehicleLookupQuery.data?.matchMeta.message;
  const sourceLabel = vehicleLookupQuery.data?.matchMeta.source?.replace(/_/g, " ");

  const resetAll = () => setFilters(defaultFilters);
  const adjustFilter = (next: Partial<ActiveFilters>) => setFilters((prev) => ({ ...prev, ...next }));
  const toggleBrand = (id: number) =>
    setFilters((prev) => ({
      ...prev,
      brandIds: prev.brandIds.includes(id) ? prev.brandIds.filter((b) => b !== id) : [...prev.brandIds, id],
    }));
  const toggleTier = (tier: "premium" | "mid_range" | "budget") =>
    setFilters((prev) => ({
      ...prev,
      brandTiers: prev.brandTiers.includes(tier) ? prev.brandTiers.filter((t) => t !== tier) : [...prev.brandTiers, tier],
    }));

  return (
    <div className="container py-6 lg:py-10">
      <nav aria-label="Breadcrumb" className="mb-3 flex items-center gap-1 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to="/tyres" className="hover:text-foreground">Tyres</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{isVrnSearch ? formatRegistration(vrn) : cat?.name ?? "Search Results"}</span>
      </nav>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            {isVrnSearch
              ? `Tyres for ${formatRegistration(vrn)}`
              : brandRecord
                ? `${brandRecord.name} tyres`
                : cat
                  ? cat.name
                  : isCatalogueHub
                    ? "Browse our tyre catalogue"
                    : headlineSize
                      ? `Tyres ${headlineSize}`
                      : "Tyres for your vehicle"}
          </h1>
          {lookupFailed ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {lookupErrorDetails.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              {searchMeta && searchMeta.lastPage > 1 ? (
                <>
                  Page <strong className="text-foreground">{searchMeta.currentPage}</strong> of{" "}
                  <strong className="text-foreground">{searchMeta.lastPage}</strong> ·{" "}
                  <strong className="text-foreground">{apiTotal}</strong> tyres in stock
                </>
              ) : (
                <>
                  Showing <strong className="text-foreground">{totalCount}</strong> result{totalCount === 1 ? "" : "s"}
                  {apiTotal > totalCount && (
                    <> (filtered from <strong className="text-foreground">{apiTotal}</strong> in stock)</>
                  )}
                </>
              )}
              {headlineSize && <> for size <strong className="font-mono text-foreground">{headlineSize}</strong></>}
              {isVrnSearch && lookupVehicle && <> matched to <strong className="text-foreground">{lookupVehicle.displayName}</strong></>}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="flex rounded-lg border border-border/80 bg-muted/40 p-0.5"
            role="group"
            aria-label="Results view"
          >
            <Button
              type="button"
              variant={resultsView === "list" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 px-2.5"
              onClick={() => setResultsView("list")}
              aria-pressed={resultsView === "list"}
            >
              <List className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">List</span>
            </Button>
            <Button
              type="button"
              variant={resultsView === "card" ? "secondary" : "ghost"}
              size="sm"
              className="h-8 gap-1.5 px-2.5"
              onClick={() => setResultsView("card")}
              aria-pressed={resultsView === "card"}
            >
              <LayoutGrid className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cards</span>
            </Button>
          </div>

          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="h-9 w-[200px] text-sm">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <Filter className="h-4 w-4" /> Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm overflow-y-auto">
              <FiltersPanel brands={brands} filters={filters} setFilters={setFilters} adjust={adjustFilter} toggleBrand={toggleBrand} toggleTier={toggleTier} reset={resetAll} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <FiltersPanel brands={brands} filters={filters} setFilters={setFilters} adjust={adjustFilter} toggleBrand={toggleBrand} toggleTier={toggleTier} reset={resetAll} />
        </aside>

        <div>
          <div className="mb-6 rounded-xl border bg-card p-4 shadow-card">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-bold uppercase text-muted-foreground">Change size</p>
              {isVrnSearch && selectedFitment && (
                <span className="text-xs text-muted-foreground">
                  {sourceLabel ? `Resolved via ${sourceLabel}` : "Vehicle-based match"}
                </span>
              )}
            </div>
            <TyreSearchWidget variant="compact" />
          </div>

          {isVrnSearch && vehicleLookupQuery.data && (
            <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-foreground">
                {formatRegistration(vehicleLookupQuery.data.registration)} · {lookupVehicle?.displayName}
              </p>
              <p className="mt-1 text-muted-foreground">
                Selected fitment: <strong className="font-mono text-foreground">{fitmentSummary}</strong>
                {lookupVehicle?.bodyType && <> · {lookupVehicle.bodyType}</>}
                {lookupVehicle?.fuelType && <> · {lookupVehicle.fuelType}</>}
              </p>
              {sourceMessage && (
                <p className="mt-2 text-xs text-muted-foreground">{sourceMessage}</p>
              )}
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                {fitments.length > 1 ? (
                  <div>
                    <Label htmlFor="fitment-choice" className="mb-1.5 block text-xs uppercase tracking-wide text-muted-foreground">
                      Factory-approved size set
                    </Label>
                    <Select
                      value={selectedFitment ? String(selectedFitment.id) : undefined}
                      onValueChange={(value) => {
                        const next = fitments.find((fitment) => fitment.id === Number(value));
                        setSelectedFitmentId(Number(value));
                        setSelectedPosition(getDefaultPosition(next));
                      }}
                    >
                      <SelectTrigger id="fitment-choice" className="bg-background text-sm">
                        <SelectValue placeholder="Choose a fitment" />
                      </SelectTrigger>
                      <SelectContent>
                        {fitments.map((fitment) => (
                          <SelectItem key={fitment.id} value={String(fitment.id)}>
                            {fitment.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex items-center rounded-md border bg-background px-3 text-xs text-muted-foreground">
                    Exact fitment set resolved for this vehicle.
                  </div>
                )}

                {selectedFitment && selectedFitment.positions.length > 1 && (
                  <div>
                    <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">Axle view</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedFitment.positions.map((position) => (
                        <Button
                          key={`${selectedFitment.id}-${position.position}`}
                          type="button"
                          size="sm"
                          variant={selectedPosition === position.position ? "default" : "outline"}
                          onClick={() => setSelectedPosition(position.position)}
                        >
                          {formatPosition(position.position)}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {appliedSpeedFilter && (
            <div className="mb-6 rounded-lg border-l-4 border-info bg-info/10 p-3 text-sm">
              <p className="flex items-center gap-2 font-semibold"><Info className="h-4 w-4" /> Speed rating compliance</p>
              <p className="mt-1 text-muted-foreground">
                Showing tyres with speed rating <strong className="font-mono text-foreground">{appliedSpeedFilter}</strong> or higher to meet your manufacturer's specification. Fitting a lower-rated tyre may invalidate your insurance.
              </p>
            </div>
          )}

          {(isVrnSearch && vehicleLookupQuery.isLoading) || searchQuery.isLoading || bootstrapQuery.isLoading ? (
            <div className="rounded-xl border bg-card p-12 text-center shadow-card">
              <p className="font-display text-lg font-bold">{isVrnSearch ? "Looking up vehicle registration" : "Loading live catalogue"}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isVrnSearch ? "Resolving your vehicle fitment before loading live tyre results." : "Fetching live tyre results."}
              </p>
            </div>
          ) : isVrnSearch && vehicleLookupQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
              <p className="font-display text-lg font-bold">{lookupErrorDetails.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {lookupApiError?.code === "fitment_not_found" && lookupApiError.message
                  ? lookupApiError.message
                  : <>{lookupErrorDetails.description} <strong className="font-mono text-foreground">{formatRegistration(vrn)}</strong>. Try another registration or search by size instead.</>}
              </p>
            </div>
          ) : searchQuery.isError || bootstrapQuery.isError ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-12 text-center">
              <p className="font-display text-lg font-bold">Live catalogue is unavailable</p>
              <p className="mt-1 text-sm text-muted-foreground">The catalogue API could not be reached. Please try again in a moment.</p>
            </div>
          ) : totalCount === 0 ? (
            <div className="rounded-xl border border-dashed bg-muted/20 p-12 text-center">
              <p className="font-display text-lg font-bold">No matching tyres in stock</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isVrnSearch
                  ? `We found your vehicle fitment, but there are no matching tyres in stock right now. Try adjusting filters or call us on ${site.phone}.`
                  : `Try adjusting your filters or call us on ${site.phone} - we can usually source any size within 24 hours.`}

              </p>
              <Button onClick={resetAll} variant="outline" className="mt-4">Reset filters</Button>
            </div>
          ) : (
            <div className="space-y-10">
              {recommended.length > 0 && (
                <ResultsTier
                  label="Recommended for you"
                  subtitle="Hand-picked by our fitters as the best balance of grip, longevity, and price."
                  skus={recommended}
                  highlight
                  viewMode={resultsView}
                />
              )}
              {tierBuckets.premium.length > 0 && (
                <ResultsTier
                  label="Premium"
                  subtitle="Top-tier brands engineered for the highest grip and longevity."
                  skus={tierBuckets.premium}
                  viewMode={resultsView}
                />
              )}
              {tierBuckets.mid_range.length > 0 && (
                <ResultsTier
                  label="Mid-Range"
                  subtitle="A great balance of price, performance, and brand pedigree."
                  skus={tierBuckets.mid_range}
                  viewMode={resultsView}
                />
              )}
              {tierBuckets.budget.length > 0 && (
                <ResultsTier
                  label="Budget"
                  subtitle="Cost-effective options for low-mileage and second-vehicle use."
                  skus={tierBuckets.budget}
                  viewMode={resultsView}
                />
              )}
              {searchMeta && searchMeta.lastPage > 1 && (
                <CataloguePagination
                  currentPage={searchMeta.currentPage}
                  lastPage={searchMeta.lastPage}
                  onPageChange={goToPage}
                />
              )}
            </div>
          )}
        </div>
      </div>

      <span className="hidden">{params.toString()}</span>
    </div>
  );
}

function CataloguePagination({
  currentPage,
  lastPage,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center justify-center gap-2 pt-4" aria-label="Catalogue pagination">
      <Button type="button" variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)}>
        Previous
      </Button>
      <span className="px-2 text-sm text-muted-foreground">
        Page {currentPage} of {lastPage}
      </span>
      <Button type="button" variant="outline" size="sm" disabled={currentPage >= lastPage} onClick={() => onPageChange(currentPage + 1)}>
        Next
      </Button>
    </nav>
  );
}

function ResultsTier({
  label,
  subtitle,
  skus,
  highlight,
  viewMode,
}: {
  label: string;
  subtitle: string;
  skus: TyreSku[];
  highlight?: boolean;
  viewMode: ResultsViewMode;
}) {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className={cn("font-display text-xl font-extrabold sm:text-2xl", highlight && "text-primary")}>{label}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
        <span className="text-xs text-muted-foreground">{skus.length} option{skus.length === 1 ? "" : "s"}</span>
      </div>
      <div
        className={cn(viewMode === "list" ? "flex flex-col gap-3" : "grid gap-5 sm:grid-cols-2 xl:grid-cols-3")}
      >
        {skus.map((sku) => (
          <ResultCard key={sku.id} sku={sku} layout={viewMode} />
        ))}
      </div>
    </section>
  );
}

function FiltersPanel({
  brands,
  filters,
  adjust,
  toggleBrand,
  toggleTier,
  reset,
}: {
  brands: Brand[];
  filters: ActiveFilters;
  setFilters: (f: ActiveFilters) => void;
  adjust: (n: Partial<ActiveFilters>) => void;
  toggleBrand: (id: number) => void;
  toggleTier: (t: "premium" | "mid_range" | "budget") => void;
  reset: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-base font-bold">Filters</p>
        <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs">
          <RotateCcw className="h-3 w-3" /> Reset
        </Button>
      </div>

      <FilterGroup label="Delivery & Category">
        <CheckboxRow
          checked={filters.sameDayOnly}
          onChange={(v) => adjust({ sameDayOnly: v })}
          label="Same-Day Delivery"
        />
        <CheckboxRow
          checked={filters.within24hOnly}
          onChange={(v) => adjust({ within24hOnly: v })}
          label="Express Fitting (Within 24h)"
        />
        <CheckboxRow
          checked={filters.premiumOnly}
          onChange={(v) => adjust({ premiumOnly: v })}
          label="Premium Tyres Only"
        />
      </FilterGroup>

      <FilterGroup label="Specialist">
        {[
          { key: "extraLoad", label: "Extra Load (XL)" },
          { key: "fourByFour", label: "4x4 / SUV" },
          { key: "van", label: "Van" },
          { key: "runFlat", label: "Run Flat" },
          { key: "winter", label: "Winter" },
          { key: "allSeason", label: "All Season" },
          { key: "ev", label: "Electric Vehicle" },
        ].map((s) => {
          const k = s.key as keyof typeof filters.specialist;
          return (
            <CheckboxRow
              key={s.key}
              checked={filters.specialist[k]}
              onChange={(v) => adjust({ specialist: { ...filters.specialist, [k]: v } })}
              label={s.label}
            />
          );
        })}
      </FilterGroup>

      <FilterGroup label="Brand Tier">
        {(["premium", "mid_range", "budget"] as const).map((t) => (
          <CheckboxRow
            key={t}
            checked={filters.brandTiers.includes(t)}
            onChange={() => toggleTier(t)}
            label={brandTierLabel(t)}
          />
        ))}
      </FilterGroup>

      <FilterGroup label="Brand">
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {(["premium", "mid_range", "budget"] as const).map((tier) => (
            <div key={tier}>
              <p className="mb-1 mt-2 text-[10px] font-bold uppercase text-muted-foreground">
                {brandTierLabel(tier)}
              </p>
              <div className="space-y-1">
                {brands.filter((brand) => brand.tier === tier).map((b) => (
                  <CheckboxRow
                    key={b.id}
                    checked={filters.brandIds.includes(b.id)}
                    onChange={() => toggleBrand(b.id)}
                    label={b.name}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Price">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Max £{filters.priceMax || 300}</span>
          </div>
          <input
            type="range"
            min={50}
            max={300}
            step={10}
            value={filters.priceMax || 300}
            onChange={(e) => adjust({ priceMax: Number(e.target.value) })}
            className="w-full accent-primary"
            aria-label="Maximum price per tyre"
          />
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup label="Offers">
        <CheckboxRow
          checked={filters.offersOnly}
          onChange={(v) => adjust({ offersOnly: v })}
          label="Only show tyres with special offers"
        />
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function CheckboxRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  const id = `flt-${label.replace(/\s+/g, "-")}`;
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(Boolean(v))} />
      <Label htmlFor={id} className="cursor-pointer text-sm">{label}</Label>
    </div>
  );
}

function sortSkus(list: TyreSku[], sort: SortOption, brands: Brand[]): TyreSku[] {
  const copy = [...list];
  switch (sort) {
    case "price_asc": return copy.sort((a, b) => a.pricePerTyre - b.pricePerTyre);
    case "price_desc": return copy.sort((a, b) => b.pricePerTyre - a.pricePerTyre);
    case "fuel_efficiency": return copy.sort((a, b) => gradeOrder.indexOf(a.euLabel.fuelEfficiency) - gradeOrder.indexOf(b.euLabel.fuelEfficiency));
    case "wet_grip": return copy.sort((a, b) => gradeOrder.indexOf(a.euLabel.wetGrip) - gradeOrder.indexOf(b.euLabel.wetGrip));
    case "external_noise": return copy.sort((a, b) => a.euLabel.externalNoise - b.euLabel.externalNoise);
    case "premium_brands": return copy.sort((a, b) => tierWeight(a.brandId, brands) - tierWeight(b.brandId, brands));
    case "budget_brands": return copy.sort((a, b) => tierWeight(b.brandId, brands) - tierWeight(a.brandId, brands));
    case "mid_range_brands": return copy.sort((a, b) => Math.abs(tierWeight(a.brandId, brands) - 1) - Math.abs(tierWeight(b.brandId, brands) - 1));
    default: return copy.sort((a, b) => {
      const ar = a.badges.includes("recommended") ? 1 : 0;
      const br = b.badges.includes("recommended") ? 1 : 0;
      if (ar !== br) return br - ar;
      return b.starRating - a.starRating;
    });
  }
}

function tierWeight(brandId: number, brands: Brand[]): number {
  const brand = brands.find((b) => Number(b.id) === Number(brandId));
  if (!brand) return 1;
  return brand.tier === "premium" ? 0 : brand.tier === "mid_range" ? 1 : 2;
}

function getDefaultPosition(fitment: VehicleLookupFitmentSet | null | undefined): VehicleLookupFitmentPosition["position"] {
  return fitment?.defaultPosition ?? fitment?.positions[0]?.position ?? "all_round";
}

function resolveActivePosition(
  fitment: VehicleLookupFitmentSet | null,
  requestedPosition: VehicleLookupFitmentPosition["position"],
): VehicleLookupFitmentPosition | null {
  if (!fitment) return null;

  return fitment.positions.find((position) => position.position === requestedPosition)
    ?? fitment.positions.find((position) => position.position === "all_round")
    ?? fitment.positions[0]
    ?? null;
}

function matchesSpeedRequirement(speedRating: string, requiredRating: string): boolean {
  return speedWeight(speedRating) >= speedWeight(requiredRating);
}

function speedWeight(speedRating: string): number {
  switch (speedRating.toUpperCase()) {
    case "C": return 1;
    case "G": return 2;
    case "H": return 3;
    case "Q": return 4;
    case "R": return 5;
    case "S": return 6;
    case "T": return 7;
    case "V": return 8;
    case "W": return 9;
    case "X": return 10;
    case "Y": return 11;
    case "Z":
    case "ZR":
      return 12;
    default:
      return 0;
  }
}

function formatPosition(position: VehicleLookupFitmentPosition["position"]): string {
  switch (position) {
    case "all_round": return "All-round";
    case "front": return "Front";
    case "rear": return "Rear";
    case "spare": return "Spare";
    default: return position;
  }
}

function getLookupErrorDetails(error: ApiError | null): { title: string; description: string } {
  switch (error?.code) {
    case "invalid_registration":
      return {
        title: "Invalid registration",
        description: "Enter a valid UK registration before we can resolve the vehicle fitment for",
      };
    case "fitment_not_found":
      return {
        title: "Vehicle found, fitment unavailable",
        description: "We identified the vehicle, but we do not have an exact fitment mapping for",
      };
    case "provider_unavailable":
      return {
        title: "Vehicle lookup unavailable",
        description: "Our live vehicle lookup service is temporarily unavailable for",
      };
    default:
      return {
        title: "Registration not found",
        description: "We could not find a fitment for",
      };
  }
}

function formatRegistration(registration: string): string {
  const normalized = registration.replace(/\s+/g, "").toUpperCase();
  return normalized.length > 4 ? `${normalized.slice(0, 4)} ${normalized.slice(4)}` : normalized;
}
