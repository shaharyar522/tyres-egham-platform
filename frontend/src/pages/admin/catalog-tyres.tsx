import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Plus, Sparkles, Trash2, Truck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AdminPagination } from "@/components/admin/admin-pagination";
import {
  useAdminBulkHiddenMutation,
  useAdminBulkPremiumMutation,
  useAdminBulkSameDayMutation,
  useAdminBulkWithin24hMutation,
  useAdminDeleteTyreMutation,
  useAdminTyresQuery,
  useAdminUpdateTyreMutation,
  type AdminTyreSku,
} from "@/lib/admin/queries";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { AdminTableSkeleton, AdminToolbarSkeleton } from "@/components/admin/admin-skeletons";
import { useAdminListPage } from "@/lib/admin/pagination";
import { formatGBP } from "@/lib/utils";

export default function AdminCatalogTyresPage() {
  const [search, setSearch] = useState("");
  const [within24h, setWithin24h] = useState<string>("");
  const [premium, setPremium] = useState<string>("");
  const [sameDayDelivery, setSameDayDelivery] = useState<string>("");
  const [hidden, setHidden] = useState<string>("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { page, setPage } = useAdminListPage([debouncedSearch, within24h, hidden, premium, sameDayDelivery]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  const tyresQuery = useAdminTyresQuery({
    search: debouncedSearch || undefined,
    within24h: within24h || undefined,
    premium: premium || undefined,
    sameDayDelivery: sameDayDelivery || undefined,
    hidden: hidden || undefined,
    page,
  });
  const updateTyre = useAdminUpdateTyreMutation();
  const bulk24h = useAdminBulkWithin24hMutation();
  const bulkPremium = useAdminBulkPremiumMutation();
  const bulkSameDay = useAdminBulkSameDayMutation();
  const bulkHidden = useAdminBulkHiddenMutation();
  const deleteTyre = useAdminDeleteTyreMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

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

  const togglePremium = async (sku: AdminTyreSku) => {
    await updateTyre.mutateAsync({
      id: sku.id,
      data: { isPremium: !sku.isPremium },
    });
  };

  const toggleSameDay = async (sku: AdminTyreSku) => {
    await updateTyre.mutateAsync({
      id: sku.id,
      data: { isSameDayDelivery: !sku.isSameDayDelivery },
    });
  };

  const toggleHidden = async (sku: AdminTyreSku) => {
    await updateTyre.mutateAsync({
      id: sku.id,
      data: { isHidden: !sku.isHidden },
    });
  };

  const applyBulk24h = async (enabled: boolean) => {
    if (selected.size === 0) return;
    await bulk24h.mutateAsync({ ids: Array.from(selected), enabled });
    setSelected(new Set());
  };

  const applyBulkPremium = async (enabled: boolean) => {
    if (selected.size === 0) return;
    await bulkPremium.mutateAsync({ ids: Array.from(selected), premium: enabled });
    setSelected(new Set());
  };

  const applyBulkSameDay = async (enabled: boolean) => {
    if (selected.size === 0) return;
    await bulkSameDay.mutateAsync({ ids: Array.from(selected), sameDayDelivery: enabled });
    setSelected(new Set());
  };

  const applyBulkHidden = async (isHidden: boolean) => {
    if (selected.size === 0) return;
    await bulkHidden.mutateAsync({ ids: Array.from(selected), hidden: isHidden });
    setSelected(new Set());
  };

  const removeTyre = async (sku: AdminTyreSku) => {
    const ok = await confirm({
      title: "Delete this tyre?",
      description: `"${sku.brandName} ${sku.modelName} ${sku.sizeLabel}" will be permanently removed from the catalogue. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    await deleteTyre.mutateAsync(sku.id);
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(sku.id);
      return next;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Catalogue - tyres</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add new SKUs or edit price, stock, visibility, offers, and the <strong>Within 24 hours</strong> express flag.
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
            <label className="text-xs font-bold uppercase text-muted-foreground">Visibility</label>
            <select
              className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={hidden}
              onChange={(e) => setHidden(e.target.value)}
            >
              <option value="">All</option>
              <option value="0">Visible only</option>
              <option value="1">Hidden only</option>
            </select>
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
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Premium</label>
            <select
              className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={premium}
              onChange={(e) => setPremium(e.target.value)}
            >
              <option value="">All</option>
              <option value="1">Premium only</option>
              <option value="0">Non-premium only</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold uppercase text-muted-foreground">Same-Day</label>
            <select
              className="mt-1 flex h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={sameDayDelivery}
              onChange={(e) => setSameDayDelivery(e.target.value)}
            >
              <option value="">All</option>
              <option value="1">Same-Day only</option>
              <option value="0">Without same-day</option>
            </select>
          </div>
          {selected.size > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => applyBulkHidden(true)} disabled={bulkHidden.isPending}>
                <EyeOff className="mr-1 h-4 w-4" /> Hide ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkHidden(false)} disabled={bulkHidden.isPending}>
                <Eye className="mr-1 h-4 w-4" /> Unhide ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulk24h(true)} disabled={bulk24h.isPending}>
                <Zap className="mr-1 h-4 w-4" /> Enable 24h ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulk24h(false)} disabled={bulk24h.isPending}>
                Disable 24h ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkPremium(true)} disabled={bulkPremium.isPending}>
                <Sparkles className="mr-1 h-4 w-4 text-amber-500" /> Premium ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkPremium(false)} disabled={bulkPremium.isPending}>
                Disable Premium ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkSameDay(true)} disabled={bulkSameDay.isPending}>
                <Truck className="mr-1 h-4 w-4 text-sky-600" /> Same-Day ({selected.size})
              </Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkSameDay(false)} disabled={bulkSameDay.isPending}>
                Disable Same-Day ({selected.size})
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())} className="text-xs text-muted-foreground">
                Clear ({selected.size})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 overflow-x-auto rounded-lg border bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={skus.length > 0 && skus.every((s) => selected.has(s.id))}
                  onCheckedChange={() => {
                    const allPageSelected = skus.length > 0 && skus.every((s) => selected.has(s.id));
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (allPageSelected) {
                        skus.forEach((s) => next.delete(s.id));
                      } else {
                        skus.forEach((s) => next.add(s.id));
                      }
                      return next;
                    });
                  }}
                  aria-label="Select all tyres on this page"
                />
              </th>
              <th className="p-3">Tyre</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3">Within 24h</th>
              <th className="p-3">Premium</th>
              <th className="p-3">Same-Day</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {skus.map((sku) => (
              <tr
                key={sku.id}
                className={`border-b last:border-0 hover:bg-muted/30 ${sku.isHidden ? "bg-muted/20 opacity-80" : ""}`}
              >
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
                    onClick={() => toggleHidden(sku)}
                    disabled={updateTyre.isPending}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      sku.isHidden
                        ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                        : "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    }`}
                    aria-label={sku.isHidden ? `Unhide ${sku.modelName}` : `Hide ${sku.modelName}`}
                  >
                    {sku.isHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    {sku.isHidden ? "Hidden" : "Visible"}
                  </button>
                </td>
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
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => togglePremium(sku)}
                    disabled={updateTyre.isPending}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      sku.isPremium
                        ? "border border-amber-300 bg-amber-100 text-amber-900 hover:bg-amber-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    aria-label={sku.isPremium ? `Remove premium flag from ${sku.modelName}` : `Set ${sku.modelName} as premium`}
                  >
                    <Sparkles className={`h-3 w-3 ${sku.isPremium ? "fill-amber-500 text-amber-600" : ""}`} />
                    {sku.isPremium ? "Premium" : "OFF"}
                  </button>
                </td>
                <td className="p-3">
                  <button
                    type="button"
                    onClick={() => toggleSameDay(sku)}
                    disabled={updateTyre.isPending}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                      sku.isSameDayDelivery
                        ? "border border-sky-300 bg-sky-100 text-sky-900 hover:bg-sky-200"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                    aria-label={sku.isSameDayDelivery ? `Disable same-day delivery for ${sku.modelName}` : `Enable same-day delivery for ${sku.modelName}`}
                  >
                    <Truck className={`h-3 w-3 ${sku.isSameDayDelivery ? "text-sky-600" : ""}`} />
                    {sku.isSameDayDelivery ? "Same-Day" : "OFF"}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link to={`/admin/tyres/${sku.id}`}>Edit</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => void removeTyre(sku)}
                      disabled={deleteTyre.isPending}
                      aria-label={`Delete ${sku.modelName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
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
      <ConfirmDialog />
    </div>
  );
}
