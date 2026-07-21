import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { SiteLogo } from "@/components/domain/site-logo";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { HtmlContent } from "@/components/domain/html-content";
import { useSite } from "@/lib/site";

const FOOTER_LINKS = [
  { label: "About Us", to: "/about" },
  { label: "Reviews", to: "/reviews" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
  { label: "Sitemap", to: "/sitemap" },
  { label: "Cookies", to: "/cookies" },
  { label: "Contact Us", to: "/contact-us" },
];

export function SiteFooter() {
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();
  const categories = bootstrapQuery.data?.categories ?? [];
  const brands = bootstrapQuery.data?.brands ?? [];
  const services = bootstrapQuery.data?.services ?? [];
  const brandsByTier = (tier: "premium" | "mid_range" | "budget") => brands.filter((brand) => brand.tier === tier);

  return (
    <footer className="border-t border-white/10 bg-slate-950 text-slate-200 [&_h4]:text-white">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="mb-3">
              <SiteLogo placement="footer" className="text-white" />
            </div>
            {site.footerBlurb && (
              <HtmlContent html={site.footerBlurb} className="prose-p:text-slate-300 mb-4 max-w-xs text-sm text-slate-300" />
            )}
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`tel:${site.phoneTel}`} className="hover:text-white">{site.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-slate-300">{site.fullAddress}</span>
              </li>
            </ul>
            {(site.facebookUrl || site.instagramUrl || site.googleBusinessUrl) && (
              <p className="mt-3 flex flex-wrap gap-3 text-xs">
                {site.googleBusinessUrl && (
                  <a href={site.googleBusinessUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                    Google
                  </a>
                )}
                {site.facebookUrl && (
                  <a href={site.facebookUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                    Facebook
                  </a>
                )}
                {site.instagramUrl && (
                  <a href={site.instagramUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white">
                    Instagram
                  </a>
                )}
              </p>
            )}
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Tyres</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/tyresearch/results?TyreCategory=${c.slug}`} className="hover:text-white">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Top Brands</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              {brandsByTier("premium").slice(0, 8).map((b) => (
                <li key={b.id}>
                  <Link
                    to={`/tyre/brand/${b.id}/${b.slug}-tyres`}
                    className="inline-flex items-center gap-2 hover:text-white"
                  >
                    <BrandLogoMark brand={b} size="xs" className="border-white/10 bg-white" />
                    <span>{b.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Services</h4>
            <ul className="space-y-1.5 text-sm text-slate-300">
              {services.map((s) => (
                <li key={s.id}>
                  <Link to={`/services/details/${s.id}/${s.slug}`} className="hover:text-white">
                    {s.name}
                  </Link>
                </li>
              ))}
              <li><Link to="/offers" className="hover:text-white">Offers</Link></li>
              <li><Link to="/faq/booking-faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container flex flex-col items-center justify-between gap-3 py-4 text-xs text-slate-300 md:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {site.businessName}
            {site.showPrototypeNotice ? ". Prototype build for client review." : "."}
          </p>
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
            {FOOTER_LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-white">{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/admin" className="text-slate-400 hover:text-white">
                Manage my website
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
