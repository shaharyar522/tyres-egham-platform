import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api/client";
import type { BookingRecord, Brand, ContentArticle, TyreCategory, TyreSku, Voucher } from "@/types";
import type { AdminUser } from "@/lib/admin/auth";
import { adminDelete, adminGet, adminPatch, adminPost, adminPostFormData, adminPut } from "@/lib/admin/client";
import { buildAdminListQuery, type AdminListMeta } from "@/lib/admin/pagination";

export type { AdminListMeta };

export const adminKeys = {
  dashboard: ["admin", "dashboard"] as const,
  content: (params: string) => ["admin", "content", params] as const,
  contentItem: (id: number) => ["admin", "content", id] as const,
  bookings: (params: string) => ["admin", "bookings", params] as const,
  reviews: (params: string) => ["admin", "reviews", params] as const,
  tyres: (params: string) => ["admin", "tyres", params] as const,
  tyre: (id: number) => ["admin", "tyre", id] as const,
  vouchers: (params: string) => ["admin", "vouchers", params] as const,
  voucher: (id: number) => ["admin", "voucher", id] as const,
  brands: (params: string) => ["admin", "brands", params] as const,
  brand: (id: number) => ["admin", "brand", id] as const,
  categories: (params: string) => ["admin", "categories", params] as const,
  category: (id: number) => ["admin", "category", id] as const,
  appointmentBlocks: (params: string) => ["admin", "appointment-blocks", params] as const,
  appointmentSettings: ["admin", "appointment-settings"] as const,
  booking: (reference: string) => ["admin", "booking", reference] as const,
  paymentSettings: ["admin", "payment-settings"] as const,
  notificationSettings: ["admin", "notification-settings"] as const,
  siteSettings: ["admin", "site-settings"] as const,
};

export type AdminSiteSettings = {
  businessName: string;
  tagline: string;
  logoMonogram: string;
  logoUrl: string | null;
  headerLogoHeight: number;
  headerLogoMaxWidth: number;
  headerLogoHeightMobile: number;
  headerLogoMaxWidthMobile: number;
  footerLogoHeight: number;
  footerLogoMaxWidth: number;
  faviconUrl: string | null;
  ogImageUrl: string | null;
  themeColor: string;
  phone: string;
  phoneTel: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  town: string;
  postcode: string;
  fullAddress: string;
  footerBlurb: string;
  openingHoursNote: string;
  googleReviewRating: number;
  googleReviewCount: number;
  googleBusinessUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  trustLine1: string;
  trustLine2: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  robots: string;
  canonicalBaseUrl: string;
  showPrototypeNotice: boolean;
  headCode: string;
  bodyCode: string;
};

export type AdminSiteSettingsSavePayload = AdminSiteSettings & {
  logoFile?: File | null;
  faviconFile?: File | null;
  ogImageFile?: File | null;
  removeLogo?: boolean;
  removeFavicon?: boolean;
  removeOgImage?: boolean;
};

export type AdminNotificationSettings = {
  appointmentReminderEnabled: boolean;
  appointmentReminderHoursBefore: number;
  paymentReminderEnabled: boolean;
  paymentReminderHoursBefore: number;
};

export type AdminPaymentSettings = {
  stripeEnabled: boolean;
  payOnFitmentEnabled: boolean;
  defaultPaymentMethod: "pay_on_fitment" | "stripe";
  stripePublishableKey: string;
  stripeSecretKeyConfigured: boolean;
  stripeWebhookSecretConfigured: boolean;
  stripePublishableKeyPreview: string | null;
};

export type AppointmentBlock = {
  id: number;
  blockDate: string;
  slotTime: string | null;
  reason: string | null;
};

export type AdminAppointmentSettings = {
  capacityPerSlot: number;
  daysAhead: number;
  closedWeekdays: number[];
  minLeadHours: number;
  slotTimes: string[];
};

export type AdminBookingDetail = BookingRecord & {
  manageUrl?: string;
  appointmentReminderSentAt?: string | null;
  paymentReminderSentAt?: string | null;
  lineItems?: Array<{
    skuId: number;
    qty: number;
    label: string;
    size: string | null;
    unitPrice: number;
    lineTotal: number;
  }>;
  services?: Array<{ id: number; name: string; priceFrom: number | "free" }>;
};

