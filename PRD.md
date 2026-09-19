# PRD — ASN.NET Marketing Website
**Product Requirements Document · Dokumen Kebutuhan Produk**

> Bilingual document: structure and body in English; user-facing copy examples in Bahasa Indonesia (ID).
> Dokumen dwibahasa: struktur dalam bahasa Inggris; contoh teks antarmuka pengguna dalam Bahasa Indonesia (ID).

---

## 1. Document Control

| Field | Value |
|---|---|
| Product | ASN.NET — Company Marketing Website (v1) |
| Document version | 1.0 |
| Status | Approved for build |
| Date | 2026-09-12 |
| Owner | ASN.NET (Product/Marketing) |
| Reference competitor | bnetfit.id (Indonesian FTTH ISP marketing site) |
| Stack (fixed) | SvelteKit + Threlte (frontend) · ElysiaJS (backend) · Bun runtime · Drizzle ORM · TypeScript |
| Repository | Single monorepo: `frontend/` + `backend/` |

### Revision history
| Version | Date | Author | Change |
|---|---|---|---|
| 1.0 | 2026-09-12 | — | Initial approved PRD |

---

## 2. Overview & Latar Belakang

### 2.1 Product vision (EN)
ASN.NET is an existing Indonesian FTTH (fiber-to-the-home) ISP. The company currently sells and installs home/business internet but lacks a modern digital storefront. This project delivers a fast, SEO-strong, visually striking marketing website whose single purpose is to **turn visitors into qualified installation leads** — through a coverage checker, transparent package catalog, and lead capture — while establishing ASN.NET as a premium, technology-forward brand.

### 2.2 Latar Belakang (ID)
> ASN.NET adalah penyedia layanan internet fiber optik (FTTH) yang sudah beroperasi dan melayani pemasangan di area-area tertentu. Saat ini calon pelanggan kesulitan mengetahui: (1) apakah rumah mereka sudah tercakup layanan, (2) paket apa yang tersedia dan berapa harganya di area mereka, dan (3) bagaimana cara mendaftar dengan cepat. Website ini menjawab ketiganya sekaligus membangun citra brand modern melalui tampilan 3D yang premium.

### 2.3 Positioning
- **Premium but accessible**: metallic-blue/silver glossy visual identity signals quality; package catalog stays honest and simple.
- **Coverage-first UX**: the #1 question an ISP visitor has — *"Apakah area saya tercakup?"* — is answered on the homepage above the fold.
- **SEO moat**: one landing page per city/area to capture organic search like *"internet fiber [kota]"*, *"pasang wifi [kecamatan]"*.

### 2.4 Reference analysis (bnetfit.id)
Patterns adopted from the reference site: hero value props (Gratis Modem · 100% Fiber Optic · Kuota Tanpa Batas), cascading coverage checker (Kota/Kabupaten → Kecamatan) with a "Request Area" fallback, speed tiers with device-count guidance and savings badges, product lines (home fiber, OTT bundle, mesh), per-city landing pages, branch/contact footer, and legal pages. Selfcare app is intentionally excluded from v1.

---

## 3. Goals & Success Metrics

### 3.1 Business goals
1. Increase qualified installation leads (form submissions + WhatsApp clicks) month over month.
2. Reduce "is my area covered?" phone inquiries by letting users self-check coverage.
3. Win organic search traffic for ISP keywords in every covered city/district.

### 3.2 Success metrics (KPIs) — measured at 90 days post-launch
| Metric | Target |
|---|---|
| Coverage checks per session | ≥ 25% of homepage sessions |
| Homepage → lead form conversion | ≥ 3% |
| Lead form completion rate | ≥ 60% of form opens |
| "Langganan Sekarang" CTR on package cards | ≥ 8% |
| Organic sessions to `/city/*` area pages | ≥ 30% of total organic |
| Lighthouse (Performance / SEO / Accessibility) | ≥ 90 / 100 / 95 |
| LCP (mobile, 75th percentile) | < 2.5 s |
| Admin lead response time (first action) | < 1 business hour |

### 3.3 Non-goals (v1)
Not measured / not built in v1: online payment conversion, subscriber churn, selfcare engagement (see §4).

---

## 4. Out of Scope (v1) & Phase 2 Preview

