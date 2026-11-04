import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  ChevronRight,
  Heart,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HomeCtaBand,
  HomePhoneCta,
  HomeSection,
  HomeSectionHeader,
  HomeSplitLayout,
  HomeTextLink,
  homeStyles,
} from "@/components/home/home-layout";
import { AboutBrandBannerSection } from "@/components/about/about-brand-banner-section";
import { AboutIntroCardsSection } from "@/components/about/about-intro-cards-section";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { stripHtml } from "@/lib/sanitize-html";
import { TYRES_EGHAM_IMAGES } from "@/lib/thetyresegham-assets";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

const NAVY = "#1c2748";

const TEAM = [
  { name: "R Moniz", role: "Tyre technician", image: TYRES_EGHAM_IMAGES.teamMoniz },
  { name: "M Naseer", role: "Tyre technician", image: TYRES_EGHAM_IMAGES.teamNaseer },
  { name: "M Zaki", role: "Tyre technician", image: TYRES_EGHAM_IMAGES.teamZaki },
] as const;

const VALUES = [
  {
    icon: Heart,
    title: "Customer-first care",
    text: "Honest advice, clear pricing, and no pressure — we treat every driver the way we would want to be treated.",
  },
  {
    icon: Wrench,
    title: "Expert workmanship",
    text: "From tyre fitting and balancing to puncture repair, our technicians work to the highest safety standards.",
  },
  {
    icon: ShieldCheck,
    title: "Safety you can trust",
    text: "TyreSafe-approved practices, quality brands, and thorough checks before your vehicle leaves the workshop.",
  },
  {
    icon: Award,
    title: "Fair value",
    text: "Premium, mid-range and budget options so you get the right tyre for your car and your budget.",
  },
] as const;

const LOCAL_AREAS = [
  "Egham",
  "Staines",
  "Virginia Water",
  "Windsor",
  "Ashford",
  "Chertsey",
] as const;

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className={cn(homeStyles.card, "px-6 py-5 text-center")}>
      <p className="font-display text-2xl font-bold text-[#1c2748] sm:text-3xl">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

