# Client Handover & Technical Architecture Report
## Feature Implementation: Same-Day Delivery, Express Fitting & Dashboard Streamlining

**Project:** Egham Tyres E-Commerce Platform  
**Date:** October 22, 2026  
**Status:** ✅ Successfully Implemented, Tested, and Production-Ready  

---

## 1. Executive Summary

This document provides a complete, professional overview of the newly engineered **Same-Day Delivery** system, **Express Fitting (Within 24h)** banner separation, and **Dashboard Streamlining** for the Egham Tyres platform.

### Key Objectives Delivered:
1. **Independent Same-Day Delivery Option**: Built a dedicated database flag, API pipeline, and UI ecosystem for tyres available for same-day delivery.
2. **Admin One-Click Instant Toggle**: Added a dedicated `SAME-DAY` column in the admin catalog table (`/admin/tyres`) allowing administrators to toggle same-day delivery with a single click.
3. **Admin Bulk Operations**: Added bulk `Same-Day` and `Disable Same-Day` actions for multiple tyre selection.
4. **Dashboard Cleanup**: Removed the obsolete/confusing `"Standard"` button from the admin bulk actions toolbar and renamed `"Standard only"` to `"Non-premium only"` in the dropdown filter.
5. **Card Banner Correction**: Removed `"Same-Day Delivery & "` from the top card banner so it now strictly displays:  
   `"Express fitting · within 24 hours"`
6. **Storefront Visual Badging**: Added a modern, glowing **🚚 Same-Day Delivery** badge on tyre cards and product detail pages when enabled.
7. **Customer Filter Differentiation**: Separated the storefront sidebar filters under `DELIVERY & CATEGORY`:
   - `[ ] 🚚 Same-Day Delivery`
   - `[ ] ⚡ Express Fitting (Within 24h)`
   - `[ ] ⭐ Premium Tyres Only`

---

## 2. System Architecture & Flow

```mermaid
flowchart TD
    subgraph Admin_Control["Admin Dashboard (/admin/tyres)"]
        A1[Admin Clicks Same-Day Toggle Button] -->|PATCH /api/admin/tyres/:id| A2[TyreSkuController@update]
        A3[Admin Selects Multiple Tyres] -->|POST /api/admin/tyres/bulk-same-day-delivery| A4[TyreSkuController@bulkSameDayDelivery]
    end

    subgraph Database_Layer["Database Layer (MySQL)"]
        A2 -->|Update boolean| DB[(tyre_skus.is_same_day_delivery)]
        A4 -->|Bulk update boolean| DB
    end

    subgraph API_Serialization["API & Cache Invalidation"]
        DB -->|Query| API[FrontendApi::tyreSku]
        API -->|Serialized JSON Payload| RQ[React Query Cache Invalidation]
    end

    subgraph Customer_Storefront["Customer Storefront (/tyres & search)"]
        RQ -->|Instant live update| SC[Storefront Tyre Cards]
        SC -->|Displays| B1[🚚 Same-Day Delivery Badge]
        SC -->|Displays| B2[⚡ Express fitting · within 24 hours Banner]
        RQ -->|Filter Execution| SF[Sidebar Filters: Delivery & Category]
        SF -->|Check Same-Day| F1[Filters tyres where isSameDayDelivery === true]
        SF -->|Check Express 24h| F2[Filters tyres where isAvailableWithin24h === true]
    end
```

---

## 3. Detailed Breakdown of Files Changed

### Backend (Laravel 11 / PHP 8.2+)

| File Path | Description of Changes |
| :--- | :--- |
| `backend/database/migrations/2026_10_22_180000_add_is_same_day_delivery_to_tyre_skus_table.php` | **[NEW]** Database migration adding `is_same_day_delivery` (boolean, default `false`) to the `tyre_skus` table. |
| `backend/app/Models/TyreSku.php` | Added `'is_same_day_delivery' => 'boolean'` to Eloquent `$casts` array. |
| `backend/app/Support/FrontendApi.php` | Added `'isSameDayDelivery' => (bool) $sku->is_same_day_delivery` to the serialized SKU payload for storefront and admin endpoints. |
| `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php` | - Added `sameDayDelivery` filter in `index()` query.<br>- Created `bulkSameDayDelivery()` method for bulk updates.<br>- Added `isSameDayDelivery` to validation, payload mapping, and default creation state. |
| `backend/routes/api.php` | Registered route: `POST /api/admin/tyres/bulk-same-day-delivery`. |
| `backend/app/Services/CatalogueMatchService.php` | Added match scoring boost (+10 score) when a tyre has `is_same_day_delivery` enabled. |

---

### Frontend (React 19 / TypeScript / Vite / TailwindCSS)

