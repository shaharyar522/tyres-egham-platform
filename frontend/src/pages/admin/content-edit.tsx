import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import {
  useAdminContentItemQuery,
  useAdminDeleteContentMutation,
  useAdminSaveContentMutation,
  useAdminUploadContentMediaMutation,
} from "@/lib/admin/queries";
import { AdminFormSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";

const emptyForm = {
  namespace: "blog",
  slug: "",
  title: "",
  excerpt: "",
  category: "buying-guide",
  readMinutes: 5,
  publishedAt: new Date().toISOString().slice(0, 10),
  imageEmoji: "",
  body: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  robots: "",
};

function MediaField({
  label,
  hint,
  currentUrl,
  previewUrl,
  onFile,
  onRemove,
}: {
  label: string;
  hint: string;
  currentUrl: string | null;
  previewUrl: string | null;
  onFile: (file: File | null) => void;
  onRemove: () => void | Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = previewUrl ?? currentUrl;

  return (
    <div className="space-y-2">
      <Label className="block">{label}</Label>
      <p className="text-xs text-muted-foreground">{hint}</p>
      {displayUrl && (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
          <img src={displayUrl} alt="" className="h-16 max-w-[200px] rounded-md object-cover" />
          <Button type="button" variant="outline" size="sm" onClick={() => void onRemove()}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" />
          {displayUrl ? "Replace image" : "Upload image"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminContentEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  const itemQuery = useAdminContentItemQuery(id);
  const saveMutation = useAdminSaveContentMutation();
  const uploadMediaMutation = useAdminUploadContentMediaMutation();
  const deleteMutation = useAdminDeleteContentMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const article = itemQuery.data?.article;

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [featuredFile, setFeaturedFile] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [ogFile, setOgFile] = useState<File | null>(null);
  const [ogPreview, setOgPreview] = useState<string | null>(null);
  const [removeFeatured, setRemoveFeatured] = useState(false);
  const [removeOg, setRemoveOg] = useState(false);

  useEffect(() => {
    if (!article) return;
    setForm({
      namespace: article.namespace ?? "blog",
      slug: article.slug,
      title: article.title,
      excerpt: article.excerpt,
      category: article.category,
      readMinutes: article.readMinutes,
      publishedAt: article.publishedAt?.slice(0, 10) ?? "",
      imageEmoji: article.imageEmoji ?? "",
      body: article.body ?? "",
      metaTitle: article.metaTitle ?? "",
      metaDescription: article.metaDescription ?? "",
      metaKeywords: article.metaKeywords ?? "",
      robots: article.robots ?? "",
    });
    setFeaturedFile(null);
    setFeaturedPreview(null);
    setOgFile(null);
    setOgPreview(null);
    setRemoveFeatured(false);
    setRemoveOg(false);
  }, [article]);

  useEffect(() => {
    return () => {
      if (featuredPreview) URL.revokeObjectURL(featuredPreview);
      if (ogPreview) URL.revokeObjectURL(ogPreview);
    };
  }, [featuredPreview, ogPreview]);

  const update = (key: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickFeatured = (file: File | null) => {
    if (!file) return;
    if (featuredPreview) URL.revokeObjectURL(featuredPreview);
    setFeaturedFile(file);
    setFeaturedPreview(URL.createObjectURL(file));
    setRemoveFeatured(false);
  };

  const pickOg = (file: File | null) => {
    if (!file) return;
    if (ogPreview) URL.revokeObjectURL(ogPreview);
    setOgFile(file);
    setOgPreview(URL.createObjectURL(file));
    setRemoveOg(false);
  };

  const mediaChanged = Boolean(featuredFile) || Boolean(ogFile) || removeFeatured || removeOg;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await saveMutation.mutateAsync({
        id: isNew ? undefined : id,
        data: {
          ...form,
          metaTitle: form.metaTitle.trim() || null,
          metaDescription: form.metaDescription.trim() || null,
          metaKeywords: form.metaKeywords.trim() || null,
          robots: form.robots.trim() || null,
        },
      });
      const savedId = result.article.id;

      if (mediaChanged) {
        await uploadMediaMutation.mutateAsync({
          id: savedId,
          featuredImage: featuredFile ?? undefined,
          ogImage: ogFile ?? undefined,
          removeFeaturedImage: removeFeatured && !featuredFile,
          removeOgImage: removeOg && !ogFile,
        });
      }

      navigate("/admin/content");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Save failed.");
    }
  };

  const remove = async () => {
    if (isNew) return;
    const ok = await confirm({
      title: "Delete this entry?",
      description: `"${form.title || "This entry"}" will be permanently removed. This cannot be undone.`,
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/admin/content");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const isSaving = saveMutation.isPending || uploadMediaMutation.isPending;
  const currentFeaturedUrl = article && !removeFeatured ? (article.featuredImageUrl ?? null) : null;
  const currentOgUrl = article && !removeOg ? (article.ogImageUrl ?? null) : null;

  if (!isNew && itemQuery.isLoading) {
    return <AdminFormSkeleton fields={8} />;
  }

  return (
    <div className="max-w-3xl">
      <ConfirmDialog />
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/content">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to content
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-extrabold">{isNew ? "New content" : "Edit content"}</h1>

      <form className="mt-6 space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Content</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Namespace</Label>
              <select
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.namespace}
                onChange={(e) => update("namespace", e.target.value)}
              >
                <option value="blog">blog (public blog posts)</option>
                <option value="content">content (legacy help articles)</option>
                <option value="page">page (legal / static CMS pages)</option>
                <option value="tyreinfo">tyreinfo</option>
              </select>
            </div>
            <div>
              <Label>Slug</Label>
              <Input className="mt-1" value={form.slug} onChange={(e) => update("slug", e.target.value)} required />
            </div>
            <div>
              <Label>Category</Label>
              <Input className="mt-1" value={form.category} onChange={(e) => update("category", e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Label>Title</Label>
              <Input className="mt-1" value={form.title} onChange={(e) => update("title", e.target.value)} required />
            </div>
            <div className="sm:col-span-2">
              <Label>Excerpt</Label>
              <Textarea className="mt-1" rows={2} value={form.excerpt} onChange={(e) => update("excerpt", e.target.value)} required />
            </div>
            <div>
              <Label>Read minutes</Label>
              <Input type="number" className="mt-1" value={form.readMinutes} onChange={(e) => update("readMinutes", Number(e.target.value))} />
            </div>
            <div>
              <Label>Published date</Label>
              <Input type="date" className="mt-1" value={form.publishedAt} onChange={(e) => update("publishedAt", e.target.value)} />
            </div>
            <div>
              <Label>Image emoji (fallback)</Label>
              <Input className="mt-1" value={form.imageEmoji} onChange={(e) => update("imageEmoji", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <MediaField
                label="Featured image"
                hint="Shown on the blog listing and article hero. PNG, JPG or WebP up to 4 MB."
                currentUrl={currentFeaturedUrl}
                previewUrl={featuredPreview}
                onFile={pickFeatured}
                onRemove={async () => {
                  const ok = await confirm({ title: "Remove featured image?", confirmLabel: "Remove", variant: "destructive" });
                  if (!ok) return;
                  if (featuredPreview) URL.revokeObjectURL(featuredPreview);
                  setFeaturedFile(null);
                  setFeaturedPreview(null);
                  setRemoveFeatured(true);
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Body</Label>
              <RichTextEditor className="mt-1" value={form.body} onChange={(html) => update("body", html)} minHeight="280px" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SEO</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-5">
            <div>
              <Label>Meta title</Label>
              <Input className="mt-1" value={form.metaTitle} onChange={(e) => update("metaTitle", e.target.value)} placeholder="Leave blank to use article title" />
              <p className="mt-1 text-xs text-muted-foreground">{form.metaTitle.length}/60 characters recommended</p>
            </div>
            <div>
              <Label>Meta description</Label>
              <Textarea className="mt-1" rows={3} value={form.metaDescription} onChange={(e) => update("metaDescription", e.target.value)} placeholder="Leave blank to use excerpt" />
              <p className="mt-1 text-xs text-muted-foreground">{form.metaDescription.length}/160 characters recommended</p>
            </div>
            <div>
              <Label>Meta keywords</Label>
              <Input className="mt-1" value={form.metaKeywords} onChange={(e) => update("metaKeywords", e.target.value)} placeholder="tyres, fitting, winter tyres" />
            </div>
            <div>
              <Label>Robots directive</Label>
              <Input className="mt-1" value={form.robots} onChange={(e) => update("robots", e.target.value)} placeholder="index,follow" />
            </div>
            <MediaField
              label="Open Graph image"
              hint="Used when sharing on social media. 1200×630 recommended. Falls back to featured image, then site default."
              currentUrl={currentOgUrl}
              previewUrl={ogPreview}
              onFile={pickOg}
              onRemove={async () => {
                const ok = await confirm({ title: "Remove OG image?", confirmLabel: "Remove", variant: "destructive" });
                if (!ok) return;
                if (ogPreview) URL.revokeObjectURL(ogPreview);
                setOgFile(null);
                setOgPreview(null);
                setRemoveOg(true);
              }}
            />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
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