export type AdminBrand = Brand & { skuCount?: number };
export type AdminCategory = TyreCategory & { skuCount?: number };

export function adminLogin(
  email: string,
  password: string,
  captcha: { a: number; b: number; answer: number },
) {
  return apiPost<{ token: string; user: AdminUser }>("/admin/login", {
    email,
    password,
    captcha_a: captcha.a,
    captcha_b: captcha.b,
    captcha_answer: captcha.answer,
  });
}

export function useAdminUpdatePasswordMutation() {
  return useMutation({
    mutationFn: (payload: {
      current_password: string;
      password: string;
      password_confirmation: string;
    }) => adminPut<{ message: string }>("/password", payload),
  });
}

export function useAdminDashboardQuery() {
  return useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: () => adminGet<{ stats: Record<string, number> }>("/dashboard"),
  });
}

export function useAdminContentQuery(params: { namespace?: string; page?: number } = {}) {
  const query = buildAdminListQuery({
    page: params.page,
    namespace: params.namespace,
  });

  return useQuery({
    queryKey: adminKeys.content(query || "all"),
    queryFn: () =>
      adminGet<{ articles: Array<ContentArticle & { body: string }>; meta: AdminListMeta }>(
        `/content${query ? `?${query}` : ""}`,
      ),
  });
}

export function useAdminContentItemQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.contentItem(id),
    queryFn: () => adminGet<{ article: ContentArticle & { body: string } }>(`/content/${id}`),
    enabled: id > 0,
  });
}

export function useAdminBookingsQuery(params: { page?: number } = {}) {
  const query = buildAdminListQuery({ page: params.page });

  return useQuery({
    queryKey: adminKeys.bookings(query || "all"),
    queryFn: () =>
      adminGet<{ bookings: Array<BookingRecord & { manageUrl?: string }>; meta: AdminListMeta }>(
        `/bookings${query ? `?${query}` : ""}`,
      ),
    staleTime: 0,
    refetchOnMount: "always",
  });
}

export function useAdminBookingQuery(reference: string) {
  return useQuery({
    queryKey: adminKeys.booking(reference),
    queryFn: () => adminGet<{ booking: AdminBookingDetail }>(`/bookings/${encodeURIComponent(reference)}`),
    enabled: Boolean(reference),
  });
}

export function useAdminUpdateBookingMutation(reference: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { status?: string; paymentStatus?: string; notes?: string }) =>
      adminPatch<{ booking: AdminBookingDetail; message?: string }>(
        `/bookings/${encodeURIComponent(reference)}`,
        data,
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.booking(reference) });
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

export function useAdminCancelBookingMutation(reference: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      adminPost<{ booking: AdminBookingDetail; message?: string; emailSent?: boolean }>(
        `/bookings/${encodeURIComponent(reference)}/cancel`,
        {},
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.booking(reference) });
      qc.invalidateQueries({ queryKey: ["admin", "bookings"] });
    },
  });
}

export function useAdminResendConfirmationMutation(reference: string) {
  return useMutation({
    mutationFn: () =>
      adminPost<{ message?: string; emailSent?: boolean }>(
        `/bookings/${encodeURIComponent(reference)}/resend-confirmation`,
        {},
      ),
  });
}

export function useAdminAppointmentSettingsQuery() {
  return useQuery({
    queryKey: adminKeys.appointmentSettings,
    queryFn: () => adminGet<{ settings: AdminAppointmentSettings }>("/appointment-settings"),
  });
}

export function useAdminSaveAppointmentSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<AdminAppointmentSettings>) =>
      adminPut<{ settings: AdminAppointmentSettings }>("/appointment-settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.appointmentSettings });
      qc.invalidateQueries({ queryKey: ["api", "appointments", "slots"] });
    },
  });
}

export function useAdminReviewsQuery(params: { status?: string; page?: number } = {}) {
  const query = buildAdminListQuery({
    page: params.page,
    status: params.status,
  });

  return useQuery({
    queryKey: adminKeys.reviews(query || "all"),
    queryFn: () =>
      adminGet<{
        reviews: Array<{ id: number; status: string; title: string; customerName: string; rating: number }>;
        meta: AdminListMeta;
      }>(`/reviews${query ? `?${query}` : ""}`),
  });
}

