import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useApiBootstrapQuery } from "@/lib/api/queries";
import { useAdminDeleteTyreMutation, useAdminSaveTyreMutation, useAdminTyreQuery, useAdminUploadTyreImageMutation, type AdminTyreSku } from "@/lib/admin/queries";
import { AdminFormSkeleton } from "@/components/admin/admin-skeletons";
import { ApiError } from "@/lib/api/client";
import { resolvePublicAssetUrl } from "@/lib/public-asset-url";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { QuantityTiersEditor } from "@/components/admin/quantity-tiers-editor";
import type { EuLabelGrade, TyreSku } from "@/types";

type TyreForm = {
  slug: string;
  brandId: string;
  tyreCategoryId: string;
  modelName: string;
  width: number;
  profile: number;
  rim: number;
  loadIndex: number;
  speedRating: string;
  manufacturerSku: string;
  ean: string;
  pricePerTyre: string;
  stock: string;
  starRating: string;
  reviewCount: string;
  videoUrl: string;
  fuelEfficiency: EuLabelGrade;
  wetGrip: EuLabelGrade;
  externalNoise: string;
  noiseClass: "A" | "B" | "C";
  oeApprovalsJson: string;
  quantityTiersJson: string;
  recalculateTiers: boolean;
  voucherCode: string;
  badgeBestBuy: boolean;
  badgeSpecialist: boolean;
  badgeRecommended: boolean;
  isExtraLoad: boolean;
  isRunFlat: boolean;
  isWinter: boolean;
  isAllSeason: boolean;
  isEvRated: boolean;
  isVan: boolean;
  is4x4: boolean;
  isAvailableWithin24h: boolean;
  isPremium: boolean;
  isSameDayDelivery: boolean;
  isHidden: boolean;
  hasActiveOffer: boolean;
};

const emptyForm: TyreForm = {
  slug: "",
  brandId: "",
  tyreCategoryId: "",
  modelName: "",
  width: 225,
  profile: 45,
  rim: 17,
  loadIndex: 94,
  speedRating: "Y",
  manufacturerSku: "",
  ean: "",
  pricePerTyre: "",
  stock: "0",
  starRating: "0",
  reviewCount: "0",
  videoUrl: "",
  fuelEfficiency: "B",
  wetGrip: "A",
  externalNoise: "71",
  noiseClass: "B",
  oeApprovalsJson: "[]",
  quantityTiersJson: "",
  recalculateTiers: false,
  voucherCode: "",
  badgeBestBuy: false,
  badgeSpecialist: false,
  badgeRecommended: false,
  isExtraLoad: false,
  isRunFlat: false,
  isWinter: false,
  isAllSeason: false,
  isEvRated: false,
  isVan: false,
  is4x4: false,
  isAvailableWithin24h: false,
  isPremium: false,
  isSameDayDelivery: false,
  isHidden: false,
  hasActiveOffer: false,
};

function skuToForm(sku: AdminTyreSku, categories: { id: number; slug: string }[]): TyreForm {
  const categoryId =
    sku.tyreCategoryId ?? categories.find((c) => c.slug === sku.category)?.id ?? "";

  const badges = sku.badges ?? [];

  return {
    slug: sku.slug,
    brandId: String(sku.brandId),
    tyreCategoryId: String(categoryId),
    modelName: sku.modelName,
    width: sku.width,
    profile: sku.profile,
    rim: sku.rim,
    loadIndex: sku.loadIndex,
    speedRating: sku.speedRating,
    manufacturerSku: sku.manufacturerSku,
    ean: sku.ean ?? "",
    pricePerTyre: String(sku.pricePerTyre),
    stock: String(sku.stock),
    starRating: String(sku.starRating),
    reviewCount: String(sku.reviewCount),
    videoUrl: sku.videoUrl ?? "",
    fuelEfficiency: sku.euLabel.fuelEfficiency,
    wetGrip: sku.euLabel.wetGrip,
    externalNoise: String(sku.euLabel.externalNoise),
    noiseClass: sku.euLabel.noiseClass,
    oeApprovalsJson: JSON.stringify(sku.oeApprovals ?? [], null, 2),
    quantityTiersJson: JSON.stringify(sku.quantityTiers ?? [], null, 2),
    recalculateTiers: false,
    voucherCode: sku.voucherCode ?? "",
    badgeBestBuy: badges.includes("best_buy"),
    badgeSpecialist: badges.includes("specialist"),
    badgeRecommended: badges.includes("recommended"),
    isExtraLoad: sku.isExtraLoad,
    isRunFlat: sku.isRunFlat,
    isWinter: sku.isWinter,
    isAllSeason: sku.isAllSeason,
    isEvRated: sku.isEvRated,
    isVan: sku.isVan,
    is4x4: sku.is4x4,
    isAvailableWithin24h: Boolean(sku.isAvailableWithin24h),
    isPremium: Boolean(sku.isPremium),
    isSameDayDelivery: Boolean(sku.isSameDayDelivery),
    isHidden: Boolean(sku.isHidden),
    hasActiveOffer: sku.hasActiveOffer,
  };
}