| File Path | Description of Changes |
| :--- | :--- |
| `frontend/src/types/index.ts` | Added `isSameDayDelivery?: boolean;` to the `TyreSku` core TypeScript interface. |
| `frontend/src/lib/admin/queries.ts` | - Added `sameDayDelivery?: string;` query parameter to `useAdminTyresQuery`.<br>- Created `useAdminBulkSameDayMutation` hook.<br>- Added `["api", "tyres"]` cache invalidation to bulk actions so changes reflect instantly on the storefront. |
| `frontend/src/pages/admin/catalog-tyres.tsx` | - Added **SAME-DAY** table column header.<br>- Added interactive row toggle button (`Same-Day` / `OFF`).<br>- Added **Same-Day** filter dropdown in the top toolbar.<br>- Added `Same-Day ({count})` and `Disable Same-Day` bulk buttons.<br>- **Removed the `Standard` button** and renamed `Standard only` to `Non-premium only`. |
| `frontend/src/pages/admin/catalog-tyre-edit.tsx` | - Added `isSameDayDelivery` to form state, defaults, and submission payload.<br>- Added `"Same-Day Delivery"` checkbox in the tyre edit flags section. |
| `frontend/src/components/domain/result-card.tsx` | - Updated top banner text to strictly `"Express fitting · within 24 hours"`.<br>- Added glowing **🚚 Same-Day Delivery** badge in `ProductBadges`. |
| `frontend/src/pages/sku-detail.tsx` | - Updated express banner text to `"Express fitting · within 24 hours"`.<br>- Added **🚚 Same-Day Delivery** badge on product photo overlay.<br>- Added dedicated Same-Day Delivery information banner. |
| `frontend/src/lib/brand-tiers.ts` | Fixed `brandTierLabel` so that `mid_range` returns `"Mid-Range"` instead of duplicate `"Budget"`. |
| `frontend/src/pages/search-results.tsx` | - Cleaned and simplified sidebar filter labels to `"Same-Day Delivery"`, `"Express Fitting (Within 24h)"`, and `"Premium Tyres Only"` without emojis.<br>- Separated active filtering logic to independently filter by `isSameDayDelivery` and `isAvailableWithin24h`. |

---

## 4. Production / Live Server Deployment (cPanel Guide)

When deploying this project to your live cPanel server, follow either of the two standard workflows below.

### Method 1: Git Deployment via cPanel Terminal (Recommended)

1. **Access Terminal in cPanel**:
   Go to **cPanel > Terminal**.
2. **Navigate to Project Directory**:
   ```bash
   cd /home/YOUR_USERNAME/public_html
   ```
3. **Pull Latest Changes**:
   ```bash
   git pull origin main
   ```
4. **Execute Database Migration**:
   ```bash
   cd backend
   php artisan migrate --force
   ```
5. **Clear & Refresh Production Cache**:
   ```bash
   php artisan route:clear
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   php artisan config:cache
   php artisan route:cache
   ```
6. **Compile Frontend (if compiling directly on server)**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

---

### Method 2: Manual Upload (FTP / cPanel File Manager)

1. **Run Database SQL via phpMyAdmin**:
   Open **cPanel > phpMyAdmin**, select your database, and run the following SQL command:
   ```sql
   ALTER TABLE `tyre_skus` 
   ADD COLUMN `is_same_day_delivery` TINYINT(1) NOT NULL DEFAULT 0 
   AFTER `is_premium`;
   ```
2. **Upload Backend Files**:
   Upload the modified files listed in Section 3 to their corresponding paths in your cPanel `backend/` folder.
3. **Build Frontend Locally & Upload**:
   On your local machine terminal:
   ```bash
   cd frontend
   npm run build
   ```
   Upload the compiled files from `frontend/dist/` to your live web directory (e.g. `public_html/` or wherever your frontend assets are served).
4. **Clear Laravel Cache**:
   In cPanel Terminal:
   ```bash
   php artisan optimize:clear
   ```

---

## 5. Verification Checklist

- [x] Admin can view the `SAME-DAY` column in `/admin/tyres`.
- [x] Admin can toggle Same-Day delivery on any individual tyre with 1 click.
- [x] Admin can bulk enable/disable Same-Day delivery for selected tyres.
- [x] Admin bulk actions toolbar no longer displays the `"Standard"` button.
- [x] Storefront card banner displays `"Express fitting · within 24 hours"`.
- [x] Storefront tyres marked with same-day delivery show the **🚚 Same-Day Delivery** badge.
- [x] Storefront filter sidebar allows users to filter by **🚚 Same-Day Delivery** and **⚡ Express Fitting (Within 24h)** independently.
- [x] Product detail page displays the Same-Day badge and delivery card.
- [x] Production build passes with zero errors (`tsc -b && vite build`).

---
*Report prepared for client presentation and documentation archive.*
