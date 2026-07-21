import { Link } from "react-router-dom";
import { ChevronRight, Clock, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useApiContentIndexQuery } from "@/lib/api/queries";
import type { ContentArticle } from "@/types";

function categoryLabel(category: ContentArticle["category"]): string {
  switch (category) {
    case "buying-guide":
      return "Buying guides";
    case "maintenance":
      return "Maintenance";
    case "safety":
      return "Safety";
    case "seasonal":
      return "Seasonal";
    default:
      return category;
  }
}

function groupByCategory(articles: ContentArticle[]): Map<ContentArticle["category"], ContentArticle[]> {
  const map = new Map<ContentArticle["category"], ContentArticle[]>();
  for (const a of articles) {
    const list = map.get(a.category) ?? [];
    list.push(a);
    map.set(a.category, list);
  }
  return map;
}

const categoryOrder: ContentArticle["category"][] = ["buying-guide", "maintenance", "safety", "seasonal"];

export default function HelpCentrePage() {
  const contentQuery = useApiContentIndexQuery();
  const articles = contentQuery.data?.articles ?? [];

  if (contentQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading help topics</h1>
        <p className="mt-2 text-muted-foreground">Fetching guides from the catalogue API.</p>
      </div>
    );
  }

  if (contentQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load help content</h1>
        <p className="mt-2 text-muted-foreground">Check the API is running and try again.</p>
      </div>
    );
  }

  const grouped = groupByCategory(articles);

  return (
    <div>
      <div className="container py-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Help &amp; advice</span>
        </nav>
      </div>

      <section className="border-b bg-muted/40 py-10">
        <div className="container">
          <h1 className="font-display text-3xl font-extrabold sm:text-4xl">Help &amp; advice</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Practical guides on choosing tyres, staying safe, and getting the most from every set. More articles will move here as the content module grows.
          </p>
        </div>
      </section>

      <div className="container space-y-12 py-12">
        <section className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Quick links</h2>
          <ul className="mt-3 flex flex-wrap gap-4 text-sm">
            <li>
              <Link to="/faq/booking-faq" className="font-medium text-primary hover:underline">Booking FAQ</Link>
            </li>
            <li>
              <Link to="/tyresearch/results" className="font-medium text-primary hover:underline">Search tyres by size</Link>
            </li>
            <li>
              <Link to="/services" className="font-medium text-primary hover:underline">Workshop services</Link>
            </li>
          </ul>
        </section>

        {articles.length === 0 ? (
          <p className="text-muted-foreground">No articles are published yet.</p>
        ) : (
          categoryOrder.map((cat) => {
            const list = grouped.get(cat);
            if (!list?.length) return null;
            return (
              <section key={cat}>
                <h2 className="font-display text-2xl font-bold">{categoryLabel(cat)}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((article) => (
                    <Link key={article.id} to={`/content/details/${article.id}/${article.slug}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardContent className="flex flex-col gap-3 p-5">
                          <div className="flex items-start gap-3">
                            <span className="text-3xl" aria-hidden>{article.imageEmoji}</span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3 shrink-0" />
                                <span className="uppercase tracking-wide">{article.category.replace("-", " ")}</span>
                              </div>
                              <h3 className="mt-1 font-display text-lg font-bold leading-snug">{article.title}</h3>
                              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{article.excerpt}</p>
                              <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {article.readMinutes} min read
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}
