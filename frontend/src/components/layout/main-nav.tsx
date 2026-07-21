import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import * as NavMenu from "@radix-ui/react-navigation-menu";
import { useHeaderAppearance } from "@/components/layout/header-appearance";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { cn } from "@/lib/utils";

const navLinkClass =
  "inline-flex items-center gap-1 px-3 py-3 font-display text-sm font-bold uppercase tracking-wide text-white transition-colors hover:text-primary data-[state=open]:text-primary xl:px-4";

export function MainNav({
  className,
  onMenuOpenChange,
}: {
  className?: string;
  onMenuOpenChange?: (open: boolean) => void;
}) {
  const bootstrapQuery = useApiBootstrapQuery();
  const services = bootstrapQuery.data?.services ?? [];
  const { solid } = useHeaderAppearance();
  const [menuValue, setMenuValue] = useState("");

  useEffect(() => {
    if (!menuValue) onMenuOpenChange?.(false);
  }, [menuValue, onMenuOpenChange]);

  return (
    <NavMenu.Root
      className={cn("relative z-40 flex min-w-0 flex-1", className)}
      value={menuValue}
      onValueChange={(value) => {
        setMenuValue(value);
        onMenuOpenChange?.(value !== "");
      }}
    >
      <NavMenu.List className="flex list-none items-center gap-0.5 xl:gap-1">
        <NavMenu.Item>
          <NavMenu.Link asChild>
            <Link to="/brands" className={navLinkClass}>
              Brands
            </Link>
          </NavMenu.Link>
        </NavMenu.Item>

        <NavMenu.Item value="services">
          <NavMenu.Trigger className={cn(navLinkClass, "group")}>
            Services
            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
          </NavMenu.Trigger>
          <NavMenu.Content className="absolute left-0 top-0">
            <div className="w-[min(100vw,420px)] space-y-1 rounded-lg border border-white/10 bg-popover p-4 text-foreground shadow-elev-3">
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
              <Link to="/services" className="mt-2 block border-t pt-3 text-center text-sm font-semibold text-primary hover:underline">
                All services
              </Link>
            </div>
          </NavMenu.Content>
        </NavMenu.Item>

        <NavMenu.Item>
          <NavMenu.Link asChild>
            <Link to="/contact-us" className={navLinkClass}>
              Contact
            </Link>
          </NavMenu.Link>
        </NavMenu.Item>

        <NavMenu.Item>
          <NavMenu.Link asChild>
            <Link to="/offers" className={navLinkClass}>
              Offers
            </Link>
          </NavMenu.Link>
        </NavMenu.Item>
      </NavMenu.List>

      <div className="absolute left-0 top-full flex w-full justify-start">
        <NavMenu.Viewport
          className={cn(
            "relative mt-0 h-[var(--radix-navigation-menu-viewport-height)] w-full origin-top overflow-visible bg-transparent transition-[width,height] duration-300 md:w-[var(--radix-navigation-menu-viewport-width)]",
            !solid && "text-white",
          )}
        />
      </div>
    </NavMenu.Root>
  );
}
