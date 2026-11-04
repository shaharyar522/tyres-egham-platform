import { useEffect } from "react";
import { useSite } from "@/lib/site";

export type PageMeta = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  ogImage?: string | null;
  /** Path beginning with `/`, optionally with a stable query string. */
  canonicalPath?: string;
};

export function upsertMeta(name: string, content: string, attr: "name" | "property" = "name") {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.content = content;
}

export function upsertLink(rel: string, href: string, type?: string) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  if (type) el.type = type;
}

/** Prefer admin canonical base, then frontendUrl, then current origin. */
export function getCanonicalBase(site: { canonicalBaseUrl?: string | null; frontendUrl?: string | null }) {
  const fromSettings = site.canonicalBaseUrl?.trim() || site.frontendUrl?.trim() || "";
  if (fromSettings) {
    return fromSettings.replace(/\/$/, "");
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "";
}

export function buildCanonicalUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/$/, "");
  if (!cleanBase) return "";

  const raw = path?.trim() || "/";
  if (raw === "/") {
    return `${cleanBase}/`;
  }

  const [pathnamePart, queryPart] = raw.split("?");
  const pathname = pathnamePart.startsWith("/") ? pathnamePart : `/${pathnamePart}`;
  const normalizedPath = pathname.replace(/\/+$/, "") || "/";
  const query = queryPart ? `?${queryPart}` : "";
  return `${cleanBase}${normalizedPath === "/" ? "/" : normalizedPath}${query}`;
}

/**
 * Build a stable canonical path from the current route.
 * Keeps meaningful catalogue filters; drops VRN/pagination/noise params.
 */
export function canonicalPathFromLocation(pathname: string, search: string) {
  const path = pathname || "/";
  const params = new URLSearchParams(search);

  if (path === "/tyresearch/results" || path === "/vrnsearch/results" || path === "/tyres") {
    const category = params.get("TyreCategory");
    if (category) {
      return `${path}?TyreCategory=${encodeURIComponent(category)}`;
    }

    const brand = params.get("brand");
    if (brand) {
      return `${path}?brand=${encodeURIComponent(brand)}`;
    }

    const width = params.get("Width");
    const profile = params.get("Profile");
    const rim = params.get("Rim");
    if (width && profile && rim) {
      const next = new URLSearchParams({
        Width: width,
        Profile: profile,
        Rim: rim,
      });
      const speed = params.get("Speed");
      if (speed) next.set("Speed", speed.toUpperCase());
      return `${path}?${next.toString()}`;
    }

    return path;
  }

  return path;
}

function applyPageMeta(meta: PageMeta, site: ReturnType<typeof useSite>, options?: { updateCanonical?: boolean }) {
  const title = meta.title ?? site.metaTitle ?? site.businessName;
  const description = meta.description ?? site.metaDescription ?? "";
  const keywords = meta.keywords ?? site.metaKeywords ?? "";
  const robots = meta.robots ?? site.robots;
  const ogImage = meta.ogImage ?? site.ogImageUrl;
  const updateCanonical = options?.updateCanonical !== false;

  document.title = title;
  upsertMeta("description", description);
  upsertMeta("keywords", keywords);
  upsertMeta("robots", robots);

  if (updateCanonical && meta.canonicalPath) {
    const canonical = buildCanonicalUrl(getCanonicalBase(site), meta.canonicalPath);
    if (canonical) {
      upsertLink("canonical", canonical);
    }
  }

  if (ogImage) {
    upsertMeta("og:image", ogImage, "property");
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:image", ogImage);
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);
  }
}

/** Applies per-page SEO. Canonical is set when `canonicalPath` is provided. */
export function usePageMeta(meta: PageMeta | null | undefined) {
  const site = useSite();

  useEffect(() => {
    if (!meta) return;

    applyPageMeta(meta, site, { updateCanonical: Boolean(meta.canonicalPath) });

    return () => {
      // Restore global SEO text; leave canonical to SiteCanonical.
      applyPageMeta({}, site, { updateCanonical: false });
    };
  }, [meta, site]);
}

/** Set the document canonical from a path (or full location-derived path). */
export function applyCanonicalPath(
  site: { canonicalBaseUrl?: string | null; frontendUrl?: string | null },
  path: string,
) {
  const href = buildCanonicalUrl(getCanonicalBase(site), path);
  if (href) {
    upsertLink("canonical", href);
  }
}
