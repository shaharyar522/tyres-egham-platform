import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BlogSearchBox, BlogSidebar } from "@/components/blog/blog-sidebar";
import { useApiBlogIndexQuery } from "@/lib/api/queries";
import {
  blogCategoryLabel,
  blogCategoryOrder,
  blogPostPath,
  filterBlogPosts,
  groupBlogPostsByCategory,
} from "@/lib/blog";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";
import type { ContentArticle } from "@/types";

function BlogPostCard({ article }: { article: ContentArticle }) {
  return (
    <Link to={blogPostPath(article.slug)}>
      <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
        <CardContent className="flex flex-col gap-3 p-0">
          {article.featuredImageUrl ? (
            <img
              src={article.featuredImageUrl}
              alt=""
              className="aspect-[16/10] w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-5xl">
              {article.imageEmoji || "📝"}
            </div>
          )}
          <div className="flex flex-col gap-3 p-5">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3 shrink-0" />
              <span className="uppercase tracking-wide">{blogCategoryLabel(article.category)}</span>
            </div>
            <h3 className="font-display text-lg font-bold leading-snug">{article.title}</h3>
            <p className="line-clamp-3 text-sm text-muted-foreground">{article.excerpt}</p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {article.readMinutes} min read
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function BlogIndexPage() {
  const site = useSite();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const blogQuery = useApiBlogIndexQuery();
  const allArticles = blogQuery.data?.articles ?? [];
  const articles = filterBlogPosts(allArticles, searchQuery);

  usePageMeta({
    title: `Tyre Blog & Advice | ${site.businessName}`,
    description:
      site.metaDescription ??
      "Expert tyre guides on buying, maintenance, safety, and seasonal driving from our Egham workshop team.",
    canonicalPath: "/blog",
  });

  if (blogQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading blog</h1>
        <p className="mt-2 text-muted-foreground">Fetching articles from the catalogue API.</p>
      </div>
    );
  }

  if (blogQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load blog</h1>
        <p className="mt-2 text-muted-foreground">Check the API is running and try again.</p>
      </div>
    );
  }

  const grouped = groupBlogPostsByCategory(articles);

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Blog</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Tyre blog &amp; advice</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Practical guides on choosing tyres, staying safe on the road, and getting the most from every set — written by our workshop team.
          </p>
        </div>
      </section>

      <div className="container space-y-12 py-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-12">
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {articles.length} result{articles.length === 1 ? "" : "s"} for &ldquo;{searchQuery}&rdquo;
                {" · "}
                <Link to="/blog" className="font-medium text-primary hover:underline">Clear search</Link>
              </p>
            )}

            <section className="rounded-xl border bg-card p-6 lg:hidden">
              <p className="mb-3 font-display text-sm font-bold uppercase tracking-wide">Search blog</p>
              <BlogSearchBox />
            </section>

            {articles.length === 0 ? (
              <p className="text-muted-foreground">
                {searchQuery ? "No blog posts match your search." : "No blog posts are published yet."}
              </p>
            ) : searchQuery ? (
              <section>
                <h2 className="font-display text-2xl font-bold">Search results</h2>
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  {articles.map((article) => (
                    <BlogPostCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            ) : (
              blogCategoryOrder.map((cat) => {
                const list = grouped.get(cat);
                if (!list?.length) return null;
                return (
                  <section key={cat}>
                    <h2 className="font-display text-2xl font-bold">{blogCategoryLabel(cat)}</h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      {list.map((article) => (
                        <BlogPostCard key={article.id} article={article} />
                      ))}
                    </div>
                  </section>
                );
              })
            )}
          </div>

          <BlogSidebar articles={allArticles} className="hidden lg:block" />
        </div>
      </div>
    </div>
  );
}
