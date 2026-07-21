import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import {
  useAdminDeleteVoucherMutation,
  useAdminSaveVoucherMutation,
  useAdminVoucherQuery,
} from "@/lib/admin/queries";
import { AdminFormSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";

const emptyForm = {
  code: "",
  brandId: "" as string,
  minQty: 2,
  discountPerQty: 10,
  validFrom: new Date().toISOString().slice(0, 10),
  validTo: new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
  description: "",
};

export default function AdminVoucherEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  const voucherQuery = useAdminVoucherQuery(id);
  const bootstrapQuery = useApiBootstrapQuery();
  const saveMutation = useAdminSaveVoucherMutation();
  const deleteMutation = useAdminDeleteVoucherMutation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const brands = bootstrapQuery.data?.brands ?? [];

  useEffect(() => {
    const voucher = voucherQuery.data?.voucher;
    if (!voucher) return;
    setForm({
      code: voucher.code,
      brandId: voucher.brandId ? String(voucher.brandId) : "",
      minQty: voucher.minQty,
      discountPerQty: voucher.discountPerQty,
      validFrom: voucher.validFrom?.slice(0, 10) ?? "",
      validTo: voucher.validTo?.slice(0, 10) ?? "",
      description: voucher.description,
    });
  }, [voucherQuery.data]);

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await saveMutation.mutateAsync({
        id: isNew ? undefined : id,
        data: {
          code: form.code.trim().toUpperCase(),
          brandId: form.brandId ? Number(form.brandId) : null,
          minQty: Number(form.minQty),
          discountPerQty: Number(form.discountPerQty),
          validFrom: form.validFrom,
          validTo: form.validTo,
          description: form.description,
        },
      });
      navigate("/admin/vouchers");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  const remove = async () => {
    if (isNew) return;
    const ok = await confirm({
      title: "Delete this voucher?",
      description: `Voucher "${form.code || "this offer"}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/admin/vouchers");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  if (!isNew && voucherQuery.isLoading) {
    return <AdminFormSkeleton fields={8} />;
  }

  return (
    <div className="max-w-xl">
      <ConfirmDialog />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/vouchers">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to vouchers
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-extrabold">{isNew ? "New voucher" : "Edit voucher"}</h1>

      <form className="mt-6 space-y-6" onSubmit={submit}>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                className="mt-1 font-mono uppercase"
                value={form.code}
                onChange={(e) => update("code", e.target.value.toUpperCase())}
                required
              />
            </div>
            <div>
              <Label htmlFor="brand">Brand (optional)</Label>
              <select
                id="brand"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.brandId}
                onChange={(e) => update("brandId", e.target.value)}
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="minQty">Minimum tyres</Label>
                <Input
                  id="minQty"
                  type="number"
                  min={1}
                  max={8}
                  className="mt-1"
                  value={form.minQty}
                  onChange={(e) => update("minQty", Number(e.target.value))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="discount">Discount per tyre (GBP)</Label>
                <Input
                  id="discount"
                  type="number"
                  step="0.01"
                  min={0}
                  className="mt-1"
                  value={form.discountPerQty}
                  onChange={(e) => update("discountPerQty", Number(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="validFrom">Valid from</Label>
                <Input
                  id="validFrom"
                  type="date"
                  className="mt-1"
                  value={form.validFrom}
                  onChange={(e) => update("validFrom", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="validTo">Valid to</Label>
                <Input
                  id="validTo"
                  type="date"
                  className="mt-1"
                  value={form.validTo}
                  onChange={(e) => update("validTo", e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description (shown on site)</Label>
              <RichTextEditor
                className="mt-1"
                value={form.description}
                onChange={(html) => update("description", html)}
                minHeight="140px"
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save"}
          </Button>
          {!isNew && (
            <Button type="button" variant="destructive" onClick={remove} disabled={deleteMutation.isPending}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
