import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type TyreSizeSelectVariant = "strip" | "panel" | "default";

/** Mega-panel content surface (registration / size / brand tabs). */
export const TYRE_SEARCH_PANEL_SURFACE = "#ECEAE9";

export const TYRE_WIDTHS = [165, 175, 185, 195, 205, 215, 225, 235, 245, 255, 265, 275, 285, 295, 305];
export const TYRE_PROFILES = [30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80];
export const TYRE_RIMS = [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
export const TYRE_SPEEDS = ["any", "H", "T", "V", "W", "Y"] as const;

export type TyreSearchMode = "vrn" | "size";

export function useTyreSearchForm(defaultMode: TyreSearchMode = "vrn") {
  const navigate = useNavigate();
  const [mode, setMode] = useState<TyreSearchMode>(defaultMode);
  const [vrn, setVrn] = useState("");
  const [width, setWidth] = useState("205");
  const [profile, setProfile] = useState("55");
  const [rim, setRim] = useState("16");
  const [speed, setSpeed] = useState<string>("any");

  const submitVrn = () => {
    const normalized = vrn.replace(/\s+/g, "").trim().toUpperCase();
    if (!normalized) return false;
    navigate(`/vrnsearch/results?vrn=${encodeURIComponent(normalized)}`);
    return true;
  };

  const submitSize = () => {
    const params = new URLSearchParams({ Width: width, Profile: profile, Rim: rim });
    if (speed !== "any") params.set("Speed", speed);
    navigate(`/tyresearch/results?${params.toString()}`);
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "vrn") submitVrn();
    else submitSize();
  };

  return {
    mode,
    setMode,
    vrn,
    setVrn,
    width,
    setWidth,
    profile,
    setProfile,
    rim,
    setRim,
    speed,
    setSpeed,
    submitVrn,
    submitSize,
    handleSubmit,
    canSubmitVrn: vrn.replace(/\s+/g, "").trim().length > 0,
  };
}

export function TyreSizeHelpDialog({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 text-xs font-medium text-black/80 underline-offset-2 hover:text-black hover:underline",
            className,
          )}
        >
          <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
          How do I find my tyre size?
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How to find your tyre size</DialogTitle>
          <DialogDescription>
            Your tyre size is printed on the sidewall and matches the format <strong>205/55 R16 91V</strong>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-muted/50 p-4">
            <p className="font-mono text-base font-bold">205/55 R16 91V</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>
                <strong className="text-foreground">205</strong> — width in millimetres
              </li>
              <li>
                <strong className="text-foreground">55</strong> — profile (% of width)
              </li>
              <li>
                <strong className="text-foreground">R16</strong> — rim diameter in inches
              </li>
              <li>
                <strong className="text-foreground">91</strong> — load index
              </li>
              <li>
                <strong className="text-foreground">V</strong> — speed rating
              </li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            Check the driver door shut panel or your owner&apos;s manual if the sidewall is hard to read.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TyreSizeSelect({
  label,
  value,
  onChange,
  options,
  optionLabels,
  variant = "strip",
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  optionLabels?: string[];
  variant?: TyreSizeSelectVariant;
  className?: string;
}) {
  if (variant === "panel") {
    return (
      <label className={cn("block min-w-0", className)}>
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {label}
        </span>
        <div className="relative">
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "h-11 w-full cursor-pointer appearance-none rounded-lg border border-black/15",
              "bg-[#ECEAE9] pl-3 pr-10 font-display text-base font-semibold text-foreground shadow-none",
              "outline-none transition-colors hover:border-black/25",
              "focus:border-primary/40 focus:ring-2 focus:ring-primary/15 focus:ring-offset-0",
            )}
            aria-label={label}
          >
            {options.map((opt, i) => (
              <option key={`${opt}-${i}`} value={opt}>
                {optionLabels?.[i] ?? opt}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </label>
    );
  }

  const isYellow = variant === "strip";

  return (
    <div className={cn("block min-w-0", className)}>
      <span
        className={cn(
          "mb-1.5 block font-bold uppercase tracking-[0.12em]",
          isYellow ? "text-[10px] text-black/80" : "text-xs text-muted-foreground",
        )}
      >
        {label}
      </span>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger
          aria-label={label}
          className={cn(
            "w-full font-display font-semibold transition-all",
            isYellow
              ? cn(
                  "h-11 rounded-lg border-black/20 bg-white px-3 text-base text-black shadow-sm",
                  "hover:border-black/35 hover:bg-white",
                  "focus:border-black/40 focus:ring-2 focus:ring-black/15 focus:ring-offset-0",
                )
              : cn(
                  "h-11 rounded-lg border-input bg-background px-3 text-base text-foreground shadow-sm",
                  "hover:border-primary/30",
                  "focus:ring-2 focus:ring-ring focus:ring-offset-2",
                ),
          )}
        >
          <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
        </SelectTrigger>
        <SelectContent
          className={cn(
            "z-[200] max-h-64 overflow-y-auto rounded-xl border shadow-xl",
            isYellow
              ? "border-black/10 bg-white text-black"
              : "border-border bg-popover",
          )}
          position="popper"
          sideOffset={6}
        >
          {options.map((opt, i) => (
            <SelectItem
              key={`${opt}-${i}`}
              value={opt}
              className={cn(
                "cursor-pointer rounded-md py-2.5 pl-8 pr-3 font-display text-sm font-semibold",
                isYellow
                  ? "focus:bg-black focus:text-[#ffde00] data-[highlighted]:bg-black/90 data-[highlighted]:text-[#ffde00]"
                  : "focus:bg-primary focus:text-primary-foreground",
              )}
            >
              {optionLabels?.[i] ?? opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function TyreSearchSkewButton({
  label = "FIND TYRES",
  disabled,
  className,
}: {
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "group relative shrink-0 transition-opacity disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      aria-label={label}
    >
      <span
        className="inline-block border-2 border-black bg-transparent px-6 py-2.5 font-display text-xs font-bold uppercase tracking-wider transition-colors group-hover:enabled:bg-black group-hover:enabled:text-[#ffde00] sm:px-9 sm:text-sm"
        style={{ transform: "skewX(-18deg)" }}
      >
        <span className="inline-block" style={{ transform: "skewX(18deg)" }}>
          {label}
        </span>
      </span>
    </button>
  );
}

/** Rectangular submit button for the Find Tyres mega panel (header + home). */
export function TyreSearchSubmitButton({
  label = "FIND TYRES",
  disabled,
  className,
}: {
  label?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      disabled={disabled}
      variant="cta"
      size="lg"
      className={cn(
        "h-11 min-w-[10.5rem] shrink-0 rounded-lg px-8 font-display text-xs font-bold uppercase tracking-[0.14em]",
        className,
      )}
      aria-label={label}
    >
      {label}
    </Button>
  );
}