function formToPayload(form: TyreForm, isNew: boolean): Record<string, unknown> {
  const badges: TyreSku["badges"] = [];
  if (form.badgeBestBuy) badges.push("best_buy");
  if (form.badgeSpecialist) badges.push("specialist");
  if (form.badgeRecommended) badges.push("recommended");

  let oeApprovals: unknown[] = [];
  let quantityTiers: unknown[] | undefined;

  try {
    oeApprovals = JSON.parse(form.oeApprovalsJson || "[]");
    if (!Array.isArray(oeApprovals)) throw new Error("OE approvals must be a JSON array.");
  } catch {
    throw new Error("OE approvals JSON is invalid.");
  }

  if (form.quantityTiersJson.trim()) {
    try {
      quantityTiers = JSON.parse(form.quantityTiersJson);
      if (!Array.isArray(quantityTiers)) throw new Error("Quantity tiers must be a JSON array.");
    } catch {
      throw new Error("Quantity tiers JSON is invalid.");
    }
  }

  const payload: Record<string, unknown> = {
    brandId: Number(form.brandId),
    tyreCategoryId: Number(form.tyreCategoryId),
    modelName: form.modelName.trim(),
    width: Number(form.width),
    profile: Number(form.profile),
    rim: Number(form.rim),
    loadIndex: Number(form.loadIndex),
    speedRating: form.speedRating.trim().toUpperCase(),
    manufacturerSku: form.manufacturerSku.trim(),
    ean: form.ean.trim() || null,
    pricePerTyre: Number(form.pricePerTyre),
    stock: Number(form.stock),
    starRating: Number(form.starRating),
    reviewCount: Number(form.reviewCount),
    videoUrl: form.videoUrl.trim() || null,
    euLabel: {
      fuelEfficiency: form.fuelEfficiency,
      wetGrip: form.wetGrip,
      externalNoise: Number(form.externalNoise),
      noiseClass: form.noiseClass,
    },
    oeApprovals,
    badges,
    isExtraLoad: form.isExtraLoad,
    isRunFlat: form.isRunFlat,
    isWinter: form.isWinter,
    isAllSeason: form.isAllSeason,
    isEvRated: form.isEvRated,
    isVan: form.isVan,
    is4x4: form.is4x4,
    isAvailableWithin24h: form.isAvailableWithin24h,
    isPremium: form.isPremium,
    isSameDayDelivery: form.isSameDayDelivery,
    isHidden: form.isHidden,
    hasActiveOffer: form.hasActiveOffer,
    voucherCode: form.voucherCode.trim() || null,
  };

  if (form.slug.trim()) {
    payload.slug = form.slug.trim();
  }

  if (quantityTiers) {
    payload.quantityTiers = quantityTiers;
  } else if (form.recalculateTiers) {
    payload.recalculateTiers = true;
  }

  if (isNew && !form.slug.trim()) {
    delete payload.slug;
  }

  return payload;
}

const FLAG_FIELDS: { key: keyof TyreForm; label: string }[] = [
  { key: "isExtraLoad", label: "Extra load (XL)" },
  { key: "isRunFlat", label: "Run flat" },
  { key: "isWinter", label: "Winter" },
  { key: "isAllSeason", label: "All season" },
  { key: "isEvRated", label: "EV rated" },
  { key: "isVan", label: "Van" },
  { key: "is4x4", label: "4x4" },
  { key: "hasActiveOffer", label: "Active offer badge" },
  { key: "isAvailableWithin24h", label: "Within 24 hours" },
  { key: "isPremium", label: "Premium tyre" },
  { key: "isSameDayDelivery", label: "Same-Day Delivery" },
  { key: "isHidden", label: "Hidden from storefront" },
];

