import type { Brand } from "@/types";

/** Official site domains for favicon fallback. */
export const BRAND_WEBSITE_DOMAINS: Record<string, string> = {
  michelin: "www.michelin.com",
  continental: "www.continental-tires.com",
  bridgestone: "www.bridgestone.com",
  pirelli: "www.pirelli.com",
  goodyear: "www.goodyear.com",
  dunlop: "www.dunlop.eu",
  yokohama: "www.yokohama.eu",
  vredestein: "www.vredestein.com",
  hankook: "www.hankooktire.com",
  falken: "www.falkentyre.com",
  kumho: "www.kumhotire.com",
  toyo: "www.toyotires.com",
  uniroyal: "www.uniroyal-tyres.com",
  "general-tire": "www.generaltire.com",
  firestone: "www.firestone.com",
  bfgoodrich: "www.bfgoodrich.com",
  avon: "www.avon-tyres.com",
  nexen: "www.nexentire.com",
  maxxis: "www.maxxis.com",
  matador: "www.matador-tyres.com",
  barum: "www.barum-tyres.com",
  kormoran: "www.kormoran-tyres.com",
  riken: "www.riken-tyres.com",
  sava: "www.sava-tyres.com",
  debica: "www.debica.com.pl",
  autogrip: "www.autogrip.com",
  linglong: "www.linglong.cn",
  westlake: "www.westlaketire.com",
  triangle: "www.triangletyre.com",
  nankang: "www.nankang-tyre.com",
  cooper: "www.coopertire.com",
  kleber: "www.kleber-tyres.com",
  fulda: "www.fulda.com",
  semperit: "www.semperit.com",
  landsail: "www.landsail.com",
  radar: "www.radartyres.com",
};

function googleFaviconUrl(domain: string): string {
  const params = new URLSearchParams({
    client: "SOCIAL",
    type: "FAVICON",
    fallback_opts: "TYPE,SIZE,URL",
    url: `https://${domain}`,
    size: "256",
  });
  return `https://t1.gstatic.com/faviconV2?${params.toString()}`;
}

/** Clearbit logo URLs — used when local `/images/brands/{slug}.png` is missing. */
export const BRAND_LOGO_CLEARBIT: Record<string, string> = {
  michelin: "https://logo.clearbit.com/michelin.com",
  continental: "https://logo.clearbit.com/continental-tires.com",
  bridgestone: "https://logo.clearbit.com/bridgestone.com",
  pirelli: "https://logo.clearbit.com/pirelli.com",
  goodyear: "https://logo.clearbit.com/goodyear.com",
  dunlop: "https://logo.clearbit.com/dunlop.eu",
  yokohama: "https://logo.clearbit.com/yokohamatire.com",
  vredestein: "https://logo.clearbit.com/vredestein.com",
  hankook: "https://logo.clearbit.com/hankooktire.com",
  falken: "https://logo.clearbit.com/falken.com",
  kumho: "https://logo.clearbit.com/kumhotire.com",
  toyo: "https://logo.clearbit.com/toyotires.com",
  uniroyal: "https://logo.clearbit.com/uniroyal-tyres.com",
  "general-tire": "https://logo.clearbit.com/generaltire.com",
  firestone: "https://logo.clearbit.com/firestone.com",
  bfgoodrich: "https://logo.clearbit.com/bfgoodrich.com",
  avon: "https://logo.clearbit.com/avon-tyres.com",
  nexen: "https://logo.clearbit.com/nexentire.com",
  maxxis: "https://logo.clearbit.com/maxxis.com",
  matador: "https://logo.clearbit.com/matador-tyres.com",
  barum: "https://logo.clearbit.com/barum-tyres.com",
  kormoran: "https://logo.clearbit.com/kormoran-tyres.com",
  riken: "https://logo.clearbit.com/riken-tyres.com",
  sava: "https://logo.clearbit.com/sava-tyres.com",
  debica: "https://logo.clearbit.com/debica.com.pl",
  autogrip: "https://logo.clearbit.com/autogrip.com",
  linglong: "https://logo.clearbit.com/linglong.cn",
  westlake: "https://logo.clearbit.com/westlaketire.com",
  triangle: "https://logo.clearbit.com/triangletyre.com",
  nankang: "https://logo.clearbit.com/nankang-tyre.com",
  cooper: "https://logo.clearbit.com/cooper.com",
  kleber: "https://logo.clearbit.com/kleber-tyres.com",
  fulda: "https://logo.clearbit.com/fulda.com",
  semperit: "https://logo.clearbit.com/semperit.com",
  landsail: "https://logo.clearbit.com/landsail.com",
  radar: "https://logo.clearbit.com/radartyres.com",
};

/** Ordered sources to try when rendering a brand logo (first match wins). */
export function getBrandLogoSources(brand: Pick<Brand, "slug"> & { logoUrl?: string | null }): string[] {
  const sources: string[] = [];

  if (brand.logoUrl) {
    sources.push(brand.logoUrl);
  }

  sources.push(`/images/brands/${brand.slug}.svg`);
  sources.push(`/images/brands/${brand.slug}.webp`);
  sources.push(`/images/brands/${brand.slug}.png`);

  const clearbit = BRAND_LOGO_CLEARBIT[brand.slug];
  if (clearbit) {
    sources.push(clearbit);
  }

  const domain = BRAND_WEBSITE_DOMAINS[brand.slug];
  if (domain) {
    sources.push(googleFaviconUrl(domain));
  }

  return [...new Set(sources)];
}
