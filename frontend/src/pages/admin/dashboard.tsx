import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { AdminDashboardSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminDashboardQuery } from "@/lib/admin/queries";

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboardQuery();
  const stats = dashboard.data?.stats;

  const tiles = [
    { label: "SKUs in catalogue", value: stats?.skus, to: "/admin/tyres" },
    { label: "Brands", value: stats?.brands, to: "/admin/brands" },
    { label: "Categories", value: stats?.categories, to: "/admin/categories" },
    { label: "Help articles", value: stats?.articles, to: "/admin/content" },
    { label: "CMS pages", value: stats?.pages, to: "/admin/content" },
    { label: "Bookings", value: stats?.bookings, to: "/admin/bookings" },
    { label: "Reviews pending", value: stats?.pendingReviews, to: "/admin/reviews" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold">Dashboard</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage catalogue, content, bookings and reviews from here.</p>

      {dashboard.isError && <p className="mt-6 text-sm text-destructive">Could not load dashboard.</p>}

      {dashboard.isLoading ? (
        <AdminDashboardSkeleton />
      ) : (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((tile) => (
          <Link key={tile.label} to={tile.to}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{tile.label}</p>
                <p className="mt-2 font-display text-3xl font-extrabold">{tile.value ?? "—"}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      )}
    </div>
  );
}


