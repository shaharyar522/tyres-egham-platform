<?php

use App\Http\Controllers\Api\Admin\AppointmentBlockController as AdminAppointmentBlockController;
use App\Http\Controllers\Api\Admin\AppointmentSettingsController as AdminAppointmentSettingsController;
use App\Http\Controllers\Api\Admin\AuthController;
use App\Http\Controllers\Api\Admin\BookingController as AdminBookingController;
use App\Http\Controllers\Api\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\Admin\ContentController as AdminContentController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\Admin\TyreCategoryController as AdminTyreCategoryController;
use App\Http\Controllers\Api\Admin\TyreSkuController as AdminTyreSkuController;
use App\Http\Controllers\Api\Admin\VoucherController as AdminVoucherController;
use App\Http\Controllers\Api\AppointmentSlotController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\BlogController;
use App\Http\Controllers\Api\BootstrapController;
use App\Http\Controllers\Api\CheckoutController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\StripeWebhookController;
use App\Http\Controllers\Api\Admin\BookingPaymentController as AdminBookingPaymentController;
use App\Http\Controllers\Api\Admin\NotificationSettingsController as AdminNotificationSettingsController;
use App\Http\Controllers\Api\Admin\PaymentSettingsController as AdminPaymentSettingsController;
use App\Http\Controllers\Api\Admin\SiteSettingsController as AdminSiteSettingsController;
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\ContentArticleController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\PageController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\TyreController;
use App\Http\Controllers\Api\VehicleLookupController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/health', HealthController::class);
Route::get('/bootstrap', BootstrapController::class);

Route::get('/brands', [BrandController::class, 'index']);
Route::get('/brands/{slug}', [BrandController::class, 'show']);
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{slug}', [ServiceController::class, 'show']);
Route::get('/content', [ContentArticleController::class, 'index']);
Route::get('/content/{slug}', [ContentArticleController::class, 'show']);
Route::get('/blog', [BlogController::class, 'index']);
Route::get('/blog/{slug}', [BlogController::class, 'show']);
Route::get('/pages/{slug}', [PageController::class, 'show']);
Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/appointments/slots', [AppointmentSlotController::class, 'index']);
Route::get('/checkout/payment-config', [CheckoutController::class, 'paymentConfig']);
Route::post('/checkout/prepare', [CheckoutController::class, 'prepare']);
Route::post('/checkout/stripe-payment-intent', [CheckoutController::class, 'stripePaymentIntent']);
Route::post('/checkout/bookings/{reference}/confirm-stripe', [CheckoutController::class, 'confirmStripe']);
Route::post('/stripe/webhook', StripeWebhookController::class);
Route::post('/bookings', [BookingController::class, 'store']);
Route::get('/bookings/{reference}', [BookingController::class, 'show']);
Route::patch('/bookings/{reference}', [BookingController::class, 'update']);
Route::post('/bookings/{reference}/cancel', [BookingController::class, 'cancel']);
Route::get('/vehicles/lookup/{registration}', [VehicleLookupController::class, 'show']);
Route::post('/tyres/search', [TyreController::class, 'search']);
Route::get('/tyres/{idOrSlug}', [TyreController::class, 'show']);

Route::prefix('/admin')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/password', [AuthController::class, 'updatePassword']);
        Route::get('/dashboard', DashboardController::class);
        Route::post('/content/{content}/media', [AdminContentController::class, 'updateMedia']);
        Route::apiResource('content', AdminContentController::class);
        Route::get('/bookings', [AdminBookingController::class, 'index']);
        Route::get('/bookings/{reference}', [AdminBookingController::class, 'show']);
        Route::patch('/bookings/{reference}', [AdminBookingController::class, 'update']);
        Route::post('/bookings/{reference}/cancel', [AdminBookingController::class, 'cancel']);
        Route::post('/bookings/{reference}/resend-confirmation', [AdminBookingController::class, 'resendConfirmation']);
        Route::patch('/bookings/{reference}/payment', [AdminBookingPaymentController::class, 'update']);
        Route::get('/appointment-settings', [AdminAppointmentSettingsController::class, 'show']);
        Route::put('/appointment-settings', [AdminAppointmentSettingsController::class, 'update']);
        Route::get('/payment-settings', [AdminPaymentSettingsController::class, 'show']);
        Route::put('/payment-settings', [AdminPaymentSettingsController::class, 'update']);
        Route::get('/notification-settings', [AdminNotificationSettingsController::class, 'show']);
        Route::put('/notification-settings', [AdminNotificationSettingsController::class, 'update']);
        Route::get('/site-settings', [AdminSiteSettingsController::class, 'show']);
        Route::post('/site-settings', [AdminSiteSettingsController::class, 'update']);
        Route::put('/site-settings', [AdminSiteSettingsController::class, 'update']);
        Route::get('/reviews', [AdminReviewController::class, 'index']);
        Route::patch('/reviews/{review}', [AdminReviewController::class, 'update']);
        Route::get('/tyres', [AdminTyreSkuController::class, 'index']);
        Route::post('/tyres', [AdminTyreSkuController::class, 'store']);
        Route::post('/tyres/bulk-within-24h', [AdminTyreSkuController::class, 'bulkWithin24h']);
        Route::get('/tyres/{tyreSku}', [AdminTyreSkuController::class, 'show']);
        Route::patch('/tyres/{tyreSku}', [AdminTyreSkuController::class, 'update']);
        Route::post('/tyres/{tyreSku}/image', [AdminTyreSkuController::class, 'updateImage']);
        Route::apiResource('vouchers', AdminVoucherController::class);
        Route::apiResource('brands', AdminBrandController::class);
        Route::apiResource('categories', AdminTyreCategoryController::class)->parameters([
            'categories' => 'tyreCategory',
        ]);
        Route::get('/appointment-blocks', [AdminAppointmentBlockController::class, 'index']);
        Route::post('/appointment-blocks', [AdminAppointmentBlockController::class, 'store']);
        Route::delete('/appointment-blocks/{appointmentBlock}', [AdminAppointmentBlockController::class, 'destroy']);
    });
});

// Removed: closure routes cannot be cached (use /admin/me instead)
