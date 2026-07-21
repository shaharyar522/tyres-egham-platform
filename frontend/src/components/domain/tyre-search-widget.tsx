import { Car, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  TYRE_PROFILES,
  TYRE_RIMS,
  TYRE_SPEEDS,
  TYRE_WIDTHS,
  TyreSizeHelpDialog,
  TyreSizeSelect,
  useTyreSearchForm,
} from "@/components/domain/tyre-search-shared";

type Variant = "compact" | "expanded";

export function TyreSearchWidget({
  variant = "expanded",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const search = useTyreSearchForm("vrn");

  return (
    <div
      className={cn(
        "rounded-2xl bg-card p-4 shadow-elev-2 ring-1 ring-border",
        variant === "expanded" && "p-5 sm:p-6",
        className,
      )}
    >
      <Tabs
        value={search.mode}
        onValueChange={(v) => search.setMode(v as "vrn" | "size")}
      >
        <TabsList className="grid w-full grid-cols-2 bg-muted/60">
          <TabsTrigger value="vrn" className="gap-2">
            <Car className="h-4 w-4" /> Search by Reg
          </TabsTrigger>
          <TabsTrigger value="size" className="gap-2">
            <Sparkles className="h-4 w-4" /> Search by Size
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vrn" className="mt-4">
          <form onSubmit={search.handleSubmit} className="space-y-3">
            <div>
              <Label htmlFor="vrn-input" className="mb-1.5 block">
                Vehicle registration
              </Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex w-12 items-center justify-center rounded-l-md bg-primary font-display text-sm font-bold text-white">
                    GB
                  </span>
                  <Input
                    id="vrn-input"
                    value={search.vrn}
                    onChange={(e) => search.setVrn(e.target.value.toUpperCase())}
                    placeholder="AB12 CDE"
                    className="h-12 pl-14 text-center font-mono text-lg font-bold uppercase tracking-widest"
                    maxLength={8}
                    aria-label="Vehicle registration"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  variant="cta"
                  className="h-12 gap-2 px-6 sm:px-8"
                  disabled={!search.canSubmitVrn}
                >
                  <Search className="h-5 w-5" /> Find tyres
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              We use your registration to look up the original-equipment tyre fitment for your vehicle.
            </p>
          </form>
        </TabsContent>

        <TabsContent value="size" className="mt-4">
          <form onSubmit={search.handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <TyreSizeSelect
                variant="default"
                label="Width"
                value={search.width}
                onChange={search.setWidth}
                options={TYRE_WIDTHS.map(String)}
              />
              <TyreSizeSelect
                variant="default"
                label="Profile"
                value={search.profile}
                onChange={search.setProfile}
                options={TYRE_PROFILES.map(String)}
              />
              <TyreSizeSelect
                variant="default"
                label="Rim"
                value={search.rim}
                onChange={search.setRim}
                options={TYRE_RIMS.map(String)}
              />
              <TyreSizeSelect
                variant="default"
                label="Speed"
                value={search.speed}
                onChange={search.setSpeed}
                options={[...TYRE_SPEEDS]}
                optionLabels={TYRE_SPEEDS.map((s) => (s === "any" ? "Any" : s))}
              />
            </div>
            <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
              <TyreSizeHelpDialog className="text-muted-foreground hover:text-primary" />
              <Button type="submit" size="lg" variant="cta" className="h-12 gap-2 px-6 sm:px-8">
                <Search className="h-5 w-5" /> Find tyres
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
