import DOMPurify from "dompurify";

const SANITIZE_OPTIONS = {
  USE_PROFILES: { html: true },
  ADD_TAGS: ["img", "mark", "sub", "sup"],
  ADD_ATTR: ["target", "rel", "src", "alt", "width", "height", "colspan", "rowspan", "style", "class", "align"],
};

/** Sanitize HTML from the admin rich text editor before save or public render. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, SANITIZE_OPTIONS) as string;
}

/** Plain text for previews, meta fields, and line-clamped snippets. */
export function stripHtml(html: string): string {
  if (!html) return "";
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const doc = new DOMParser().parseFromString(html, "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
