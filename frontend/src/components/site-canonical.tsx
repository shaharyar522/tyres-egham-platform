import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applyCanonicalPath, canonicalPathFromLocation } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

/**
 * Keeps <link rel="canonical"> in sync with the current public route.
 * Skips admin. Uses admin Canonical base URL when set, else frontend URL / origin.
 */
export function SiteCanonical() {
  const site = useSite();
  const { pathname, search } = useLocation();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  useEffect(() => {
    if (isAdmin) return;

    const path = canonicalPathFromLocation(pathname, search);
    applyCanonicalPath(site, path);
  }, [site, pathname, search, isAdmin]);

  return null;
}
