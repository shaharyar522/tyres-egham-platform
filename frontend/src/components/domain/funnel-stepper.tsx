import { cn } from "@/lib/utils";
import type { BookingFunnelStep } from "@/types";

const STEPS: { key: BookingFunnelStep; label: string; percent: number }[] = [
  { key: "basket", label: "Basket", percent: 0 },
  { key: "services", label: "Services", percent: 50 },
  { key: "checkout", label: "Checkout", percent: 100 },
];

interface FunnelStepperProps {
  current: BookingFunnelStep;
  className?: string;
}

export function FunnelStepper({ current, className }: FunnelStepperProps) {
  const currentIdx = STEPS.findIndex((s) => s.key === current);
  const currentPercent = STEPS[currentIdx]?.percent ?? 0;

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isActive = idx === currentIdx;
          const isComplete = idx < currentIdx;
          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors",
                    isComplete && "border-primary bg-primary text-primary-foreground",
                    isActive && "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20",
                    !isActive && !isComplete && "border-border bg-background text-muted-foreground",
                  )}
                >
                  {idx + 1}
                </div>
                <span className={cn("mt-2 text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="-mt-6 h-0.5 flex-1 bg-border">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: idx < currentIdx ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <span>{currentPercent}% complete</span>
        <span>{100 - currentPercent}% remaining</span>
      </div>
    </div>
  );
}