**Deferred to Phase 2 (not in this build):**
- Customer selfcare portal (login, profile, invoice history) — equivalent of a "MyASN.NET" app.
- Online payments / payment gateway integration.
- Billing & subscription management, RADIUS/Mikrotik sync.
- Installation-technician scheduling & dispatch.
- Live chat / chatbot.
- Blog CMS beyond a simple article list (v1 ships FAQ only; blog is P2).

**Phase 2 preview:** login (OTP via WhatsApp/email) → dashboard (langganan, tagihan, riwayat) → payment gateway (QRIS, VA) → support tickets. The v1 data model (§12) keeps `leads` normalized so Phase 2 can convert a lead → customer without migration pain.

---

## 5. Target Users & Personas

### Front-of-site (public)
| Persona | Profile | Needs | Key journey |
|---|---|---|---|
| **Ibu Rumah Tangga — "Sari" (35, Bekasi)** | Family of 4–5, 10+ devices, worried about buffering | Know if her housing complex is covered; affordable unlimited package | Homepage hero → cek cakupan → lihat paket → isi form / WhatsApp |
| **WFH Professional — "Dimas" (29, Jakarta Selatan)** | Video calls all day, symmetric upload matters | Stable low-latency fiber; speed tiers explained clearly | SEO area page → Stream/Fiber comparison → lead form |
| **Gamer/Streamer — "Raka" (21, Bandung)** | Low ping, high download, night-heavy usage | Fastest tier, honest "up to" framing, FUP clarity | Product page → paket tertinggi → WhatsApp |
| **Pemilik UKM — "Bu Ratna" (45, Medan)** | Small shop/office, needs reliability + invoice | Business package, human contact fast | Business page → kontak/branch → telepon/WhatsApp |
| **Pencari di area belum tercakup — "Anto" (31, Kudus)** | Wants the service locally | Express demand, get notified | Coverage checker → "Request Area" form |

### Back-of-site (admin)
| Persona | Needs |
|---|---|
| **Marketing Admin** | Manage promos, banners, FAQ, package copy without developer help |
| **Sales CS** | View new leads instantly, filter by area/package, update follow-up status, export to spreadsheet |
| **Network/NOC Admin** | Maintain city/district coverage data as deployment expands |

---

## 6. Site Map & Information Architecture

### 6.1 Public routes
```
/                          Homepage (3D hero, value props, checker, highlights, promos, FAQ teaser)
/city                      City/area directory (SEO index) — "Pilih Area Domisili Kamu"
/city/[slug]               Per-city SEO landing (packages for that city, local copy)
/layanan                   Product index
/layanan/fiber             ASN.NET Fiber — home internet flagship
/layanan/stream            ASN.NET Stream — fiber + OTT entertainment bundle
/layanan/mesh              ASN.NET Mesh — whole-home WiFi with extra access points
/layanan/business          ASN.NET Business — UKM/office dedicated options
/paket                     Full package catalog (filterable by area)
/promo                     Active promotions page
/daftar                    Lead signup form (also reachable as modal from CTAs)
/request-area              Request coverage form
/tentang                   About ASN.NET
/kontak                    Contact + branch offices + maps embed
/faq                       FAQ (accordion, CMS-driven)
/kebijakan-privasi         Privacy Policy (UU PDP aware)
/persyaratan-layanan       Terms of Service
```

### 6.2 Homepage section order
1. **Hero 3D** — headline + subheadline + inline coverage checker + trust badges.
2. **Value props strip** — 3 cards: `Gratis WiFi Modem` · `100% Fiber Optic` · `Kuota Tanpa Batas`.
3. **Product lines preview** — Fiber / Stream / Mesh / Business cards with 3D tilt.
4. **Package highlights** — 3–4 popular tiers with promo badges.
5. **How it works** — `Cek Cakupan → Pilih Paket → Jadwal Pemasangan` 3-step strip.
6. **Active promo banner(s)** — CMS-driven.
7. **Testimonials / stats** (configurable).
8. **FAQ teaser** (top 4) + full FAQ link.
9. **Final CTA** + footer (contacts, branch cities, socials, legal links).

### 6.3 Coverage checker flow (core IA logic)
`Kota/Kabupaten (select) → Kecamatan (dependent select) → Check`
- **Available** → success state + package list filtered to that area + CTA `Langganan Sekarang`.
- **Coming soon** → "Segera hadir" state + option to join waitlist (lead with source=waitlist).
- **Not available** → `Request Area` form (name, WhatsApp, city, district auto-filled) → recorded as area request.

