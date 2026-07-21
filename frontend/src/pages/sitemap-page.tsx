import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { getCheckoutVisibleServices } from "@/lib/service-pricing";

interface SitemapSection {
  title: string;
  links: Array<{ to: string; label: string }>;
}

const STATIC_SECTIONS: SitemapSection[] = [
  {
    title: "Shop",
    links: [
      { to: "/", label: "Home" },
      { to: "/tyresearch/results?Width=205&Profile=55&Rim=16", label: "Example size search (205/55 R16)" },
      { to: "/brands", label: "All brands" },
      { to: "/makes", label: "Popular vehicle makes" },
      { to: "/offers", label: "Offers & vouchers" },
    ],
  },
  {
    title: "Help & content",
    links: [
      { to: "/blog", label: "Blog" },
      { to: "/faq/booking-faq", label: "Booking FAQ" },
      { to: "/blog/buying-premium-vs-budget-tyres", label: "Sample article" },
      { to: "/reviews", label: "Reviews" },
      { to: "/areas-served", label: "Areas we serve" },
    ],
  },
  {
    title: "Basket & booking",
    links: [
      { to: "/basket", label: "Basket" },
      { to: "/basket/services", label: "Basket — services" },
      { to: "/basket/checkout", label: "Checkout" },
      { to: "/booking/confirmation", label: "Confirmation (demo query)" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About us" },
      { to: "/contact-us", label: "Contact us" },
      { to: "/privacy", label: "Privacy" },
      { to: "/terms", label: "Terms" },
      { to: "/cookies", label: "Cookies" },
    ],
  },
];

export default function SitemapPage() {
  const bootstrapQuery = useApiBootstrapQuery();
  const services = getCheckoutVisibleServices(bootstrapQuery.data?.services ?? []);

  const sections: SitemapSection[] = [
    STATIC_SECTIONS[0],
    {
      title: "Services",
      links: [
        { to: "/services", label: "All services" },
        ...services.map((service) => ({
          to: `/services/details/${service.id}/${service.slug}`,
          label: service.name,
        })),
      ],
    },
    ...STATIC_SECTIONS.slice(1),
  ];

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Sitemap</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Sitemap</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Main routes in this build. Tyre detail URLs follow <code className="rounded bg-muted px-1 py-0.5 text-xs">/tyresearch/details/:id/:slug</code>
            {" "}from search results or brand pages.
          </p>
        </div>
      </section>

      <div className="container grid gap-10 py-12 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="border-b pb-2 font-display text-lg font-bold">{section.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-primary hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
