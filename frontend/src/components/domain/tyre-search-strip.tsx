import type { ReactNode } from "react";
import { Car, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  TYRE_PROFILES,
  TYRE_RIMS,
  TYRE_SPEEDS,
  TYRE_WIDTHS,
  TyreSearchSkewButton,
  TyreSizeHelpDialog,
  TyreSizeSelect,
  useTyreSearchForm,
} from "@/components/domain/tyre-search-shared";

export function TyreSearchStrip({ className }: { className?: string }) {
  const search = useTyreSearchForm("vrn");

  return (
    <section
      className={cn("border-y-2 border-black bg-[#ffde00] text-black", className)}
      aria-label="Find your tyres"
    >
      <form onSubmit={search.handleSubmit} className="container py-4 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <h2 className="font-display text-lg font-bold italic tracking-tight sm:text-xl lg:text-2xl">
              FIND YOUR TYRE
            </h2>
            <div className="flex rounded-md border-2 border-black p-0.5" role="tablist" aria-label="Search method">
              <ModeTab
                active={search.mode === "vrn"}
                onClick={() => search.setMode("vrn")}
                icon={<Car className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                By reg
              </ModeTab>
              <ModeTab
                active={search.mode === "size"}
                onClick={() => search.setMode("size")}
                icon={<Gauge className="h-3.5 w-3.5" aria-hidden="true" />}
              >
                By size
              </ModeTab>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {search.mode === "vrn" ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                <div className="relative min-w-0 flex-1">
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
                    className="h-11 w-full rounded border-2 border-black bg-white pl-12 pr-3 text-center font-mono text-lg font-bold uppercase tracking-widest text-black outline-none ring-black/20 transition-shadow placeholder:text-black/35 focus-visible:ring-2"
                    aria-label="Vehicle registration"
                  />
                </div>
                <p className="text-xs text-black/75 sm:hidden">
                  We look up the correct tyre fitment for your vehicle from your registration.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                  <TyreSizeSelect
                    variant="strip"
                    label="Width"
                    value={search.width}
                    onChange={search.setWidth}
                    options={TYRE_WIDTHS.map(String)}
                  />
                  <TyreSizeSelect
                    variant="strip"
                    label="Ratio"
                    value={search.profile}
                    onChange={search.setProfile}
                    options={TYRE_PROFILES.map(String)}
                  />
                  <TyreSizeSelect
                    variant="strip"
                    label="Diameter"
                    value={search.rim}
                    onChange={search.setRim}
                    options={TYRE_RIMS.map(String)}
                  />
                  <TyreSizeSelect
                    variant="strip"
                    label="Speed"
                    value={search.speed}
                    onChange={search.setSpeed}
                    options={[...TYRE_SPEEDS]}
                    optionLabels={TYRE_SPEEDS.map((s) => (s === "any" ? "Any" : s))}
                    className="col-span-2 sm:col-span-1"
                  />
                </div>
                <TyreSizeHelpDialog />
              </div>
            )}
          </div>

          <TyreSearchSkewButton
            className="self-start lg:self-center"
            disabled={search.mode === "vrn" && !search.canSubmitVrn}
          />
        </div>

        {search.mode === "vrn" && (
          <p className="mt-2 hidden text-xs text-black/75 sm:block">
            We look up the correct tyre fitment for your vehicle from your registration.
          </p>
        )}
      </form>
    </section>
  );
}

function ModeTab({
  active,
  onClick,
  children,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  icon: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-display text-xs font-bold uppercase tracking-wide transition-colors sm:text-sm",
        active ? "bg-black text-[#ffde00]" : "bg-transparent text-black hover:bg-black/10",
      )}
    >
      {icon}
      {children}
    </button>
  );
}
