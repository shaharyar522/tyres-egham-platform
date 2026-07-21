import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Phone, ShoppingCart } from "lucide-react";
import { HeaderTopNav } from "@/components/layout/header-top-nav";
import { HeaderAppearanceProvider } from "@/components/layout/header-appearance";
import { HeaderActionNav } from "@/components/layout/header-action-nav";
import { MainNav } from "@/components/layout/main-nav";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ValuePropStrip } from "@/components/layout/value-prop-strip";
import { useBasket } from "@/store/basket";
import { SiteLogo } from "@/components/domain/site-logo";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

const SCROLL_OFFSET = 24;

export function SiteHeader({ showValueProp = false }: { showValueProp?: boolean }) {
  const { totals } = useBasket();
  const site = useSite();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mainNavOpen, setMainNavOpen] = useState(false);
  const [actionNavOpen, setActionNavOpen] = useState(false);

  const isHome = location.pathname === "/";
  const menuOpen = mainNavOpen || actionNavOpen;
  const solid = scrolled || hovered || menuOpen || !isHome;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_OFFSET);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setScrolled(window.scrollY > SCROLL_OFFSET);
    setHovered(false);
    setMainNavOpen(false);
    setActionNavOpen(false);
  }, [location.pathname]);

  return (
    <HeaderAppearanceProvider solid={solid}>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 text-white transition-[background-color,border-color,box-shadow] duration-300",
          solid ? "border-b border-white/10 bg-black shadow-md" : "border-b border-transparent bg-transparent",
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <HeaderTopNav />

        <div className="hidden lg:block">
          <div className="container flex h-[4.5rem] items-stretch gap-4 xl:gap-6">
            <SiteLogo linkToHome placement="header" className="shrink-0 self-center" />
            <MainNav onMenuOpenChange={setMainNavOpen} className="self-center" />
            <HeaderActionNav className="shrink-0 self-stretch" onMenuOpenChange={setActionNavOpen} />
          </div>
        </div>

        <div className="lg:hidden">
          <div className="container grid h-14 grid-cols-[auto_1fr_auto] items-center gap-2">
            <MobileMenu />
            <SiteLogo
              linkToHome
              placement="headerMobile"
              className="justify-center"
              imageClassName="mx-auto object-center"
            />
            <div className="flex items-center justify-end gap-1">
              <a href={`tel:${site.phoneTel}`} className="inline-flex p-2 hover:text-primary" aria-label={`Call ${site.phone}`}>
                <Phone className="h-5 w-5" />
              </a>
              <Link to="/basket" className="relative inline-flex p-2 hover:text-primary" aria-label={`Basket (${totals.itemCount})`}>
                <ShoppingCart className="h-5 w-5" />
                {totals.itemCount > 0 && (
                  <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {totals.itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {showValueProp && <ValuePropStrip />}
      </header>

      <div
        className={cn("h-14 md:h-[calc(2.25rem+4.5rem)]", isHome && "hidden")}
        aria-hidden="true"
      />
    </HeaderAppearanceProvider>
  );
}
