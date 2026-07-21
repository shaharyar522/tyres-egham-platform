import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { ContactForm } from "@/components/contact/contact-form";
import { ContactMap } from "@/components/contact/contact-map";
import { HomeCtaBand, homeStyles } from "@/components/home/home-layout";
import { Button } from "@/components/ui/button";
import { googleMapsDirectionsUrl, whatsAppUrl } from "@/lib/google-maps";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

function ContactDetailCard({
  icon: Icon,
  title,
  children,
  href,
}: {
  icon: typeof Phone;
  title: string;
  children: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{title}</p>
        <div className="mt-1.5 text-sm font-medium leading-snug text-[#1c2748]">{children}</div>
      </div>
    </>
  );

  const className = cn(
    homeStyles.card,
    "flex gap-4 p-5 transition-colors",
    href && "hover:border-primary/30 hover:shadow-md",
  );

  if (href) {
    return (
      <a href={href} className={className}>
        {inner}
      </a>
    );
  }

  return <div className={className}>{inner}</div>;
}

export default function ContactUsPage() {
  const site = useSite();
  const directionsUrl = googleMapsDirectionsUrl(site.fullAddress, site.googleBusinessUrl);
  const waUrl = whatsAppUrl(site.phoneTel);

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-foreground">Contact us</span>
        </nav>
      </div>

      <section className="relative min-h-[280px] overflow-hidden border-b border-border/60 sm:min-h-[320px] lg:min-h-[360px]">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${TYRES_EGHAM_IMAGES.contactBanner})` }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#1c2748]/95 via-[#1c2748]/82 to-[#1c2748]/55"
          aria-hidden="true"
        />

        <div className="container relative z-10 flex min-h-[280px] items-center py-12 sm:min-h-[320px] sm:py-14 lg:min-h-[360px] lg:py-16">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground/90">
              Get in touch
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Contact {site.businessName}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              Questions about tyres, fitting, or a booking? Send us a message, call the workshop, or
              drop in — we&apos;re here to help drivers across Egham and Surrey.
            </p>
            {(site.trustLine1 || site.trustLine2) && (
              <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-white/80">
                {site.trustLine1 && <li>{site.trustLine1}</li>}
                {site.trustLine2 && <li>{site.trustLine2}</li>}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="py-14 lg:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
            <div className="lg:col-span-5 xl:col-span-5">
              <div className={cn(homeStyles.card, "p-7 sm:p-8 lg:sticky lg:top-28")}>
                <p className={homeStyles.eyebrow}>Send a message</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#1c2748] sm:text-[1.65rem]">
                  Contact form
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  We aim to reply within one working day. For urgent tyre help, call us directly.
                </p>
                <div className="mt-7">
                  <ContactForm />
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-7 xl:col-span-7">
              <div>
                <p className={homeStyles.eyebrow}>Direct contact</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-[#1c2748]">
                  Workshop details
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <ContactDetailCard icon={Phone} title="Phone" href={`tel:${site.phoneTel}`}>
                  {site.phone}
                </ContactDetailCard>
                <ContactDetailCard icon={Mail} title="Email" href={`mailto:${site.email}`}>
                  {site.email}
                </ContactDetailCard>
                <ContactDetailCard icon={Clock} title="Opening hours">
                  {site.openingHoursNote ?? "Mon–Sat · 8:30am – 5:30pm"}
                </ContactDetailCard>
                <ContactDetailCard icon={MapPin} title="Address" href={directionsUrl}>
                  <span className="block">{site.addressLine1}</span>
                  {site.addressLine2 && <span className="block">{site.addressLine2}</span>}
                  <span className="block">
                    {[site.town, site.postcode].filter(Boolean).join(", ")}
                  </span>
                </ContactDetailCard>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg" variant="cta" className="gap-2 rounded-lg">
                  <a href={`tel:${site.phoneTel}`}>
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    Call now
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2 rounded-lg">
                  <a href={waUrl} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" aria-hidden="true" />
                    WhatsApp
                  </a>
                </Button>
              </div>

              <ContactMap
                address={site.fullAddress}
                businessName={site.businessName}
                placeUrl={site.googleBusinessUrl}
              />
            </div>
          </div>
        </div>
      </section>

      <HomeCtaBand
        title="Need tyres fitted today?"
        description="Search by registration or size, reserve online, and pay when we fit — same-day slots when stock allows."
        phone={site.phone}
        phoneTel={site.phoneTel}
      />
    </div>
  );
}
