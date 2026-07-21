import { Award } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { OeApproval } from "@/types";
import { cn } from "@/lib/utils";

export function OeBadge({ approval, className }: { approval: OeApproval; className?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-md border border-[#1c2748]/15 bg-[#f8f8f8] px-2 py-0.5 text-[11px] font-bold text-[#1c2748]",
              className,
            )}
          >
            <Award className="h-3 w-3" />
            {approval.code}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">
            <span className="font-semibold">{approval.manufacturer} OE Approval:</span> {approval.description}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function OeBadgeRow({ approvals, className }: { approvals: OeApproval[]; className?: string }) {
  if (approvals.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {approvals.map((a) => (
        <OeBadge key={a.code} approval={a} />
      ))}
    </div>
  );
}
