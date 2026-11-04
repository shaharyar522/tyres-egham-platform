import { useEffect } from "react";
import { useSite } from "@/lib/site";
import { applySiteThemeColor, normalizeHexColor } from "@/lib/theme-color";
import { upsertLink, upsertMeta } from "@/lib/page-meta";

/** Applies global SEO, theme, and favicon from bootstrap site settings. */
export function SiteHead() {
  const site = useSite();

  useEffect(() => {
    if (site.metaTitle) {
      document.title = site.metaTitle;
    }
    upsertMeta("description", site.metaDescription ?? "");
    upsertMeta("keywords", site.metaKeywords ?? "");
    upsertMeta("robots", site.robots);
    const themeHex = normalizeHexColor(site.themeColor) ?? site.themeColor;
    upsertMeta("theme-color", themeHex);
    applySiteThemeColor(site.themeColor);

    // Canonical URLs are owned by SiteCanonical / usePageMeta (per-route).

    if (site.faviconUrl) {
      upsertLink("icon", site.faviconUrl);
      upsertLink("shortcut icon", site.faviconUrl);
    }

    if (site.ogImageUrl) {
      upsertMeta("og:image", site.ogImageUrl, "property");
      upsertMeta("og:title", site.metaTitle ?? site.businessName, "property");
      upsertMeta("og:description", site.metaDescription ?? "", "property");
      upsertMeta("twitter:card", "summary_large_image");
      upsertMeta("twitter:image", site.ogImageUrl);
    }
  }, [site]);

  return null;
}
