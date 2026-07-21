import { useEffect, useState } from "react";
import { Clock, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

function getCutoffStatus(now: Date): { stage: "fitTomorrow" | "orderNow" | "nextDayPromise"; minutes: number } {
  const cutoffHour = 16;
  const cutoff = new Date(now);
  cutoff.setHours(cutoffHour, 0, 0, 0);
  const diffMin = Math.round((cutoff.getTime() - now.getTime()) / 60000);
  if (diffMin > 30) return { stage: "fitTomorrow", minutes: diffMin };
  if (diffMin > 0) return { stage: "orderNow", minutes: diffMin };
  return { stage: "nextDayPromise", minutes: 0 };
}

export function CutoffTimer({ className, compact }: { className?: string; compact?: boolean }) {
  const [now, setNow] = useState(() => {
    const d = new Date();
    d.setHours(15, 35, 0, 0);
    return d;
  });

  useEffect(() => {
    const tick = setInterval(() => setNow((n) => new Date(n.getTime() + 60_000)), 60_000);
    return () => clearInterval(tick);
  }, []);

  const status = getCutoffStatus(now);

  if (status.stage === "fitTomorrow") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800", compact && "text-[11px]", className)}>
        <Clock className="h-3 w-3" />
        Book within {status.minutes} mins to fit tomorrow
      </div>
    );
  }

  if (status.stage === "orderNow") {
    return (
      <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 animate-pulse", compact && "text-[11px]", className)}>
        <Clock className="h-3 w-3" />
        Order now to fit tomorrow ({status.minutes} mins left)
      </div>
    );
  }

  return (
    <div className={cn("inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800", compact && "text-[11px]", className)}>
      <Truck className="h-3 w-3" />
      Next day fitting available
    </div>
  );
}
