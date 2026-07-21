import { Link, useParams } from "react-router-dom";
import { Calendar, ChevronRight, Clock, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { HtmlContent } from "@/components/domain/html-content";
import { TyreSearchWidget } from "@/components/domain/tyre-search-widget";
import { useApiBlogIndexQuery, useApiBlogQuery } from "@/lib/api/queries";
import { blogCategoryLabel, buildBlogPostMeta } from "@/lib/blog";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";
import { cn } from "@/lib/utils";

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug ?? "";
  const site = useSite();
  const articleQuery = useApiBlogQuery(slug);
  const indexQuery = useApiBlogIndexQuery();
  const article = articleQuery.data?.article;
  const allPosts = indexQuery.data?.articles ?? [];

  usePageMeta(article ? buildBlogPostMeta(article, site.businessName) : null);

  if (articleQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading article</h1>
        <p className="mt-2 text-muted-foreground">Fetching article from the catalogue API.</p>
      </div>
    );
  }

  if (!article || articleQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Article not found</h1>
        <Button asChild className="mt-4">
          <Link to="/blog">Browse the blog</Link>
        </Button>
      </div>
    );
  }

  const heroImage = article.featuredImageUrl;
  const publishedLabel = new Date(article.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-muted/20">
      {/* Hero band */}
      <section className="border-b border-border/60 bg-brand text-white">
        <div className="container py-4">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-white/70">
            <Link to="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blog" className="hover:text-white">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="line-clamp-1 text-white">{article.title}</span>
          </nav>
        </div>
        <div className="container pb-10 pt-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
            <Tag className="h-3 w-3" />
            {blogCategoryLabel(article.category)}
          </span>
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-[2.75rem]">
            {article.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base text-white/85 sm:text-lg">{article.excerpt}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {publishedLabel}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {article.readMinutes} min read
            </span>
          </div>
        </div>
      </section>

      {/* Two-column layout */}
      <div className="container py-10 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-card">
              {heroImage ? (
                <img
                  src={heroImage}
                  alt=""
                  className="aspect-[16/9] w-full object-cover"
                  loading="eager"
                />
              ) : article.imageEmoji ? (
                <div className="flex aspect-[16/9] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-8xl">
                  {article.imageEmoji}
                </div>
              ) : null}

              <div className="p-6 sm:p-8 lg:p-10">
                <HtmlContent
                  html={article.body ?? ""}
                  className={cn(
                    "text-foreground",
                    "prose-headings:font-display prose-headings:font-bold",
                    "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
                    "sm:prose-lg",
                  )}
                />
              </div>
            </div>

            <Card className="mt-8 overflow-hidden border-2 border-primary/20 shadow-card">
              <CardContent className="flex flex-col items-start justify-between gap-5 bg-gradient-to-br from-primary/5 to-primary/10 p-6 sm:flex-row sm:items-center sm:p-8">
                <div>
                  <p className="font-display text-lg font-bold">Ready to find new tyres?</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Search by size and book a fitting slot in under two minutes.
                  </p>
                </div>
                <Button asChild size="lg" variant="cta" className="shrink-0">
                  <Link to="/">Find my tyres</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="mt-8 rounded-2xl border border-border/80 bg-card p-6 shadow-card sm:p-8">
              <p className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                Find tyres for your vehicle
              </p>
              <TyreSearchWidget variant="compact" />
            </div>
          </article>

          <BlogSidebar
            articles={allPosts}
            currentArticleId={article.id}
            currentSlug={article.slug}
            currentTitle={article.title}
          />
        </div>
      </div>
    </div>
  );
}
