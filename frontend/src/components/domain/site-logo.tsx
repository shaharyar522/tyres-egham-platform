import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "@/lib/site";
import type { SiteSettings } from "@/lib/api/contracts";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";
import { cn } from "@/lib/utils";

const DEFAULT_LOGO = "/images/tyreeghm-logo.png";

export type SiteLogoPlacement = "header" | "headerMobile" | "footer";

function dimension(value: number | undefined, fallback: number) {
  return typeof value === "number" && value > 0 ? value : fallback;
}

export function logoDimensionsFor(site: SiteSettings, placement: SiteLogoPlacement) {
  switch (placement) {
    case "header":
      return {
        height: dimension(site.headerLogoHeight, 56),
        maxWidth: dimension(site.headerLogoMaxWidth, 220),
      };
    case "headerMobile":
      return {
        height: dimension(site.headerLogoHeightMobile, 40),
        maxWidth: dimension(site.headerLogoMaxWidthMobile, 152),
      };
    case "footer":
      return {
        height: dimension(site.footerLogoHeight, 52),
        maxWidth: dimension(site.footerLogoMaxWidth, 200),
      };
  }
}

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  placement?: SiteLogoPlacement;
  showWordmark?: boolean;
  linkToHome?: boolean;
};

export function SiteLogo({
  className,
  imageClassName,
  placement = "header",
  showWordmark = false,
  linkToHome = false,
}: SiteLogoProps) {
  const site = useSite();
  const remoteLogo = resolvePublicAssetUrl(site.logoUrl);
  const preferredSrc = remoteLogo || DEFAULT_LOGO;
  const [src, setSrc] = useState(preferredSrc);

  useEffect(() => {
    setSrc(preferredSrc);
  }, [preferredSrc]);

  const { height, maxWidth } = logoDimensionsFor(site, placement);

  const content = (
    <>
      <img
        src={src}
        alt={site.businessName}
        style={{ height: `${height}px`, maxWidth: `${maxWidth}px` }}
        className={cn("w-auto object-contain object-left", imageClassName)}
        onError={() => {
          // Keep a visible logo — never blank the header when the upload URL 404s.
          if (src !== DEFAULT_LOGO) setSrc(DEFAULT_LOGO);
        }}
      />
      {showWordmark && (
        <div className="flex flex-col leading-tight">
          <span className="font-display text-base font-extrabold text-inherit">{site.businessName}</span>
          {site.tagline && (
            <span className="text-[10px] uppercase tracking-widest opacity-70">{site.tagline}</span>
          )}
        </div>
      )}
    </>
  );

  const classes = cn("flex items-center gap-2", className);

  if (linkToHome) {
    return (
      <Link to="/" className={classes} aria-label="Home">
        {content}
      </Link>
    );
  }

  return <div className={classes}>{content}</div>;
}
