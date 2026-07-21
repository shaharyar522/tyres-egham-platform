import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { useAdminVouchersQuery } from "@/lib/admin/queries";
import { AdminCardListSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminListPage } from "@/lib/admin/pagination";
import { formatGBP } from "@/lib/utils";

export default function AdminVouchersPage() {
  const { page, setPage } = useAdminListPage();
  const vouchersQuery = useAdminVouchersQuery({ page });
  const vouchers = vouchersQuery.data?.vouchers ?? [];
  const meta = vouchersQuery.data?.meta;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Vouchers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Promo codes applied at checkout — brand-specific or site-wide.
          </p>
        </div>
        <Button asChild>
          <Link to="/admin/vouchers/new">
            <Plus className="mr-2 h-4 w-4" /> New voucher
          </Link>
        </Button>
      </div>

      {vouchersQuery.isLoading ? (
        <AdminCardListSkeleton className="mt-6" />
      ) : (
      <div className="mt-6 space-y-3">
        {vouchers.map((voucher) => (
          <Card key={voucher.id ?? voucher.code}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-mono font-bold">{voucher.code}</p>
                  {voucher.brandName ? (
                    <Badge variant="secondary">{voucher.brandName}</Badge>
                  ) : (
                    <Badge variant="outline">All brands</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{voucher.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatGBP(voucher.discountPerQty)} off per tyre · min {voucher.minQty} tyres ·{" "}
                  {voucher.validFrom} → {voucher.validTo}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link to={`/admin/vouchers/${voucher.id}`}>Edit</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
        {vouchers.length === 0 && (
          <p className="text-sm text-muted-foreground">No vouchers yet.</p>
        )}
      </div>
      )}

      <AdminPagination
        className="mt-6"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={vouchersQuery.isFetching}
      />
    </div>
  );
}


