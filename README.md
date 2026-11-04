# The Tyres Egham - Project Master Documentation & Deployment Guide

> **Project Architecture:** Modern Headless Web Platform  
> **Backend:** Laravel 11 (PHP 8.2+) REST API  
> **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS  
> **Admin Panel:** Integrated SPA CMS (`/admin`)

---

## Fihrist (Table of Contents)

1. [Project Overview (Yeh Project Kaise Kaam Karta Hai)](#1-project-overview)
2. [Kon Kon Si Files Me Changing Ki Gayi Hai (File Change Log)](#2-file-change-log)
3. [Frontend Aur Backend Ka Code Abhi Kaise Dekhein (Local URLs)](#3-local-urls)
4. ["Build" Kya Hai Aur `npm run build` Se Kya Hota Hai?](#4-build-explanation)
5. [Live Server Par Latest Code Kaise Upload Karein (Step-by-Step)](#5-live-upload-guide)
6. [Database Migrations (Database Me Naye Columns Add Karna)](#6-database-migrations)
7. [Important Artisan & NPM Commands](#7-commands-reference)

---

## 1. Project Overview

Yeh project do hisson (2 main parts) par mushtamil hai:

```
f:\the tyeres ghums\
│
├── backend/          --> Laravel 11 REST API (Database, Business Logic, Admin Endpoints)
└── frontend/         --> React + Vite Single Page Application (Customer Website + Admin Portal)
```

1. **Backend (Laravel API):**
   - Database ke sath connect hota hai (`tyre_skus`, `brands`, `bookings`, etc.).
   - Frontend ko JSON format me data bhejta hai.
   - Bulk update actions (`/api/admin/tyres/bulk-premium`, `/api/admin/tyres/bulk-same-day-delivery`, etc.) handle karta hai.

2. **Frontend (React + Vite):**
   - Customer Facing Pages: Home (`/`), Tyre Search (`/tyres`), Product Detail (`/tyre/...`), Basket & Checkout.
   - Admin CMS Portal (`/admin`): Dashboard, Catalogue (`/admin/tyres`), Add/Edit Tyre (`/admin/tyres/:id`), Bookings, Settings.

---

## 2. File Change Log (Kon Si File Me Kya Change Hua)

Tamam changes do modules ke teht ki gayi hain: **Backend** aur **Frontend**.

### A. Frontend Files:

| File Path | Kya Change Hua (Description) |
|---|---|
| `frontend/src/pages/admin/catalog-tyres.tsx` | **Bulk Actions Toolbar:** <br>• `Disable Premium ({count})` button add kiya.<br>• `Same-Day ({count})` aur `Disable Same-Day ({count})` add kiya.<br>• `Enable 24h` aur `Disable 24h` counts ke sath update kiya.<br>• Table header me master **"Select All" Checkbox** add kiya.<br>• **`Clear ({count})`** selection button add kiya. |
| `frontend/src/components/admin/quantity-tiers-editor.tsx` | **Naya Visual Component:** <br>• Raw JSON textarea ke bajaye interactive visual table banai.<br>• Qty (1, 2, 4), Price per tyre (£), Total Price, aur Live Savings preview diya.<br>• **⚡ 1-Click "Auto-generate (1, 2, 4)"** button add kiya jo base price se automatic discounts calculate karta hai.<br>• Raw JSON toggle with live syntax validation badge. |
| `frontend/src/pages/admin/catalog-tyre-edit.tsx` | Tyre add/edit form me raw `<textarea>` ko hata kar naye `<QuantityTiersEditor />` ke sath connect kiya. |
| `frontend/src/pages/search-results.tsx` | Customer website ke search filter me **"Premium Tyres Only"** ko strictly `Boolean(s.isPremium)` par filter kiya taake sirf wahi tyres show hon jin par gold **Premium Badge** hai. |
| `frontend/src/components/domain/result-card.tsx` | Golden **Premium Badge** aur Sky-Blue **Same-Day Delivery Badge** card par display hote hain. |
| `frontend/src/pages/sku-detail.tsx` | Tyre single product detail page par Premium aur Same-Day delivery cards aur badges wired hain. |
| `frontend/src/lib/admin/queries.ts` | React Query mutations for bulk premium, same day delivery, and within 24h express flag. |

### B. Backend Files:

| File Path | Kya Change Hua (Description) |
|---|---|
| `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php` | `bulkPremium` aur `bulkSameDayDelivery` endpoints jo selected tyre IDs ko database me 1 click se enable ya disable karte hain. Aur `index()` me filters support. |
| `backend/app/Models/TyreSku.php` | `is_premium` aur `is_same_day_delivery` fillable aur boolean casting. |
| `backend/app/Support/FrontendApi.php` | API response me `isPremium` aur `isSameDayDelivery` fields JSON me serialize hoti hain. |
| `backend/database/migrations/2026_10_21_204700_add_is_premium_to_tyre_skus_table.php` | Database table `tyre_skus` me `is_premium` (boolean) column add karta hai. |
| `backend/database/migrations/2026_10_22_180000_add_is_same_day_delivery_to_tyre_skus_table.php` | Database table `tyre_skus` me `is_same_day_delivery` (boolean) column add karta hai. |
| `backend/routes/api.php` | `/api/admin/tyres/bulk-premium` aur `/api/admin/tyres/bulk-same-day-delivery` routes register hain. |

---

## 3. Local URLs (Abhi Apne Computer Par Kaise Check Karein)

Dono dev servers aapke computer par chal rahe hain:

- **Customer Website (Tyre Search):**  
  👉 [http://localhost:5173/tyres](http://localhost:5173/tyres)  
  *(Sidebar me "DELIVERY & CATEGORY" me "Premium Tyres Only" check karein).*

- **Admin Portal - Catalogue Tyres:**  
  👉 [http://localhost:5173/admin/tyres](http://localhost:5173/admin/tyres)  
  *(Checkboxes select karein aur "Premium", "Disable Premium", "Same-Day", "Disable Same-Day" buttons test karein).*

- **Admin Portal - Add New Tyre:**  
  👉 [http://localhost:5173/admin/tyres/new](http://localhost:5173/admin/tyres/new)  
  *(Pricing section me naya visual Quantity Tiers table dekhein aur 1-click Auto-generate test karein).*

- **Backend API:**  
  👉 [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

---

## 4. "Build" Kya Hai Aur `npm run build` Se Kya Hota Hai?

### Aam Alfaaz Me Samajhein:
Jab hum React aur TypeScript me code likhte hain:
- Files hoti hain `.tsx`, `.ts`, Tailwind CSS utility classes, React Hooks, etc.
- **Web browsers (Chrome, Safari, Edge) `.tsx` files ko direct nahi chala sakte.**

### `npm run build` Kya Karta Hai?
Jab aap `frontend` folder me `npm run build` chalate hain to do baray kaam hotay hain:
1. **Type Checking (`tsc -b`):**  
   TypeScript poore project ko scan karta hai ke kisi file me koi syntax ya code error to nahi hai. Agar koi error ho to build foran ruk jati hai taake kharab code live na jaye.
2. **Bundling & Minification (`vite build`):**  
   Vite saari 100+ React components, icons, aur styles ko compress (minify) kar ke 3-4 choti plain JavaScript aur CSS files me pack kar deta hai.
3. **`frontend/dist/` Folder:**  
   Yeh compiled files `frontend/dist/` folder ke andar save hoti hain (`dist/index.html` aur `dist/assets/...`).

> **Golden Rule:** Live server par React ki `.tsx` files execute nahi hoti; live server par sirf aur sirf **`dist/`** folder ki files serve hoti hain! Isliye jab bhi frontend code me changing karein, `npm run build` chala kar `dist/` ko live server par replace karna zaroori hai.

---

## 5. Live Server Par Latest Code Upload Karne Ka Tareeqa

### Tareeqa 1: cPanel File Manager Ya FTP (FileZilla) Ke Zariye (Most Common)

Agar aapke paas cPanel access hai:

#### Step 1: Local Computer Par Build Banayein
Apne computer ke terminal me jayein:
```bash
cd "f:\the tyeres ghums\frontend"
npm run build
```
*(Yeh command `frontend/dist` me latest files tayyar kar degi).*

#### Step 2: Frontend Files Upload Karein
1. cPanel File Manager open karein.
2. Website ke public web folder me jayein (aam tor par `public_html` ya jahan frontend hosted hai).
3. Apne computer ke `f:\the tyeres ghums\frontend\dist\` ke andar jitni bhi files hain (`index.html`, `assets/` folder wagera), unko server ke web root me upload kar ke purani files ko **overwrite/replace** kar dein.

#### Step 3: Backend Files Upload Karein
Agar aapne backend files bhi server par update karni hain:
1. `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php`
2. `backend/app/Models/TyreSku.php`
3. `backend/app/Support/FrontendApi.php`
4. `backend/routes/api.php`
5. `backend/database/migrations/` (dono new migration files)
Yeh files cPanel ke zariye server ke `backend/` folder me unhi paths par upload kar dein.

#### Step 4: Database Update Karein (Agar Column Pehle Se Maujood Nahi Hain)
cPanel me phpMyAdmin open karein aur database me check karein ke `tyre_skus` table me `is_premium` aur `is_same_day_delivery` columns hain ya nahi.
Agar nahi hain to phpMyAdmin me yeh simple SQL query chala dein:
```sql
ALTER TABLE tyre_skus ADD COLUMN is_premium TINYINT(1) NOT NULL DEFAULT 0 AFTER is_available_within_24h;
ALTER TABLE tyre_skus ADD COLUMN is_same_day_delivery TINYINT(1) NOT NULL DEFAULT 0 AFTER is_premium;
```

#### Step 5: Laravel Cache Clear Karein
cPanel Terminal me ya SSH me yeh commands chalayein:
```bash
cd /path/to/backend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
```

---

### Tareeqa 2: SSH Terminal / Git Ke Zariye (Developer Approach)

Agar aapka live server Git ke sath linked hai:

```bash
# 1. Local se commit and push karein
git add .
git commit -m "Update bulk premium, same day delivery, and visual quantity tiers"
git push origin main

# 2. Server me SSH login karein
ssh user@your-server-ip
cd /var/www/the-tyres-egham

# 3. Code pull karein
git pull origin main

# 4. Backend migrations aur cache clear
cd backend
php artisan migrate --force
php artisan optimize:clear
php artisan route:cache

# 5. Frontend build
cd ../frontend
npm install
npm run build
```

---

## 6. Database Migrations Reference

Agar aap live server par terminal use kar rahe hain to migrations run karne ke liye:
```bash
php artisan migrate --force
```
Yeh do files database me columns banati hain:
- `2026_10_21_204700_add_is_premium_to_tyre_skus_table.php` -> `is_premium` (TINYINT 1, default 0)
- `2026_10_22_180000_add_is_same_day_delivery_to_tyre_skus_table.php` -> `is_same_day_delivery` (TINYINT 1, default 0)

---

## 7. Useful Commands Reference

| Kaam (Task) | Terminal Command | Folder (Cwd) |
|---|---|---|
| Frontend Dev Server Start | `npm run dev` | `frontend` |
| Frontend Production Build | `npm run build` | `frontend` |
| Backend Server Start | `php artisan serve` | `backend` |
| Backend Cache Clear | `php artisan optimize:clear` | `backend` |
| Database Migration Run | `php artisan migrate` | `backend` |
| Route List Check | `php artisan route:list --path=admin/tyres` | `backend` |

---
*Created for The Tyres Egham Platform — October 2026*
