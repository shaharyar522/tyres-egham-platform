# Live Server Par Changes Upload Karne Ki Complete Guide (Roman Urdu)

Yeh guide apko step-by-step batayegi ke jo nayi features aur changes humne add ki hain:
1. **Bulk Disable / Enable Premium Tyres** (Admin Catalogue me)
2. **Bulk Disable / Enable Same-Day & 24h Delivery** (Admin Catalogue me)
3. **Select All Checkbox** (Catalogue Table Header me)
4. **Exact Premium Tyres Filter** (Frontend Website search results me)
5. **Visual Quantity Tiers Manager** (Tyre add/edit me raw JSON ke bajaye visual table + 1-click auto generator)

In sab changes ko aap apne live server (VPS, cPanel, ya Cloud Server) par kaise upload aur activate kar sakte hain.

---

## 1. Kon Kon Si Files Change Hui Hain?

### Frontend Files (React + Vite):
* `frontend/src/pages/admin/catalog-tyres.tsx` *(Bulk Disable Premium, Select All Header, Clear Button)*
* `frontend/src/pages/admin/catalog-tyre-edit.tsx` *(QuantityTiersEditor integrate kiya)*
* `frontend/src/components/admin/quantity-tiers-editor.tsx` *(Naya visual component)*
* `frontend/src/pages/search-results.tsx` *(Premium badge exact filter)*
* `frontend/dist/` *(Compiled production bundle)*

### Backend Files (Laravel):
* `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php` *(Pehle se bulkPremium & bulkSameDayDelivery supported hai)*
* `backend/routes/api.php` *(Pehle se routes verified hain)*

---

## 2. Server Par Upload Karne Ke 2 Aasan Tareeqay

Apke server setup ke mutabiq aap **Option A (Git + SSH)** ya **Option B (cPanel / FileZilla FTP)** choose kar sakte hain:

---

### Option A: Agar Aapke Paas SSH Terminal / Git Hai (Best & Recommended)

#### Step 1: Local Computer Par Git Commit & Push Karein
Apne computer ke terminal me yeh commands chalayein:
```bash
git add .
git commit -m "Add bulk disable premium, exact premium filter, and visual quantity tiers editor"
git push origin main
```

#### Step 2: Live Server Me Login Karein & Pull Karein
SSH ke zariye apne server me jayein:
```bash
ssh username@your-server-ip
cd /path/to/your/project
git pull origin main
```

#### Step 3: Frontend Build Run Karein (Live Server Par)
```bash
cd frontend
npm install
npm run build
```
*(Build files `frontend/dist/` me tayyar ho jayengi).*

#### Step 4: Backend Caches Refresh Karein
```bash
cd ../backend
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Bas! Aapki tamam changes live server par active ho jayengi!

---

### Option B: Agar Aap cPanel File Manager Ya FileZilla (FTP) Use Karte Hain

Agar aapke server par command line / SSH access nahi hai:

#### Step 1: Local Computer Par Frontend Ka Build Banayein
Apne computer ke VS Code terminal me:
```bash
cd "f:\the tyeres ghums\frontend"
npm run build
```
Yeh command `frontend/dist` folder me sab latest compiled files create kar degi.

#### Step 2: Live Server Par Frontend Files Upload Karein
1. cPanel File Manager ya FileZilla open karein.
2. Apne website ke public web folder me jayein (aam tor par `public_html` ya jahan frontend serve ho raha hai).
3. Apne computer ke `f:\the tyeres ghums\frontend\dist\` folder ka sara content (`assets/`, `index.html`, etc.) server ke us web folder me upload kar ke overwrite/replace kar dein.

#### Step 3: Backend Controller File Upload Karein
Agar backend me koi change ho:
* Local file: `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php`
* Server par destination: `backend/app/Http/Controllers/Api/Admin/TyreSkuController.php` me upload kar dein.

#### Step 4: Laravel Cache Clear Karein
cPanel Terminal ya URL ke zariye Laravel cache clear karein:
```bash
php artisan optimize:clear
```
*(Ya cPanel me `php artisan route:clear` aur `php artisan config:clear` run karein).*

---

## 3. Server Par Changes Test Karne Ka Tareeqa

Upload karne ke baad browser me check karein:

1. **Admin Panel -> Catalogue - tyres (`/admin/tyres`)**:
   - Checkbox par click karein:
   - Dekhein ke toolbar me **Premium (X)** aur sath **Disable Premium (X)** dono buttons show ho rahe hain.
   - Same-Day ke liye **Same-Day (X)** aur **Disable Same-Day (X)** dono maujood hain.
   - Table header ka pehla box tick karein, page ke tamam 25 tyres 1 click me select honge!
   - **Disable Premium** par click karein -> selected tyres ka premium status foran OFF ho jayega!

2. **Admin Panel -> Edit / Add Tyre (`/admin/tyres/new` ya `/admin/tyres/:id`)**:
   - Pricing section me jayein.
   - Ab raw JSON textarea ke bajaye ek khubsurat **Visual Table** nazar aayegi!
   - Base price likhein (maslan 150) aur **"Auto-generate (1, 2, 4)"** button dabayein -> 1 second me 1, 2, aur 4 tyres ke discounts ban kar table me aa jayenge!

3. **Front-End Search Results (`/tyres`)**:
   - Sidebar me "DELIVERY & CATEGORY" me jayein.
   - **"Premium Tyres Only"** checkbox tick karein.
   - Ab sirf aur sirf wahi tyres result me aayenge jin par gold color ka **Premium Badge** laga hua hai!

---

## 4. Common Troubleshooting (Agar Koi Masla Aaye)

| Masla | Wajah | Hal (Fix) |
|---|---|---|
| Browser me purani files show ho rahi hain | Browser cache | Browser me `Ctrl + Shift + R` (Hard Refresh) karein ya Incognito mode me check karein. |
| Admin button click karne par "401 / 419" error | Session expire | Admin se logout kar ke dobara login karein. |
| Live server par new changes reflect nahi ho rahe | Vite build upload nahi hui | Ensure karein ke `frontend/dist` ka sara naya material live server par replace ho gaya hai. |
| Laravel route error | Route cache purani hai | Live server terminal par `php artisan route:clear` chalayein. |

---
*Yeh guide aapke deployment process ko seamless aur error-free banati hai.*
