import { Link } from "react-router-dom";
import { Star, ShieldCheck, Award } from "lucide-react";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TrustRibbon({ className }: { className?: string }) {
  const site = useSite();

  return (
    <div className={cn("hidden border-b bg-slate-900 text-white md:block", className)}>
      <div className="container flex h-9 items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </span>
            <strong className="font-semibold">{site.googleReviewRating.toFixed(1)}</strong>
            <span className="text-white/70">on Google ({site.googleReviewCount} reviews)</span>
          </span>
          {site.trustLine1 && (
            <span className="hidden items-center gap-1.5 lg:inline-flex">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              {site.trustLine1}
            </span>
          )}
          {site.trustLine2 && (
            <span className="hidden items-center gap-1.5 xl:inline-flex">
              <Award className="h-3.5 w-3.5 text-amber-300" />
              {site.trustLine2}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4 text-white/80">
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/reviews" className="hover:text-white">Reviews</Link>
          <Link to="/contact-us" className="hover:text-white">Contact</Link>
          <Link to="/admin" className="text-white/60 hover:text-white">Manage my website</Link>
        </div>
      </div>
    </div>
  );
}
