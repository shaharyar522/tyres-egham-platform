import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type {
  ApiAppointmentSlotsResponse,
  ApiBookingCreateResponse,
  ApiBookingShowResponse,
  ApiBootstrapResponse,
  ApiBrandDetailResponse,
  ApiBrandIndexResponse,
  ApiContentDetailResponse,
  ApiBlogIndexResponse,
  ApiBlogDetailResponse,
  ApiContentIndexResponse,
  ApiHealthResponse,
  ApiPageResponse,
  ApiContactSubmitResponse,
  ApiReviewSubmitResponse,
  ApiReviewsResponse,
  ApiServiceDetailResponse,
  ApiServiceIndexResponse,
  ApiTyreDetailResponse,
  ApiTyreSearchParams,
  ApiTyreSearchResponse,
  ApiPaymentConfigResponse,
  ApiStripePaymentIntentResponse,
  ApiVehicleLookupResponse,
} from "@/lib/api/contracts";
import type { PaymentMethod } from "@/types";

export const apiQueryKeys = {
  health: ["api", "health"] as const,
  bootstrap: ["api", "bootstrap"] as const,
  tyreSearch: (params: ApiTyreSearchParams) => ["api", "tyres", "search", params] as const,
  tyreDetail: (idOrSlug: string | number) => ["api", "tyres", idOrSlug] as const,
  vehicleLookup: (registration: string) => ["api", "vehicles", "lookup", registration] as const,
  brandIndex: ["api", "brands"] as const,
  brandDetail: (slug: string) => ["api", "brands", slug] as const,
  serviceIndex: ["api", "services"] as const,
  serviceDetail: (slug: string) => ["api", "services", slug] as const,
  contentIndex: (namespace?: string) => ["api", "content", namespace ?? "content"] as const,
  contentDetail: (slug: string) => ["api", "content", slug] as const,
  blogIndex: ["api", "blog"] as const,
  blogDetail: (slug: string) => ["api", "blog", slug] as const,
  page: (slug: string) => ["api", "pages", slug] as const,
  reviews: ["api", "reviews"] as const,
  booking: (reference: string, token: string) => ["api", "bookings", reference, token] as const,
  appointmentSlots: (excludeReference?: string) =>
    ["api", "appointments", "slots", excludeReference ?? ""] as const,
  paymentConfig: ["api", "checkout", "payment-config"] as const,
};

export type CheckoutPayload = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slot: { date: string; time: string };
  notes?: string;
  voucherCode?: string;
  items: Array<{ skuId: number; qty: number; snapshot?: unknown }>;
  serviceIds: number[];
  serviceSelections?: Record<string, { optionKey: string; customPrice?: number }>;
  totals: { subtotal: number; voucherDiscount: number; servicesTotal: number; total: number };
  paymentMethod?: PaymentMethod;
};

export const getApiHealth = () => apiGet<ApiHealthResponse>("/health");
export const getApiBootstrap = () => apiGet<ApiBootstrapResponse>("/bootstrap");
export const searchTyres = (params: ApiTyreSearchParams) => apiPost<ApiTyreSearchResponse>("/tyres/search", params);
export const getTyreDetail = (idOrSlug: string | number) => apiGet<ApiTyreDetailResponse>(`/tyres/${idOrSlug}`);
export const getVehicleLookup = (registration: string) => apiGet<ApiVehicleLookupResponse>(`/vehicles/lookup/${encodeURIComponent(registration)}`);
export const getBrands = () => apiGet<ApiBrandIndexResponse>("/brands");
export const getBrand = (slug: string) => apiGet<ApiBrandDetailResponse>(`/brands/${slug}`);
export const getServices = () => apiGet<ApiServiceIndexResponse>("/services");
export const getService = (slug: string) => apiGet<ApiServiceDetailResponse>(`/services/${slug}`);
export const getContentArticles = (namespace = "content") =>
  apiGet<ApiContentIndexResponse>(`/content?namespace=${encodeURIComponent(namespace)}`);
export const getContentArticle = (slug: string) => apiGet<ApiContentDetailResponse>(`/content/${slug}`);
export const getBlogPosts = () => apiGet<ApiBlogIndexResponse>("/blog");
export const getBlogPost = (slug: string) => apiGet<ApiBlogDetailResponse>(`/blog/${slug}`);
export const getPage = (slug: string) => apiGet<ApiPageResponse>(`/pages/${slug}`);
export const getReviews = () => apiGet<ApiReviewsResponse>("/reviews");
export const getPaymentConfig = () => apiGet<ApiPaymentConfigResponse>("/checkout/payment-config");

export const createBooking = (payload: CheckoutPayload) =>
  apiPost<ApiBookingCreateResponse>("/bookings", {
    ...payload,
    paymentMethod: payload.paymentMethod ?? "pay_on_fitment",
  });

export const createStripePaymentIntent = (payload: CheckoutPayload) =>
  apiPost<ApiStripePaymentIntentResponse>("/checkout/stripe-payment-intent", payload);

export const confirmStripePayment = (reference: string, paymentIntentId: string) =>
  apiPost<ApiBookingCreateResponse & { message?: string }>(
    `/checkout/bookings/${encodeURIComponent(reference)}/confirm-stripe`,
    { paymentIntentId },
  );

export const getBooking = (reference: string, token: string) =>
  apiGet<ApiBookingShowResponse>(`/bookings/${encodeURIComponent(reference)}?token=${encodeURIComponent(token)}`);

export const getAppointmentSlots = (excludeReference?: string) => {
  const qs = excludeReference ? `?excludeReference=${encodeURIComponent(excludeReference)}` : "";
  return apiGet<ApiAppointmentSlotsResponse>(`/appointments/slots${qs}`);
};

