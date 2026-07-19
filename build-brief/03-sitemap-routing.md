# 03 — Sitemap and Routing

Every URL on the site, what it renders, and what data it fetches. Uses Next.js App Router conventions.

## Public routes

### Home
- **URL:** `/`
- **Component:** `app/page.tsx`
- **Data:** Fetches the `home` page from the Pages global + up to 6 `published` trucks marked as featured (or the 6 most recent if no featured set) for the "Featured Inventory" section
- **Rendering:** Static generation with ISR (revalidate every 60 seconds)
- **Spec:** See `pages/home.md`

### Inventory (all trucks)
- **URL:** `/inventory`
- **Component:** `app/inventory/page.tsx`
- **Data:** All `published` trucks. Filters applied via URL search params (`?body=box-truck&make=isuzu&year_min=2015&year_max=2024`).
- **Rendering:** Server-side rendered (URL-param dependent) with brief cache
- **Spec:** See `pages/inventory.md`

### Category pages
- **URLs:**
  - `/inventory/box-trucks`
  - `/inventory/reefers`
  - `/inventory/day-cabs`
  - `/inventory/flat-beds`
  - `/inventory/dump-trucks`
  - `/inventory/tow-trucks`
- **Component:** `app/inventory/[category]/page.tsx` (dynamic route)
- **Data:** Same as `/inventory` but pre-filtered by `bodyType`. Also loads a short SEO paragraph for the category.
- **Rendering:** Server-side rendered
- **Spec:** See `pages/inventory.md` (same template as main inventory, with the category filter pre-applied and SEO copy at the top)

### Individual truck
- **URL:** `/trucks/[slug]`
- **Component:** `app/trucks/[slug]/page.tsx` (dynamic route)
- **Data:** Single truck fetched by slug. Also fetches up to 3 similar trucks (same `bodyType`, excluding current) for the "Similar Trucks" section at the bottom.
- **Rendering:** Static generation with ISR (revalidate every 60 seconds). Generates static params from all published trucks at build time.
- **404 behavior:** If the slug doesn't match a `published` truck, render the 404 page.
- **Spec:** See `pages/truck-detail.md`

### Financing
- **URL:** `/financing`
- **Component:** `app/financing/page.tsx`
- **Data:** Fetches the `financing` page from the Pages global
- **Rendering:** Static generation with ISR
- **Spec:** See `pages/financing.md`

### Fleet
- **URL:** `/fleet`
- **Component:** `app/fleet/page.tsx`
- **Data:** Fetches the `fleet` page from the Pages global
- **Rendering:** Static generation with ISR
- **Spec:** See `pages/fleet.md`

### About
- **URL:** `/about`
- **Component:** `app/about/page.tsx`
- **Data:** Fetches the `about` page from Pages global + the Settings global for address/hours
- **Rendering:** Static generation with ISR
- **Spec:** See `pages/about.md`

### Contact
- **URL:** `/contact`
- **Component:** `app/contact/page.tsx`
- **Data:** Fetches the `contact` page from Pages global + Settings for address/hours
- **Rendering:** Static generation with ISR
- **Spec:** See `pages/contact.md`

### Form submission endpoints
- **URL:** `/api/leads` (POST)
- **Purpose:** Receives all lead form submissions (truck inquiry, financing pre-qual, general contact)
- **Rate limit:** 5 submissions per IP per 10 minutes
- **Response:** JSON `{ success: true, leadId: string }` on success; error response with reason on failure
- **Side effects:** Creates a Lead record, sends email notification

- **URL:** `/api/fleet-inquiries` (POST)
- **Purpose:** Receives fleet inquiry submissions
- **Rate limit:** 3 submissions per IP per 10 minutes
- **Response:** JSON `{ success: true, inquiryId: string }`
- **Side effects:** Creates a FleetInquiry record, sends email notification

### System routes
- **URL:** `/sitemap.xml` — Auto-generated sitemap listing home, all category pages, all published trucks, and static pages
- **URL:** `/robots.txt` — Allows all crawlers to public pages; disallows `/admin/*` and `/api/*`
- **URL:** `/favicon.ico` — Sparta mark

