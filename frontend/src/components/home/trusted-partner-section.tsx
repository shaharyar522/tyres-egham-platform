import { HomeCtaLink } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

export function TrustedPartnerSection({ className }: { className?: string }) {
  const site = useSite();

  return (
    <section
      id="home-trusted-partner"
      className={cn(
        "relative min-h-[26rem] overflow-hidden bg-black text-white sm:min-h-[28rem] lg:min-h-[32rem]",
        className,
      )}
      aria-labelledby="trusted-partner-title"
    >
      <div
        className="absolute inset-0 bg-cover bg-right bg-no-repeat"
        style={{ backgroundImage: `url(${TYRES_EGHAM_IMAGES.whyChooseUs})` }}
        aria-hidden="true"
      />

      <div className="container relative flex min-h-[26rem] items-center sm:min-h-[28rem] lg:min-h-[32rem]">
        <div className="max-w-lg lg:max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/75 sm:text-xs">
            Why drivers choose us
          </p>
          <h2
            id="trusted-partner-title"
            className="mt-4 font-display text-[1.75rem] font-bold uppercase italic leading-[1.12] text-white sm:text-4xl lg:text-[2.625rem]"
          >
            Trusted Tyre Fitting in Egham &amp; Surrey
          </h2>
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/90 sm:text-base sm:leading-relaxed">
            {site.businessName} is your independent local tyre specialist same-day fitting, mobile call-outs and
            24/7 emergency roadside support across Egham and surrounding areas. We fit premium, mid-range and budget
            brands with honest advice, fair prices and expert care you can rely on.
          </p>
          <HomeCtaLink to="/tyres" className="mt-8">
            Find your tyres
          </HomeCtaLink>
        </div>
      </div>
    </section>
  );
}
