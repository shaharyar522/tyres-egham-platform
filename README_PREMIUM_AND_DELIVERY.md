# Premium Tyre Feature & Same-Day Delivery Guide

This document explains all the changes made to add the **Premium** tyre feature (Admin toggle + Storefront badge + filters) and the **Same-Day Delivery & Express Fitting** option, as well as step-by-step instructions for deploying to a live/production server.

---

## 1. Summary of Changes

### A. Admin Dashboard Catalogue (`/admin/tyres`)
- **New Column "Premium"**: Added between "Within 24h" and the action buttons in the admin table.
- **One-Click Instant Toggle**: Admin can click the button in any tyre row (`Premium` / `OFF`) to immediately toggle premium status without leaving the page.
- **Toolbar Filter**: Added a `Premium filter` dropdown (`All`, `Premium only`, `Standard only`).
- **Bulk Actions**: Added `Premium ({count})` and `Standard` bulk buttons when tyres are selected with checkboxes.
- **Tyre Edit Form (`/admin/tyres/:id`)**: Added a `Premium tyre` checkbox under the flags section.

### B. Front-End Storefront (`/tyres`, Search Results & SKU Details)
- **Product Card Badge**: Tyres marked as Premium display a distinctive amber/gold gradient **⭐ Premium** badge on both Grid and List cards (`result-card.tsx`).
- **Product Detail Page**: Displays the glowing **⭐ Premium** badge on the product image overlay (`sku-detail.tsx`).
- **Same-Day Delivery Banner**: Enhanced express fitting banner text to `"Same-Day Delivery & Express Fitting · within 24 hours"`.
- **Search Filters Sidebar**:
  - Added **"⚡ Same-Day / Within 24h"** express delivery filter.
  - Added **"⭐ Premium Tyres Only"** filter.
  - Corrected the Brand Tier label for mid-range tyres from "Budget" to "Mid-Range".

---

## 2. Modified & Created Files

### Backend (Laravel)
1. **Migration (Created)**:
   - `backend/database/migrations/2026_10_21_204700_add_is_premium_to_tyre_skus_table.php`
   - Adds the `is_premium` boolean column (default `false`) to the `tyre_skus` table.

2. **Model**:
   - `backend/app/Models/TyreSku.php`
   - Added `'is_premium' => 'boolean'` to `$casts`.

3. **API Serialization**:
   - `backend/app/Support/FrontendApi.php`
   - Added `'isPremium' => (bool) $sku->is_premium` in `tyreSku()`.

4. **Controller**:
   - `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php`
   - Supported `premium` query parameter in `index()`.
   - Added `bulkPremium()` endpoint for bulk updates.
   - Handled `isPremium` validation and payload mapping in `validatedTyrePayload()`.

5. **Routes**:
   - `backend/routes/api.php`
   - Added `POST /api/admin/tyres/bulk-premium` route.

---

### Frontend (React + TypeScript + Tailwind)
1. **Types**:
   - `frontend/src/types/index.ts`
   - Added `isPremium?: boolean;` to `TyreSku` interface.

2. **Admin API Queries**:
   - `frontend/src/lib/admin/queries.ts`
   - Added `premium` parameter to `useAdminTyresQuery`.
   - Added `useAdminBulkPremiumMutation` hook.

3. **Admin Catalogue Page**:
   - `frontend/src/pages/admin/catalog-tyres.tsx`
   - Added `Premium` table header and row toggle button.
   - Added `togglePremium()` and `applyBulkPremium()` handlers.
   - Added `Premium filter` dropdown in the toolbar.

4. **Admin Tyre Edit Page**:
   - `frontend/src/pages/admin/catalog-tyre-edit.tsx`
   - Added `isPremium` to `TyreForm` state, payload mapping, and `FLAG_FIELDS`.

5. **Storefront Tyre Card**:
   - `frontend/src/components/domain/result-card.tsx`
   - Added `Sparkles` icon and glowing gold/amber **Premium** badge in `ProductBadges`.
   - Updated express fitting banner to `"Same-Day Delivery & Express Fitting · within 24 hours"`.

6. **Storefront Product Detail Page**:
   - `frontend/src/pages/sku-detail.tsx`
   - Added **Premium** badge on the tyre photo overlay.
   - Updated express delivery info card.

7. **Storefront Search Results**:
   - `frontend/src/pages/search-results.tsx`
   - Added `sameDayOnly` and `premiumOnly` filters to `ActiveFilters`.
   - Added "Delivery & Category" filter options in the sidebar.
   - Grouped premium tyres into the top Premium tier bucket.

---

## 3. Server Deployment Instructions (Live Server Guide)

When deploying these changes to your live / production server (e.g., VPS, cPanel, Cloud Server, Ubuntu / Nginx / Apache):

### Step 1: Pull or Upload the Changes
If using Git:
```bash
git pull origin main
```
Or upload the updated files listed in Section 2 above.

---

### Step 2: Run Database Migration
On your server terminal inside the `backend` folder, run:
```bash
php artisan migrate --force
```
> **What this does**: Automatically adds the `is_premium` column to the `tyre_skus` table in MySQL without altering any existing tyre data.

If for any reason you prefer to run raw SQL directly in phpMyAdmin / MySQL CLI:
```sql
ALTER TABLE `tyre_skus` 
ADD COLUMN `is_premium` TINYINT(1) NOT NULL DEFAULT 0 
AFTER `is_available_within_24h`;
```

---

### Step 3: Clear Laravel Cache
In the `backend` directory:
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
php artisan view:clear
```
(Optional for production optimization):
```bash
php artisan config:cache
php artisan route:cache
```

---

### Step 4: Build or Upload the Frontend
#### If building on the server:
In the `frontend` directory:
```bash
npm install
npm run build
```

#### If building locally and uploading:
Build locally:
```bash
cd frontend
npm run build
```
Then upload the contents of the `frontend/dist/` directory to your web server's public frontend directory (or root public_html depending on your server setup).

---

## 4. Verification Checklist
- [x] Go to `/admin/tyres` in your browser.
- [x] Check that the **PREMIUM** column appears next to "Within 24h".
- [x] Click the **OFF** button on any tyre row — it will instantly change to **Premium** (amber badge).
- [x] Go to the storefront `/tyres` or search results — that tyre will now display the **⭐ Premium** badge.
- [x] Use the sidebar filter **⚡ Same-Day / Within 24h** to filter tyres available for quick fitting.
- [x] Use the sidebar filter **⭐ Premium Tyres Only** to filter premium tyres.
