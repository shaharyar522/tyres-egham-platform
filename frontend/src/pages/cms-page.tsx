import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HtmlContent } from "@/components/domain/html-content";
import { useApiPageQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

interface CmsPageProps {
  slug: string;
}

export default function CmsPage({ slug }: CmsPageProps) {
  const site = useSite();
  const pageQuery = useApiPageQuery(slug);
  const page = pageQuery.data?.page;

  usePageMeta(
    page
      ? {
          title: page.metaTitle ?? `${page.title} | ${site.businessName}`,
          description: page.metaDescription ?? page.excerpt,
          keywords: page.metaKeywords ?? undefined,
          robots: page.robots ?? undefined,
          ogImage: page.ogImageUrl ?? page.featuredImageUrl ?? undefined,
          canonicalPath: `/${slug}`,
        }
      : null,
  );

  if (pageQuery.isLoading) {
    return (
      <div className="container max-w-3xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading page</h1>
        <p className="mt-2 text-muted-foreground">Fetching content from the API.</p>
      </div>
    );
  }

  if (pageQuery.isError || !page) {
    return (
      <div className="container max-w-3xl py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Page not found</h1>
        <Button asChild className="mt-4">
          <Link to="/">Go home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">{page.title}</span>
        </nav>
      </div>

      <div className="container max-w-3xl py-10">
        <h1 className="font-display text-3xl font-extrabold sm:text-display-lg">{page.title}</h1>
        {page.excerpt && <p className="mt-2 text-muted-foreground">{page.excerpt}</p>}
        {page.updatedAt && (
          <p className="mt-2 text-xs text-muted-foreground">
            Last updated{" "}
            {new Date(page.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}
        <HtmlContent html={page.body} className="mt-6 text-foreground sm:prose-base" />
      </div>
    </div>
  );
}