export const rescheduleBooking = (
  reference: string,
  token: string,
  payload: { slot: { date: string; time: string }; notes?: string },
) =>
  apiPatch<ApiBookingShowResponse & { message?: string }>(
    `/bookings/${encodeURIComponent(reference)}?token=${encodeURIComponent(token)}`,
    payload,
  );

export const cancelBooking = (reference: string, token: string) =>
  apiPost<ApiBookingShowResponse & { message?: string }>(
    `/bookings/${encodeURIComponent(reference)}/cancel?token=${encodeURIComponent(token)}`,
    {},
  );

export const submitReview = (payload: {
  customerName: string;
  customerEmail?: string;
  rating: number;
  title: string;
  body: string;
}) => apiPost<ApiReviewSubmitResponse>("/reviews", payload);

export type ContactSubject = "general" | "tyre_quote" | "booking" | "roadside";

export const submitContactEnquiry = (payload: {
  name: string;
  email: string;
  phone?: string;
  subject: ContactSubject;
  message: string;
}) => apiPost<ApiContactSubmitResponse>("/contact", payload);

export function useApiHealthQuery() {
  return useQuery({
    queryKey: apiQueryKeys.health,
    queryFn: getApiHealth,
    retry: 1,
  });
}

export function useApiBootstrapQuery() {
  return useQuery({
    queryKey: apiQueryKeys.bootstrap,
    queryFn: getApiBootstrap,
    retry: 1,
  });
}

function tyreSearchQueryEnabled(params: ApiTyreSearchParams): boolean {
  if (params.browse) {
    return true;
  }

  return Object.entries(params).some(([key, value]) => {
    if (key === "browse" || key === "page" || key === "perPage") {
      return false;
    }

    return value !== undefined && value !== "";
  });
}

export function useApiTyreSearchQuery(params: ApiTyreSearchParams) {
  return useQuery({
    queryKey: apiQueryKeys.tyreSearch(params),
    queryFn: () => searchTyres(params),
    enabled: tyreSearchQueryEnabled(params),
  });
}

export function useApiTyreDetailQuery(idOrSlug: string | number) {
  return useQuery({
    queryKey: apiQueryKeys.tyreDetail(idOrSlug),
    queryFn: () => getTyreDetail(idOrSlug),
    enabled: Boolean(idOrSlug),
  });
}

export function useApiVehicleLookupQuery(registration: string) {
  return useQuery({
    queryKey: apiQueryKeys.vehicleLookup(registration),
    queryFn: () => getVehicleLookup(registration),
    enabled: Boolean(registration),
    retry: false,
  });
}

export function useApiBrandQuery(slug: string) {
  return useQuery({
    queryKey: apiQueryKeys.brandDetail(slug),
    queryFn: () => getBrand(slug),
    enabled: Boolean(slug),
  });
}

export function useApiBrandsIndexQuery() {
  return useQuery({
    queryKey: apiQueryKeys.brandIndex,
    queryFn: getBrands,
    retry: 1,
  });
}

export function useApiServicesIndexQuery() {
  return useQuery({
    queryKey: apiQueryKeys.serviceIndex,
    queryFn: getServices,
    retry: 1,
  });
}

export function useApiServiceQuery(slug: string) {
  return useQuery({
    queryKey: apiQueryKeys.serviceDetail(slug),
    queryFn: () => getService(slug),
    enabled: Boolean(slug),
  });
}

export function useApiContentIndexQuery(namespace = "content") {
  return useQuery({
    queryKey: apiQueryKeys.contentIndex(namespace),
    queryFn: () => getContentArticles(namespace),
    retry: 1,
  });
}

export function useApiContentQuery(slug: string) {
  return useQuery({
    queryKey: apiQueryKeys.contentDetail(slug),
    queryFn: () => getContentArticle(slug),
    enabled: Boolean(slug),
  });
}

export function useApiBlogIndexQuery() {
  return useQuery({
    queryKey: apiQueryKeys.blogIndex,
    queryFn: () => getBlogPosts(),
    retry: 1,
  });
}

export function useApiBlogQuery(slug: string) {
  return useQuery({
    queryKey: apiQueryKeys.blogDetail(slug),
    queryFn: () => getBlogPost(slug),
    enabled: Boolean(slug),
  });
}

export function useApiPageQuery(slug: string) {
  return useQuery({
    queryKey: apiQueryKeys.page(slug),
    queryFn: () => getPage(slug),
    enabled: Boolean(slug),
  });
}

export function useApiReviewsQuery() {
  return useQuery({
    queryKey: apiQueryKeys.reviews,
    queryFn: getReviews,
    retry: 1,
  });
}

export function useApiBookingQuery(reference: string, token: string) {
  return useQuery({
    queryKey: apiQueryKeys.booking(reference, token),
    queryFn: () => getBooking(reference, token),
    enabled: Boolean(reference && token),
    retry: false,
  });
}

export function usePaymentConfigQuery() {
  return useQuery({
    queryKey: apiQueryKeys.paymentConfig,
    queryFn: getPaymentConfig,
    staleTime: 60_000,
  });
}

export function useAppointmentSlotsQuery(excludeReference?: string) {
  return useQuery({
    queryKey: apiQueryKeys.appointmentSlots(excludeReference),
    queryFn: () => getAppointmentSlots(excludeReference),
    staleTime: 60_000,
  });
}

export function useRescheduleBookingMutation(reference: string, token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { slot: { date: string; time: string }; notes?: string }) =>
      rescheduleBooking(reference, token, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiQueryKeys.booking(reference, token) }),
  });
}

export function useCancelBookingMutation(reference: string, token: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelBooking(reference, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: apiQueryKeys.booking(reference, token) }),
  });
}
