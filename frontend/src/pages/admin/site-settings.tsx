import { useEffect, useRef, useState } from "react";
import { ImageIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useAdminSaveSiteSettingsMutation,
  useAdminSiteSettingsQuery,
  type AdminSiteSettings,
  type AdminSiteSettingsSavePayload,
} from "@/lib/admin/queries";
import { AdminSiteSettingsSkeleton } from "@/components/admin/admin-skeletons";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { ApiError } from "@/lib/api/client";

function LogoDimensionField({
  id,
  label,
  value,
  onChange,
  min,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div>
      <Label htmlFor={id} className="mb-1.5 block text-xs">
        {label}
      </Label>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        required
      />
    </div>
  );
}

function LogoSizePreview({
  label,
  src,
  height,
  maxWidth,
}: {
  label: string;
  src: string;
  height: number;
  maxWidth: number;
}) {
  return (
    <div className="text-center">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex min-h-[4rem] items-center justify-center rounded border bg-muted/20 px-3 py-2">
        <img
          src={src}
          alt=""
          style={{ height: `${height}px`, maxWidth: `${maxWidth}px` }}
          className="w-auto object-contain"
        />
      </div>
      <p className="mt-1 text-[10px] text-muted-foreground">
        {height}px × max {maxWidth}px
      </p>
    </div>
  );
}

function AssetField({
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
          <img src={displayUrl} alt="" className="h-12 max-w-[160px] object-contain" />
          <Button type="button" variant="outline" size="sm" onClick={() => void onRemove()}>
            <Trash2 className="mr-2 h-4 w-4" /> Remove
          </Button>
        </div>
      )}
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.ico"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          <ImageIcon className="mr-2 h-4 w-4" />
          {displayUrl ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  );
}

