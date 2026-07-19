# Home Page (`/`)

The Home page is the front door. Its job: communicate Sparta's brand thesis (honest specs, inspected trucks, for working businesses) in the first three seconds, then drive users to the Inventory page.

**Mockup reference:** `/mockups/sparta-scroll-hero-v2.html`
**Mobile mockup:** `/mockups/sparta-mobile.html` (Phone 1)

## Page structure (top to bottom)

1. Nav (dark, sticky, site-wide component)
2. Hero — scroll-driven truck disassembly
3. Stats bar
4. Shop by body type (categories)
5. Featured inventory
6. How we work (trust strip)
7. Fleet CTA (orange strip)
8. Footer (dark, site-wide component)

## Section-by-section spec

### 1. Nav (dark, sticky)

Site-wide component. Full spec in `04-design-system.md`. Recap:

- Dark background (`#1A1A1A`)
- Sparta logo mark + wordmark on left
- Menu items: INVENTORY / FINANCING / FLEET / ABOUT / CONTACT
- Active state (bolded orange) shows current page
- Phone number in mono type on far right, with orange diamond marker
- Sticky at top of viewport, always visible

### 2. Hero — Scroll-driven truck disassembly

**The signature feature of the site.** As the user scrolls, a truck disassembles piece by piece — box container floats up, cab lifts, wheels visible. Delivers the brand thesis ("we show you what's inside every truck before you buy") as an interaction.

**Structural pattern:**

- Hero section is `250vh` tall (2.5 screens of scroll depth)
- Inside: a `100vh` sticky container pinned during scroll
- The truck video/image sequence fills the sticky viewport edge-to-edge (`object-fit: cover`, `object-position: center 55%`)
- Page background matches the truck backdrop (`#EFEEEA`) for seamless blend
- Gradient overlay at the bottom fades to background color for text readability over the truck

**Video pipeline:** 240-frame PNG sequence → optimized WebM → scroll-scrubbed. Full implementation in `integrations/hero-video.md`.

**Three text phases fade in/out at scroll depths:**

**Phase 1 (0-25% scroll progress, 25-35% fade out):**
- Header: `◆ 01 · THE TRUCK` (mono, orange, small)
- Display: `Used commercial trucks for working businesses.` (Barlow Condensed 800, ~68px)
- Lead: `Box trucks, reefers, day cabs, dump trucks, tow rigs. Every truck inspected before it goes on the lot.`

**Phase 2 (35-45% fade in, 45-60% visible, 60-70% fade out):**
- Header: `◆ 02 · THE INSPECTION`
- Display: `Inspected inside and out. Every truck.`
- Lead: `If it doesn't run right, we don't sell it. Real mileage, real photos, real condition notes.`

**Phase 3 (70-80% fade in, 80-100% visible):**
- Header: `◆ 03 · THE PROMISE`
- Display: `You see everything — before you buy.`
- CTAs: `[Browse inventory →]` (orange primary) + `[Fleet inquiries]` (ghost)

**Additional hero elements:**

- Top-left: `EST. 2018 · CHARLOTTE, NC` in orange monospace, small
- Top-right: three phase-indicator dots; active phase shown in orange
- Bottom-right: `SCROLL` indicator, fades out after user starts scrolling
- Background: subtle "SPARTA" watermark at very low opacity behind everything

**Mobile hero:**

On mobile the scroll-driven pattern still works, but with an adapted layout:

- The truck video fills a smaller portion of the viewport (not full-height)
- Text is stacked above the truck (SPARTA MOTORS lockup + headline + description + CTAs)
- Scrolling still scrubs the truck disassembly below the text
- On very small screens (`<380px`), the video simplifies to first/last frame only (perf consideration)

See `/mockups/sparta-mobile.html` Phone 1 for the mobile hero layout.

**Reduced motion:**

Users with `prefers-reduced-motion` see: static first frame of the truck, three text phases fade between static states instead of scrubbing.

### 3. Stats bar

Below the hero. Horizontal band with 4 stats.

- Light background
- 4 columns on desktop, 2×2 grid on mobile
- Each stat: small label (mono uppercase, Iron color) + large value (Barlow Condensed 700, 48px, orange for lead stat)

**Content (Phase 1 launch values — admin can edit later):**

| Label | Value | Description |
|---|---|---|
| ON THE LOT | 22 | Trucks in stock |
| BODY TYPES | 06 | Categories |
| BRANDS | 08 | Isuzu, Hino, Freightliner + more |
| EST. | 2018 | Charlotte, NC |

### 4. Shop by body type

