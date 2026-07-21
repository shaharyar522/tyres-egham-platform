import { Link } from "react-router-dom";
import { MapPin, Phone } from "lucide-react";
import { HeaderSocialIcons } from "@/components/layout/header-social-icons";
import { useHeaderAppearance } from "@/components/layout/header-appearance";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

const UTILITY_LINKS = [
  { to: "/about", label: "About" },
  { to: "/contact-us", label: "Contact" },
  { to: "/blog", label: "Blog" },
] as const;

export function HeaderTopNav({ className }: { className?: string }) {
  const site = useSite();
  const { solid } = useHeaderAppearance();

  return (
    <nav
      className={cn(
        "hidden border-b text-white transition-colors duration-300 lg:block",
        solid ? "border-white/10 bg-black" : "border-transparent bg-transparent",
        className,
      )}
      aria-label="Utility navigation"
    >
      <div className="container flex h-9 items-center justify-between gap-4 text-xs">
        <div className="flex min-w-0 items-center gap-3 text-white/90">
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{site.fullAddress}</span>
          </span>
          <span className="hidden text-white/35 sm:inline" aria-hidden="true">
            |
          </span>
          <a
            href={`tel:${site.phoneTel}`}
            className="inline-flex shrink-0 items-center gap-1.5 font-semibold transition-colors hover:text-primary"
          >
            <Phone className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
            {site.phone}
          </a>
        </div>

        <div className="flex shrink-0 items-center gap-4">
          <ul className="flex items-center gap-4">
            {UTILITY_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-semibold uppercase tracking-wide text-white/90 transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <HeaderSocialIcons
            facebookUrl={site.facebookUrl}
            instagramUrl={site.instagramUrl}
            tiktokUrl={site.tiktokUrl}
            className="border-l border-white/20 pl-4"
          />
        </div>
      </div>
    </nav>
  );
}
