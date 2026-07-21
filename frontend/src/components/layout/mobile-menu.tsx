import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronRight, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { brandTierLabel } from "@/lib/brand-tiers";
import { useSite } from "@/lib/site";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const site = useSite();
  const bootstrapQuery = useApiBootstrapQuery();
  const categories = bootstrapQuery.data?.categories ?? [];
  const brands = bootstrapQuery.data?.brands ?? [];
  const services = bootstrapQuery.data?.services ?? [];
  const brandsByTier = (tier: "premium" | "mid_range" | "budget") => brands.filter((brand) => brand.tier === tier);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Open menu"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[92vw] max-w-md overflow-y-auto p-0">
        <div className="flex h-14 items-center justify-between border-b bg-neutral-900 px-4 text-white">
          <span className="font-display text-lg font-bold uppercase tracking-wide">Menu</span>
          <Button variant="ghost" size="icon" onClick={close} className="text-white hover:bg-white/10" aria-label="Close menu">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Accordion type="multiple" className="px-4" defaultValue={["browse"]}>
          <AccordionItem value="browse">
            <AccordionTrigger className="font-display font-bold uppercase tracking-wide">Browse tyres</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1">
                <li>
                  <Link to="/tyres" onClick={close} className="flex items-center justify-between rounded-md px-2 py-2 text-sm font-semibold hover:bg-accent">
                    Full catalogue
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      to={`/tyresearch/results?TyreCategory=${c.slug}`}
                      onClick={close}
                      className="flex items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent"
                    >
                      {c.name}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="brands">
            <AccordionTrigger className="font-display font-bold uppercase tracking-wide">Brands</AccordionTrigger>
            <AccordionContent>
              {(["premium", "mid_range", "budget"] as const).map((tier) => (
                <div key={tier} className="mb-3">
                  <p className="mb-1 text-[11px] font-bold uppercase text-muted-foreground">
                    {brandTierLabel(tier)}
                  </p>
                  <ul className="space-y-1">
                    {brandsByTier(tier).slice(0, 8).map((b) => (
                      <li key={b.id}>
                        <Link
                          to={`/tyre/brand/${b.id}/${b.slug}-tyres`}
                          onClick={close}
                          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                        >
                          <BrandLogoMark brand={b} size="xs" />
                          <span className="truncate">{b.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <Link to="/brands" onClick={close} className="text-sm font-semibold text-primary hover:underline">
                View all brands
              </Link>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="services">
            <AccordionTrigger className="font-display font-bold uppercase tracking-wide">Services</AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1">
                {services.map((s) => (
                  <li key={s.id}>
                    <Link
                      to={`/services/details/${s.id}/${s.slug}`}
                      onClick={close}
                      className="block rounded-md px-2 py-2 text-sm hover:bg-accent"
                    >
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <nav className="border-t p-4" aria-label="Secondary">
          <ul className="space-y-1 text-sm font-semibold uppercase tracking-wide">
            <li>
              <Link to="/offers" onClick={close} className="block rounded-md px-2 py-2 hover:bg-accent">
                Offers
              </Link>
            </li>
            <li>
              <Link to="/about" onClick={close} className="block rounded-md px-2 py-2 hover:bg-accent">
                About
              </Link>
            </li>
            <li>
              <Link to="/blog" onClick={close} className="block rounded-md px-2 py-2 hover:bg-accent">
                Blog
              </Link>
            </li>
            <li>
              <Link to="/contact-us" onClick={close} className="block rounded-md px-2 py-2 hover:bg-accent">
                Contact
              </Link>
            </li>
          </ul>
          <a
            href={`tel:${site.phoneTel}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 font-display font-bold text-primary-foreground"
          >
            <Phone className="h-4 w-4" />
            {site.phone}
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
