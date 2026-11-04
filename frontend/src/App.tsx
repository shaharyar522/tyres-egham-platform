import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SiteLayout } from "@/components/layout/site-layout";
import { ScrollToTop } from "@/components/scroll-to-top";
import { BasketProvider } from "@/store/basket";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useApiBootstrapQuery, useApiHealthQuery } from "@/lib/api/queries";
import { SiteHead } from "@/components/site-head";
import { SiteCustomCode } from "@/components/site-custom-code";
import { SiteCanonical } from "@/components/site-canonical";

const HomePage = lazy(() => import("@/pages/home"));
const SearchResultsPage = lazy(() => import("@/pages/search-results"));
const SkuDetailPage = lazy(() => import("@/pages/sku-detail"));
const BrandLandingPage = lazy(() => import("@/pages/brand-landing"));
const BasketPage = lazy(() => import("@/pages/basket"));
const ServicesUpsellPage = lazy(() => import("@/pages/services-upsell"));
const CheckoutPage = lazy(() => import("@/pages/checkout"));
const ConfirmationPage = lazy(() => import("@/pages/confirmation"));
const ServiceDetailPage = lazy(() => import("@/pages/service-detail"));
const ContentArticlePage = lazy(() => import("@/pages/content-article"));
const AreasServedPage = lazy(() => import("@/pages/areas-served"));
const ReviewsPage = lazy(() => import("@/pages/reviews"));
const FaqPage = lazy(() => import("@/pages/faq"));
const BrandsDirectoryPage = lazy(() => import("@/pages/brands-directory"));
const MakesDirectoryPage = lazy(() => import("@/pages/makes-directory"));
const ServicesDirectoryPage = lazy(() => import("@/pages/services-directory"));
const BlogIndexPage = lazy(() => import("@/pages/blog-index"));
const BlogDetailPage = lazy(() => import("@/pages/blog-detail"));
const OffersPage = lazy(() => import("@/pages/offers-page"));
const SitemapPage = lazy(() => import("@/pages/sitemap-page"));
const CmsPage = lazy(() => import("@/pages/cms-page"));
const ReviewSubmitPage = lazy(() => import("@/pages/review-submit"));
const BookingManagePage = lazy(() => import("@/pages/booking-manage"));
const AdminLoginPage = lazy(() => import("@/pages/admin/login"));
const AdminLayout = lazy(() => import("@/pages/admin/layout"));
const AdminDashboardPage = lazy(() => import("@/pages/admin/dashboard"));
const AdminContentListPage = lazy(() => import("@/pages/admin/content-list"));
const AdminContentEditPage = lazy(() => import("@/pages/admin/content-edit"));
const AdminBookingsPage = lazy(() => import("@/pages/admin/bookings"));
const AdminBookingDetailPage = lazy(() => import("@/pages/admin/booking-detail"));
const AdminReviewsPage = lazy(() => import("@/pages/admin/reviews"));
const AdminCatalogTyresPage = lazy(() => import("@/pages/admin/catalog-tyres"));
const AdminCatalogTyreEditPage = lazy(() => import("@/pages/admin/catalog-tyre-edit"));
const AdminVouchersPage = lazy(() => import("@/pages/admin/vouchers"));
const AdminVoucherEditPage = lazy(() => import("@/pages/admin/voucher-edit"));
const AdminBrandsPage = lazy(() => import("@/pages/admin/brands"));
const AdminBrandEditPage = lazy(() => import("@/pages/admin/brand-edit"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/categories"));
const AdminCategoryEditPage = lazy(() => import("@/pages/admin/category-edit"));
const AdminAppointmentBlocksPage = lazy(() => import("@/pages/admin/appointment-blocks"));
const AdminPaymentSettingsPage = lazy(() => import("@/pages/admin/payment-settings"));
const AdminNotificationsPage = lazy(() => import("@/pages/admin/notifications"));
const AdminSiteSettingsPage = lazy(() => import("@/pages/admin/site-settings"));
const AdminAccountSettingsPage = lazy(() => import("@/pages/admin/account-settings"));

import AboutPage from "@/pages/about";
import ContactUsPage from "@/pages/contact-us";
import StaticPage, { NotFoundPage } from "@/pages/static";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false },
  },
});