export default function AboutPage() {
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();

  usePageMeta({
    title: `About us | ${site.businessName}`,
    description: `Learn about ${site.businessName} — independent tyre fitting in Egham with workshop and mobile support.`,
    canonicalPath: "/about",
  });

  const brandCount = bootstrapQuery.data?.stats.brands ?? 0;
  const reviewCount = site.googleReviewCount;
  const reviewRating = site.googleReviewRating;
  const storyLead =
    (site.footerBlurb ? stripHtml(site.footerBlurb) : "") ||
    "Independent local tyre fitter with over two decades of experience serving Surrey, Berkshire and West London.";

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-foreground">About us</span>
        </nav>
      </div>

      {/* 1 — Hero */}
      <section className="relative z-10 min-h-[540px] overflow-hidden border-b border-border/60 sm:min-h-[510px] lg:min-h-[590px]">
        <div
          className="absolute inset-0 bg-[#1c2748] bg-cover bg-[center_right] bg-no-repeat"
          style={{
            backgroundImage: `url(${TYRES_EGHAM_IMAGES.aboutBanner})`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center right",
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#1c2748]/95 via-[#1c2748]/82 to-[#1c2748]/40"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1c2748]"
          aria-hidden="true"
        />

        <div className="container relative z-10 flex min-h-[540px] items-center py-12 sm:min-h-[510px] sm:py-14 lg:min-h-[590px] lg:py-16">
          <div className="max-w-3xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">About us</p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              Your local tyre experts in Egham
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/90 sm:text-lg">
              {site.businessName} is an independent tyre fitter serving Surrey and beyond — combining decades of
              experience with same-day fitting, mobile call-outs, and emergency roadside support.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="cta" className="rounded-lg">
                <Link to="/tyres">Find your tyres</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-lg border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
              >
                <Link to="/contact-us">Contact us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <AboutIntroCardsSection />

      <AboutBrandBannerSection />

      {/* 2 — Our story */}
      <HomeSection variant="default" ariaLabelledby="about-story-title">
        <div className="container">
          <HomeSplitLayout
            image={
              <img
                src={TYRES_EGHAM_IMAGES.completeVehicle}
                alt="Tyre technician fitting a wheel at the Egham workshop"
                className={cn(homeStyles.imageTall, "min-h-[320px] lg:min-h-[440px]")}
                width={667}
                height={1000}
                loading="lazy"
              />
            }
          >
            <HomeSectionHeader
              eyebrow="Our story"
              title="Built on trust, driven by service"
              titleId="about-story-title"
              description={storyLead}
              className="max-w-none"
            />
            <div className={cn(homeStyles.body, "mt-6 space-y-4")}>
              <p>
                We started with a simple goal: give drivers in Egham and the surrounding area a garage they could rely
                on for tyres, fitting, repairs, and honest advice without the hard sell.
              </p>
              <p>
                Today we fit premium, mid-range and budget brands, run a busy workshop on {site.town ?? "Egham"}, and
                support customers with mobile tyre fitting and 24/7 emergency roadside assistance when you need us most.
              </p>
            </div>
            <div className="mt-8">
              <HomePhoneCta phone={site.phone} phoneTel={site.phoneTel} />
            </div>
          </HomeSplitLayout>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:mt-16">
            <StatCard value="20+" label="Years serving local drivers" />
            <StatCard
              value={brandCount > 0 ? `${brandCount}+` : "50+"}
              label="Tyre brands in stock"
            />
            <StatCard
              value={
                reviewRating && reviewCount
                  ? `${reviewRating.toFixed(1)}★`
                  : "4.9★"
              }
              label={
                reviewCount
                  ? `${reviewCount.toLocaleString()} Google reviews`
                  : "Highly rated on Google"
              }
            />
            <StatCard
              value={site.openingHoursNote?.split("·")[0]?.trim() ?? "Mon–Sat"}
              label="Workshop opening hours"
            />
          </div>
        </div>
      </HomeSection>

      {/* 3 — What we stand for */}
      <HomeSection variant="muted" ariaLabelledby="about-values-title">
        <div className="container">
          <HomeSectionHeader
            align="center"
            eyebrow="What we stand for"
            title="Why drivers choose Egham Tyres"
            titleId="about-values-title"
            description="Everything we do is focused on keeping you safe on the road — with transparent service and expertise you can count on."
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {VALUES.map((item) => (
              <div key={item.title} className={cn(homeStyles.card, "p-6 lg:p-7")}>
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-lg font-bold text-[#1c2748]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <HomeTextLink to="/services">View our services</HomeTextLink>
            <HomeTextLink to="/reviews">Read customer reviews</HomeTextLink>
          </div>
        </div>
      </HomeSection>

      {/* 4 — Meet the team */}
      <HomeSection variant="default" compact ariaLabelledby="about-team-title">
        <div className="container">
          <HomeSectionHeader
            align="center"
            eyebrow="Meet the team"
            title="Skilled technicians you can trust"
            titleId="about-team-title"
            description="Specialists in tyre sales, fitting, balancing, and comprehensive vehicle care — the people behind every job at our workshop."
            className="mx-auto"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {TEAM.map((member) => (
              <Card key={member.name} className={cn(homeStyles.card, "overflow-hidden border-0 p-0")}>
                <img
                  src={member.image}
                  alt={member.name}
                  className="aspect-[512/444] w-full object-cover object-top"
                  width={512}
                  height={444}
                  loading="lazy"
                />
                <CardContent className="p-6 text-center">
                  <p className="font-display text-lg font-semibold text-[#1c2748]">{member.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </HomeSection>

      {/* 5 — Local roots */}
      <section
        className="border-y border-border/60 bg-[#f7f5f2] py-16 lg:py-20"
        aria-labelledby="about-local-title"
      >
        <div className="container">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className={homeStyles.eyebrow}>Local expertise</p>
              <h2
                id="about-local-title"
                className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl"
                style={{ color: NAVY }}
              >
                Proudly serving Egham &amp; Surrey
              </h2>
              <p className={cn(homeStyles.lead, "mt-4 max-w-xl")}>
                Whether you need tyres fitted at the workshop, a mobile call-out at home or work, or emergency roadside
                help, we cover Egham and towns across Surrey, Berkshire and West London.
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {LOCAL_AREAS.map((area) => (
                  <li
                    key={area}
                    className="rounded-full border border-border/80 bg-white px-4 py-1.5 text-sm font-medium text-[#1c2748]"
                  >
                    {area}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="cta" size="lg" className="gap-2 rounded-lg">
                  <Link to="/areas-served">
                    Areas we serve
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 rounded-lg">
                  <Link to="/contact-us">
                    <MapPin className="h-4 w-4" aria-hidden="true" />
                    Visit our workshop
                  </Link>
                </Button>
              </div>
            </div>

            <div className={cn(homeStyles.card, "p-8 lg:p-10")}>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <Users className="h-6 w-6 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-display text-lg font-bold" style={{ color: NAVY }}>
                    {site.trustLine1 ?? "TyreSafe Approved Fitter"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {site.trustLine2 ??
                      "Independent Garage of the Year nominee — recognised for quality, safety and customer care."}
                  </p>
                </div>
              </div>
              {reviewRating && reviewCount > 0 && (
                <div className="mt-8 flex items-center gap-3 border-t border-border/60 pt-8">
                  <div className="flex text-primary" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-display text-lg font-bold text-[#1c2748]">
                      {reviewRating.toFixed(1)}
                    </span>{" "}
                    from {reviewCount.toLocaleString()} Google reviews
                  </p>
                </div>
              )}
              <p className="mt-6 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{site.fullAddress}</span>
                <br />
                {site.openingHoursNote ?? "Mon–Sat · 8:30am – 5:30pm"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6 — CTA */}
      <HomeCtaBand
        title="Ready to book your tyres?"
        description="Search by registration or size, reserve online, and pay when we fit — same-day appointments when stock allows."
        phone={site.phone}
        phoneTel={site.phoneTel}
      />
    </div>
  );
}