Grid of six category tiles. Uses the sticky-stacking motion pattern (see `04-design-system.md`, motion moment #2).

- Section label: `◆ SHOP BY BODY TYPE`
- Section title: `Find the right truck.`
- Grid: 3 columns × 2 rows on desktop, 2 columns × 3 rows on mobile
- Each tile: dark background (`#1A1A1A`), padding, category number (mono orange), category name (Barlow Condensed 700), truck count (mono Concrete)
- Hover state: orange border appears, number shifts orange → white
- Click routes to `/inventory/[category-slug]`

**Category order:** Box Trucks, Reefers, Day Cabs, Flat Beds, Dump Trucks, Tow Trucks. Match the order in `03-sitemap-routing.md`.

### 5. Featured inventory

- Section label: `◆ FEATURED INVENTORY`
- Section title: `On the lot now.`
- Section lead: `Recent additions. See the full inventory for everything we have.`
- Grid: 3 truck cards on desktop, 1-column on mobile
- Each card: same style as elsewhere on the site (see `04-design-system.md`)
- Below the grid: `[See all inventory →]` link to `/inventory`

**Query:** Fetch up to 6 published trucks marked as `featured: true` in Payload. If fewer than 6 are marked featured, fill the rest with most recently published trucks. See `02-data-model.md` for the truck fields (add `featured` boolean if not already there — reasonable Phase 1 addition).

### 6. How we work

Dark section. Three trust pillars presented as short vertical statements.

- Background: `#1A1A1A`
- Section label: `◆ HOW WE WORK`
- Section title: `Straight talk. Working trucks.`
- Three pillars in a horizontal row (stacked on mobile):
  - **01 — Inspected on the lot.** Every truck gets looked over before it's listed. If it doesn't run right, we don't sell it.
  - **02 — Honest specs.** Real mileage, real photos, real condition notes. VIN on every listing so you can run your own report.
  - **03 — Financing help.** We connect you with commercial lenders. Ask us.

Pillars use character-by-character text reveal on scroll (motion moment #4).

### 7. Fleet CTA

Full-width orange strip.

- Background: Safety Orange (`#F26B0F`)
- Left side: label + big Barlow Condensed heading + short description
- Right side: dark button "Start fleet inquiry →" linking to `/fleet`

**Copy:**
- Label: `◆ FLEET & BULK INQUIRIES`
- Heading: `Growing your fleet? Tell us what you need.`
- Description: `We source used commercial trucks for small fleets and growing businesses. Tell us the spec — we'll find it as trucks come available.`

### 8. Footer

Site-wide component. Full spec at the end of this doc (also used on every page).

## Data requirements

**Fetched at page render:**

- `Pages` global for `home` slug (any editable copy, section content)
- Up to 6 featured/recent `published` trucks
- `Settings` global (for footer phone, address, etc.)

## Performance targets

- **Time to Interactive:** under 2.5s on 4G
- **Largest Contentful Paint:** under 2.0s (the hero video first frame)
- **Cumulative Layout Shift:** near zero (all image sizes reserved)
- **Total Blocking Time:** under 200ms

The hero video is the biggest performance risk. See `integrations/hero-video.md` for the strategies to keep it fast.

## SEO

**Meta tags:**

- Title: `Sparta Motors — Used Commercial Trucks in Charlotte, NC`
- Description: `Used commercial trucks for working businesses. Box trucks, reefers, day cabs, dump trucks, tow rigs. Charlotte, NC. Est. 2018.`
- Open Graph image: Sparta logo on branded background

**Structured data (JSON-LD):**

- `Organization` schema for Sparta Motors
- `LocalBusiness` schema with address, hours, phone

## Site-wide components used

- Nav (top)
- Truck card
- Section label + title + lead pattern
- Category tile
- Fleet CTA strip
- Footer

## Site-wide footer spec (referenced by all pages)

Deep dark background (`#0F0F0F`). 4-column grid on desktop, stacked on mobile.

**Column 1 (brand):**
- Sparta logo mark + wordmark
- Tagline: "Used commercial trucks for working businesses. Charlotte, NC · Est. 2018"
- Phone number (mono, Bone color)

**Column 2 (Inventory):**
- Section heading `◆ INVENTORY` (mono orange)
- Links: Box Trucks / Reefers / Day Cabs / Dump Trucks / Tow Trucks

**Column 3 (Company):**
- Section heading `◆ COMPANY` (mono orange)
- Links: About / Financing / Fleet inquiries / Contact

**Column 4 (Parts):**
- Section heading `◆ PARTS` (mono orange)
- Text: "Sparta Parts coming soon."
- (In Phase 2 this becomes actual parts navigation)

**Bottom bar:**
- Divided by horizontal line
- Left: `© 2026 SPARTA MOTORS LLC` (mono, Iron)
- Right: `CHARLOTTE, NC` (mono, Iron)

## What good implementation looks like

- The scroll-driven hero works smoothly on iPhone 12 and mid-tier Android without dropped frames
- All text is readable at every scroll position (no illegible moments where dark text sits on the darkest truck part)
- The stats bar values are pulled from `Pages.home` content, not hard-coded
- Featured trucks link correctly to their detail pages
- The category tiles link correctly to their category pages
- The Fleet CTA button routes to `/fleet`
- On slow connections, the hero degrades gracefully (first frame shows while the video loads)
