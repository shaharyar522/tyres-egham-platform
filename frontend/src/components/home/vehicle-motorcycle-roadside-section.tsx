import { Battery, Bike, Clock, MapPin, Wrench } from "lucide-react";
import { HomePhoneCta, HomeSection, homeStyles } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const NAVY = "#1c2748";

const ROADSIDE_POINTS = [
  {
    icon: Wrench,
    title: "Puncture repair",
    detail: "On-site fitting to get you moving again",
  },
  {
    icon: Battery,
    title: "Battery & breakdown",
    detail: "Jump starts and roadside checks",
  },
  {
    icon: Bike,
    title: "Cars & motorcycles",
    detail: "Support for cars, vans and bikes",
  },
  {
    icon: MapPin,
    title: "Local coverage",
    detail: "Egham and surrounding areas",
  },
] as const;

export function VehicleMotorcycleRoadsideSection({
  phone,
  phoneTel,
}: {
  phone: string;
  phoneTel: string;
}) {
  return (
    <HomeSection variant="muted" ariaLabelledby="vehicle-motorcycle-roadside-heading">
      <div className="container">
        <div
          className={cn(
            "grid items-stretch lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]",
            homeStyles.splitGap,
          )}
        >
          {/* Left — content stack with CTA pinned to bottom */}
          <div className="flex flex-col">
            <div>
              <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
                <span className="h-[2px] w-8 shrink-0 bg-primary" aria-hidden="true" />
                24/7 Roadside Support
              </p>

              <h2
                id="vehicle-motorcycle-roadside-heading"
                className="mt-4 font-display leading-[1.1]"
              >
                <span
                  className="block text-[1.625rem] font-bold sm:text-[2rem] lg:text-[2.375rem]"
                  style={{ color: NAVY }}
                >
                  Vehicle and Motorcycle
                </span>
                <span className="mt-0.5 block text-[1.625rem] font-bold text-primary sm:text-[2rem] lg:text-[2.375rem]">
                  Roadside Assistance
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-[#64748b] sm:text-base">
                Flat tyre, puncture or battery trouble The Tyres Egham sends a fully equipped mobile team to you.
                Fast, reliable help for cars and motorcycles, anytime.
              </p>

              <ul
                className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2"
                aria-label="Roadside services we cover"
              >
                {ROADSIDE_POINTS.map((item) => (
                  <li key={item.title} className="flex gap-3.5">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/[0.1] text-primary">
                      <item.icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span
                        className="block font-display text-[0.9375rem] font-semibold"
                        style={{ color: NAVY }}
                      >
                        {item.title}
                      </span>
                      <span className="mt-0.5 block text-[0.8125rem] leading-snug text-[#64748b]">
                        {item.detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-10">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <HomePhoneCta phone={phone} phoneTel={phoneTel} label="Call Now" className="w-full sm:w-auto" />
                <p className="flex items-center gap-2 text-[0.8125rem] text-[#64748b] sm:text-sm">
                  <Clock className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.25} aria-hidden="true" />
                  Available 24/7 call for immediate help
                </p>
              </div>
            </div>
          </div>

          {/* Right — image stretches to match left column height */}
          <div className="relative h-full min-h-[260px] sm:min-h-[300px] lg:min-h-full">
            <div className="absolute inset-0 overflow-hidden rounded-2xl shadow-[0_10px_40px_rgba(28,39,72,0.12)] ring-1 ring-border/60">
              <img
                src={TYRES_EGHAM_IMAGES.roadsideAssistance}
                alt="Mobile tyre technicians repairing a vehicle on a UK motorway at sunset"
                className="h-full w-full object-cover object-center"
                width={640}
                height={480}
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
