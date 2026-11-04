# Egham Tyres - Phase 0 Prototype

A clickable, mobile-first prototype of the Egham Tyres ecommerce + booking platform. This is **Phase 0** - frontend only, mock data, no backend, no real payments. Its job is to lock the design and the customer flows before the dynamic Laravel + admin CMS work starts in Phase 1.

## Stack

- **Build**: Vite + React 18 + TypeScript
- **UI**: shadcn-style primitives on top of Radix UI + Tailwind CSS
- **Icons**: lucide-react
- **Forms**: react-hook-form + zod (wired in deps, ready for Phase 1)
- **Routing**: react-router-dom
- **Server state**: @tanstack/react-query (provider configured, ready for Phase 1 MSW/API integration)

## Run it

```bash
cd prototype
npm install     # only first time
npm run dev     # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production bundle
npm run preview  # serve the production bundle
npm run lint     # eslint
```

## What's in the prototype

### Pages (frontend-only, mock data)

| Route                                                  | What it shows                                                                           |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `/`                                                    | Home: trust ribbon, value-prop strip, hero search (VRN + size tabs), popular sizes, categories, brands by tier, services, reviews |
| `/tyresearch/results?Width=205&Profile=55&Rim=16`      | Search results: filter panel, sort dropdown (9 options), tier sections (Recommended / Premium / Mid / Budget), result cards |
| `/tyresearch/results?TyreCategory=4x4`                 | Same page, category-deep-link entry                                                     |
| `/vrnsearch/results?vrn=AB12CDE`                       | Reuses search results page (DVLA flow placeholder)                                      |
| `/tyresearch/details/:id/:slug`                        | SKU detail: EU label, OE badges, manufacturer SKU, video toggle, qty ladder, fitment-confirm checkbox, related |
| `/tyre/brand/:id/:slug`                                | Brand landing template (CMS-ready in Phase 1) with hero, voucher, recommended-by-category, peer brands |
| `/services/details/:id/:slug`                          | Service detail page (Tyre Safety Check / Wheel Alignment / Tyre Repair)                 |
| `/content/details/:id/:slug`                           | Advice / content article page                                                           |
| `/basket`                                              | Step 1 - basket with voucher entry and brand-keyed validation                           |
| `/basket/services`                                     | Step 2 - services upsell                                                                |
| `/basket/checkout`                                     | Step 3 - slot selection, contact details, booking notes, fitment confirm                |
| `/booking/confirmation?ref=...`                        | Booking confirmation with magic-link CTA                                                |
| `/reviews`                                             | Reviews wall with submission CTA                                                        |
| `/faq/booking-faq`                                     | Booking FAQ accordion                                                                   |
| `/about`, `/contact-us`, `/privacy`, `/terms`, `/cookies`, `/sitemap` | Lightweight static placeholders                                            |
| `/admin/*`                                             | Stub - admin dashboard ships in Phase 1                                                 |

### Domain components

Located in `src/components/domain/`:

- `tyre-search-widget` - dual-mode VRN + size search (used on home and as compact search elsewhere)
- `result-card` - full reference-parity card with brand mark, OE badges, EU label, voucher banner, cutoff timer, qty ladder, star rating
- `eu-label` - EU tyre-label badge row (fuel grade, wet grip, noise dB + class)
- `oe-badge` - OE / vehicle-manufacturer approval pill with tooltip
- `voucher-banner` - brand-keyed promotional banner
- `cutoff-timer` - state machine (`Book within N mins...` -> `Order now to fit tomorrow` -> `Next day fitting available`)
- `funnel-stepper` - 3-step progress bar
- `brand-logo` - tier-coloured brand mark placeholder
- `star-rating` - 5-star rating with count
- `order-summary` - sticky basket summary (used in all 3 funnel steps)

### Layout components

Located in `src/components/layout/`:

- `site-layout` - root layout with sticky header + footer + cookie consent
- `site-header` - logo, mega menu (desktop), mobile drawer (lg:hidden), phone CTA, basket badge
- `mega-menu` - desktop mega panel: Tyres / Brands / Vehicle Makes / Services / Offers / Help / About
- `mobile-menu` - mobile accordion drawer with all menu groups
- `trust-ribbon` - top bar with rating, accreditations, admin link
- `value-prop-strip` - persistent strip: Next day fitting / Pay when fitted / Local experts / Best brands
- `cookie-consent` - 3-option banner: Accept / Reject / Manage
- `site-footer` - 5-column footer with categories, top brands, services, and 8 legal/utility links

### Mock data

Located in `src/data/`:

