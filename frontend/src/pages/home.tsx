import { HomeHeroSection } from "@/components/home/home-hero-section";
import { BrandSlider } from "@/components/domain/brand-slider";
import { TyreSearchMegaPanel } from "@/components/domain/tyre-search-mega-panel";
import { VehicleMotorcycleRoadsideSection } from "@/components/home/vehicle-motorcycle-roadside-section";
import {
  HomeCtaBand,
  HomeSection,
  HomeSectionHeader,
  HomeTextLink,
  homeStyles,
} from "@/components/home/home-layout";
import { ProfessionalTyreServicesSection } from "@/components/home/professional-tyre-services-section";
import { LatestTyresSlider } from "@/components/home/latest-tyres-slider";
import { WorkshopMobileServiceSection } from "@/components/home/workshop-mobile-service-section";
import { TrustedPartnerSection } from "@/components/home/trusted-partner-section";
import { CustomerTestimonialsSection } from "@/components/home/customer-testimonials-section";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { useSite } from "@/lib/site";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { cn } from "@/lib/utils";

const NAVY = "#1c2748";

const TEAM = [
  { name: "R Moniz", role: "Tyre technician", image: TYRES_EGHAM_IMAGES.teamMoniz },
  { name: "M Naseer", role: "Tyre technician", image: TYRES_EGHAM_IMAGES.teamNaseer },
] as const;

const PREMIUM_BRAND_NAMES = ["Michelin", "Goodyear", "Bridgestone", "Continental", "Pirelli", "Yokohama"] as const;

export default function HomePage() {
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();
  const brands = bootstrapQuery.data?.brands ?? [];
  const brandCount = bootstrapQuery.data?.stats.brands ?? brands.length;
  const brandsForSlider = [...brands].sort((a, b) => {
    const tierOrder = { premium: 0, mid_range: 1, budget: 2 } as const;
    const ta = tierOrder[a.tier as keyof typeof tierOrder] ?? 3;
    const tb = tierOrder[b.tier as keyof typeof tierOrder] ?? 3;
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="overflow-x-hidden [&>section]:my-0 [&>section[aria-label='Welcome']]:!pt-14 [&>section[aria-label='Welcome']]:md:!pt-[calc(2.25rem+4.5rem)]">
      <HomeHeroSection phone={site.phone} phoneTel={site.phoneTel} />

      {/* Search — same 1200px content width as the rest of the page */}
      <HomeSection
        variant="default"
        ariaLabel="Find your tyres"
        padded={false}
        className={cn(homeStyles.sectionYTight)}
      >
        <div className="container">
          <TyreSearchMegaPanel variant="home" className="mx-auto w-full max-w-[1200px]" />
        </div>
      </HomeSection>

      {/* Latest tyres — immediately after search */}
      <HomeSection variant="muted" ariaLabelledby="local-coverage-heading">
        <div className="container">
          <HomeSectionHeader
            align="center"
            eyebrow="Express fitting · within 24 hours"
            title="Book today, drive tomorrow — fast tyre fitting near you"
            description="Reserve your slot online, get fitted within 24 hours, and get back on the road with honest advice and quality brands."
            titleId="local-coverage-heading"
            className="mx-auto max-w-3xl"
          />
          <LatestTyresSlider className="mt-10 lg:mt-12" />
        </div>
      </HomeSection>

      <WorkshopMobileServiceSection
        phone={site.phone}
        phoneTel={site.phoneTel}
        openingHoursNote={site.openingHoursNote}
      />

      <TrustedPartnerSection className="!mt-0 !mb-0" />

      <ProfessionalTyreServicesSection />

      <VehicleMotorcycleRoadsideSection phone={site.phone} phoneTel={site.phoneTel} />

      <HomeCtaBand
        title="Need Fast, Reliable Vehicle or Motorcycle Help?"
        description="Call now for 24/7 roadside assistance, mobile tyre repair, flat tyre change, and emergency vehicle recovery. Get back on the road safely we're just a call away."
        phone={site.phone}
        phoneTel={site.phoneTel}
      />

      {/* Brands — white break so gray sections don't stack */}
      <HomeSection variant="default" ariaLabelledby="brands-we-fit-heading">
        <div className="container">
          <HomeSectionHeader
            align="center"
            eyebrow="Tyre brands"
            title="Brands we fit"
            description={`Trusted premium brands include ${PREMIUM_BRAND_NAMES.join(", ")} plus mid-range and budget options across ${brandCount} manufacturers.`}
            titleId="brands-we-fit-heading"
            className="mx-auto"
          />
          <BrandSlider
            brands={brandsForSlider}
            cardVariant="featured"
            fadeFrom="from-white"
            className="mt-10 lg:mt-12"
          />
          <div className="mt-10 text-center">
            <HomeTextLink to="/brands">View all brands</HomeTextLink>
          </div>
        </div>
      </HomeSection>

      <CustomerTestimonialsSection />

      {/* Team — white after testimonials gray */}
      <HomeSection variant="default" ariaLabelledby="meet-the-team-heading">
        <div className="container">
          <HomeSectionHeader
            align="center"
            eyebrow="Meet the team"
            title="Skilled technicians you can trust"
            description="Specialists in tyre sales, fitting, balancing, and comprehensive vehicle care."
            titleId="meet-the-team-heading"
            className="mx-auto"
          />
          <div className="mx-auto mt-10 grid max-w-3xl gap-5 sm:grid-cols-2 sm:gap-6 lg:mt-12 lg:gap-8">
            {TEAM.map((member) => (
              <article
                key={member.name}
                className="overflow-hidden rounded-2xl bg-[#f8f8f8] shadow-[0_4px_22px_rgba(28,39,72,0.06)] ring-1 ring-black/[0.04]"
              >
                <img
                  src={member.image}
                  alt={member.name}
                  className="aspect-[512/444] w-full object-cover object-top"
                  width={512}
                  height={444}
                  loading="lazy"
                />
                <div className="bg-white px-6 py-5 text-center">
                  <p className="font-display text-lg font-semibold" style={{ color: NAVY }}>
                    {member.name}
                  </p>
                  <p className="mt-1 text-sm text-[#64748b]">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </HomeSection>

      {/* Final CTA — hidden for now
      <HomeSection
        variant="brand"
        padded={false}
        className="relative min-h-[22rem] overflow-hidden !bg-transparent sm:min-h-[26rem] lg:min-h-[30rem]"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${TYRES_EGHAM_IMAGES.garageCta})` }}
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-brand/90" aria-hidden="true" />
        <div className="container relative z-10 flex min-h-[22rem] flex-col items-center justify-center gap-8 py-16 text-center sm:min-h-[26rem] sm:py-20 lg:min-h-[30rem] lg:py-24">
          <HomeSectionHeader
            align="center"
            light
            title="From our garage to you"
            description="Get honest advice, fair prices, and expert care from your trusted local team. Book your service today with confidence."
            className="max-w-2xl"
          />
        </div>
      </HomeSection>
      */}

      {bootstrapQuery.isError && (
        <div className="container py-6">
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-base text-amber-900">
            Live brand catalogue data is temporarily unavailable. Search, call, and WhatsApp still work as normal.
          </div>
        </div>
      )}
    </div>
  );
}