export function useAdminSaveContentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: number; data: Record<string, unknown> }) =>
      payload.id
        ? adminPut<{ article: ContentArticle & { body: string } }>(`/content/${payload.id}`, payload.data)
        : adminPost<{ article: ContentArticle & { body: string } }>("/content", payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: ["api", "blog"] });
      qc.invalidateQueries({ queryKey: ["api", "content"] });
    },
  });
}

export function useAdminUploadContentMediaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      id: number;
      featuredImage?: File;
      ogImage?: File;
      removeFeaturedImage?: boolean;
      removeOgImage?: boolean;
    }) => {
      const fd = new FormData();
      if (payload.removeFeaturedImage) fd.append("removeFeaturedImage", "1");
      if (payload.removeOgImage) fd.append("removeOgImage", "1");
      if (payload.featuredImage) fd.append("featuredImage", payload.featuredImage);
      if (payload.ogImage) fd.append("ogImage", payload.ogImage);
      return adminPostFormData<{ article: ContentArticle & { body: string } }>(`/content/${payload.id}/media`, fd);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "content"] });
      qc.invalidateQueries({ queryKey: adminKeys.contentItem(variables.id) });
      qc.invalidateQueries({ queryKey: ["api", "blog"] });
    },
  });
}

export function useAdminDeleteContentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/content/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "content"] }),
  });
}

export function useAdminReviewStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminPatch(`/reviews/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
}

export type AdminTyreSku = TyreSku & {
  tyreCategoryId?: number;
  brandName?: string;
  brandSlug?: string;
  categoryName?: string;
  sizeLabel?: string;
};

export function useAdminTyresQuery(params: {
  search?: string;
  within24h?: string;
  premium?: string;
  sameDayDelivery?: string;
  hidden?: string;
  page?: number;
  perPage?: number;
}) {
  const query = buildAdminListQuery({
    page: params.page,
    perPage: params.perPage,
    search: params.search,
    within24h: params.within24h,
    premium: params.premium,
    sameDayDelivery: params.sameDayDelivery,
    hidden: params.hidden,
  });

  return useQuery({
    queryKey: adminKeys.tyres(query || "all"),
    queryFn: () =>
      adminGet<{ skus: AdminTyreSku[]; meta: AdminListMeta }>(`/tyres${query ? `?${query}` : ""}`),
  });
}

export function useAdminTyreQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.tyre(id),
    queryFn: () => adminGet<{ sku: AdminTyreSku }>(`/tyres/${id}`),
    enabled: id > 0,
  });
}

export function useAdminUpdateTyreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      adminPatch<{ sku: AdminTyreSku }>(`/tyres/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["admin", "tyre"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminCreateTyreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminPost<{ sku: AdminTyreSku }>("/tyres", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
    },
  });
}

export function useAdminSaveTyreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: number; data: Record<string, unknown> }) =>
      payload.id
        ? adminPatch<{ sku: AdminTyreSku }>(`/tyres/${payload.id}`, payload.data)
        : adminPost<{ sku: AdminTyreSku }>("/tyres", payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["admin", "tyre"] });
    },
  });
}

export function useAdminUploadTyreImageMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; image?: File; removeImage?: boolean }) => {
      const fd = new FormData();
      if (payload.removeImage) fd.append("removeImage", "1");
      if (payload.image) fd.append("image", payload.image);
      return adminPostFormData<{ sku: AdminTyreSku }>(`/tyres/${payload.id}/image`, fd);
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["admin", "tyre", variables.id] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminDeleteTyreMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/tyres/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminBulkWithin24hMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; enabled: boolean }) =>
      adminPost<{ updated: number }>("/tyres/bulk-within-24h", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminBulkHiddenMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; hidden: boolean }) =>
      adminPost<{ updated: number }>("/tyres/bulk-hidden", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminBulkPremiumMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; premium: boolean }) =>
      adminPost<{ updated: number }>("/tyres/bulk-premium", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminBulkSameDayMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { ids: number[]; sameDayDelivery: boolean }) =>
      adminPost<{ updated: number }>("/tyres/bulk-same-day-delivery", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "tyres"] });
      qc.invalidateQueries({ queryKey: ["api", "tyres"] });
    },
  });
}

