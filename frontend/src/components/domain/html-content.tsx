import { sanitizeHtml } from "@/lib/sanitize-html";
import { cn } from "@/lib/utils";

export function HtmlContent({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  if (!html?.trim()) return null;
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-table:w-full prose-th:border prose-th:border-border prose-td:border prose-td:border-border prose-img:rounded-md",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }}
    />
  );
}
