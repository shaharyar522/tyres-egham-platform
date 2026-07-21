import type { ReactNode } from "react";
import type { EuLabel } from "@/types";
import { cn } from "@/lib/utils";
import { Droplets, Fuel, Volume2 } from "lucide-react";

const gradeColor: Record<string, string> = {
  A: "bg-emerald-600 text-white",
  B: "bg-lime-500 text-white",
  C: "bg-amber-500 text-white",
  D: "bg-orange-500 text-white",
  E: "bg-red-600 text-white",
};

function EuLabelChip({
  icon,
  label,
  grade,
  compact,
}: {
  icon: ReactNode;
  label: string;
  grade: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "inline-flex min-w-0 items-center rounded-lg border border-border/80 bg-background text-xs",
        compact ? "w-full gap-1 px-1.5 py-1" : "gap-1.5 px-2.5 py-1.5",
      )}
    >
      {icon}
      <span className="min-w-0 truncate text-muted-foreground">{label}</span>
      <span
        className={cn(
          "ml-auto flex shrink-0 items-center justify-center rounded font-bold",
          gradeColor[grade],
          compact ? "h-4 w-4 text-xs" : "h-5 w-5 text-xs",
        )}
      >
        {grade}
      </span>
    </div>
  );
}

export function EuLabelBadges({
  label,
  className,
  compact,
}: {
  label: EuLabel;
  className?: string;
  compact?: boolean;
}) {
  const iconSize = compact ? "h-3 w-3 shrink-0" : "h-3.5 w-3.5 shrink-0";

  return (
    <div
      className={cn(
        compact ? "grid grid-cols-3 gap-1" : "flex flex-wrap items-center gap-1.5",
        className,
      )}
    >
      <EuLabelChip
        compact={compact}
        icon={<Fuel className={cn(iconSize, "text-muted-foreground")} />}
        label="Fuel"
        grade={label.fuelEfficiency}
      />
      <EuLabelChip
        compact={compact}
        icon={<Droplets className={cn(iconSize, "text-muted-foreground")} />}
        label="Wet"
        grade={label.wetGrip}
      />
      <div
        className={cn(
          "inline-flex min-w-0 items-center rounded-lg border border-border/80 bg-background text-xs",
          compact ? "w-full gap-0.5 px-1.5 py-1" : "gap-1 px-2.5 py-1.5",
        )}
      >
        <Volume2 className={cn(iconSize, "text-muted-foreground")} />
        <span className="font-semibold tabular-nums">{label.externalNoise}</span>
        <span className="text-muted-foreground">dB</span>
        <span
          className={cn(
        "ml-auto rounded bg-[#f8f8f8] font-semibold text-foreground",
            compact ? "px-1 text-xs" : "px-1",
          )}
        >
          {label.noiseClass}
        </span>
      </div>
    </div>
  );
}
