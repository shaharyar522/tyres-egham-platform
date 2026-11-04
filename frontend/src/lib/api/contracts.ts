import type {
  Area,
  BookingRecord,
  Brand,
  CmsPage,
  ContentArticle,
  PaymentConfig,
  Review,
  Service,
  TyreCategory,
  TyreSku,
  VehicleLookup,
  VehicleMake,
  Voucher,
} from "@/types";

export interface ApiHealthResponse {
  status: "ok" | "error";
  app: string;
  environment: string;
  database: "up" | "down";
  timestamp: string;
}

export interface SiteSettings {
  name: string;
  apiBaseUrl: string;
  frontendUrl: string;
  businessName: string;
  tagline: string | null;
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
  addressLine2: string | null;
  town: string | null;
  postcode: string;
  fullAddress: string;
  footerBlurb: string | null;
  openingHoursNote: string | null;
  googleReviewRating: number;
  googleReviewCount: number;
  googleBusinessUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  trustLine1: string | null;
  trustLine2: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  robots: string;
  canonicalBaseUrl: string | null;
  showPrototypeNotice: boolean;
  /** Raw HTML/JS for document head (GTM, analytics, meta tags). */
  headCode: string | null;
  /** Raw HTML/JS for end of body (noscript, chat widgets, pixels). */
  bodyCode: string | null;
}

export interface ApiBootstrapResponse {
  site: SiteSettings;
  stats: {
    brands: number;
    categories: number;
    makes: number;
    services: number;
    areas: number;
    articles: number;
    skus: number;
  };
  brands: Brand[];
  categories: TyreCategory[];
  makes: VehicleMake[];
  services: Service[];
  areas: Area[];
  content: Array<ContentArticle & { namespace?: string }>;
  vouchers: Voucher[];
}

export interface ApiTyreSearchParams {
  width?: number;
  profile?: number;
  rim?: number;
  brand?: string;
  tyreCategory?: string;
  offersOnly?: boolean;
  browse?: boolean;
  page?: number;
  perPage?: number;
  vehicleRegistration?: string;
  fitmentId?: number;
  position?: "all_round" | "front" | "rear" | "spare";
}

export interface ApiTyreSearchResponse {
  filters: ApiTyreSearchParams;
  total: number;
  results: TyreSku[];
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
  };
  matchMeta?: {
    fitmentId: number;
    position: string;
    positionLabel: string;
    staggered: boolean;
  };
}

export interface ApiTyreDetailResponse {
  sku: TyreSku;
}

export type ApiVehicleLookupResponse = VehicleLookup;

export interface ApiBrandIndexResponse {
  brands: Brand[];
}

export interface ApiBrandDetailResponse {
  brand: Brand;
}

export interface ApiServiceIndexResponse {
  services: Service[];
}

export interface ApiServiceDetailResponse {
  service: Service;
}

export interface ApiVoucherResponse {
  vouchers: Voucher[];
}

export interface ApiAdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface ApiAdminLoginResponse {
  token: string;
  user: ApiAdminUser;
}

export interface ApiContentIndexResponse {
  articles: ContentArticle[];
}

export interface ApiContentDetailResponse {
  article: ContentArticle & { body: string };
}

export interface ApiBlogIndexResponse {
  articles: ContentArticle[];
}

export interface ApiBlogDetailResponse {
  article: ContentArticle & { body: string };
}

export interface ApiPageResponse {
  page: CmsPage;
}

export interface ApiReviewsResponse {
  reviews: Review[];
  stats: {
    count: number;
    averageRating: number;
    googleReviewCount: number;
    googleReviewRating?: number;
  };
}

export interface ApiReviewSubmitResponse {
  message: string;
}

export interface ApiContactSubmitResponse {
  message: string;
}

export interface ApiBookingCreateResponse {
  booking: BookingRecord;
  manageUrl: string;
  emailSent?: boolean;
}

export interface ApiBookingShowResponse {
  booking: BookingRecord;
}

export interface AppointmentSlotDay {
  date: string;
  dateIso: string;
  weekday: string;
  day: number;
  month: string;
  times: Array<{ time: string; remaining: number }>;
}

export interface ApiAppointmentSlotsResponse {
  days: AppointmentSlotDay[];
  meta: {
    capacityPerSlot: number;
    daysAhead: number;
    times: string[];
  };
}

export type ApiPaymentConfigResponse = PaymentConfig;

export interface ApiStripePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  booking: BookingRecord;
  manageUrl: string;
}

export interface ApiCheckoutPrepareResponse {
  totals: {
    subtotal: number;
    voucherDiscount: number;
    servicesTotal: number;
    total: number;
  };
}