export function useAdminVouchersQuery(params: { page?: number } = {}) {
  const query = buildAdminListQuery({ page: params.page });

  return useQuery({
    queryKey: adminKeys.vouchers(query || "all"),
    queryFn: () =>
      adminGet<{ vouchers: Voucher[]; meta: AdminListMeta }>(`/vouchers${query ? `?${query}` : ""}`),
  });
}

export function useAdminVoucherQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.voucher(id),
    queryFn: () => adminGet<{ voucher: Voucher }>(`/vouchers/${id}`),
    enabled: id > 0,
  });
}

export function useAdminSaveVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: number; data: Record<string, unknown> }) =>
      payload.id
        ? adminPut<{ voucher: Voucher }>(`/vouchers/${payload.id}`, payload.data)
        : adminPost<{ voucher: Voucher }>("/vouchers", payload.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

export function useAdminDeleteVoucherMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/vouchers/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "vouchers"] }),
  });
}

export function useAdminBrandsQuery(params: { page?: number } = {}) {
  const query = buildAdminListQuery({ page: params.page });

  return useQuery({
    queryKey: adminKeys.brands(query || "all"),
    queryFn: () => adminGet<{ brands: AdminBrand[]; meta: AdminListMeta }>(`/brands${query ? `?${query}` : ""}`),
  });
}

export function useAdminBrandQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.brand(id),
    queryFn: () => adminGet<{ brand: AdminBrand }>(`/brands/${id}`),
    enabled: id > 0,
  });
}

export function useAdminSaveBrandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: number; data: Record<string, unknown> }) =>
      payload.id
        ? adminPut<{ brand: AdminBrand }>(`/brands/${payload.id}`, payload.data)
        : adminPost<{ brand: AdminBrand }>("/brands", payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
      qc.invalidateQueries({ queryKey: ["api", "bootstrap"] });
    },
  });
}

export function useAdminDeleteBrandMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/brands/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "brands"] });
      qc.invalidateQueries({ queryKey: ["api", "bootstrap"] });
    },
  });
}

export function useAdminCategoriesQuery(params: { page?: number } = {}) {
  const query = buildAdminListQuery({ page: params.page });

  return useQuery({
    queryKey: adminKeys.categories(query || "all"),
    queryFn: () =>
      adminGet<{ categories: AdminCategory[]; meta: AdminListMeta }>(
        `/categories${query ? `?${query}` : ""}`,
      ),
  });
}

export function useAdminCategoryQuery(id: number) {
  return useQuery({
    queryKey: adminKeys.category(id),
    queryFn: () => adminGet<{ category: AdminCategory }>(`/categories/${id}`),
    enabled: id > 0,
  });
}

export function useAdminSaveCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id?: number; data: Record<string, unknown> }) =>
      payload.id
        ? adminPut<{ category: AdminCategory }>(`/categories/${payload.id}`, payload.data)
        : adminPost<{ category: AdminCategory }>("/categories", payload.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["api", "bootstrap"] });
    },
  });
}

export function useAdminDeleteCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/categories/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["api", "bootstrap"] });
    },
  });
}

export function useAdminAppointmentBlocksQuery(params: { page?: number } = {}) {
  const query = buildAdminListQuery({ page: params.page });

  return useQuery({
    queryKey: adminKeys.appointmentBlocks(query || "all"),
    queryFn: () =>
      adminGet<{ blocks: AppointmentBlock[]; meta: AdminListMeta }>(
        `/appointment-blocks${query ? `?${query}` : ""}`,
      ),
  });
}

export function useAdminCreateAppointmentBlockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { blockDate: string; slotTime?: string; reason?: string }) =>
      adminPost<{ block: AppointmentBlock }>("/appointment-blocks", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "appointment-blocks"] });
      qc.invalidateQueries({ queryKey: ["api", "appointments", "slots"] });
    },
  });
}

export function useAdminNotificationSettingsQuery() {
  return useQuery({
    queryKey: adminKeys.notificationSettings,
    queryFn: () => adminGet<{ settings: AdminNotificationSettings }>("/notification-settings"),
  });
}

export function useAdminSaveNotificationSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminPut<{ settings: AdminNotificationSettings }>("/notification-settings", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.notificationSettings }),
  });
}