- `brands.ts` - 29 brands grouped by tier (Premium 8 / Mid-Range 11 / Budget 10)
- `categories.ts` - 8 tyre categories (Car / 4x4 / Van / Run Flat / EV / All Season / Winter / High Performance)
- `makes.ts` - 12 popular vehicle makes
- `services.ts` - 3 services (Tyre Safety Check FREE / Wheel Alignment from £49 / Tyre Repair from £25)
- `skus.ts` - 30 SKUs across 5 sizes and all tiers, with realistic OE markings, EU labels, qty tier pricing, voucher links
- `vouchers.ts` - 6 brand-keyed vouchers with min-qty + per-qty discount + validity windows
- `reviews.ts` - 6 sample reviews
- `content.ts` - 8 advice articles
- `areas.ts` - 88 areas served (mirroring the planned local-SEO catchment)

### Design system

- Theme tokens in `src/index.css` using HSL CSS variables - colours, surfaces, status, brand
- Tailwind config in `tailwind.config.ts` extends with brand colours, container, custom fontSize ramp, shadows, and animations
- Fonts: Inter (body) + Manrope (display) via Google Fonts
- Mobile-first breakpoints: `sm 640 / md 768 / lg 1024 / xl 1280 / 2xl 1440`

## What is intentionally NOT in Phase 0

These are scoped for Phase 1 and beyond:

- Real Laravel backend, MySQL, Redis
- DVLA + SMMT vehicle lookups
- Real payment / Stripe / Opayo
- Real email / SMS / WhatsApp sending
- Real authentication (admin Sanctum + customer magic-link)
- Admin dashboard and Site Settings module
- Programmatic SEO page generator
- Cloudflare CDN + sitemap-index
- MSW (Mock Service Worker) - currently using static fixtures; MSW will be wired up alongside the real API contracts in Phase 1
- Storybook - planned for Phase 0+ as time allows; primitives are already structured to drop into Storybook stories

All "submit" actions in the prototype show success states / navigate, but nothing persists to a server. The basket state persists to `localStorage` for demo continuity.

## Project structure

```
prototype/
\u251c\u2500 src/
\u2502  \u251c\u2500 components/
\u2502  \u2502  \u251c\u2500 ui/         # shadcn-style primitives
\u2502  \u2502  \u251c\u2500 domain/     # tyre-specific composite components
\u2502  \u2502  \u2514\u2500 layout/     # header, footer, mega menu, cookie consent
\u2502  \u251c\u2500 data/           # mock fixtures
\u2502  \u251c\u2500 lib/            # cn, formatGBP, slugify, pluralize
\u2502  \u251c\u2500 pages/          # one file per route
\u2502  \u251c\u2500 store/          # BasketProvider (React context + localStorage)
\u2502  \u251c\u2500 types/          # all domain TypeScript types
\u2502  \u251c\u2500 App.tsx         # router + providers
\u2502  \u251c\u2500 main.tsx        # root
\u2502  \u2514\u2500 index.css       # Tailwind layers + theme tokens
\u251c\u2500 tailwind.config.ts
\u251c\u2500 postcss.config.js
\u251c\u2500 vite.config.ts
\u2514\u2500 tsconfig.app.json
```

## How to demo it

A suggested click-through for showing this to the client:

1. Open `/` - point out trust ribbon, value-prop strip, sticky search widget, mega menu, popular sizes, brand tiers, services, reviews.
2. Click a popular size like `205/55R16` - browse the search results page.
3. Toggle some filters (Specialist > Run Flat, Brand Tier > Premium) and switch the sort dropdown.
4. Click into a SKU detail page - show OE badges with tooltip, EU label, qty ladder, voucher banner, fitment-confirm checkbox.
5. Add to basket -> Step 1 (apply voucher e.g. `MICH26FA`) -> Step 2 (add Wheel Alignment) -> Step 3 (pick a slot, fill details, confirm).
6. Land on the booking confirmation - reference number, slot, magic-link CTA.
7. Open `/tyre/brand/1/michelin-tyres` to see the brand landing template.
8. Open `/services/details/76/tyre-safety-check` and `/content/details/20/buying-premium-vs-budget-tyres`.
9. Resize the window to mobile (< 1024px) - mega menu collapses into the drawer, value-prop strip scrolls, search widget reflows.

## Sample voucher codes for demos

| Code         | Brand        | Min Qty | Discount/tyre |
| ------------ | ------------ | ------- | ------------- |
| `MICH26FA`   | Michelin     | 4       | \u00a312.50   |
| `COMAY26`    | Continental  | 4       | \u00a315      |
| `GOOD26`     | Goodyear     | 2       | \u00a38       |
| `PIRELLI4`   | Pirelli      | 4       | \u00a317.50   |
| `FALK4SAVE`  | Falken       | 4       | \u00a37       |
| `HANK2DEAL`  | Hankook      | 2       | \u00a36       |

Try entering one in the basket page after adding 4 of the matching brand's tyres.
