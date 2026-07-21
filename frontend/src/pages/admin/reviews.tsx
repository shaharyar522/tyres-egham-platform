import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { useAdminReviewStatusMutation, useAdminReviewsQuery } from "@/lib/admin/queries";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminListPage } from "@/lib/admin/pagination";

export default function AdminReviewsPage() {
  const [filter, setFilter] = useState<string>("pending");
  const { page, setPage } = useAdminListPage([filter]);
  const reviewsQuery = useAdminReviewsQuery({ status: filter || undefined, page });
  const statusMutation = useAdminReviewStatusMutation();
  const reviews = reviewsQuery.data?.reviews ?? [];
  const meta = reviewsQuery.data?.meta;

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Reviews</h1>
      <p className="mt-1 text-sm text-muted-foreground">Moderate on-site submissions before they appear publicly.</p>

      <div className="mt-4 flex gap-2">
        {["pending", "approved", "rejected", ""].map((status) => (
          <Button
            key={status || "all"}
            size="sm"
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
          >
            {status === "" ? "All" : status}
          </Button>
        ))}
      </div>

      {reviewsQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" />
      ) : (
      <div className="mt-6 space-y-3">
        {reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-display font-bold">{r.title}</p>
                    <Badge variant="outline">{(r as { status?: string }).status}</Badge>
                    <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{r.customerName}</p>
                </div>
                {(r as { status?: string }).status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => statusMutation.mutate({ id: r.id, status: "approved" })}
                      disabled={statusMutation.isPending}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => statusMutation.mutate({ id: r.id, status: "rejected" })}
                      disabled={statusMutation.isPending}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={reviewsQuery.isFetching}
      />
    </div>
  );
}