### 6.4 Admin routes
```
/admin                     Login
/admin/leads               Lead inbox (filter, status, export CSV)
/admin/area-requests       Demand map/list by district
/admin/coverage            Manage cities, districts, coverage status
/admin/packages            Products, packages, per-area price overrides
/admin/promos              Promo badges & validity windows
/admin/content             Banners, FAQ, testimonials, homepage copy blocks
/admin/branches            Office/branch entries
/admin/users               Admin accounts & roles
```

---

## 7. Design Direction — 3D Landing Page & Visual Identity

### 7.1 Brand palette (fixed by stakeholder)
| Token | Value | Usage |
|---|---|---|
| `--asn-blue-300` | `#7DD3FC` | Light metallic blue — highlights, gradients start |
| `--asn-blue-500` | `#38BDF8` | Primary actions, links, focus rings |
| `--asn-blue-700` | `#0369A1` | Gradient ends, hover states |
| `--asn-silver-100` | `#F4F6F9` | Metallic silver light — panels, sheen |
| `--asn-silver-400` | `#C3CBD6` | Metallic silver mid — borders, chrome text |
| `--asn-silver-600` | `#94A3B3` | Silver dark — secondary text on glossy white |
| `--asn-white` | `#FFFFFF` | **Glossy white background** base |
| `--asn-ink-900` | `#0F172A` | Primary text (AA on white) |
| Gradient hero | `#7DD3FC → #38BDF8 → #0369A1` | 3D materials, CTA fills |

**Material language:** "white glossy" = near-white surfaces with soft specular sheen (subtle diagonal light-sweep gradient, `backdrop-filter` glass cards with 1px silver borders and soft blue-tinted shadows). Metallic silver is brushed/chrome gradient text or trims; metallic blue is reserved for interactive/brand elements so CTAs stay unambiguous.

