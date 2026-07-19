# Inventory Page (`/inventory`) + Category Pages

The browse experience. Where customers who don't have a specific truck in mind explore options.

**Mockup reference:** `/mockups/sparta-inventory.html`

## Two page types, one template

- **`/inventory`** — all published trucks, no pre-filter
- **`/inventory/box-trucks`** (and 5 similar category pages) — pre-filtered by `bodyType`, with a short SEO paragraph at the top

Both use the same page component. The category pages simply lock the body-type filter and add a category-specific intro.

## Page structure

1. Nav (site-wide)
2. Page header (dark, with "INVENTORY" watermark)
3. Search bar (VIN, stock number, keyword)
4. Category SEO paragraph — category pages only
5. Main grid: sidebar filters + content area
6. Fleet CTA (site-wide)
7. Location section with map
8. Footer (site-wide)

## Page header

Dark background (`#1A1A1A`), watermark "INVENTORY" text behind at very low opacity.

- Breadcrumb: `Home / Inventory` (or `Home / Inventory / Box Trucks` for category pages)
- Page label: `◆ ALL COMMERCIAL TRUCKS` (or `◆ BOX TRUCKS FOR SALE` for category)
- Display title: `Inventory.` (or `Box Trucks.`)
- Subtitle: `Every truck inspected before it goes on the lot. Filter by body type, brand, or budget — call us if you don't see what you need.` (Same across all category pages, or slight variation per category)
- Inventory stats on right:
  - `SHOWING` — count of filtered results
  - `IN STOCK` — total published trucks
  - `BODY TYPES` — 06

## Search bar

Below the header. Full-width search input with orange submit button.

- Placeholder: `Search by VIN, stock number, or keyword...`
- Style: dark background (`#2C2C2A`), Bone text, monospace font (feels like a technical search)
- Search covers: VIN, stock number, make, model
- Submit: filters the results below

## Category SEO paragraph (category pages only)

Between the search bar and the main grid, on category pages only.

- Short paragraph (100-200 words) explaining the category
- Optimized for SEO — targeted at "used box trucks for sale Charlotte NC" and similar search queries
- Content should be editable via Payload (add a `categoryDescriptions` field to the Pages global, keyed by category slug)

**Example (Box Trucks):**

> Used box trucks are the workhorses of local commerce — deliveries, dry freight, moving, small-business logistics. Sparta Motors stocks used box trucks from Isuzu, Hino, Freightliner, and other proven brands. Most box trucks on our lot fall between 14 and 26 feet, with a mix of gas and diesel engines. Every truck inspected before it goes on the lot, with real mileage and real photos.

## Filter sidebar (left column, sticky, 260px)

7 filter groups. Sticky at `top: 88px`. Max-height calc so it scrolls independently when the list gets long.

**Groups (top to bottom):**

### 1. Body Type
- Checkboxes for each body type
- On category pages: this is disabled/pre-selected and locked to the current category
- Each option shows a count: `Box Truck (8)`

### 2. Make
- Checkboxes for each make with counts
- Options: Isuzu, Freightliner, Hino, Nissan, Volvo, Peterbilt, Kenworth, Mack, International, Other
- Only show makes that have at least one published truck

### 3. Year (range slider)
- Dual-thumb range slider
- Min: earliest published truck year (auto-detect, floor to 2010)
- Max: latest published truck year (auto-detect, ceiling to current year)
- Shows current selection: `2010 — 2024`

### 4. Mileage (range slider)
- Dual-thumb range slider
- Min: 0
- Max: 300,000 mi (adjust based on actual inventory)
- Format with commas

### 5. Price (range slider)
- Dual-thumb range slider
- Min: $10,000
- Max: $150,000 (or ceiling of actual inventory)
- Format with $

### 6. Condition
- Checkboxes: Excellent, Good, Fair with counts

### 7. Fuel Type
- Checkboxes: Diesel, Gasoline with counts

**Filter header:**

- `Filters` title on left, Barlow Condensed 700, 16px
- `clear all` link on right, mono orange, 10px

Each filter group has a small chevron ▾ that could collapse the section — Phase 1 nice-to-have, not required.

## Toolbar (top of content area)

Above the truck grid.

**Left side:** `Showing 12 of 22 trucks` (mono, Iron color, "12" and "22" bolded)

**Right side:**
- Sort dropdown with a `SORT` label
- Grid/List view toggle

**Sort options:**
- Featured (default — admin can mark trucks as featured; unfeatured show after)
- Newest (by `publishedAt` desc)
- Price: Low to High
- Price: High to Low
- Mileage: Low to High

**Grid/List toggle:**

