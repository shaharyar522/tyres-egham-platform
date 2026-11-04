export type BrandTier = "premium" | "mid_range" | "budget";

export interface Brand {
  id: number;
  slug: string;
  name: string;
  tier: BrandTier;
  description: string;
  recommendedFor: string[];
  hasActiveOffer: boolean;
}

export type TyreCategorySlug =
  | "car"
  | "4x4"
  | "van"
  | "run-flat"
  | "ev"
  | "all-season"
  | "winter"
  | "high-performance";

export interface TyreCategory {
  id: number;
  slug: TyreCategorySlug;
  name: string;
  description: string;
  iconName: string;
}

export interface VehicleMake {
  id: number;
  slug: string;
  name: string;
  topModels: string[];
}

export interface VehicleLookupVehicle {
  makeId: number;
  makeSlug: string | null;
  makeName: string;
  modelId: number | null;
  modelSlug: string | null;
  modelName: string;
  derivative: string | null;
  year: number | null;
  fuelType: string | null;
  bodyType: string | null;
  engineCapacity: number | null;
  taxStatus: string | null;
  motStatus: string | null;
  displayName: string;
  source: string;
}

export interface VehicleLookupFitmentPosition {
  id: number;
  position: "all_round" | "front" | "rear" | "spare";
  width: number;
  profile: number;
  rim: number;
  loadIndex: number | null;
  speedRating: string | null;
  tyreCategory: TyreCategorySlug | null;
  isExtraLoad: boolean;
  isRunFlat: boolean;
  isWinter: boolean;
  isAllSeason: boolean;
  isEvRated: boolean;
  isVan: boolean;
  is4x4: boolean;
  oeMarking: string | null;
  recommendedQuantity: number;
  label: string;
}

export interface VehicleLookupFitmentSet {
  id: number;
  label: string;
  fitmentType: string;
  tyreCategory: TyreCategorySlug | null;
  provider: string;
  providerReference: string | null;
  isPrimary: boolean;
  isStaggered: boolean;
  confidence: number | null;
  defaultPosition: VehicleLookupFitmentPosition["position"] | null;
  positions: VehicleLookupFitmentPosition[];
}

export interface VehicleLookupMatchMeta {
  source: string;
  provider: string | null;
  usedCache: boolean;
  selectedFitmentId: number | null;
  availableFitmentCount: number;
  queriedAt: string | null;
  expiresAt: string | null;
  fallbackMode: string | null;
  message: string | null;
}

export interface VehicleLookup {
  registration: string;
  vehicle: VehicleLookupVehicle;
  fitments: VehicleLookupFitmentSet[];
  selectedFitment: VehicleLookupFitmentSet | null;
  matchMeta: VehicleLookupMatchMeta;
}

export interface OeApproval {
  code: string;
  manufacturer: string;
  description: string;
}

export type EuLabelGrade = "A" | "B" | "C" | "D" | "E";

export interface EuLabel {
  fuelEfficiency: EuLabelGrade;
  wetGrip: EuLabelGrade;
  externalNoise: number;
  noiseClass: "A" | "B" | "C";
}

export interface QuantityTier {
  qty: number;
  pricePerTyre: number;
  saveLabel?: string;
}

export interface TyreSku {
  id: number;
  slug: string;
  brandId: number;
  modelName: string;
  width: number;
  profile: number;
  rim: number;
  loadIndex: number;
  speedRating: string;
  isExtraLoad: boolean;
  isRunFlat: boolean;
  isWinter: boolean;
  isAllSeason: boolean;
  isEvRated: boolean;
  isVan: boolean;
  is4x4: boolean;
  manufacturerSku: string;
  ean: string;
  euLabel: EuLabel;
  oeApprovals: OeApproval[];
  videoUrl: string | null;
  imageUrl?: string | null;
  pricePerTyre: number;
  quantityTiers: QuantityTier[];
  starRating: number;
  reviewCount: number;
  stock: number;
  category: TyreCategorySlug;
  badges: ("best_buy" | "specialist" | "recommended")[];
  hasActiveOffer: boolean;
  voucherCode?: string;
  isAvailableWithin24h?: boolean;
  isPremium?: boolean;
  isSameDayDelivery?: boolean;
  isHidden?: boolean;
}

export interface ServicePricingOption {
  key: string;
  label: string;
  price: number;
  requiresCustomPrice?: boolean;
  priceHint?: string;
  discussionMessage?: string;
}

export interface ServicePricingOptions {
  type: string;
  options: ServicePricingOption[];
}

export interface ServiceSelection {
  optionKey: string;
  customPrice?: number;
}

export interface Service {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  priceFrom: number | "free";
  durationMinutes: number;
  iconName: string;
  upsellInBasket: boolean;
  pricingOptions?: ServicePricingOptions | null;
}

export interface Voucher {
  id?: number;
  code: string;
  brandId?: number | null;
  brandSlug: string | null;
  brandName: string | null;
  minQty: number;
  discountPerQty: number;
  validFrom: string;
  validTo: string;
  description: string;
}

export interface Review {
  id: number;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  source: "google" | "in_site";
}

export interface ContentArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: "buying-guide" | "safety" | "maintenance" | "seasonal" | "page";
  readMinutes: number;
  publishedAt: string;
  imageEmoji: string;
  namespace?: string;
  body?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  robots?: string | null;
  featuredImageUrl?: string | null;
  ogImageUrl?: string | null;
}

export interface CmsPage {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  updatedAt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  robots?: string | null;
  featuredImageUrl?: string | null;
  ogImageUrl?: string | null;
}

export interface Area {
  id: number;
  slug: string;
  name: string;
  postcodePrefix: string;
}

export interface BasketSkuSnapshot {
  brandId: number;
  brandSlug?: string;
  pricePerTyre: number;
  quantityTiers: QuantityTier[];
}

export interface BasketItem {
  skuId: number;
  qty: number;
  snapshot?: BasketSkuSnapshot;
}

export type BookingFunnelStep = "basket" | "services" | "checkout";

export interface BookingRecord {
  reference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  slot: { date: string; time: string };
  notes: string;
  voucherCode: string | null;
  items: BasketItem[];
  serviceIds: number[];
  serviceSelections?: Record<string, ServiceSelection>;
  totals: {
    subtotal: number;
    voucherDiscount: number;
    servicesTotal: number;
    total: number;
  };
  status: string;
  paymentMethod?: "pay_on_fitment" | "stripe";
  paymentStatus?: "unpaid" | "pending" | "paid" | "failed" | "refunded";
  amountPaid?: number | null;
  paidAt?: string | null;
  createdAt?: string;
}

export type PaymentMethod = "pay_on_fitment" | "stripe";

export interface PaymentConfig {
  methods: PaymentMethod[];
  stripeEnabled: boolean;
  payOnFitmentEnabled: boolean;
  stripePublishableKey: string | null;
  defaultPaymentMethod: PaymentMethod;
}