### 404
- **URL:** Anything not matched above
- **Component:** `app/not-found.tsx`
- **Design:** Simple dark page with Sparta branding, "Not found" message, link back to Home and Inventory

---

## Admin routes

The Payload admin panel is served at `/admin/*` and handled entirely by Payload. No custom Next.js routes needed. Payload 3.x embeds cleanly under the Next.js App Router.

- **URL:** `/admin` — Admin login (or dashboard if already logged in)
- **URL:** `/admin/collections/trucks` — Truck management
- **URL:** `/admin/collections/leads` — Leads inbox
- **URL:** `/admin/collections/fleet-inquiries` — Fleet inquiries
- **URL:** `/admin/collections/users` — User management (admin only)
- **URL:** `/admin/collections/media` — Photo library
- **URL:** `/admin/globals/settings` — Site-wide settings
- **URL:** `/admin/globals/pages/{slug}` — Individual page content editing

### Admin customization

The mockups in `/mockups/sparta-admin.html` show four screens with Sparta branding applied to Payload's default admin. To achieve this look:

- Configure Payload's `admin.components` to inject a custom logo, favicon, and CSS variables
- Override the CSS variables Payload uses for accent color to `#F26B0F`, background/text colors per the palette in `04-design-system.md`
- Custom dashboard component that replaces Payload's default admin home with the stat cards + activity feed + quick actions design
- Truck collection uses custom field grouping (tabs or panels for Basic Info / Key Specs / Mechanical / Photos / Description)

See `admin/dashboard.md` for the custom dashboard implementation.

### Admin URLs are noindex

All routes under `/admin/*` return `noindex, nofollow` meta tags via middleware to prevent search-engine indexing of the admin panel.

---

## Phase 2 routes (reserved)

Do not build these in Phase 1, but do not use these URL patterns for anything else either.

- `/parts` — Parts landing / category browse
- `/parts/[category]` — Part category pages
- `/parts/[slug]` — Individual part detail
- `/cart` — Shopping cart (Phase 2)
- `/checkout` — Checkout flow (Phase 2)
- `/account` — Customer account (Phase 2)

## Phase 2 redirects

When sparta-parts.com is consolidated in Phase 2:

- `sparta-parts.com/*` → `sparta-motors.com/parts/*` via Cloudflare page rules (301 permanent redirect)
- Every existing sparta-parts.com URL pattern needs a mapping — audit at Phase 2 time

---

## Redirects and legacy URLs

The current sparta-motors.com WordPress site may have URLs that customers or search engines have bookmarked. At launch, review the current site's URLs and set up redirects for anything important:

- Current truck listing URLs → new `/trucks/[slug]` URLs (map by VIN if the old site exposes it, otherwise map manually for the top 10-20 currently indexed truck pages)
- `/inventory.html` or similar legacy URLs → `/inventory`

Redirects live in Cloudflare (page rules) rather than in Next.js middleware. This keeps the Next.js code clean and lets the CDN handle redirects at the edge.

## URL conventions

- **Kebab-case throughout.** `/inventory/box-trucks`, not `/inventory/boxTrucks` or `/inventory/box_trucks`.
- **No trailing slashes.** `/inventory`, not `/inventory/`. Enforced via Next.js `trailingSlash: false` in config.
- **Lowercase.** All URLs lowercase.
- **Truck slugs:** `{year}-{make}-{model}-{vin-suffix}` — e.g., `/trucks/2019-isuzu-npr-hd-7834`. See `02-data-model.md` for slug generation.

## Canonical URLs and SEO

Every page includes a canonical URL meta tag pointing to itself (without any URL parameters). This prevents filter combinations on the inventory page from being indexed as separate URLs.

Structured data (JSON-LD) is included on:

- **Truck detail pages:** `Product` schema with truck specs
- **Home page:** `Organization` schema with Sparta's business info
- **Contact page:** `LocalBusiness` schema with address, hours, phone

Details on structured data implementation are in `pages/truck-detail.md` and `pages/contact.md`.
