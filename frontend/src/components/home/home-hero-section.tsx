import { Check } from "lucide-react";
import { HomePhoneCta } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const HERO_POINTS = [
  "Vehicle or Motorcycle Premium & budget tyres available",
  "Same-day tyre fitting & repair",
  "Mobile tyre support available",
  "Professional & trusted technicians",
] as const;

export function HomeHeroSection({ phone, phoneTel }: { phone: string; phoneTel: string }) {
  return (
    <section
      className="relative min-h-[480px] overflow-hidden bg-muted lg:min-h-[560px]"
      aria-label="Welcome"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${TYRES_EGHAM_IMAGES.heroBanner})` }}
        aria-hidden="true"
      />

      <div className="container relative flex min-h-[400px] items-center py-12 sm:py-14 lg:min-h-[480px] lg:py-16">
        <article
          className={cn(
            "w-full max-w-[42rem] rounded-2xl bg-white p-7 sm:p-9 lg:p-10",
            "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] ring-1 ring-black/[0.06]",
          )}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary">Egham Tyres</p>

          <h1 className="mt-3 font-display text-[1.875rem] font-bold leading-[1.18] tracking-tight text-[#1c1c1c] sm:text-4xl lg:text-[2.625rem] lg:leading-[1.12]">
            Trusted Tyre &amp; Auto Services in Egham, UK
          </h1>

          <ul className="mt-7 space-y-3.5" aria-label="Why choose us">
            {HERO_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <span
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10"
                  aria-hidden="true"
                >
                  <Check className="h-4 w-4 text-primary" strokeWidth={2.75} />
                </span>
                <span className="text-base leading-snug text-[#333333] sm:text-[1.05rem]">{point}</span>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-col gap-5 border-t border-[#e5e5e5] pt-7 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <img
              src={TYRES_EGHAM_IMAGES.googleReviews}
              alt="Google customer reviews"
              className="h-auto w-[11.5rem] max-w-full shrink-0 object-contain sm:w-48"
              width={220}
              height={80}
              loading="eager"
            />

            <HomePhoneCta phone={phone} phoneTel={phoneTel} className="w-full sm:w-auto" />
          </div>
        </article>
      </div>
    </section>
  );
}
