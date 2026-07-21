import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAdminBrandQuery,
  useAdminDeleteBrandMutation,
  useAdminSaveBrandMutation,
} from "@/lib/admin/queries";
import { AdminFormSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";
import type { BrandTier } from "@/types";

const emptyForm = {
  name: "",
  slug: "",
  tier: "premium" as BrandTier,
  description: "",
  recommendedForText: "",
  hasActiveOffer: false,
};

export default function AdminBrandEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  const brandQuery = useAdminBrandQuery(id);
  const saveMutation = useAdminSaveBrandMutation();
  const deleteMutation = useAdminDeleteBrandMutation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const brand = brandQuery.data?.brand;

  useEffect(() => {
    if (!brand) return;
    setForm({
      name: brand.name,
      slug: brand.slug,
      tier: brand.tier,
      description: brand.description ?? "",
      recommendedForText: (brand.recommendedFor ?? []).join("\n"),
      hasActiveOffer: brand.hasActiveOffer,
    });
  }, [brand]);

  const update = <K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const recommendedFor = form.recommendedForText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    try {
      await saveMutation.mutateAsync({
        id: isNew ? undefined : id,
        data: {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          tier: form.tier,
          description: form.description.trim() || null,
          recommendedFor,
          hasActiveOffer: form.hasActiveOffer,
        },
      });
      navigate("/admin/brands");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  const remove = async () => {
    if (isNew) return;
    const ok = await confirm({
      title: "Delete this brand?",
      description: `"${form.name || "This brand"}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/admin/brands");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  if (!isNew && brandQuery.isLoading) {
    return <AdminFormSkeleton fields={7} />;
  }

  return (
    <div className="max-w-xl">
      <ConfirmDialog />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/brands">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to brands
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-extrabold">{isNew ? "New brand" : "Edit brand"}</h1>
      {!isNew && brand && (
        <p className="mt-1 text-sm text-muted-foreground">
          {brand.skuCount ?? 0} tyre SKUs use this brand
        </p>
      )}

      <form className="mt-6 space-y-6" onSubmit={submit}>
        <Card>
          <CardContent className="space-y-4 p-5">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" className="mt-1" value={form.name} onChange={(e) => update("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                className="mt-1 font-mono text-sm"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="Auto from name if blank"
              />
            </div>
            <div>
              <Label htmlFor="tier">Tier</Label>
              <select
                id="tier"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.tier}
                onChange={(e) => update("tier", e.target.value as BrandTier)}
              >
                <option value="premium">Premium</option>
                <option value="mid_range">Budget</option>
                <option value="budget">Budget</option>
              </select>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <RichTextEditor
                className="mt-1"
                value={form.description}
                onChange={(html) => update("description", html)}
                minHeight="160px"
              />
            </div>
            <div>
              <Label htmlFor="recommended">Recommended for (one per line)</Label>
              <Textarea
                id="recommended"
                className="mt-1"
                rows={3}
                value={form.recommendedForText}
                onChange={(e) => update("recommendedForText", e.target.value)}
                placeholder="e.g. High-performance saloons"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="offer"
                checked={form.hasActiveOffer}
                onCheckedChange={(v) => update("hasActiveOffer", v === true)}
              />
              <Label htmlFor="offer">Brand has active offer (site-wide badge)</Label>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving…" : "Save"}
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

