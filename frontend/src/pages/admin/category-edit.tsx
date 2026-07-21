import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  useAdminCategoryQuery,
  useAdminDeleteCategoryMutation,
  useAdminSaveCategoryMutation,
} from "@/lib/admin/queries";
import { AdminFormSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  iconName: "",
};

export default function AdminCategoryEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  const categoryQuery = useAdminCategoryQuery(id);
  const saveMutation = useAdminSaveCategoryMutation();
  const deleteMutation = useAdminDeleteCategoryMutation();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const category = categoryQuery.data?.category;

  useEffect(() => {
    if (!category) return;
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? "",
      iconName: category.iconName ?? "",
    });
  }, [category]);

  const update = <K extends keyof typeof emptyForm>(key: K, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await saveMutation.mutateAsync({
        id: isNew ? undefined : id,
        data: {
          name: form.name.trim(),
          slug: form.slug.trim() || undefined,
          description: form.description.trim() || null,
          iconName: form.iconName.trim() || null,
        },
      });
      navigate("/admin/categories");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  const remove = async () => {
    if (isNew) return;
    const ok = await confirm({
      title: "Delete this category?",
      description: `"${form.name || "This category"}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/admin/categories");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  if (!isNew && categoryQuery.isLoading) {
    return <AdminFormSkeleton fields={5} />;
  }

  return (
    <div className="max-w-xl">
      <ConfirmDialog />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/categories">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to categories
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-extrabold">{isNew ? "New category" : "Edit category"}</h1>
      {!isNew && category && (
        <p className="mt-1 text-sm text-muted-foreground">
          {category.skuCount ?? 0} tyre SKUs use this category
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
                placeholder="e.g. car, winter, 4x4"
              />
            </div>
            <div>
              <Label htmlFor="icon">Icon name (Lucide)</Label>
              <Input
                id="icon"
                className="mt-1 font-mono text-sm"
                value={form.iconName}
                onChange={(e) => update("iconName", e.target.value)}
                placeholder="e.g. Car, Snowflake, Truck"
              />
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
