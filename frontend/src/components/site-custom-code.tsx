import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSite } from "@/lib/site";
import { clearSiteCustomCode, injectSiteCustomCode } from "@/lib/inject-site-code";

/**
 * Injects admin-configured head/body HTML (GTM, analytics, pixels, etc.)
 * on public pages only — skipped under /admin.
 */
export function SiteCustomCode() {
  const site = useSite();
  const { pathname } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    clearSiteCustomCode();

    if (isAdmin) {
      return;
    }

    if (site.headCode?.trim()) {
      injectSiteCustomCode(document.head, site.headCode, "head");
    }
    if (site.bodyCode?.trim()) {
      injectSiteCustomCode(document.body, site.bodyCode, "body");
    }

    return () => {
      clearSiteCustomCode();
    };
  }, [site.headCode, site.bodyCode, isAdmin]);

  return null;
}
