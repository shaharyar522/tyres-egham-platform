import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

/** Shared spacing & typography for the home page */
export const homeStyles = {
  eyebrow: "text-xs font-bold uppercase tracking-[0.2em] text-primary",
  title: "font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl lg:text-[2.375rem] lg:leading-[1.15]",
  titleSm: "font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl",
  lead: "mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed",
  body: "text-base leading-relaxed text-muted-foreground",
  bodySm: "text-sm leading-relaxed text-muted-foreground sm:text-base",
  image: "w-full rounded-2xl object-cover ring-1 ring-border/80 shadow-card",
  imageTall: "aspect-[4/5] w-full rounded-2xl object-cover ring-1 ring-border/80 shadow-card",
  imageWide: "aspect-[4/3] w-full rounded-2xl object-cover ring-1 ring-border/80 shadow-card sm:aspect-[16/10]",
  card: "rounded-2xl border border-border/80 bg-card shadow-card",
  splitGap: "gap-10 lg:gap-14 xl:gap-16",
  /** Consistent vertical rhythm between home blocks */
  sectionY: "py-12 sm:py-14 lg:py-16",
  sectionYTight: "py-8 sm:py-10",
  /** Shared button styling for every CTA on the home page */
  btnCta: "gap-2 rounded-lg px-6 font-semibold sm:px-8",
  btnOutline: "gap-2 rounded-lg border-border bg-background font-semibold shadow-sm hover:bg-[#f8f8f8]",
  btnOutlineOnDark:
    "gap-2 rounded-lg border-white/40 bg-transparent font-semibold text-white hover:bg-white/10 hover:text-white",
} as const;

type BgVariant = "default" | "muted" | "mutedSoft" | "primary" | "brand" | "white";

const bgMap: Record<BgVariant, string> = {
  default: "bg-background",
  muted: "bg-[#f8f8f8]",
  mutedSoft: "bg-[#f8f8f8]",
  primary: "bg-primary text-primary-foreground",
  brand: "bg-brand text-white",
  white: "bg-background",
};

export function HomeSection({
  children,
  className,
  variant = "default",
  id,
  ariaLabel,
  ariaLabelledby,
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  variant?: BgVariant;
  id?: string;
  ariaLabel?: string;
  ariaLabelledby?: string;
  /** Apply standard vertical padding (turn off for full-bleed bands). */
  padded?: boolean;
  /** @deprecated No longer affects spacing; kept for call-site compatibility */
  compact?: boolean;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
      className={cn(
        bgMap[variant],
        "my-0",
        padded && homeStyles.sectionY,
        className,
      )}
    >
      {children}
    </section>
  );
}

export function HomeSectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  light = false,
  className,
  titleId,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
  titleId?: string;
}) {
  return (
    <header className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn(homeStyles.eyebrow, light && "text-white/85")}>{eyebrow}</p>
      )}
      <h2
        id={titleId}
        className={cn(
          homeStyles.title,
          eyebrow && "mt-3",
          !eyebrow && "mt-0",
          light && "text-white",
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn(homeStyles.lead, light && "text-white/90")}>{description}</p>
      )}
    </header>
  );
}

export function HomeSplitLayout({
  children,
  image,
  reverse = false,
  className,
}: {
  children: ReactNode;
  image: ReactNode;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid items-center",
        homeStyles.splitGap,
        reverse ? "lg:grid-cols-2" : "lg:grid-cols-2",
        className,
      )}
    >
      <div className={cn(reverse && "lg:order-2")}>{children}</div>
      <div className={cn("mx-auto w-full max-w-xl lg:max-w-none", reverse && "lg:order-1")}>{image}</div>
    </div>
  );
}

export function HomePhoneCta({
  phone,
  phoneTel,
  label,
  className,
}: {
  phone: string;
  phoneTel: string;
  /** Visible button text; defaults to the phone number. Link always uses phoneTel. */
  label?: string;
  className?: string;
}) {
  return (
    <Button asChild size="lg" variant="cta" className={cn(homeStyles.btnCta, className)}>
      <a href={`tel:${phoneTel}`}>
        <Phone className="h-4 w-4" aria-hidden="true" />
        {label ?? phone}
      </a>
    </Button>
  );
}

export function HomeCtaBand({
  title,
  description,
  phone,
  phoneTel,
  variant = "primary",
  backgroundImage = TYRES_EGHAM_IMAGES.ctaBand,
}: {
  title: string;
  description: string;
  phone: string;
  phoneTel: string;
  variant?: "primary" | "brand";
  backgroundImage?: string;
}) {
  const overlayClass = variant === "brand" ? "bg-brand/90" : "bg-primary/90";

  return (
    <HomeSection
      variant={variant}
      padded={false}
      ariaLabelledby="home-cta-band-title"
      className="relative min-h-[22rem] overflow-hidden !bg-transparent text-primary-foreground sm:min-h-[26rem] lg:min-h-[30rem]"
    >
      <div
        className="absolute inset-0 bg-cover bg-[center_right] bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <div className={cn("absolute inset-0", overlayClass)} aria-hidden="true" />

      <div className="container relative z-10 flex min-h-[22rem] flex-col items-center justify-center py-16 text-center sm:min-h-[26rem] sm:py-20 lg:min-h-[30rem] lg:py-24">
        <h2 id="home-cta-band-title" className={cn(homeStyles.title, "text-inherit")}>
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed opacity-90 sm:text-lg">{description}</p>
        <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
          <HomePhoneCta
            phone={phone}
            phoneTel={phoneTel}
            className="w-full !border-0 !bg-white !text-[#9E0404] shadow-md hover:!bg-white/90 hover:!text-[#9E0404]"
          />
          <HomeTextLink
            to="/contact-us"
            className="w-full !border-white/50 !bg-white !text-[#1c2748] shadow-md hover:!bg-white/90"
          >
            Enquire / Contact
          </HomeTextLink>
        </div>
      </div>
    </HomeSection>
  );
}

export function HomeCtaLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button asChild size="lg" variant="cta" className={cn(homeStyles.btnCta, className)}>
      <Link to={to}>
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}

export function HomeTextLink({
  to,
  children,
  className,
}: {
  to: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button asChild variant="outline" size="lg" className={cn(homeStyles.btnOutline, className)}>
      <Link to={to}>
        {children}
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Button>
  );
}
