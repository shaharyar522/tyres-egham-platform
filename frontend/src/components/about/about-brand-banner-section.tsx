import { Link } from "react-router-dom";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

/** Split brand banner above Our story (Egham Tyres artwork). */
export function AboutBrandBannerSection({ className }: { className?: string }) {
  const site = useSite();

  return (
    <section
      className={cn("w-full overflow-hidden border-y border-black/10", className)}
      aria-label={`${site.businessName} tyres`}
    >
      <Link
        to="/tyres"
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <img
          src={TYRES_EGHAM_IMAGES.aboutTyreEgham}
          alt={`${site.businessName} — premium tyres fitted in Egham and Surrey`}
          className="block h-auto min-h-[120px] w-full object-cover object-center sm:min-h-[160px] md:min-h-[200px] lg:min-h-[240px]"
          width={1920}
          height={400}
          loading="lazy"
        />
      </Link>
    </section>
  );
}