export function useAdminTestMailMutation() {
  return useMutation({
    mutationFn: (email: string) =>
      adminPost<{
        sent: boolean;
        message: string;
        mailer?: string;
        smtpHost?: string;
        smtpPort?: number | string;
        from?: string;
        bookingReference?: string;
      }>("/mail/test", { email }),
  });
}

export function useAdminPaymentSettingsQuery() {
  return useQuery({
    queryKey: adminKeys.paymentSettings,
    queryFn: () => adminGet<{ settings: AdminPaymentSettings }>("/payment-settings"),
  });
}

export function useAdminSavePaymentSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminPut<{ settings: AdminPaymentSettings }>("/payment-settings", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.paymentSettings });
      qc.invalidateQueries({ queryKey: ["api", "checkout", "payment-config"] });
    },
  });
}

export function useAdminUpdateBookingPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { reference: string; paymentStatus: string }) =>
      adminPatch(`/bookings/${encodeURIComponent(payload.reference)}/payment`, {
        paymentStatus: payload.paymentStatus,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "bookings"] }),
  });
}

export function useAdminDeleteAppointmentBlockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => adminDelete(`/appointment-blocks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "appointment-blocks"] });
      qc.invalidateQueries({ queryKey: ["api", "appointments", "slots"] });
    },
  });
}

export function useAdminSiteSettingsQuery() {
  return useQuery({
    queryKey: adminKeys.siteSettings,
    queryFn: () => adminGet<{ settings: AdminSiteSettings }>("/site-settings"),
  });
}

function buildSiteSettingsFormData(data: AdminSiteSettingsSavePayload): FormData {
  const fd = new FormData();
  const textFields: Array<[string, string | number | boolean]> = [
    ["businessName", data.businessName],
    ["tagline", data.tagline],
    ["logoMonogram", data.logoMonogram],
    ["phone", data.phone],
    ["email", data.email],
    ["addressLine1", data.addressLine1],
    ["addressLine2", data.addressLine2],
    ["town", data.town],
    ["postcode", data.postcode],
    ["footerBlurb", data.footerBlurb],
    ["openingHoursNote", data.openingHoursNote],
    ["googleReviewRating", data.googleReviewRating],
    ["googleReviewCount", data.googleReviewCount],
    ["googleBusinessUrl", data.googleBusinessUrl],
    ["facebookUrl", data.facebookUrl],
    ["instagramUrl", data.instagramUrl],
    ["tiktokUrl", data.tiktokUrl],
    ["trustLine1", data.trustLine1],
    ["trustLine2", data.trustLine2],
    ["metaTitle", data.metaTitle],
    ["metaDescription", data.metaDescription],
    ["metaKeywords", data.metaKeywords],
    ["robots", data.robots],
    ["canonicalBaseUrl", data.canonicalBaseUrl],
    ["themeColor", data.themeColor],
    ["headerLogoHeight", data.headerLogoHeight],
    ["headerLogoMaxWidth", data.headerLogoMaxWidth],
    ["headerLogoHeightMobile", data.headerLogoHeightMobile],
    ["headerLogoMaxWidthMobile", data.headerLogoMaxWidthMobile],
    ["footerLogoHeight", data.footerLogoHeight],
    ["footerLogoMaxWidth", data.footerLogoMaxWidth],
    ["showPrototypeNotice", data.showPrototypeNotice ? "1" : "0"],
    ["headCode", data.headCode ?? ""],
    ["bodyCode", data.bodyCode ?? ""],
  ];
  for (const [key, value] of textFields) {
    fd.append(key, String(value ?? ""));
  }
  if (data.logoFile) fd.append("logo", data.logoFile);
  if (data.faviconFile) fd.append("favicon", data.faviconFile);
  if (data.ogImageFile) fd.append("ogImage", data.ogImageFile);
  if (data.removeLogo) fd.append("removeLogo", "1");
  if (data.removeFavicon) fd.append("removeFavicon", "1");
  if (data.removeOgImage) fd.append("removeOgImage", "1");
  return fd;
}

export function useAdminSaveSiteSettingsMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AdminSiteSettingsSavePayload) =>
      adminPostFormData<{ settings: AdminSiteSettings }>("/site-settings", buildSiteSettingsFormData(data)),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminKeys.siteSettings });
      qc.invalidateQueries({ queryKey: ["api", "bootstrap"] });
    },
  });
}