Two buttons side by side. Active button has dark background (`#1A1A1A`) and Bone text. Inactive is transparent with Iron text.

- `Grid` — default view, 3-column card grid
- `List` — horizontal cards, more info per row

Toggle state persists in URL param (`?view=list`) so shareable filtered links keep the view style.

## Grid view

3 columns on desktop, 2 on tablet (`~1000px`), 1 on mobile.

Card design matches the truck cards used everywhere else on the site:
- White background, 10px rounded, 1px Chalk border
- Photo area 160px tall, body-type badge top-left
- Info area: year/make in mono caps, model name in Barlow Condensed 700
- Bottom stats bar: mileage on left, price on right (mono)
- Hover: lift 2px, subtle shadow, photo scales 1.02

Each card links to `/trucks/[slug]`.

## List view

Same trucks, horizontal rows.

- Card layout: 240px photo on left + info in middle + price on right
- More info visible per row:
  - Year and make
  - Model name
  - Mileage
  - Class + Fuel type
  - Condition
- Photo: 130px tall
- Price block on right: `PRICE` label + big orange monospace amount
- Hover: same lift + shadow

**Mobile (list view):** cards collapse to single column, photo on top, info below, price left-aligned.

## Empty state

When filters return zero results:

- Show a centered message: "No trucks match your filters."
- Below: `Try loosening a filter, or [call us]` — with the phone number linked

## URL params

Filters and sort state live in URL params so links are shareable and browser back/forward work correctly.

Examples:
- `/inventory?body=box-truck` — box trucks only (same as `/inventory/box-trucks`)
- `/inventory?body=box-truck,reefer&make=isuzu` — box + reefer, only Isuzu
- `/inventory?year_min=2018&year_max=2022&sort=price-asc` — 2018-2022, sorted by price
- `/inventory?view=list` — list view

Multi-select filters (body type, make) use comma-separated values.

## Location section (before footer)

Same pattern as on Contact and About. Shows the Sparta lot location with an interactive map.

- Dark section background (`#1A1A1A`)
- Left: address, hours, contact info in a light card
- Right: interactive Leaflet map (Positron light tiles, orange marker, popup on click)

Full spec in `integrations/leaflet-map.md`.

## Data requirements

**Fetched at page render:**

- All `published` trucks matching filter params
- Counts per filter group (for showing "(8)" next to Box Truck, etc.)
- Settings global (for footer and location section)
- Category description (category pages only) from Pages global

## Interactions

- **Filter changes:** Update URL params without full page reload. Use Next.js `useSearchParams` + `router.replace`.
- **Sort dropdown:** Same as filters.
- **Grid/List toggle:** Same.
- **Slider dragging:** Debounce updates (300ms) so results don't refetch on every pixel of drag.
- **Clear all:** Removes all filter params, resets sort to Featured, keeps view style.

## SEO

**Meta tags for main inventory:**

- Title: `Used Commercial Trucks for Sale — Sparta Motors, Charlotte NC`
- Description: `Browse used commercial trucks in Charlotte, NC. Box trucks, reefers, day cabs, dump trucks, and more from Isuzu, Hino, Freightliner. Real mileage, honest specs, inspected.`

**Meta tags for category pages** (example: box trucks):

- Title: `Used Box Trucks for Sale — Sparta Motors, Charlotte NC`
- Description: `Used box trucks from Isuzu, Hino, Freightliner. 14-26 foot models available. Real mileage, inspected on the lot. Charlotte, NC.`

**Structured data:**

- `ItemList` schema listing all currently visible trucks with links

## Performance

- **Filter changes should feel instant** — client-side filtering when possible, server refetch only when needed
- **Images:** all use `next/image`, lazy loaded except first 6 (above the fold on desktop)
- **First Contentful Paint:** under 1.5s

## Accessibility

- All checkboxes and inputs have labels
- Sliders keyboard-accessible (arrow keys adjust value)
- Filter changes announce results count change to screen readers ("Showing 8 trucks")
- Grid/List toggle keyboard-accessible (Enter/Space to toggle)

## What good implementation looks like

- The 7 category pages (main `/inventory` + 6 body-type pages) all use the same component
- Category pages arrive pre-filtered (body type checkbox for that category is checked, others unchecked)
- Filter counts update as other filters change (e.g., checking "Isuzu" updates the year range to show only years available for Isuzus)
- Sliders don't fight the user — they respond smoothly and update the results shortly after drag stops
- The grid/list toggle is a genuine choice, both views look intentional
- Filters persist across navigation — going into a truck detail and back preserves the filter state
- URL is shareable — a filtered inventory URL sent via text or email opens with the same filter state
