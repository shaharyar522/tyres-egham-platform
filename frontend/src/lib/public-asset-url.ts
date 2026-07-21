import { getApiBaseUrl } from "@/lib/api/client";

/**
 * Live layout: SPA at domain root, Laravel only under /api.
 * Bootstrap may still return .../storage/... which hits the SPA and 404s.
 * Rewrite those to .../api/media/... so Laravel can serve the file.
 */
export function resolvePublicAssetUrl(url: string | null | undefined): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  const storageMatch = trimmed.match(/\/storage\/(.+)$/i);
  if (storageMatch) {
    const path = storageMatch[1].replace(/^\/+/, "");
    return `${getApiBaseUrl()}/media/${path}`;
  }

  return trimmed;
}
