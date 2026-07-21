import {
  Award,
  Clock,
  ShieldCheck,
  Tag,
  Truck,
  Wrench,
} from "lucide-react";
import { HomeSection } from "@/components/home/home-layout";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const MAROON = "#4a1018";

const GALLERY_PANELS = [
  {
    src: TYRES_EGHAM_IMAGES.promiseGalleryFirst,
    alt: "Premium Michelin tyre and alloy wheel",
    fit: "contain" as const,
    objectPosition: "center center",
    backgroundColor: "#ffffff",
    width: "26%",
    marginLeft: undefined,
    clipPath: "polygon(0 0, 100% 0, 92% 100%, 0 100%)",
    zIndex: 3,
    imageClassName: "object-contain p-1 sm:p-2",
  },
  {
    src: TYRES_EGHAM_IMAGES.heroBanner,
    alt: "Tyres Egham mobile tyre service van",
    fit: "fill" as const,
    objectPosition: "center center",
    backgroundColor: "#0f0f0f",
    width: "54%",
    marginLeft: "-7%",
    clipPath: "polygon(8% 0, 100% 0, 92% 100%, 0 100%)",
    zIndex: 2,
    imageClassName: "object-cover",
  },
  {
    src: TYRES_EGHAM_IMAGES.promiseGalleryThird,
    alt: "Tyre repair, fitting and wheel service at our workshop",
    fit: "cover" as const,
    objectPosition: "right center",
    backgroundColor: "#e5e7eb",
    width: "44%",
    marginLeft: "-7%",
    clipPath: "polygon(14% 0, 100% 0, 100% 100%, 0 100%)",
    zIndex: 1,
    imageClassName: "object-cover",
  },
] as const;

const PROMISE_FEATURES = [
  {
    num: "01",
    title: "Fast Service",
    text: "Same-day tyre repair and fitting when you need it most.",
    icon: Clock,
  },
  {
    num: "02",
    title: "Expert Team",
    text: "Skilled technicians for all vehicle types and fitments.",
    icon: Wrench,
  },
  {
    num: "03",
    title: "Top Tyre Brands",
    text: "Premium and budget options from trusted manufacturers.",
    icon: Award,
  },
  {
    num: "04",
    title: "Mobile & Roadside",
    text: "On-site repairs and emergency support across Egham.",
    icon: Truck,
  },
  {
    num: "05",
    title: "Transparent Pricing",
    text: "Fair, upfront costs with no hidden fees.",
    icon: Tag,
  },
  {
    num: "06",
    title: "Safety First",
    text: "Complete safety checks on every tyre we fit or repair.",
    icon: ShieldCheck,
  },
] as const;

function PromiseGalleryPanel({
  src,
  alt,
  width,
  marginLeft,
  clipPath,
  zIndex,
  fit,
  objectPosition,
  backgroundColor,
  imageClassName,
}: {
  src: string;
  alt: string;
  width: string;
  marginLeft?: string;
  clipPath: string;
  zIndex: number;
  fit: "contain" | "cover" | "fill";
  objectPosition: string;
  backgroundColor: string;
  imageClassName: string;
}) {
  return (
    <div
      className="relative h-full shrink-0 overflow-hidden"
      style={{ width, marginLeft, clipPath, zIndex, backgroundColor }}
    >
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn(
          "h-full w-full",
          fit === "fill"
            ? "absolute left-1/3 top-1/2 min-h-full min-w-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2"
            : "",
          imageClassName,
        )}
        style={{ objectPosition }}
      />
    </div>
  );
}

export function OurPromiseSection() {
  return (
    <HomeSection
      variant="default"
      ariaLabelledby="our-promise-heading"
      className="!bg-[#f8f8f8]"
    >
      <div className="container">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-block rounded-lg bg-white px-5 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-foreground shadow-[0_4px_18px_rgba(0,0,0,0.08)] sm:text-xs">
            Our promise
          </span>
          <h2
            id="our-promise-heading"
            className="mt-6 font-display text-[1.75rem] font-semibold leading-[1.15] text-[#1c2748] sm:text-4xl lg:text-[2.75rem]"
          >
            Your Go-To Team for{" "}
            <span style={{ color: MAROON }}>Tyres &amp; Roadside</span> Support
          </h2>
          <div className="mx-auto mt-5 flex max-w-3xl flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
            <p className="text-sm leading-relaxed text-[#64748b] sm:text-base sm:text-right">
              We go beyond standard tyre services with fast, reliable,
            </p>
            <span className="hidden h-10 w-px shrink-0 bg-[#cbd5e1] sm:block" aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[#64748b] sm:text-base sm:text-left">
              and affordable solutions — keeping you safe on the road with expert care.
            </p>
          </div>
        </div>

        {/* Slanted image gallery */}
        <div className="relative mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-white/80 bg-white shadow-[0_12px_40px_rgba(28,39,72,0.1)] sm:mt-12">
          <div className="relative flex h-[250px] sm:h-[310px] lg:h-[350px]">
            {GALLERY_PANELS.map((panel) => (
              <PromiseGalleryPanel key={panel.src} {...panel} />
            ))}
          </div>
        </div>

        {/* Feature grid */}
        <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 sm:mt-12">
          {PROMISE_FEATURES.map((item) => (
            <li
              key={item.num}
              className="relative flex gap-4 rounded-xl border border-white/60 bg-gradient-to-br from-[#eceef1] via-[#f4f5f7] to-[#e8eaed] p-5 shadow-[0_4px_20px_rgba(28,39,72,0.07)]"
            >
              <span className="absolute right-4 top-4 text-[11px] font-bold text-[#94a3b8]">{item.num}</span>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[#1c2748]/15 text-[#1c2748]">
                <item.icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
              </span>
              <div className="min-w-0 pr-6 pt-0.5">
                <p className="font-display text-[0.9375rem] font-semibold text-[#1c2748]">{item.title}</p>
                <p className="mt-1 text-[0.8125rem] leading-relaxed text-[#64748b]">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* Footer callout */}
        <div className="mx-auto mt-8 flex max-w-3xl items-center gap-5 rounded-2xl border border-white/80 bg-white px-6 py-5 shadow-[0_8px_30px_rgba(28,39,72,0.08)] sm:mt-10 sm:px-8 sm:py-6">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#1c2748] text-white shadow-md">
            <ShieldCheck className="h-7 w-7" strokeWidth={2} aria-hidden="true" />
          </span>
          <span className="hidden h-12 w-px shrink-0 bg-[#e2e8f0] sm:block" aria-hidden="true" />
          <div className="min-w-0">
            <p className="font-display text-base font-semibold text-[#1c2748] sm:text-lg">
              Safety, Reliability, Peace of Mind.
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[#64748b]">
              We&apos;re here whenever you need us. Your safety is our priority.
            </p>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