export default function AdminSiteSettingsPage() {
  const settingsQuery = useAdminSiteSettingsQuery();
  const saveMutation = useAdminSaveSiteSettingsMutation();
  const settings = settingsQuery.data?.settings;

  const [form, setForm] = useState<AdminSiteSettings | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [ogImageFile, setOgImageFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [ogPreview, setOgPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);
  const [removeOgImage, setRemoveOgImage] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const confirmRemoveAsset = async (label: string, action: () => void) => {
    const ok = await confirm({
      title: `Remove ${label}?`,
      description: "The asset will be cleared when you save site settings.",
      confirmLabel: "Remove",
      variant: "destructive",
    });
    if (ok) action();
  };

  useEffect(() => {
    if (settings) {
      setForm({
        ...settings,
        headerLogoHeight: settings.headerLogoHeight ?? 56,
        headerLogoMaxWidth: settings.headerLogoMaxWidth ?? 220,
        headerLogoHeightMobile: settings.headerLogoHeightMobile ?? 40,
        headerLogoMaxWidthMobile: settings.headerLogoMaxWidthMobile ?? 152,
        footerLogoHeight: settings.footerLogoHeight ?? 52,
        footerLogoMaxWidth: settings.footerLogoMaxWidth ?? 200,
      });
      setRemoveLogo(false);
      setRemoveFavicon(false);
      setRemoveOgImage(false);
      setLogoFile(null);
      setFaviconFile(null);
      setOgImageFile(null);
      setLogoPreview(null);
      setFaviconPreview(null);
      setOgPreview(null);
    }
  }, [settings]);

  const set = <K extends keyof AdminSiteSettings>(key: K, value: AdminSiteSettings[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const pickFile = (kind: "logo" | "favicon" | "og", file: File | null) => {
    const url = file ? URL.createObjectURL(file) : null;
    if (kind === "logo") {
      setLogoFile(file);
      setLogoPreview(url);
      setRemoveLogo(false);
    } else if (kind === "favicon") {
      setFaviconFile(file);
      setFaviconPreview(url);
      setRemoveFavicon(false);
    } else {
      setOgImageFile(file);
      setOgPreview(url);
      setRemoveOgImage(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setMessage(null);
    setError(null);
    const payload: AdminSiteSettingsSavePayload = {
      ...form,
      logoFile,
      faviconFile,
      ogImageFile,
      removeLogo,
      removeFavicon,
      removeOgImage,
    };
    try {
      await saveMutation.mutateAsync(payload);
      setMessage("Site settings saved.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save settings.");
    }
  };

  if (settingsQuery.isLoading || !form) {
    return <AdminSiteSettingsSkeleton />;
  }

  return (
    <div>
      <ConfirmDialog />
      <h1 className="font-display text-2xl font-extrabold">Site settings</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Logo, favicon, contact details, social links, trust ribbon, and SEO — everything shown on the public site.
      </p>

      <form onSubmit={save} className="mt-6 max-w-3xl space-y-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">Branding &amp; assets</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="businessName" className="mb-1.5 block">Business name</Label>
                <Input id="businessName" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="logoMonogram" className="mb-1.5 block">Logo monogram (fallback)</Label>
                <Input id="logoMonogram" maxLength={8} value={form.logoMonogram} onChange={(e) => set("logoMonogram", e.target.value.toUpperCase())} required />
              </div>
            </div>
            <div>
              <Label htmlFor="tagline" className="mb-1.5 block">Tagline</Label>
              <Input id="tagline" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="themeColor" className="mb-1.5 block">Theme colour</Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Used for buttons, links, accents, and the browser theme bar. Enter a hex code like #fff700.
              </p>
              <div className="mt-1.5 flex gap-2">
                <Input
                  id="themeColor"
                  value={form.themeColor}
                  onChange={(e) => set("themeColor", e.target.value)}
                  placeholder="#a00303"
                  className="font-mono"
                />
                <input
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(form.themeColor) ? form.themeColor : "#a00303"}
                  onChange={(e) => set("themeColor", e.target.value)}
                  className="h-10 w-12 cursor-pointer rounded border"
                  aria-label="Pick theme colour"
                />
              </div>
            </div>
            <AssetField
              label="Site logo"
              hint="PNG, JPG, WebP or SVG. Shown in header and footer when set."
              currentUrl={removeLogo ? null : form.logoUrl}
              previewUrl={logoPreview}
              onFile={(f) => pickFile("logo", f)}
              onRemove={() =>
                confirmRemoveAsset("site logo", () => {
                  setRemoveLogo(true);
                  setLogoFile(null);
                  setLogoPreview(null);
                })
              }
            />

            <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
              <div>
                <p className="font-display text-sm font-bold">Logo display size</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Set height and max width in pixels for header and footer. Increase these if your logo looks too small or squashed.
                </p>
              </div>
              {(logoPreview ?? (removeLogo ? null : form.logoUrl)) && (
                <div className="flex flex-wrap items-end gap-6 rounded-md border bg-background p-3">
                  <LogoSizePreview
                    label="Header (desktop)"
                    src={logoPreview ?? form.logoUrl ?? ""}
                    height={form.headerLogoHeight}
                    maxWidth={form.headerLogoMaxWidth}
                  />
                  <LogoSizePreview
                    label="Header (mobile)"
                    src={logoPreview ?? form.logoUrl ?? ""}
                    height={form.headerLogoHeightMobile}
                    maxWidth={form.headerLogoMaxWidthMobile}
                  />
                  <LogoSizePreview
                    label="Footer"
                    src={logoPreview ?? form.logoUrl ?? ""}
                    height={form.footerLogoHeight}
                    maxWidth={form.footerLogoMaxWidth}
                  />
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <LogoDimensionField
                  id="headerLogoHeight"
                  label="Header height (px)"
                  value={form.headerLogoHeight}
                  onChange={(v) => set("headerLogoHeight", v)}
                  min={24}
                  max={160}
                />
                <LogoDimensionField
                  id="headerLogoMaxWidth"
                  label="Header max width (px)"
                  value={form.headerLogoMaxWidth}
                  onChange={(v) => set("headerLogoMaxWidth", v)}
                  min={80}
                  max={480}
                />
                <LogoDimensionField
                  id="headerLogoHeightMobile"
                  label="Mobile header height (px)"
                  value={form.headerLogoHeightMobile}
                  onChange={(v) => set("headerLogoHeightMobile", v)}
                  min={20}
                  max={120}
                />
                <LogoDimensionField
                  id="headerLogoMaxWidthMobile"
                  label="Mobile header max width (px)"
                  value={form.headerLogoMaxWidthMobile}
                  onChange={(v) => set("headerLogoMaxWidthMobile", v)}
                  min={60}
                  max={360}
                />
                <LogoDimensionField
                  id="footerLogoHeight"
                  label="Footer height (px)"
                  value={form.footerLogoHeight}
                  onChange={(v) => set("footerLogoHeight", v)}
                  min={24}
                  max={160}
                />
                <LogoDimensionField
                  id="footerLogoMaxWidth"
                  label="Footer max width (px)"
                  value={form.footerLogoMaxWidth}
                  onChange={(v) => set("footerLogoMaxWidth", v)}
                  min={80}
                  max={480}
                />
              </div>
            </div>
            <AssetField
              label="Favicon"
              hint="ICO, PNG or SVG. Browser tab icon."
              currentUrl={removeFavicon ? null : form.faviconUrl}
              previewUrl={faviconPreview}
              onFile={(f) => pickFile("favicon", f)}
              onRemove={() =>
                confirmRemoveAsset("favicon", () => {
                  setRemoveFavicon(true);
                  setFaviconFile(null);
                  setFaviconPreview(null);
                })
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">Contact</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone" className="mb-1.5 block">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => set("phone", e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1.5 block">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="addressLine1" className="mb-1.5 block">Address line 1</Label>
              <Input id="addressLine1" value={form.addressLine1} onChange={(e) => set("addressLine1", e.target.value)} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="addressLine2" className="mb-1.5 block">Address line 2</Label>
                <Input id="addressLine2" value={form.addressLine2} onChange={(e) => set("addressLine2", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="town" className="mb-1.5 block">Town</Label>
                <Input id="town" value={form.town} onChange={(e) => set("town", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="postcode" className="mb-1.5 block">Postcode</Label>
              <Input id="postcode" value={form.postcode} onChange={(e) => set("postcode", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="openingHours" className="mb-1.5 block">Opening hours note</Label>
              <Input id="openingHours" value={form.openingHoursNote} onChange={(e) => set("openingHoursNote", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">Social &amp; trust</p>
            <div>
              <Label htmlFor="googleBusinessUrl" className="mb-1.5 block">Google Business profile URL</Label>
              <Input id="googleBusinessUrl" type="url" value={form.googleBusinessUrl} onChange={(e) => set("googleBusinessUrl", e.target.value)} placeholder="https://g.page/..." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <Label htmlFor="facebookUrl" className="mb-1.5 block">Facebook URL</Label>
                <Input id="facebookUrl" type="url" value={form.facebookUrl} onChange={(e) => set("facebookUrl", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="instagramUrl" className="mb-1.5 block">Instagram URL</Label>
                <Input id="instagramUrl" type="url" value={form.instagramUrl} onChange={(e) => set("instagramUrl", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="tiktokUrl" className="mb-1.5 block">TikTok URL</Label>
                <Input id="tiktokUrl" type="url" value={form.tiktokUrl} onChange={(e) => set("tiktokUrl", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="footerBlurb" className="mb-1.5 block">Footer blurb</Label>
              <RichTextEditor
                className="mt-1.5"
                value={form.footerBlurb}
                onChange={(html) => set("footerBlurb", html)}
                minHeight="120px"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="googleRating" className="mb-1.5 block">Google rating</Label>
                <Input id="googleRating" type="number" step="0.1" min={0} max={5} value={form.googleReviewRating} onChange={(e) => set("googleReviewRating", Number(e.target.value))} required />
              </div>
              <div>
                <Label htmlFor="googleCount" className="mb-1.5 block">Google review count</Label>
                <Input id="googleCount" type="number" min={0} value={form.googleReviewCount} onChange={(e) => set("googleReviewCount", Number(e.target.value))} required />
              </div>
            </div>
            <div>
              <Label htmlFor="trustLine1" className="mb-1.5 block">Trust ribbon line 1</Label>
              <Input id="trustLine1" value={form.trustLine1} onChange={(e) => set("trustLine1", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="trustLine2" className="mb-1.5 block">Trust ribbon line 2</Label>
              <Input id="trustLine2" value={form.trustLine2} onChange={(e) => set("trustLine2", e.target.value)} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={form.showPrototypeNotice} onCheckedChange={(v) => set("showPrototypeNotice", v === true)} />
              Show prototype notice in footer
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-5">
            <p className="font-display font-bold">SEO</p>
            <div>
              <Label htmlFor="metaTitle" className="mb-1.5 block">Default page title</Label>
              <Input id="metaTitle" value={form.metaTitle} onChange={(e) => set("metaTitle", e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">{form.metaTitle.length}/60 characters recommended</p>
            </div>
            <div>
              <Label htmlFor="metaDescription" className="mb-1.5 block">Meta description</Label>
              <Textarea id="metaDescription" rows={3} value={form.metaDescription} onChange={(e) => set("metaDescription", e.target.value)} />
              <p className="mt-1 text-xs text-muted-foreground">{form.metaDescription.length}/160 characters recommended</p>
            </div>
            <div>
              <Label htmlFor="metaKeywords" className="mb-1.5 block">Meta keywords</Label>
              <Input id="metaKeywords" value={form.metaKeywords} onChange={(e) => set("metaKeywords", e.target.value)} placeholder="tyres, fitting, Egham" />
            </div>
            <div>
              <Label htmlFor="robots" className="mb-1.5 block">Robots directive</Label>
              <Input id="robots" value={form.robots} onChange={(e) => set("robots", e.target.value)} placeholder="index,follow" />
            </div>
            <div>
              <Label htmlFor="canonicalBaseUrl" className="mb-1.5 block">Canonical base URL</Label>
              <Input id="canonicalBaseUrl" type="url" value={form.canonicalBaseUrl} onChange={(e) => set("canonicalBaseUrl", e.target.value)} placeholder="https://www.eghamtyres.co.uk" />
            </div>
            <AssetField
              label="Open Graph image"
              hint="1200×630 recommended. Used when sharing links on social media."
              currentUrl={removeOgImage ? null : form.ogImageUrl}
              previewUrl={ogPreview}
              onFile={(f) => pickFile("og", f)}
              onRemove={() =>
                confirmRemoveAsset("Open Graph image", () => {
                  setRemoveOgImage(true);
                  setOgImageFile(null);
                  setOgPreview(null);
                })
              }
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? "Saving…" : "Save site settings"}
        </Button>
        {message && <p className="text-sm text-emerald-700">{message}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </form>
    </div>
  );
}
