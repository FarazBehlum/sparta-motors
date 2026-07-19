# Truck Detail Page (`/trucks/[slug]`)

The single most important conversion page on the site. This is where customers decide to inquire.

**Mockup reference:** `/mockups/sparta-truck-detail.html`
**Mobile mockup:** `/mockups/sparta-mobile.html` (Phone 2)

## Design pattern

Facebook Marketplace product listing style:

- Familiar to every customer
- Forgiving of variable phone-quality photos (only the currently-featured photo needs to be great; the others live in the thumbnail strip)
- Mobile-first by design
- Doesn't feel like a landing page — feels like a real listing where the buyer is here to inquire, not be sold to

## Page structure

Desktop:

1. Nav (site-wide, sticky)
2. Breadcrumb bar (Home / Inventory / [Category] / [Truck Name])
3. Main content grid (two columns):
   - Left: photo gallery + all truck info (main content column)
   - Right: sticky lead form (380px wide, sticky at `top: 88px`)
4. Similar trucks section (full width, below main content)
5. Footer (site-wide)

Mobile:

1. Nav (site-wide, sticky)
2. Breadcrumb (small)
3. Single-column layout: photos → title → key specs → description → spec table
4. Lead form appears below all content (not sticky)
5. Sticky bottom bar at viewport edge: `[☎ Call]` + `[Inquire →]`

## Left column (main content) — detailed spec

### A. Photo gallery

Single large photo with prev/next arrows, thumbnail strip below, photo counter.

**Details:**

- Main photo: aspect-ratio 16:10, `object-fit: cover`
- Prev / next arrow buttons: rounded, semi-transparent black, hover to Safety Orange
- Photo counter: top-right corner, monospace, "3 / 12" format, semi-transparent black background with backdrop blur
- Body type badge: top-left corner, `#1A1A1A` background, Bone text, uppercase
- Thumbnail strip: below main photo, horizontally scrollable, each thumb 80×60px
- Active thumbnail: 2px orange border
- Click thumbnail → jump to that photo
- Arrow keys (← →) cycle through photos
- Click main photo → open lightbox (Phase 1 optional; nice-to-have)

**Mobile version:**

- Full-width photo
- No arrows — swipe left/right instead (react-swipeable or similar library)
- Orange dots below indicate position; active dot is elongated
- `SWIPE LEFT / RIGHT` hint below the photo (first-load only, dismisses after first swipe)
- Photo counter still in top-right corner

### B. Title + Price block

White card, 24px padding, appears immediately below the gallery.

**Layout — desktop:**

Split into left/right:

- **Left side:**
  - Small mono year and make: `2019 · ISUZU`
  - Big Barlow Condensed model name: `NPR-HD 16FT Box Truck`
  - Three badges: body type (filled dark), class (outline), fuel type (outline)
- **Right side, right-aligned:**
  - Small label: `PRICE`
  - Big orange monospace amount: `$34,900`
  - Small underneath: `OBO · Trade-ins welcome`

**Key Specs Bar** — 4-column strip below the title/price row, separated by a top border:

- Mileage: `87,432 mi`
- VIN: `JALC4W16..7834` (truncated middle for readability, full VIN visible in spec table)
- Condition: `Good`
- Stock #: `SM-2419`

Each spec: small mono label above, mono value below.

**Mobile version:**

Everything stacks vertically. Year/make → model name → badges → price row (below, with the OBO note). Key specs collapse from 4 columns to 2×2 grid.

### C. Description block

White card. Uses the standard section pattern.

- Section label: `◆ DESCRIPTION`
- Section title: `About this truck`
- 2-4 paragraphs in Sparta's voice
- Body text: Inter 14-15px, line-height 1.6-1.7
- Should mention inspection status, any notable features, condition specifics

**Example copy (auto-generated from Payload rich text):**

> 2019 Isuzu NPR-HD with 87,432 miles. One-owner delivery route out of Charlotte. 16-foot aluminum box body with roll-up door, ready to work.
>
> Truck has been inspected on the lot. Runs strong, no known issues. New brakes and tires installed last month. Documented service history available.

### D. Full spec table

White card. Formal display of all technical specifications.

- Section label: `◆ FULL SPECIFICATIONS`
- Section title: `Technical details`
- **16 fields displayed in 2 columns** on desktop, 1 column on mobile:
  1. Year
  2. Make
  3. Model
  4. Trim
  5. Body Type
  6. GVWR
  7. Engine
  8. Horsepower (if in DB)
  9. Transmission
  10. Drivetrain
  11. Fuel Type
  12. Fuel Capacity (if in DB — this may not be a field yet, ok to omit)
  13. Payload Class
  14. Body Length (parse from trim if not separate)
  15. Cab type (if in DB)
  16. Exterior Color (if in DB)

Each row: label (mono uppercase, Iron color) on left, value (mono, Sparta Black, medium weight) on right, thin bottom border.

**If a field isn't populated for a specific truck, omit that row entirely** — don't show empty rows.

### E. Spec sheet PDF download (conditional)

Only appears if a spec sheet PDF is attached to the truck record.

