import { Link } from "react-router-dom";
import { ArrowRight, Star } from "lucide-react";
import { HomeSection, HomeTextLink } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const NAVY = "#1c2748";

const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Egham",
    service: "Roadside puncture repair",
    quote:
      "I got a flat tyre on the way to work, and the team came to my rescue within 30 minutes! Professional, friendly, and fixed my tyre on-site. I can't recommend their roadside service enough!",
  },
  {
    id: 2,
    name: "James R.",
    location: "Egham",
    service: "Tyre fitting & repairs",
    quote:
      "I've been using them for a while now and they never disappoint. From tyre fitting to quick repairs, the team is friendly, professional, and always gets the job done right.",
  },
] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CustomerTestimonialsSection() {
  return (
    <HomeSection
      id="home-testimonials"
      variant="muted"
      ariaLabelledby="customer-testimonials-heading"
    >
      <div className="container">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <header className="max-w-xl">
            <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              <span className="h-[2px] w-8 shrink-0 bg-primary" aria-hidden="true" />
              Happy clients
            </p>
            <h2
              id="customer-testimonials-heading"
              className="mt-4 font-display text-[1.625rem] font-bold leading-[1.12] sm:text-[2rem] lg:text-[2.375rem]"
              style={{ color: NAVY }}
            >
              Drivers across Egham trust us
            </h2>
            <p className="mt-4 max-w-md text-[0.9375rem] leading-relaxed text-[#64748b] sm:text-base">
              Real feedback from local customers same-day fitting, mobile call-outs, and honest advice when it
              matters.
            </p>
          </header>

          <div className="flex shrink-0 items-center gap-4 self-start rounded-2xl bg-white px-5 py-4 shadow-[0_4px_22px_rgba(28,39,72,0.07)] lg:self-auto">
            <img
              src={TYRES_EGHAM_IMAGES.googleReviews}
              alt="Google customer reviews"
              className="h-auto w-[9.5rem] object-contain sm:w-40"
              width={180}
              height={64}
              loading="lazy"
            />
            <div className="hidden border-l border-border/70 pl-4 sm:block">
              <p className="font-display text-2xl font-bold leading-none" style={{ color: NAVY }}>
                5.0
              </p>
              <div className="mt-1.5 flex gap-0.5 text-primary" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-[0.75rem] text-[#64748b]">Average rating</p>
            </div>
          </div>
        </div>

        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:mt-12 lg:gap-6" role="list">
          {TESTIMONIALS.map((t) => (
            <li key={t.id}>
              <figure
                className={cn(
                  "relative flex h-full flex-col overflow-hidden rounded-2xl bg-white p-6 sm:p-8",
                  "shadow-[0_4px_22px_rgba(28,39,72,0.07)] ring-1 ring-black/[0.04]",
                  "transition-shadow hover:shadow-[0_10px_32px_rgba(28,39,72,0.1)]",
                )}
              >
                <span
                  className="pointer-events-none absolute -right-2 -top-3 select-none font-display text-[7rem] font-bold leading-none text-primary/[0.07]"
                  aria-hidden="true"
                >
                  “
                </span>

                <div className="relative flex items-center gap-0.5 text-primary" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" aria-hidden="true" />
                  ))}
                </div>

                <blockquote
                  className="relative mt-5 flex-1 text-[0.9375rem] leading-relaxed sm:text-base sm:leading-relaxed"
                  style={{ color: NAVY }}
                >
                  <p>&ldquo;{t.quote}&rdquo;</p>
                </blockquote>

                <figcaption className="relative mt-7 flex items-center gap-3.5 border-t border-[#f0f0f0] pt-5">
                  <span
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
                    aria-hidden="true"
                  >
                    {initials(t.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-[0.9375rem] font-semibold" style={{ color: NAVY }}>
                      {t.name}
                    </p>
                    <p className="mt-0.5 text-[0.8125rem] text-[#64748b]">
                      {t.location} · {t.service}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row">
          <HomeTextLink to="/reviews">Read more reviews</HomeTextLink>
          <Link
            to="/contact-us"
            className="inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Share your experience
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </HomeSection>
  );
}
