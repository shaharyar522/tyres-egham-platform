import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  useAdminBulkWithin24hMutation,
  useAdminTyresQuery,
  useAdminUpdateTyreMutation,
  type AdminTyreSku,
} from "@/lib/admin/queries";
import { AdminTableSkeleton, AdminToolbarSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminListPage } from "@/lib/admin/pagination";
import { formatGBP } from "@/lib/utils";

export default function AdminCatalogTyresPage() {
  const [search, setSearch] = useState("");
  const [within24h, setWithin24h] = useState<string>("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { page, setPage } = useAdminListPage([debouncedSearch, within24h]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const tyresQuery = useAdminTyresQuery({
    search: debouncedSearch || undefined,
    within24h: within24h || undefined,
    page,
  });
  const updateTyre = useAdminUpdateTyreMutation();
  const bulk24h = useAdminBulkWithin24hMutation();

  const skus = tyresQuery.data?.skus ?? [];
  const meta = tyresQuery.data?.meta;

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggle24h = async (sku: AdminTyreSku) => {
    await updateTyre.mutateAsync({
      id: sku.id,
      data: { isAvailableWithin24h: !sku.isAvailableWithin24h },
    });
  };

  const applyBulk24h = async (enabled: boolean) => {
    if (selected.size === 0) return;
    await bulk24h.mutateAsync({ ids: Array.from(selected), enabled });
    setSelected(new Set());
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Catalogue - tyres</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new SKUs or edit price, stock, offers, and the <strong>Within 24 hours</strong> express flag.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {meta && <p className="text-sm text-muted-foreground">{meta.total} SKUs</p>}
          <Button asChild>
            <Link to="/admin/tyres/new">
              <Plus className="mr-2 h-4 w-4" /> New tyre
            </Link>
          </Button>
        </div>
      </div>

      {tyresQuery.isLoading ? (
        <>
          <AdminToolbarSkeleton className="mt-6" />
          <AdminTableSkeleton className="mt-4" rows={10} />
        </>
      ) : (
        <>
      <Card className="mt-6">
        <CardContent className="flex flex-wrap items-end gap-3 p-4">
          <div className="min-w-[200px] flex-1">
            <label className="text-xs font-bold uppercase text-muted-foreground">Search</label>
            <Input
              className="mt-1"
              placeholder="Brand, model, slug, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">24h filter</label>
            <select
              className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={within24h}
              onChange={(e) => setWithin24h(e.target.value)}
            >
              <option value="">All</option>
              <option value="1">Within 24h only</option>
              <option value="0">Not within 24h</option>
            </select>
          </div>
          {selected.size > 0 && (
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => applyBulk24h(true)} disabled={bulk24h.isPending}>
                <Zap className="mr-1 h-4 w-4" /> Enable 24h ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulk24h(false)} disabled={bulk24h.isPending}>
                Disable 24h
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 p-3" />
              <th className="p-3">Tyre</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Within 24h</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => (
              <tr key={sku.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <Checkbox
                    checked={selected.has(sku.id)}
                    onCheckedChange={() => toggleSelect(sku.id)}
                    aria-label={`Select ${sku.modelName}`}
                  />
                </td>
                <td className="p-3">
                  <p className="font-medium">
                    {sku.brandName} {sku.modelName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {sku.sizeLabel} | #{sku.id}
                  </p>
                  {sku.hasActiveOffer && (
                    <Badge variant="secondary" className="mt-1 text-[10px]">
                      Offer
                    </Badge>
                  )}
                </td>
                <td className="p-3">{formatGBP(sku.pricePerTyre)}</td>
                <td className="p-3">{sku.stock}</td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggle24h(sku)}
                    disabled={updateTyre.isPending}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      sku.isAvailableWithin24h
                        ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <Zap className="h-3 w-3" />
                    {sku.isAvailableWithin24h ? "ON" : "OFF"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/admin/tyres/${sku.id}`}>Edit</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </>
      )}

      <AdminPagination
        className="mt-4"
        meta={meta}
        page={page}
        onPageChange={setPage}
        isLoading={tyresQuery.isFetching}
      />
    </div>
  );
}
