import { CalendarDays, Check, Clock3, Phone } from "lucide-react";
import { HomePhoneCta, HomeSection } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";

const NAVY = "#1c2748";

const SERVICES = [
  "Tyre fitting & replacement",
  "Puncture repair",
  "Wheel balancing",
  "Mobile call-outs",
] as const;

export function WorkshopMobileServiceSection({
  phone,
  phoneTel,
  openingHoursNote,
}: {
  phone: string;
  phoneTel: string;
  openingHoursNote?: string | null;
}) {
  const hours = openingHoursNote?.trim() || "Mon–Sat · 8:30am – 5:30pm";

  return (
    <HomeSection
      id="home-workshop-service"
      variant="default"
      ariaLabelledby="workshop-mobile-service-heading"
      padded={false}
      className="pb-12 pt-12 sm:pb-14 sm:pt-14 lg:pb-16 lg:pt-16"
    >
      <div className="container">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="max-w-xl">
            <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
              <span className="h-[2px] w-8 shrink-0 bg-primary" aria-hidden="true" />
              Workshop &amp; mobile
            </p>

            <h2
              id="workshop-mobile-service-heading"
              className="mt-4 font-display text-[1.75rem] font-bold leading-[1.12] sm:text-[2rem] lg:text-[2.25rem]"
              style={{ color: NAVY }}
            >
              Care under one roof
            </h2>

            <div className="mt-4 space-y-3 text-[0.9375rem] leading-relaxed text-[#64748b] sm:text-base">
              <p>
                Fast, honest tyre and vehicle care from experienced technicians in our Egham workshop or at your
                location.
              </p>
              <p>
                From tyre replacement and puncture repair to wheel balancing and full fitting, we keep you moving with
                transparent pricing and reliable workmanship across Egham and surrounding areas.
              </p>
            </div>

            <ul className="mt-6 grid gap-2.5 sm:grid-cols-2" aria-label="Services included">
              {SERVICES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[0.875rem] sm:text-[0.9375rem]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.75} aria-hidden="true" />
                  </span>
                  <span className="font-medium" style={{ color: NAVY }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            <ul
              className="mt-7 space-y-3 rounded-2xl bg-[#f8f8f8] p-4 sm:p-5"
              aria-label="Workshop essentials"
            >
              <li className="flex items-center gap-3">
                <Clock3 className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
                <span className="text-[0.875rem] text-[#64748b]">
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Hours:
                  </span>{" "}
                  {hours}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
                <span className="text-[0.875rem] text-[#64748b]">
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Availability:
                  </span>{" "}
                  Same-day fitting
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
                <span className="text-[0.875rem] text-[#64748b]">
                  <span className="font-semibold" style={{ color: NAVY }}>
                    Booking:
                  </span>{" "}
                  Call or WhatsApp
                </span>
              </li>
            </ul>

            <div className="mt-7">
              <HomePhoneCta phone={phone} phoneTel={phoneTel} label="Call Now" className="w-full sm:w-auto" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(28,39,72,0.1)] ring-1 ring-black/[0.04]">
            <img
              src={TYRES_EGHAM_IMAGES.completeVehicle}
              alt="Tyre technician fitting a wheel in the workshop"
              className="aspect-[4/5] w-full object-cover object-center sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[28rem]"
              width={800}
              height={1000}
              loading="eager"
            />
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
