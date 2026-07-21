import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { BrandLogoMark } from "@/components/domain/brand-logo";
import { useAdminBrandsQuery } from "@/lib/admin/queries";
import { useAdminListPage } from "@/lib/admin/pagination";

const tierLabel: Record<string, string> = {
  premium: "Premium",
  mid_range: "Budget",
  budget: "Budget",
};

export default function AdminBrandsPage() {
  const { page, setPage } = useAdminListPage();
  const brandsQuery = useAdminBrandsQuery({ page });
  const brands = brandsQuery.data?.brands ?? [];
  const meta = brandsQuery.data?.meta;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Brands</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tyre manufacturers shown on the site, search filters, and brand landing pages.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/brands/new">
            <Plus className="mr-2 h-4 w-4" /> New brand
          </Link>
        </Button>
      </div>

      {brandsQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" />
      ) : (
      <div className="mt-6 space-y-3">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="flex min-w-0 items-start gap-3">
                <BrandLogoMark brand={brand} size="md" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-display font-bold">{brand.name}</p>
                    <Badge variant="secondary">{tierLabel[brand.tier] ?? brand.tier}</Badge>
                    {brand.hasActiveOffer && <Badge variant="outline">Offer</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">/{brand.slug}</p>
                  {brand.description && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{brand.description}</p>
                  )}
                  <p className="mt-1 text-xs text-muted-foreground">{brand.skuCount ?? 0} SKUs</p>
                </div>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/brands/${brand.id}`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {brands.length === 0 && (
          <p className="text-sm text-muted-foreground">No brands yet.</p>
        )}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={brandsQuery.isFetching}
      />
    </div>
  );
}

