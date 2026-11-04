import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitReview } from "@/lib/api/queries";
import { ApiError } from "@/lib/api/client";
import { usePageMeta } from "@/lib/page-meta";
import { useSite } from "@/lib/site";

export default function ReviewSubmitPage() {
  const site = useSite();

  usePageMeta({
    title: `Write a review | ${site.businessName}`,
    description: `Share your experience with ${site.businessName}.`,
    canonicalPath: "/reviews/submit",
    robots: "noindex,follow",
  });

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      submitReview({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || undefined,
        rating,
        title: title.trim(),
        body: body.trim(),
      }),
  });

  if (mutation.isSuccess) {
    return (
      <div className="container max-w-xl py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Thank you</h1>
        <p className="mt-3 text-muted-foreground">{mutation.data.message}</p>
        <Button asChild className="mt-6">
          <Link to="/reviews">Back to reviews</Link>
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
          <Link to="/reviews" className="hover:text-foreground">Reviews</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground">Leave a review</span>
        </nav>
      </div>

      <div className="container max-w-xl py-10">
        <h1 className="font-display text-3xl font-extrabold">Leave a review</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Share your experience after a visit. Reviews are moderated before they appear on the site.
        </p>

        <Card className="mt-8">
          <CardContent className="space-y-5 p-6">
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  maxLength={120}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  maxLength={255}
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="rounded p-1 transition-colors hover:bg-muted"
                      aria-label={`${value} star${value === 1 ? "" : "s"}`}
                    >
                      <Star
                        className={`h-7 w-7 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Headline</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={200}
                  placeholder="Summarise your visit in a few words"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Your review</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  required
                  minLength={20}
                  maxLength={5000}
                  rows={5}
                  placeholder="Tell other drivers about the service, value and fitting quality..."
                />
              </div>

              {mutation.isError && (
                <p className="text-sm text-destructive">
                  {mutation.error instanceof ApiError
                    ? mutation.error.message
                    : "Something went wrong. Please try again."}
                </p>
              )}

              <Button type="submit" variant="cta" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? "Submitting…" : "Submit review"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