### 7.2 3D hero scene
- **Engine:** [Threlte](https://threlte.xyz) (Three.js for Svelte) in SvelteKit.
- **Scene concept A (default):** abstract **fiber-optic network** — glowing blue light strands flowing through a metallic-silver grid toward a chrome ASN.NET orb; light pulses communicate "speed & stability".
- **Scene concept B (fallback/pre-launch A/B):** low-poly **fiber globe** with connection arcs lighting up covered cities.
- **Interaction:** subtle mouse/touch parallax (max ±6° rotation), no pointer-lock or heavy post-processing. Respect `prefers-reduced-motion` → static render.
- **Load strategy:** scene code-split, lazy-mounted after first paint; **poster** (static metallic render) shown instantly for LCP; scene fades in when ready. On `navigator.hardwareConcurrency <= 4` or no WebGL2 → poster + CSS animated light-sweep only.
- The 3D canvas is **decorative only** (`aria-hidden`); all actions are real DOM controls.

### 7.3 Scroll storytelling & motion
- Sections reveal on scroll (fade + rise 16px, staggered) via GSAP ScrollTrigger or Svelte transitions — one motion style, 150–400 ms, `cubic-bezier(0.22, 1, 0.36, 1)`.
- Package cards: **3D tilt on hover** (desktop, pointer-fine only) + glossy reflection sweep.
- Value-prop cards get floating metallic 3D icons (modem, fiber cable, infinity) — same material language as hero.
- All motion disabled under `prefers-reduced-motion`.

### 7.4 Typography & layout
- Font: `Plus Jakarta Sans` (headings 700/800, body 400/500) — self-hosted, `font-display: swap`.
- Fluid type scale via `clamp()`; 8-pt spacing grid; max content width 1200px (hero full-bleed).

---

## 8. Responsive Device Matrix

**Requirement (stakeholder-fixed): responsive on smartphone, tablet, iPad, laptop, PC.**

| Device class | Viewport (px) | Tailwind bp | Layout rules | 3D hero behavior |
|---|---|---|---|---|
| Smartphone S/M | 360–429 | base | 1 column; stacked checker (3 taps: kota → kecamatan → cek); sticky bottom CTA bar (`Cek Cakupan` + WhatsApp) | Static poster + CSS light-sweep |
| Smartphone L | 430–767 | `sm` | 1 column, larger type | Poster or very light scene (≤ 30k tris) if GPU allows |
| Tablet / iPad | 768–1023 | `md` | 2 columns; checker inline in hero; package grid 2-up | Simplified scene (no post-processing, reduced particle count) |
| iPad Pro / small laptop | 1024–1279 | `lg` | 3-col package grid; full nav bar | Full scene, capped DPR 1.5 |
| Laptop | 1280–1599 | `xl` | 1200px content width, 4-col grids | Full scene, DPR ≤ 2 |
| PC / Desktop | 1600–2560+ | `2xl` | Content max 1320px, hero full-bleed with safe margins | Full scene + parallax, DPR ≤ 2 |

Cross-cutting rules:
- **Mobile-first CSS**; test matrix must include iPhone SE (375), iPhone Pro Max (430), iPad mini & iPad Air (portrait **and** landscape), 1366 laptop, 1920 PC, 2560 ultrawide.
- **Touch vs pointer:** hover/tilt effects only on `(hover: hover) and (pointer: fine)`; tap targets ≥ 44×44 px; form inputs trigger correct keyboards (`inputmode="tel"` for WhatsApp, `type="email"`).
- **Navigation:** hamburger + slide-over drawer `< lg`; full horizontal nav ≥ `lg`.
- **Tables/catalog:** package comparison becomes swipeable card carousel on mobile; no horizontal page scroll anywhere.
- **Orientation change:** hero canvas resizes via `ResizeObserver`; no layout shift on rotate.
- Coverage checker and lead forms must be fully operable one-handed on a 360 px viewport.

---

## 9. Functional Requirements (P0 / P1 / P2)

Legend: **P0** = must ship v1 · **P1** = should ship v1 · **P2** = nice to have / Phase 2.

### FR-1 Coverage Service (P0)
- FR-1.1 Public API returns active cities (with slug) and, per city, its districts.
- FR-1.2 Public API answers a coverage query `(cityId, districtId)` → `available | coming_soon | not_available` + list of packages for that area (respecting per-area price overrides).
- FR-1.3 Coverage status per district is admin-manageable (see FR-7) and auditable (`updated_at`, `updated_by`).
- FR-1.4 Responses are cacheable (CDN/HTTP cache, 5-min TTL) to keep the checker fast and cheap.
- **Acceptance:** checker returns result < 500 ms p95; invalid combos return 404-friendly state, not 500.

### FR-2 Package Catalog (P0)
- FR-2.1 Products: `Fiber`, `Stream`, `Mesh`, `Business` — each with landing page content managed in admin.
- FR-2.2 Package fields: name, speed (`Up To X Mbps`), base price/month, recommended device range (`cocok digunakan 12–15 perangkat`), features list, active flag, product relation, sort order.
- FR-2.3 **Per-area price overrides**: a package can have a different price per city (and optional per district); UI always shows the effective price for the checked/selected area.
- FR-2.4 Package cards display: speed number, `/bulan`, device-count line, feature bullets, promo badge (if any), CTA `Langganan Sekarang`.
- FR-2.5 Catalog pages filterable by product and by selected area (after coverage check).

### FR-3 Promo Engine (P1)
- FR-3.1 Admin defines promos: badge text (`Kamu lebih hemat`, `Promo Harbolnas: Bayar 3 Bulan, Gratis 1 Bulan!`), description, discount type (percent / fixed / free-months), valid window (`starts_at`–`ends_at`), applicable products/packages/areas.
- FR-3.2 Promo badges render automatically on matching package cards; expired promos disappear without deploy.
- FR-3.3 Promo page `/promo` lists active campaigns with terms & conditions.

### FR-4 Lead Capture (P0)
- FR-4.1 Lead form fields: full name, WhatsApp number (validated E.164-ID), email (optional), city, district, full address, selected package (optional), preferred install date (optional), consent checkbox for data processing (UU PDP).
- FR-4.2 Sources tracked: `homepage_checker`, `package_card`, `product_page`, `promo_page`, `contact_page`, `waitlist`.
- FR-4.3 Server-side validation + **duplicate detection** (same WhatsApp + city within 30 days → flagged `duplicate` but still stored).
- FR-4.4 Anti-spam: rate limit per IP, honeypot field, Cloudflare Turnstile (or equivalent) on submit.
- FR-4.5 On success: confirmation UI (`Terima kasih! Tim kami akan menghubungi kamu dalam 1×24 jam.`) + optional WhatsApp deep-link fallback.
- FR-4.6 Optional webhook/email notification to sales on new lead (P1).

### FR-5 Request Area Workflow (P0)
- FR-5.1 When coverage = `not_available`, user can submit an area request (name, WhatsApp, auto-filled city/district).
- FR-5.2 Admin sees demand aggregated per district (count, trend) to prioritize network expansion.
- FR-5.3 (P1) User may opt into notification when their district becomes available.

### FR-6 CMS-lite Content (P1)
- FR-6.1 Admin edits: hero copy, value-prop cards, FAQ entries, testimonials, promo banners, branch list — no deploys.
- FR-6.2 All public content fields have sane defaults in seed data.

### FR-7 Admin Panel (P0 core / P1 extended)
- FR-7.1 Auth: email + password (bcrypt/argon2), session cookie (httpOnly, SameSite=Lax), roles `admin | marketing | sales | noc`.
- FR-7.2 Coverage management: CRUD cities/districts; bulk-set coverage status; CSV import for districts (P1).
- FR-7.3 Package management: CRUD packages, drag sort, per-area price matrix editor.
- FR-7.4 Leads inbox: list with filters (status, city, package, date, source), status pipeline `new → contacted → scheduled → installed → lost`, internal notes, CSV export, click-to-WhatsApp link.
- FR-7.5 Area requests: list + per-district aggregation view.
- FR-7.6 Content & promo editors (ties to FR-6, FR-3).
- FR-7.7 Audit log of admin mutations (P1).

### FR-8 SEO & Analytics (P0)
- FR-8.1 SSR pages with unique title/meta description per route; canonical URLs; Open Graph + Twitter cards.
- FR-8.2 City landing pages generate localized copy from templates + real package data (thin-content guard: pages only render for cities with data).
- FR-8.3 Structured data: `Organization`, `WebSite` (sitewide), `Product`/`Offer` (packages), `FAQPage` (FAQ), `BreadcrumbList`.
- FR-8.4 Auto `sitemap.xml` + `robots.txt`; sitemap includes all `/city/*` and product pages.
- FR-8.5 GA4 + Meta Pixel with consent banner; custom events: `coverage_check`, `coverage_result`, `lead_submit`, `request_area`, `whatsapp_click`, `package_cta`.
- FR-8.6 WhatsApp click-to-chat floating button with prefilled message: `Halo ASN.NET, saya mau tanya paket untuk area [kota/kecamatan].`

---

## 10. Tech Stack & Monorepo Architecture

### 10.1 Repository structure (stakeholder-fixed: one monorepo, `frontend/` + `backend/`)
```
asnnet-website/
├── package.json                 # Bun workspaces: ["frontend", "backend"]
├── bun.lock
├── .env.example
├── README.md
├── PRD.md
├── frontend/                    # SvelteKit (Svelte 5) + Threlte + Tailwind
│   ├── package.json
│   ├── svelte.config.js
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   └── src/
│       ├── routes/              # /, /city/[slug], /layanan/*, /paket, /promo, /daftar, /request-area, /kontak, /faq, legal
│       ├── lib/
│       │   ├── components/      # ui/, sections/ (hero, checker, packages, footer…)
│       │   ├── scenes/          # Threlte 3D hero (scene, materials, poster fallback)
│       │   ├── api/             # Eden Treaty client, typed endpoints
│       │   ├── stores/          # coverage-check state, area selection
│       │   └── utils/           # formatters, seo helpers
│       └── app.html / app.css   # glossy-white theme tokens
└── backend/                     # ElysiaJS on Bun + Drizzle ORM
    ├── package.json
    ├── drizzle.config.ts
    └── src/
        ├── index.ts             # Elysia app bootstrap, CORS, rate-limit
        ├── routes/              # public.ts, leads.ts, coverage.ts, admin/*.ts, auth.ts
        ├── schemas/             # TypeBox validation schemas (shared with frontend)
        ├── services/            # coverage.service, lead.service, promo.service, content.service
        ├── db/                  # drizzle client, schema.ts, migrations/, seed.ts
        ├── plugins/             # auth (jwt/session), rate-limit, turnstile verify
        └── utils/               # env validation, logger
```

### 10.2 Stack decisions
| Layer | Choice | Rationale |
|---|---|---|
| Runtime | **Bun** (both workspaces) | Single toolchain: dev, test, bundler, package manager |
| Frontend | **SvelteKit (Svelte 5)** | SSR/SSG for SEO, best-in-class DX, Threlte integration |
| 3D | **Threlte 7 / Three.js** | Declarative Three.js in Svelte, code-split scenes |
| Styling | **Tailwind CSS** + design tokens (§7.1) | Fast metallic/glossy theming, responsive matrix via breakpoints |
| Backend | **ElysiaJS** | Bun-native, end-to-end type safety with Eden Treaty, great DX |
| Validation | **TypeBox** schemas in `backend/src/schemas` (re-exported to frontend) | One source of truth for form + API validation |
| ORM | **Drizzle ORM** + `drizzle-kit` | Typed SQL, lightweight, first-class Bun support |
| Database | **PostgreSQL 16** (assumption — see §17) | Reliable relational fit for catalog/coverage/leads |
| Auth | Session cookies (admin only) | Simple, secure, no public login in v1 |
| Deploy | Single VPS or Bun-friendly host: `frontend` (Node adapter or static prerender + SSR server) behind Nginx/Caddy reverse proxy to `backend` | Cost-efficient; HTTPS via Caddy auto-TLS |

### 10.3 API surface (v1)
```
GET  /api/cities                      → active cities
GET  /api/cities/:slug/districts      → districts for city
GET  /api/coverage?city=&district=    → status + effective packages for area
GET  /api/packages?product=&city=     → catalog (optional filters)
GET  /api/promos/active               → active promo badges
GET  /api/content/:key                → CMS blocks (hero, faq, banners, branches…)
POST /api/leads                       → create lead (turnstile + rate-limited)
POST /api/area-requests               → create area request
POST /api/admin/auth/login            → admin session
*    /api/admin/* (guarded)           → CRUD: coverage, packages, promos, leads, content, users
```

### 10.4 Environments & config
- `.env` validated at boot (Elysia `t` / zod): `DATABASE_URL`, `JWT_SECRET`, `TURNSTILE_SECRET_KEY`, `PUBLIC_SITE_URL`, `WHATSAPP_NUMBER`, webhook secrets.
- Seed script (`backend/src/db/seed.ts`) ships 1 demo city + districts + 4 packages + 1 promo so the site is demonstrable on day one.

---

## 11. UX Flows & Example Copy (ID)

### Flow A — Coverage check (happy path)
1. User lands on homepage hero. Headline:
   > **Internet Fiber Super Cepat untuk Rumah & Bisnismu**
   > Koneksi stabil 100% fiber optik, unlimited, gratis modem.
2. User selects `Kota/Kabupaten` → `Kecamatan` → taps **`Cek Cakupan`**.
3. Result (available):
   > ✅ **Kabar baik! ASN.NET sudah tersedia di Kecamatan Cibinong.**
   > Pilih paket favoritmu di bawah ini 👇
4. Packages render with area price; CTA **`Langganan Sekarang`** opens the lead form (modal or `/daftar?package=…&city=…`).

### Flow B — Lead form
Fields as FR-4.1. Microcopy:
> Isi data di bawah, tim ASN.NET akan menghubungimu via WhatsApp dalam 1×24 jam untuk jadwal pemasangan. 🚀
Submit button: **`Kirim Permintaan Pemasangan`**
Success: **`Terima kasih, [Nama]! Permintaanmu sudah kami terima. Cek WhatsApp kamu ya!`**

### Flow C — Request Area (no coverage)
Result state:
> 😔 **Waduh, ASN.NET belum tersedia di Kecamatan [X].**
> Tapi tenang — semakin banyak yang meminta, semakin cepat kami datang!
CTA: **`Request Area`** → short form → success:
> **Terima kasih! Permintaan area [Kecamatan] sudah dicatat. Kami kabari begitu ASN.NET hadir di lokasimu.**

### Package card copy pattern
```
ASN.NET Fiber 100
Up To 100 Mbps  |  Rp299.000 /bulan
✓ Cocok digunakan 8–10 perangkat
✓ Unlimited tanpa FUP
✓ Gratis instalasi & modem
[badge: Kamu lebih hemat]
[ Langganan Sekarang ]
```

### Empty/edge states
- Cities list still loading → skeleton selectors (no spinner-only screens).
- District list empty for a city → show `Request Area` directly.
- API failure on checker → inline retry: `Gagal memuat. Coba lagi.` (no dead ends).

---

## 12. Data Model (Drizzle outline)

```ts
// backend/src/db/schema.ts (conceptual)
cities            { id, name, slug, province, isActive, createdAt }
districts         { id, cityId → cities, name, slug }
coverageAreas     { id, cityId, districtId, status: 'available'|'coming_soon'|'not_available',
                    updatedAt, updatedBy → adminUsers }        // unique(cityId, districtId)
products          { id, key: 'fiber'|'stream'|'mesh'|'business', name, tagline, heroCopy,
                    features jsonb, sortOrder, isActive }
packages          { id, productId → products, name, speedMbps, basePriceIdr,
                    devicesMin, devicesMax, features jsonb, sortOrder, isActive }
packageAreaPrices { id, packageId → packages, cityId → cities, districtId nullable,
                    priceIdr, isActive }                        // effective price resolution
promos            { id, name, badgeText, description, tnc,
                    discountType: 'percent'|'fixed'|'free_months', discountValue,
                    scope jsonb /* products/packages/areas */,
                    startsAt, endsAt, isActive }
leads             { id, fullName, phone, email, cityId, districtId, address,
                    packageId nullable, preferredDate nullable, source,
                    status: 'new'|'contacted'|'scheduled'|'installed'|'lost',
                    duplicateOf nullable → leads, notes, consentAt, createdAt }
areaRequests      { id, fullName, phone, cityId, districtId, notifyWhenAvailable,
                    status: 'new'|'reviewed', createdAt }
contentBlocks     { id, key /* hero, faq, banners, testimonials, branches… */,
                    data jsonb, updatedAt, updatedBy }
adminUsers        { id, email, passwordHash, name, role, isActive, lastLoginAt }
auditLogs         { id, actorId, entity, entityId, action, diff jsonb, createdAt }   // P1
```

Key behaviors:
- **Effective price resolver**: `packageAreaPrices` most-specific match (district → city) else `packages.basePriceIdr`.
- **Leads dedup rule**: same normalized phone + city within 30 days → `duplicateOf` link (still stored, flagged in admin).
- All money stored as integer IDR (no floats). All timestamps `timestamptz`.

---

## 13. Admin Panel (Back-Office) UX Summary
- SvelteKit admin area under `/admin` (same monorepo frontend, separate layout, server-guarded).
- Leads inbox is the default landing after login — sales CS workflow first.
- Per-district demand view: bar list of area requests (last 30/90 days) with coverage status cross-referenced — answers "where do we build next?".
- Bulk actions: update lead status, CSV export (leads, area requests).
- All destructive actions confirm via modal; audit trail for coverage/package/price changes (P1).

---

## 14. Integrations
| Integration | Purpose | Phase |
|---|---|---|
| WhatsApp click-to-chat (`wa.me` deep links, prefilled per area) | Primary human channel | v1 |
| Cloudflare Turnstile | Form spam protection | v1 |
| GA4 + Meta Pixel (+ consent banner) | Funnel measurement, remarketing readiness | v1 |
| Google Maps embed | Branch locations on `/kontak` | v1 |
| Email/webhook (Resend or Slack webhook) | New-lead notifications to sales | P1 |
| Payment gateway (Midtrans/Xendit) | Phase 2 selfcare billing | P2 |
| RADIUS / Mikrotik / billing sync | Phase 2 operations | P2 |

---

## 15. Non-Functional Requirements
- **Performance:** LCP < 2.5 s and CLS < 0.1 at p75 mobile (with 3D poster strategy from §7.2); initial JS ≤ 200 KB gz on homepage before scene hydration; images AVIF/WebP with explicit dimensions.
- **Accessibility:** WCAG 2.1 AA — AA contrast on glossy white, visible focus rings (`--asn-blue-500`), keyboard-operable checker & forms, `prefers-reduced-motion` honored, 3D canvas `aria-hidden` with text alternatives.
- **Compatibility:** evergreen browsers; last 2 versions Chrome/Edge/Firefox/Safari (iOS & macOS).
- **Availability:** 99.9% monthly; health endpoint `/api/health`; structured JSON logs.
- **Security:** HTTPS only, HSTS; security headers (CSP, X-Frame-Options, Referrer-Policy); parameterized queries via Drizzle; rate limits (per-IP: checker 60/min, lead POST 5/h); secrets only via env; admin sessions expire + rotation on privilege change.
- **Privacy (UU PDP):** consent checkbox with explicit purpose text; data retained per policy; lead export/delete on request; consent timestamp stored on lead.
- **Backups:** daily DB backups, 30-day retention; migration rollback plan (`drizzle-kit` down scripts for risky changes).
- **Scalability:** stateless API (horizontal scale); CDN-cacheable public GETs; coverage/packages data designed for hundreds of cities × districts × packages without redesign.

---

## 16. Milestones & Phasing

### Phase 1 — This PRD (target: 8 weeks)
| Milestone | Weeks | Scope |
|---|---|---|
| **M1 — Foundations** | 1–2 | Monorepo scaffold (Bun workspaces), design tokens + glossy theme, Tailwind system, Drizzle schema + seed, Elysia skeleton, CI (typecheck, lint) |
| **M2 — Core MVP** | 3–5 | Coverage checker (API + UI), package catalog + per-area prices, lead capture + admin leads inbox, request-area flow, product & city pages (SSR), FAQ/legal |
| **M3 — 3D & Polish** | 6–7 | Threlte hero + poster fallback, scroll storytelling, promo engine, CMS-lite, SEO (schema.org, sitemap), analytics events |
| **M4 — Hardening & Launch** | 8 | Cross-device QA (§8 matrix), a11y & Lighthouse audit, UAT with sales team, load/rate-limit checks, DNS/SSL cutover, launch checklist |

**Launch checklist (extract):** sitemap submitted to Search Console · GA4/Pixel verified · Turnstile live in prod · WhatsApp number tested · seed content replaced with real packages/prices · backup job verified · rollback plan documented.

### Phase 2 — Preview (post-v1)
Selfcare portal (OTP login, subscription & invoice view), payment gateway (QRIS/VA), support tickets, technician scheduling, blog CMS, WhatsApp API notifications, coverage waitlist auto-notify.

---

## 17. Risks, Assumptions & Open Questions

### Risks
| Risk | Impact | Mitigation |
|---|---|---|
| 3D hero hurts LCP / low-end devices | Conversion drop | Poster-first strategy, device-tier degradation (§7.2, §8), performance budget enforced in CI |
| Coverage data stale/wrong | Mis-sold leads, complaints | Admin ownership (NOC role), audit trail, `updated_at` displayed internally, lead notes surface area mismatch |
| Sales SLA not met (1×24 jam promise) | Reputation damage | Admin notifications (P1) + lead aging report before promise is published |
| Thin city pages → SEO penalty | Organic loss | Pages only render with real data + unique local copy fields per city |
| Spam leads via public form | Wasted sales time | Turnstile + rate limits + duplicate detection |

### Assumptions
1. PostgreSQL is the production DB (no existing DB to integrate; confirm — see Open Questions).
2. Coverage data can be exported from network ops as city/district lists (no live BSS integration in v1).
3. Prices differ by area for the same package name (per-area override is required; if pricing is national, FR-2.3 simplifies but model stays).
4. Marketing admin will own content updates after handover (CMS-lite scope is sufficient).
5. One WhatsApp business number is the primary channel.

### Open Questions
1. ~~Final legal entity name & address block for footer/legal pages?~~ **Answered 2026-09-13: PT Advance Service Network Indonesia** (brand: ASN.NET, tagline: "Smart Service, Strong Network" — official logo provided; footer/favicon updated). Address block still open.
2. Is pricing strictly per-city, or also per-district? (affects admin price matrix UI priority)
3. Which OTT/streaming partner (if any) for the Stream product bundle? *(reference site bundles Vidio)*
4. Production hosting target (VPS provider / region) and domain for launch?
5. Brand assets: final ASN.NET logo, and is a dark-metallic variant allowed for footer/3D scene accents?

---

*End of PRD — ASN.NET Marketing Website v1.0*
