import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminContentQuery } from "@/lib/admin/queries";
import { useAdminListPage } from "@/lib/admin/pagination";

export default function AdminContentListPage() {
  const { page, setPage } = useAdminListPage();
  const content = useAdminContentQuery({ page });
  const articles = content.data?.articles ?? [];
  const meta = content.data?.meta;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Content</h1>
          <p className="mt-1 text-sm text-muted-foreground">Help articles and CMS pages (HTML body).</p>
        </div>
        <Button asChild>
          <Link to="/admin/content/new">
            <Plus className="mr-2 h-4 w-4" /> New entry
          </Link>
        </Button>
      </div>

      {content.isLoading ? (
        <AdminCardListSkeleton className="mt-6" />
      ) : (
      <div className="mt-6 space-y-3">
        {articles.map((article) => (
          <Card key={article.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display font-bold">{article.title}</p>
                  <Badge variant="secondary">{article.namespace}</Badge>
                  <Badge variant="outline">{article.category}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">/{article.slug}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/content/${article.id}`}>Edit</Link>
              </Button>
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
        isLoading={content.isFetching}
      />
    </div>
  );
}


