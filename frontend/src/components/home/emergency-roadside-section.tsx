import {
  Clock,
  Headphones,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { HomeSection, homeStyles } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Clock, title: "24/7 Availability", description: "Round-the-clock support" },
  { icon: Truck, title: "Mobile Team", description: "We come to you" },
  { icon: ShieldCheck, title: "Safety First", description: "Expert roadside care" },
  { icon: MapPin, title: "Local Coverage", description: "Egham & surrounding areas" },
] as const;

export function EmergencyRoadsideSection({
  phone,
  phoneTel,
}: {
  phone: string;
  phoneTel: string;
}) {
  return (
    <HomeSection variant="mutedSoft" ariaLabelledby="emergency-roadside-heading">
      <div className="container">
        <div className={cn("grid items-center", homeStyles.splitGap, "lg:grid-cols-2")}>
          <div className="order-2 lg:order-1">
            <div className="flex items-center justify-center gap-3 lg:justify-start">
              <span className="hidden h-px w-12 bg-primary/40 sm:block" aria-hidden="true" />
              <span className="inline-flex items-center gap-2.5">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary bg-background text-[10px] font-bold leading-none text-primary"
                  aria-hidden="true"
                >
                  24/7
                </span>
                <span className={homeStyles.eyebrow}>24/7 Roadside Support</span>
              </span>
              <span className="hidden h-px w-12 bg-primary/40 sm:block" aria-hidden="true" />
            </div>

            <h2
              id="emergency-roadside-heading"
              className="mt-6 text-center font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-left lg:text-[2.375rem]"
            >
              <span className="relative inline-block pb-2">
                Emergency
                <span
                  className="absolute bottom-0 left-0 h-1 w-full rounded-full bg-primary"
                  aria-hidden="true"
                />
              </span>{" "}
              Roadside Help
            </h2>

            <div className={cn(homeStyles.body, "mt-6 space-y-4 text-center lg:text-left")}>
              <p>
                Stranded with a flat tyre? The Tyres Egham provides fast and reliable emergency roadside tyre assistance
                in Egham and surrounding areas. Whether you need mobile tyre repair, puncture repair, tyre replacement, or
                urgent tyre fitting, our team responds quickly to get you back on the road safely.
              </p>
              <p>
                We offer 24/7 roadside tyre support, same-day service, and mobile tyre fitting near you, ensuring
                minimal downtime and maximum convenience.
              </p>
            </div>

            <ul className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <li key={title} className="text-center lg:text-left">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/20 bg-background text-primary lg:mx-0">
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-display text-sm font-semibold text-foreground">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                </li>
              ))}
            </ul>

            <div className={cn(homeStyles.card, "mt-10 overflow-hidden p-0")}>
              <div className="flex flex-col sm:flex-row">
                <a
                  href={`tel:${phoneTel}`}
                  className="flex flex-1 flex-col items-center justify-center gap-1 bg-primary px-6 py-7 text-center text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Phone className="h-6 w-6" aria-hidden="true" />
                  <span className="text-[11px] font-bold uppercase tracking-[0.2em]">Call now</span>
                  <span className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{phone}</span>
                </a>
                <div className="flex flex-1 items-center gap-4 border-t border-border/60 bg-[#f8f8f8] px-6 py-6 sm:border-l sm:border-t-0">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm ring-1 ring-border/60">
                    <Headphones className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className={homeStyles.bodySm}>
                    <span className="font-semibold text-foreground">One call. Fast help.</span> Get back on the road
                    with confidence.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative mx-auto max-w-lg lg:mx-0 lg:max-w-none">
              <div
                className={cn(
                  "relative overflow-hidden rounded-2xl shadow-card ring-1 ring-border/80",
                  "lg:[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]",
                )}
              >
                <img
                  src={TYRES_EGHAM_IMAGES.emergencyRoadside}
                  alt="Mobile tyre technician providing emergency roadside assistance"
                  className="aspect-[4/3] w-full object-cover sm:aspect-[5/4] lg:aspect-[4/5] lg:min-h-[500px]"
                  width={1024}
                  height={683}
                  loading="lazy"
                />
              </div>

              <div
                className={cn(
                  homeStyles.card,
                  "absolute bottom-4 left-4 right-4 flex items-center gap-4 border-0 bg-primary p-5 text-primary-foreground lg:left-[8%] lg:right-4",
                )}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <ShieldCheck className="h-6 w-6" strokeWidth={2.5} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-base font-semibold sm:text-lg">Your Safety is Our Priority</p>
                  <p className="mt-0.5 text-sm text-white/80">Professional help just one call away.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