function PageLoader() {
  return (
    <div className="container py-20 text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-3 text-sm text-muted-foreground">Loading...</p>
    </div>
  );
}

function BackendWarmup() {
  useApiHealthQuery();
  useApiBootstrapQuery();

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BackendWarmup />
      <SiteHead />
      <BrowserRouter>
        <SiteCanonical />
        <SiteCustomCode />
        <ScrollToTop />
        <BasketProvider>
          <TooltipProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="admin/login" element={<AdminLoginPage />} />
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="content" element={<AdminContentListPage />} />
                  <Route path="content/:id" element={<AdminContentEditPage />} />
                  <Route path="bookings" element={<AdminBookingsPage />} />
                  <Route path="bookings/:reference" element={<AdminBookingDetailPage />} />
                  <Route path="appointments" element={<AdminAppointmentBlocksPage />} />
                  <Route path="payments" element={<AdminPaymentSettingsPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="site-settings" element={<AdminSiteSettingsPage />} />
                  <Route path="account" element={<AdminAccountSettingsPage />} />
                  <Route path="reviews" element={<AdminReviewsPage />} />
                  <Route path="tyres" element={<AdminCatalogTyresPage />} />
                  <Route path="tyres/:id" element={<AdminCatalogTyreEditPage />} />
                  <Route path="vouchers" element={<AdminVouchersPage />} />
                  <Route path="vouchers/:id" element={<AdminVoucherEditPage />} />
                  <Route path="brands" element={<AdminBrandsPage />} />
                  <Route path="brands/:id" element={<AdminBrandEditPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="categories/:id" element={<AdminCategoryEditPage />} />
                </Route>
                <Route element={<SiteLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="tyresearch/results" element={<SearchResultsPage />} />
                  <Route path="vrnsearch/results" element={<SearchResultsPage />} />
                  <Route path="tyresearch/details/:id/:slug" element={<SkuDetailPage />} />
                  <Route path="tyre/brand/:id/:slug" element={<BrandLandingPage />} />
                  <Route path="tyre/make/:id/:slug" element={<SearchResultsPage />} />
                  <Route path="tyres" element={<SearchResultsPage />} />
                  <Route path="brands" element={<BrandsDirectoryPage />} />
                  <Route path="makes" element={<MakesDirectoryPage />} />
                  <Route path="services" element={<ServicesDirectoryPage />} />
                  <Route path="services/details/:id/:slug" element={<ServiceDetailPage />} />
                  <Route path="blog" element={<BlogIndexPage />} />
                  <Route path="blog/:slug" element={<BlogDetailPage />} />
                  <Route path="content/details/:id/:slug" element={<ContentArticlePage />} />
                  <Route path="help" element={<Navigate to="/blog" replace />} />
                  <Route path="help-centre" element={<Navigate to="/blog" replace />} />
                  <Route path="offers" element={<OffersPage />} />
                  <Route path="areas-served" element={<AreasServedPage />} />
                  <Route path="areas-served/:slug" element={<AreasServedPage />} />
                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="reviews/submit" element={<ReviewSubmitPage />} />
                  <Route path="faq/booking-faq" element={<FaqPage />} />
                  <Route path="faq/:slug" element={<FaqPage />} />
                  <Route path="about" element={<AboutPage />} />
                  <Route path="contact-us" element={<ContactUsPage />} />
                  <Route path="privacy" element={<CmsPage slug="privacy" />} />
                  <Route path="terms" element={<CmsPage slug="terms" />} />
                  <Route path="cookies" element={<CmsPage slug="cookies" />} />
                  <Route path="sitemap" element={<SitemapPage />} />
                  <Route path="basket" element={<BasketPage />} />
                  <Route path="basket/services" element={<ServicesUpsellPage />} />
                  <Route path="basket/checkout" element={<CheckoutPage />} />
                  <Route path="booking/confirmation" element={<ConfirmationPage />} />
                  <Route path="booking/manage" element={<BookingManagePage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </TooltipProvider>
        </BasketProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
