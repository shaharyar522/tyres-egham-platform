import { useEffect } from "react";
import { useSite } from "@/lib/site";

export type PageMeta = {
  title?: string;
  description?: string;
  keywords?: string;
  robots?: string;
  ogImage?: string | null;
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

function applyPageMeta(meta: PageMeta, site: ReturnType<typeof useSite>) {
  const title = meta.title ?? site.metaTitle ?? site.businessName;
  const description = meta.description ?? site.metaDescription ?? "";
  const keywords = meta.keywords ?? site.metaKeywords ?? "";
  const robots = meta.robots ?? site.robots;
  const ogImage = meta.ogImage ?? site.ogImageUrl;
  const canonicalBase = site.canonicalBaseUrl?.replace(/\/$/, "") ?? "";
  const canonical = meta.canonicalPath && canonicalBase ? `${canonicalBase}${meta.canonicalPath}` : canonicalBase;

  document.title = title;
  upsertMeta("description", description);
  upsertMeta("keywords", keywords);
  upsertMeta("robots", robots);

  if (canonical) {
    upsertLink("canonical", canonical);
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

/** Applies per-page SEO and restores global site meta on unmount. */
export function usePageMeta(meta: PageMeta | null | undefined) {
  const site = useSite();

  useEffect(() => {
    if (!meta) return;

    applyPageMeta(meta, site);

    return () => {
      applyPageMeta({}, site);
    };
  }, [meta, site]);
}
