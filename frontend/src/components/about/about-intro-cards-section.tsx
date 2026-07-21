import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { TYRES_EGHAM_COLORS } from "@/lib/thetyresegham-assets";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

const ACCENT_BLUE = TYRES_EGHAM_COLORS.link;

const WHAT_WE_DO = [
  "Tyre balancing",
  "Flat tyre repair",
  "Tyre installation",
  "Car servicing and repairs",
  "Mechanical work",
  "Scooter repairs",
] as const;

function IntroCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "rounded-sm bg-white px-7 py-8 shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:px-8 sm:py-9",
        className,
      )}
    >
      <span
        className="mb-5 block h-1 w-12 rounded-sm"
        style={{ backgroundColor: ACCENT_BLUE }}
        aria-hidden="true"
      />
      <h2 className="font-display text-xl font-bold tracking-tight text-[#1a1a1a] sm:text-[1.35rem]">
        {title}
      </h2>
      <div className="mt-4 text-[15px] leading-relaxed text-[#4b4f58]">{children}</div>
    </article>
  );
}

export function AboutIntroCardsSection() {
  const site = useSite();

  return (
    <section className="relative z-20 bg-[#f8f8f8] pb-14 sm:pb-16 lg:pb-20" aria-labelledby="about-who-title">
      <div className="container">
        <div className="relative -mt-20 grid gap-6 sm:-mt-24 sm:grid-cols-2 sm:gap-7 lg:-mt-28 lg:grid-cols-3 lg:gap-8">
          <IntroCard title="Who Are We">
            <p id="about-who-title">
              At {site.businessName}, we pride ourselves on delivering exceptional automotive services with a
              personal touch. Trust us as your local experts for all your tyre and mechanical needs.
            </p>
          </IntroCard>

          <IntroCard title="Our Mission">
            <p>
              To offer our customers honest advice, excellent service, and competitive prices, ensuring your vehicle
              performs at its best on the busy roads of Egham and beyond.
            </p>
          </IntroCard>

          <IntroCard title="What We Do" className="sm:col-span-2 lg:col-span-1">
            <ul className="space-y-3">
              {WHAT_WE_DO.map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: ACCENT_BLUE }}
                    aria-hidden="true"
                  />
                  <span className="text-[13px] font-semibold uppercase tracking-wide text-[#3a3a3a]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </IntroCard>
        </div>
      </div>
    </section>
  );
}
