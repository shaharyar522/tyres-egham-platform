import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminCategoriesQuery } from "@/lib/admin/queries";
import { useAdminListPage } from "@/lib/admin/pagination";

export default function AdminCategoriesPage() {
  const { page, setPage } = useAdminListPage();
  const categoriesQuery = useAdminCategoriesQuery({ page });
  const categories = categoriesQuery.data?.categories ?? [];
  const meta = categoriesQuery.data?.meta;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Tyre categories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Car, 4x4, winter, run-flat, and other catalogue groupings used on SKUs and navigation.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/categories/new">
            <Plus className="mr-2 h-4 w-4" /> New category
          </Link>
        </Button>
      </div>

      {categoriesQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" />
      ) : (
      <div className="mt-6 space-y-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold">{category.name}</p>
                  {category.iconName && <Badge variant="outline">{category.iconName}</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">/{category.slug}</p>
                {category.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{category.description}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{category.skuCount ?? 0} SKUs</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/categories/${category.id}`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {categories.length === 0 && (
          <p className="text-sm text-muted-foreground">No categories yet.</p>
        )}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={categoriesQuery.isFetching}
      />
    </div>
  );
}

