import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  CircleDot,
  Home,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { HomeSection } from "@/components/home/home-layout";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { getCheckoutVisibleServices } from "@/lib/service-pricing";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const NAVY = "#1c2748";
const IMAGE_H = "h-[28rem] sm:h-[30rem] lg:h-[32rem]";

const SERVICE_ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Home,
  Wrench,
  CircleDot,
};

const NEW_TYRES_CARD = {
  title: "New Tyres",
  description:
    "Wide range of premium tyres for safety and performance expert advice to help you choose the best option.",
  icon: CircleDot,
  href: "/tyres",
} as const;

function SectionEyebrow({ children }: { children: string }) {
  return (
    <p className="inline-flex items-center justify-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
      <span className="h-[2px] w-8 shrink-0 bg-primary" aria-hidden="true" />
      {children}
    </p>
  );
}

export function ProfessionalTyreServicesSection() {
  const bootstrapQuery = useApiBootstrapQuery();
  const checkoutServices = getCheckoutVisibleServices(bootstrapQuery.data?.services ?? []);

  const serviceCards = [
    NEW_TYRES_CARD,
    ...checkoutServices.map((service) => ({
      title: service.name,
      description: service.shortDescription,
      icon: SERVICE_ICONS[service.iconName] ?? ShieldCheck,
      href: `/services/details/${service.id}/${service.slug}`,
    })),
  ];

  return (
    <HomeSection variant="default" ariaLabelledby="professional-services-heading">
      <div className="container">
        {/* Centered heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-12">
          <SectionEyebrow>Expert care, every mile</SectionEyebrow>
          <h2 id="professional-services-heading" className="mt-4 font-display leading-[1.08]">
            <span
              className="block text-[1.625rem] font-bold sm:text-[2rem] lg:text-[2.375rem]"
              style={{ color: NAVY }}
            >
              Professional Tyre Services
            </span>
            <span className="mt-0.5 block text-[1.625rem] font-bold text-primary sm:text-[2rem] lg:text-[2.375rem]">
              You Can Trust
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-[#64748b] sm:text-base">
            From new tyres to expert care and on-road support, we offer reliable advice and professional fitting for
            every journey.
          </p>
        </div>

        {/* Image + services — same height, bottom aligned */}
        <div className="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8 xl:gap-10">
          <div className={cn("relative overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(28,39,72,0.12)]", IMAGE_H)}>
            <img
              src={TYRES_EGHAM_IMAGES.professionalServices}
              alt="Tyre technician fitting a wheel at our Egham workshop"
              className="h-full w-full object-cover object-center"
              width={800}
              height={512}
              loading="lazy"
            />
            <div
              className="absolute inset-x-0 bottom-0 px-5 py-4 sm:px-6 sm:py-5"
              style={{
                backgroundColor: NAVY,
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)",
                backgroundSize: "16px 16px",
              }}
            >
              <div className="flex items-start gap-3.5 sm:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#1c2748] shadow-sm">
                  <ShieldCheck className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="font-display text-[0.9375rem] font-semibold text-white sm:text-base">
                    Safety checks on every job
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-white/80 sm:text-[0.8125rem]">
                    Every tyre change or repair includes a complete safety check to keep you on the road with
                    confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <ul className={cn("flex flex-col gap-3", IMAGE_H)} role="list">
            {serviceCards.map((service) => (
              <li key={service.href} className="flex min-h-0 flex-1">
                <Link
                  to={service.href}
                  className={cn(
                    "group flex h-full w-full items-center gap-4 rounded-xl border border-[#E8E8E8] bg-white px-4 py-3.5",
                    "shadow-[0_2px_10px_rgba(28,39,72,0.04)] transition-all duration-200",
                    "hover:border-primary/25 hover:shadow-[0_6px_20px_rgba(28,39,72,0.08)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    "sm:gap-5 sm:px-5 sm:py-4",
                  )}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-[#1c2748] transition-colors group-hover:bg-primary/10 group-hover:text-primary sm:h-12 sm:w-12">
                    <service.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1 text-left">
                    <span
                      className="block font-display text-[0.9875rem] font-semibold leading-snug sm:text-base"
                      style={{ color: NAVY }}
                    >
                      {service.title}
                    </span>
                    <span className="mt-1 block text-[0.8125rem] leading-relaxed text-[#64748b] sm:text-sm">
                      {service.description}
                    </span>
                  </span>
                  <ArrowRight
                    className="h-4 w-4 shrink-0 text-primary transition-transform duration-200 group-hover:translate-x-1"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </HomeSection>
  );
}