function TyreImageField({
  label,
  hint,
  currentUrl,
  previewUrl,
  disabled,
  onFile,
  onRemove,
}: {
  label: string;
  hint: string;
  currentUrl: string | null;
  previewUrl: string | null;
  disabled?: boolean;
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
          <img src={displayUrl} alt="" className="h-20 w-20 rounded-md object-contain bg-white" />
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => void onRemove()}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          disabled={disabled}
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => inputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" />
          {displayUrl ? "Replace image" : "Upload image"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminCatalogTyreEditPage() {
  const params = useParams();
  const navigate = useNavigate();
  const isNew = params.id === "new";
  const id = isNew ? 0 : Number(params.id);
  const tyreQuery = useAdminTyreQuery(id);
  const bootstrapQuery = useApiBootstrapQuery();
  const saveMutation = useAdminSaveTyreMutation();
  const uploadImageMutation = useAdminUploadTyreImageMutation();
  const deleteMutation = useAdminDeleteTyreMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const sku = tyreQuery.data?.sku;

  const brands = bootstrapQuery.data?.brands ?? [];
  const categories = bootstrapQuery.data?.categories ?? [];

  const [form, setForm] = useState<TyreForm>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (!sku || isNew) return;
    setForm(skuToForm(sku, categories));
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(false);
  }, [sku, isNew, categories]);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const currentImageUrl =
    sku && !isNew && !removeImage ? (resolvePublicAssetUrl(sku.imageUrl) ?? sku.imageUrl ?? null) : null;
  const imageChanged = Boolean(imageFile) || removeImage;

  const update = <K extends keyof TyreForm>(key: K, value: TyreForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const pickImage = (file: File | null) => {
    if (!file) return;
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const data = formToPayload(form, isNew);
      const result = await saveMutation.mutateAsync(isNew ? { data } : { id, data });
      const savedId = result.sku.id;

      if (imageChanged) {
        await uploadImageMutation.mutateAsync({
          id: savedId,
          image: imageFile ?? undefined,
          removeImage: removeImage && !imageFile,
        });
      }

      navigate("/admin/tyres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Save failed.");
    }
  };

  const removeTyre = async () => {
    if (isNew) return;
    const ok = await confirm({
      title: "Delete this tyre?",
      description: sku
        ? `"${sku.brandName} ${sku.modelName} ${sku.sizeLabel}" will be permanently removed from the catalogue. This cannot be undone.`
        : "This tyre will be permanently removed from the catalogue. This cannot be undone.",
      confirmLabel: "Delete",
      variant: "destructive",
    });
    if (!ok) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate("/admin/tyres");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Delete failed.");
    }
  };

  const isSaving = saveMutation.isPending || uploadImageMutation.isPending;

  if (!isNew && tyreQuery.isLoading) {
    return <AdminFormSkeleton wide fields={12} />;
  }

  if (!isNew && (!sku || tyreQuery.isError)) {
    return <p className="text-sm text-destructive">SKU not found.</p>;
  }

  return (
    <div className="max-w-2xl">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/admin/tyres">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to catalogue
        </Link>
      </Button>

      <h1 className="font-display text-2xl font-extrabold">{isNew ? "New tyre SKU" : "Edit tyre"}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {isNew
          ? "Leave slug blank to auto-generate from brand, model and size."
          : sku
            ? `#${sku.id} · ${sku.brandName} ${sku.modelName} · ${sku.sizeLabel}`
            : ""}
      </p>

      <form className="mt-6 space-y-6" onSubmit={submit}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Identity</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="brand">Brand</Label>
              <select
                id="brand"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.brandId}
                onChange={(e) => update("brandId", e.target.value)}
                required
              >
                <option value="">Select brand</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.tyreCategoryId}
                onChange={(e) => update("tyreCategoryId", e.target.value)}
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="model">Model name</Label>
              <Input
                id="model"
                className="mt-1"
                value={form.modelName}
                onChange={(e) => update("modelName", e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="slug">URL slug</Label>
              <Input
                id="slug"
                className="mt-1 font-mono text-sm"
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder={isNew ? "Auto-generated if blank" : sku?.slug}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Size & rating</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="width">Width</Label>
              <Input id="width" type="number" className="mt-1" value={form.width} onChange={(e) => update("width", Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="profile">Profile</Label>
              <Input id="profile" type="number" className="mt-1" value={form.profile} onChange={(e) => update("profile", Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="rim">Rim</Label>
              <Input id="rim" type="number" className="mt-1" value={form.rim} onChange={(e) => update("rim", Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="load">Load index</Label>
              <Input id="load" type="number" className="mt-1" value={form.loadIndex} onChange={(e) => update("loadIndex", Number(e.target.value))} required />
            </div>
            <div>
              <Label htmlFor="speed">Speed rating</Label>
              <Input id="speed" className="mt-1 uppercase" value={form.speedRating} onChange={(e) => update("speedRating", e.target.value.toUpperCase())} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Product codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="mfg">Manufacturer SKU</Label>
              <Input id="mfg" className="mt-1 font-mono" value={form.manufacturerSku} onChange={(e) => update("manufacturerSku", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="ean">EAN (optional)</Label>
              <Input id="ean" className="mt-1 font-mono" value={form.ean} onChange={(e) => update("ean", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pricing & stock</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="price">Price per tyre (£)</Label>
              <Input id="price" type="number" step="0.01" min="0" className="mt-1" value={form.pricePerTyre} onChange={(e) => update("pricePerTyre", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input id="stock" type="number" min="0" className="mt-1" value={form.stock} onChange={(e) => update("stock", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="voucher">Voucher code</Label>
              <Input id="voucher" className="mt-1 font-mono uppercase" value={form.voucherCode} onChange={(e) => update("voucherCode", e.target.value.toUpperCase())} />
            </div>
            <div className="flex items-end pb-2">
              <div className="flex items-center gap-2">
                <Checkbox id="recalc" checked={form.recalculateTiers} onCheckedChange={(v) => update("recalculateTiers", v === true)} />
                <Label htmlFor="recalc">Recalculate quantity tiers from price</Label>
              </div>
            </div>
            <div className="sm:col-span-2">
              <QuantityTiersEditor
                value={form.quantityTiersJson}
                onChange={(json) => update("quantityTiersJson", json)}
                basePrice={Number(form.pricePerTyre) || 0}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">EU label</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="fuel">Fuel efficiency</Label>
              <select id="fuel" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.fuelEfficiency} onChange={(e) => update("fuelEfficiency", e.target.value as EuLabelGrade)}>
                {["A", "B", "C", "D", "E"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="wet">Wet grip</Label>
              <select id="wet" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.wetGrip} onChange={(e) => update("wetGrip", e.target.value as EuLabelGrade)}>
                {["A", "B", "C", "D", "E"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="noise">External noise (dB)</Label>
              <Input id="noise" type="number" className="mt-1" value={form.externalNoise} onChange={(e) => update("externalNoise", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="noiseClass">Noise class</Label>
              <select id="noiseClass" className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.noiseClass} onChange={(e) => update("noiseClass", e.target.value as "A" | "B" | "C")}>
                {["A", "B", "C"].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Reviews & media</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <TyreImageField
                label="Product image"
                hint={
                  isNew
                    ? "Optional. Upload a photo of this tyre model — it will be saved when you create the SKU. PNG, JPG or WebP up to 4 MB."
                    : "Shown on search results and the product page instead of the generic placeholder. PNG, JPG or WebP up to 4 MB."
                }
                currentUrl={currentImageUrl}
                previewUrl={imagePreview}
                onFile={pickImage}
                onRemove={async () => {
                  const ok = await confirm({
                    title: "Remove tyre image?",
                    description: "The generic category placeholder will be shown until you upload a new image.",
                    confirmLabel: "Remove",
                    variant: "destructive",
                  });
                  if (!ok) return;
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImageFile(null);
                  setImagePreview(null);
                  setRemoveImage(true);
                }}
              />
            </div>
            <div>
              <Label htmlFor="stars">Star rating</Label>
              <Input id="stars" type="number" step="0.1" min="0" max="5" className="mt-1" value={form.starRating} onChange={(e) => update("starRating", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="reviews">Review count</Label>
              <Input id="reviews" type="number" min="0" className="mt-1" value={form.reviewCount} onChange={(e) => update("reviewCount", e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="video">Video URL</Label>
              <Input id="video" className="mt-1" value={form.videoUrl} onChange={(e) => update("videoUrl", e.target.value)} placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="oe">OE approvals (JSON array)</Label>
              <Textarea id="oe" className="mt-1 font-mono text-xs" rows={4} value={form.oeApprovalsJson} onChange={(e) => update("oeApprovalsJson", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Badges & flags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Checkbox id="badgeBestBuy" checked={form.badgeBestBuy} onCheckedChange={(v) => update("badgeBestBuy", v === true)} />
                <Label htmlFor="badgeBestBuy">Best buy</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="badgeSpecialist" checked={form.badgeSpecialist} onCheckedChange={(v) => update("badgeSpecialist", v === true)} />
                <Label htmlFor="badgeSpecialist">Specialist</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="badgeRecommended" checked={form.badgeRecommended} onCheckedChange={(v) => update("badgeRecommended", v === true)} />
                <Label htmlFor="badgeRecommended">Recommended</Label>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {FLAG_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox id={key} checked={form[key] as boolean} onCheckedChange={(v) => update(key, v === true)} />
                  <Label htmlFor={key}>{label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving…" : isNew ? "Create tyre SKU" : "Save changes"}
          </Button>
          {!isNew && (
            <Button type="button" variant="destructive" onClick={removeTyre} disabled={deleteMutation.isPending}>
              <Trash2 className="mr-2 h-4 w-4" /> {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          )}
        </div>
      </form>
      <ConfirmDialog />
    </div>
  );
}


