import { useApiBootstrapQuery } from "@/lib/api/queries";
import type { SiteSettings } from "@/lib/api/contracts";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";

const FALLBACK: SiteSettings = {
  name: "Egham Tyres",
  apiBaseUrl: "",
  frontendUrl: "",
  businessName: "Egham Tyres",
  tagline: "Independent tyre experts",
  logoMonogram: "TE",
  logoUrl: "/images/tyreeghm-logo.png",
  headerLogoHeight: 56,
  headerLogoMaxWidth: 220,
  headerLogoHeightMobile: 40,
  headerLogoMaxWidthMobile: 152,
  footerLogoHeight: 52,
  footerLogoMaxWidth: 200,
  faviconUrl: null,
  ogImageUrl: null,
  themeColor: "#a00303",
  phone: "+44 7487755777",
  phoneTel: "447487755777",
  email: "hello@eghamtyres.example",
  addressLine1: "12 Station Road",
  addressLine2: "Egham, Surrey",
  town: "Egham",
  postcode: "TW20 9LF",
  fullAddress: "12 Station Road, Egham, Surrey, TW20 9LF",
  footerBlurb:
    "Independent local tyre fitter with over two decades of experience serving Surrey, Berkshire and West London.",
  openingHoursNote: "Mon–Sat · 8:30am – 5:30pm",
  googleReviewRating: 4.9,
  googleReviewCount: 812,
  googleBusinessUrl: null,
  facebookUrl: null,
  instagramUrl: null,
  tiktokUrl: null,
  trustLine1: "TyreSafe Approved Fitter",
  trustLine2: "Independent Garage of the Year nominee",
  metaTitle: "Egham Tyres | Tyres fitted in Egham, Surrey",
  metaDescription:
    "Book tyres online with local fitting at Egham Tyres. Premium, mid-range and budget brands with honest advice.",
  metaKeywords: "tyres, tyre fitting, Egham, Surrey",
  robots: "index,follow",
  canonicalBaseUrl: null,
  showPrototypeNotice: false,
  headCode: null,
  bodyCode: null,
};

export function useSite(): SiteSettings {
  const bootstrap = useApiBootstrapQuery();
  const site = bootstrap.data?.site ?? FALLBACK;

  return {
    ...site,
    logoUrl: resolvePublicAssetUrl(site.logoUrl) ?? site.logoUrl,
    faviconUrl: resolvePublicAssetUrl(site.faviconUrl),
    ogImageUrl: resolvePublicAssetUrl(site.ogImageUrl),
  };
}
