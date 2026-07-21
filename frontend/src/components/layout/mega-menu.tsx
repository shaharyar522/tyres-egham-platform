import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import * as NavMenu from "@radix-ui/react-navigation-menu";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { stripHtml } from "@/lib/sanitize-html";
import { brandTierLabel } from "@/lib/brand-tiers";
import { cn } from "@/lib/utils";

export function MegaMenu({ className }: { className?: string }) {
  const bootstrapQuery = useApiBootstrapQuery();
  const categories = bootstrapQuery.data?.categories ?? [];
  const brands = bootstrapQuery.data?.brands ?? [];
  const makes = bootstrapQuery.data?.makes ?? [];
  const services = bootstrapQuery.data?.services ?? [];
  const content = bootstrapQuery.data?.content ?? [];
  const brandCount = bootstrapQuery.data?.stats.brands ?? brands.length;
  const brandsByTier = (tier: "premium" | "mid_range" | "budget") => brands.filter((brand) => brand.tier === tier);

  return (
    <NavMenu.Root className={cn("relative z-50 hidden lg:flex lg:justify-center", className)}>
      <NavMenu.List className="group flex list-none items-center gap-1">
        <MenuItem label="Tyres">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 p-6 lg:grid-cols-3 lg:w-[760px]">
            <div className="col-span-2 lg:col-span-3 flex items-center justify-between border-b pb-2">
              <p className="font-display text-sm font-bold uppercase text-muted-foreground">Shop tyres by category</p>
              <Link to="/tyres" className="text-xs text-primary underline-offset-2 hover:underline">View all categories</Link>
            </div>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/tyresearch/results?TyreCategory=${cat.slug}`}
                className="group flex flex-col gap-0.5 rounded-md p-2 hover:bg-accent"
              >
                <span className="text-sm font-semibold group-hover:text-primary">{cat.name}</span>
                <span className="line-clamp-2 text-xs text-muted-foreground">{stripHtml(cat.description)}</span>
              </Link>
            ))}
          </div>
        </MenuItem>

        <MenuItem label="Brands">
          <div className="grid grid-cols-3 gap-x-8 gap-y-1 p-6 w-[720px]">
            {(["premium", "mid_range", "budget"] as const).map((tier) => (
              <div key={tier}>
                <p className="font-display text-sm font-bold uppercase text-muted-foreground border-b pb-2 mb-2">
                  {brandTierLabel(tier)}
                </p>
                <ul className="space-y-1">
                  {brandsByTier(tier).slice(0, 10).map((brand) => (
                    <li key={brand.id}>
                      <Link
                        to={`/tyre/brand/${brand.id}/${brand.slug}-tyres`}
                        className="flex items-center gap-2 rounded px-2 py-1 text-sm hover:bg-accent hover:text-primary"
                      >
                        <BrandLogoMark brand={brand} size="xs" />
                        <span className="truncate">{brand.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="col-span-3 flex items-center justify-between border-t pt-3 mt-2">
              <span className="text-xs text-muted-foreground">All {brandCount} brands available across our range.</span>
              <Link to="/brands" className="text-xs text-primary underline-offset-2 hover:underline">View all brands</Link>
            </div>
          </div>
        </MenuItem>

        <MenuItem label="Vehicle Makes">
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 p-6 w-[640px]">
            {makes.map((m) => (
              <Link
                key={m.id}
                to={`/tyre/make/${m.id}/${m.slug}`}
                className="rounded px-2 py-1 text-sm hover:bg-accent hover:text-primary"
              >
                {m.name}
              </Link>
            ))}
            <Link to="/makes" className="col-span-3 mt-2 border-t pt-3 text-xs text-primary underline-offset-2 hover:underline">
              View all popular vehicle makes
            </Link>
          </div>
        </MenuItem>

        <MenuItem label="Services">
          <div className="space-y-2 p-6 w-[420px]">
            {services.map((s) => (
              <Link
                key={s.id}
                to={`/services/details/${s.id}/${s.slug}`}
                className="flex items-start justify-between gap-3 rounded-md p-3 hover:bg-accent"
              >
                <div>
                  <p className="text-sm font-semibold">{s.name}</p>
                  <p className="line-clamp-2 text-xs text-muted-foreground">{s.shortDescription}</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                  {s.priceFrom === "free" ? "FREE" : `From £${s.priceFrom}`}
                </span>
              </Link>
            ))}
          </div>
        </MenuItem>

        <NavMenu.Item>
          <NavMenu.Link asChild>
            <Link to="/offers" className="px-3 py-2 text-sm font-medium hover:text-primary">
              Offers
            </Link>
          </NavMenu.Link>
        </NavMenu.Item>

        <MenuItem label="Blog">
          <div className="grid grid-cols-2 gap-3 p-6 w-[560px]">
            {content.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/blog/${c.slug}`}
                className="group rounded-md p-2 hover:bg-accent"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{c.imageEmoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold group-hover:text-primary">{c.title}</p>
                    <p className="text-[11px] text-muted-foreground">{c.readMinutes} min read</p>
                  </div>
                </div>
              </Link>
            ))}
            <Link to="/blog" className="col-span-2 border-t pt-3 text-xs text-primary underline-offset-2 hover:underline">
              View all blog posts
            </Link>
          </div>
        </MenuItem>
      </NavMenu.List>

      <div className="absolute left-0 top-full flex w-full justify-center">
        <NavMenu.Viewport className="relative mt-2 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-xl border bg-popover shadow-elev-3 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 md:w-[var(--radix-navigation-menu-viewport-width)]" />
      </div>
    </NavMenu.Root>
  );
}

function MenuItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <NavMenu.Item>
      <NavMenu.Trigger className="group inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-primary data-[state=open]:bg-accent data-[state=open]:text-primary">
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
      </NavMenu.Trigger>
      <NavMenu.Content className="left-0 top-0 w-full data-[motion=from-end]:animate-in data-[motion=from-start]:animate-in data-[motion=to-end]:animate-out data-[motion=to-start]:animate-out md:absolute md:w-auto">
        {children}
      </NavMenu.Content>
    </NavMenu.Item>
  );
}
