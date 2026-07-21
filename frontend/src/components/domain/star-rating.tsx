import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({ rating, reviewCount, size = "sm", showCount = true, className }: StarRatingProps) {
  const sizeClass = { sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" }[size];
  const stars = Array.from({ length: 5 }, (_, i) => i + 1);
  return (
    <div className={cn("inline-flex items-center gap-1", className)}>
      <div className="flex items-center" aria-label={`Rated ${rating} out of 5`}>
        {stars.map((s) => (
          <Star
            key={s}
            className={cn(
              sizeClass,
              s <= Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-muted text-muted",
            )}
          />
        ))}
      </div>
      <span className={cn("font-semibold", size === "sm" ? "text-xs" : "text-sm")}>{rating.toFixed(1)}</span>
      {showCount && reviewCount !== undefined && (
        <span className={cn("text-muted-foreground", size === "sm" ? "text-xs" : "text-sm")}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