- Dark card (`#1A1A1A` background, Bone text)
- Left: PDF icon (orange outline)
- Middle: "Spec sheet" title + filename + file size
- Right: orange "Download ↓" button

## Right column (desktop only) — Sticky lead form

Sticky at `top: 88px`. 380px wide. Stays in view as user scrolls through the truck info.

**Structure:**

**Header** (dark background, orange accent):
- Label: `◆ INQUIRE`
- Title: `Contact about this truck`
- Subtitle: `We usually reply within a few hours.`

**"Truck of interest" tag** (orange background, prominent):
- Small label: `TRUCK OF INTEREST`
- Bold truck name (year make model): auto-populated from current listing
- User cannot edit this — it's the auto-attribution to this specific truck

**Form fields:**

1. **Full name** (text, required)
2. **Phone** (tel, required)
3. **Email** (email, required)
4. **Message** (textarea, optional, placeholder: "Any questions about this truck?")
5. **Checkbox: "Interested in financing"** with subtext "We'll connect you with a partner lender."
6. **Checkbox: "Have a trade-in"** with subtext "Trading in a truck? Tell us about it."
   - When checked, reveals 3 additional fields (animated slide-down):
     - Year/Make/Model (text)
     - Mileage (number)
     - Condition (short text)
7. **Submit button:** Orange, full-width, "Send inquiry →"

**Below form:**
- Warm off-white background stripe
- Label: `OR CALL DIRECTLY`
- Phone number in mono, prominent

**Form submission:**

- Endpoint: `POST /api/leads`
- Payload includes: form fields + `source: 'truck-inquiry'` + `truckOfInterest: [truck ID]`
- On success: form clears, shows a success message "Thanks — we'll be in touch soon."
- On failure: shows an error message, keeps form data intact so user doesn't retype
- See `integrations/smtp-email.md` for what happens after submission

## Sticky bottom bar (mobile only)

Below 900px viewport width, this bar appears:

- Fixed to bottom of viewport
- Dark background (`#1A1A1A`)
- 10-14px vertical padding
- Two buttons side by side:
  - **Left:** `☎ Call` — transparent with 1px light border, calls the phone number when tapped (`tel:` link)
  - **Right (larger):** `Inquire →` — orange background, scrolls to the lead form section when tapped

Body content gets padding-bottom equal to the bar height so nothing hides behind it.

## Similar trucks section

Full width, below main content.

- Section label: `◆ SIMILAR BOX TRUCKS` (or whatever the current truck's body type is)
- Section title: `Others you might like`
- 3 truck cards in a grid (matches home page featured inventory design)
- Query: same body type, excluding current truck, most recently published, limit 3
- If fewer than 3 exist, show what's available

## Data requirements

**Fetched at page render:**

- Single Truck by slug, must be status `published`
- Up to 3 similar trucks (same `bodyType`, `status: published`, excluding current)
- Settings global (for phone number in sticky bar, footer, etc.)

**Static generation:** All published trucks generate static pages at build. ISR revalidates every 60 seconds so newly published trucks appear quickly.

## Interactions

- **Photo gallery:** Arrow keys on desktop cycle photos; click thumbs to jump. On mobile, swipe.
- **Trade-in checkbox:** Reveals 3 additional fields with a smooth height animation.
- **Form validation:** Client-side + server-side. Required fields highlight red on blur if empty. Email format validated. Phone number accepted in any common format (no strict pattern requirement).
- **Form submit:** During submission, button shows spinner and text becomes "Sending...". On success, form is replaced by a success message.
- **Similar trucks:** Same hover pattern as inventory cards (lift 2px, subtle shadow).

## SEO

**Meta tags:**

- Title: `{year} {make} {model} — Sparta Motors`
- Description: `{year} {make} {model}. {mileage} miles. {body type}. {price}. Charlotte, NC.`

**Structured data (JSON-LD):**

Uses `Product` schema (or `Vehicle` schema — pick whichever gets richer Google display for used commercial trucks). Include:

- `name`: title
- `image`: array of photo URLs
- `description`: description
- `brand`: make
- `model`: model
- `vehicleModelDate`: year
- `mileageFromOdometer`: mileage
- `vehicleIdentificationNumber`: VIN
- `bodyType`: body type
- `offers`: price, currency USD, availability

## Performance

- **First Contentful Paint:** under 1.5s
- **Photos:** lazy loaded except the first one; use `next/image` with priority for first photo
- **Sticky form:** does not cause layout thrash during scroll

## Accessibility

- Photo gallery: alt text on all photos (from Media `alt` field)
- Form: all inputs have `<label>`, correct autocomplete attributes
- Keyboard navigation through form is logical
- Sticky bar buttons are large enough (min 44px tap targets)
- Contrast ratios pass WCAG AA everywhere

## What good implementation looks like

- Photo gallery is snappy — clicking a thumbnail advances instantly, no fade transition delay
- Sticky sidebar form stays visible without any jitter as user scrolls
- Trade-in reveal animation is smooth (200ms max)
- Success message after form submit is clear and gracious
- Mobile sticky bar never overlaps important content
- Similar trucks feel like real recommendations, not filler
- Every VIN/mileage/price is in monospace font
- The page loads fast even with 12 photos in the gallery
