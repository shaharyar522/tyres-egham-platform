import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StarRating } from "@/components/domain/star-rating";
import { useApiReviewsQuery } from "@/lib/api/queries";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

export default function ReviewsPage() {
  const site = useSite();
  const reviewsQuery = useApiReviewsQuery();
  const reviews = reviewsQuery.data?.reviews ?? [];
  const stats = reviewsQuery.data?.stats;

  usePageMeta({
    title: `Customer reviews | ${site.businessName}`,
    description: `Read customer reviews for ${site.businessName} tyre fitting in Egham.`,
    canonicalPath: "/reviews",
  });


  if (reviewsQuery.isLoading) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Loading reviews</h1>
        <p className="mt-2 text-muted-foreground">Fetching customer feedback from the API.</p>
      </div>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Could not load reviews</h1>
        <p className="mt-2 text-muted-foreground">Check the API is running and try again.</p>
      </div>
    );
  }

  const avg = stats?.averageRating ?? 0;
  const totalCount = (stats?.googleReviewCount ?? 0) + (stats?.count ?? 0);

  return (
    <div className="container py-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-extrabold sm:text-display-lg">Customer reviews</h1>
        <div className="mt-3 inline-flex items-center gap-2">
          <StarRating rating={avg} reviewCount={totalCount} size="lg" />
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {stats?.count ?? 0} on-site reviews · {stats?.googleReviewCount ?? 0} on Google · {avg.toFixed(1)} average
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <StarRating rating={r.rating} showCount={false} size="sm" />
                <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {r.source === "google" ? "Google" : "On-site"}
                </span>
              </div>
              <h3 className="mt-2 font-display text-base font-bold">{r.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
              <p className="mt-3 text-xs font-semibold">{r.customerName}</p>
              <p className="text-[11px] text-muted-foreground">
                {new Date(r.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-2 border-primary/20 bg-primary/5">
        <CardContent className="flex flex-col items-center justify-between gap-3 p-6 text-center sm:flex-row sm:text-left">
          <div className="flex items-center gap-3">
            <Star className="h-8 w-8 text-amber-400" />
            <div>
              <p className="font-display text-lg font-bold">Recently fitted with us?</p>
              <p className="text-sm text-muted-foreground">Share your experience — it really helps other drivers in the area.</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/reviews/submit">Leave on-site review</Link></Button>
            <Button asChild variant="cta">
              <a href="https://google.com/" target="_blank" rel="noreferrer">Leave a Google review</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

