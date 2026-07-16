# SPARTA MOTORS — Website Redesign
## Project Save-State Document (v2)

**Last updated:** July 16, 2026
**Status:** Design phase in progress — Home page and Truck Detail page complete. Inventory listing page next.

---

## HOW TO USE THIS DOCUMENT

**To resume in a new chat with Claude:**
1. Start a new conversation with Claude (Claude.ai — not Claude Code yet).
2. Paste this entire document at the top of your first message.
3. Add: *"This is my saved state for the Sparta Motors website redesign project. Read this document, then continue where we left off (see 'Where we left off' section at the bottom)."*
4. Claude will pick up exactly where the last session ended.

**To hand off to Claude Code when the time comes:**
This document becomes the foundation of the Claude Code build brief. Do not paste this directly into Claude Code yet — we finish the remaining design work first (Inventory, short content pages, admin, mobile), then produce a proper Claude Code build brief that combines this + those remaining decisions.

---

## 1. PROJECT OVERVIEW

**Company:** Sparta Motors — used commercial truck dealer in Charlotte, NC. Est. 2018.

**Target customers:** Small-business owners — delivery operators, tow companies, landscapers, construction, box-truck operators. Future expansion to fleet/corporate buyers.

**Inventory:** Used medium/heavy-duty commercial trucks — box trucks, reefers, day cabs, flat beds, dump trucks, tow trucks. Brands include Isuzu, Hino, Freightliner, Nissan. Approximately 20 listings at any time.

**Sister business (Phase 2):** Sparta Parts — hundreds of truck parts SKUs. Currently at sparta-parts.com on WooCommerce.

**Existing sites (to replace):**
- sparta-motors.com (primary, kept)
- sparta-parts.com (to 301-redirect to sparta-motors.com/parts in Phase 2)

**Business model:**
- **Trucks:** Lead-generation only (browse → contact form → email/text notification). No online purchase.
- **Parts (Phase 2):** Lead-gen + direct-purchase checkout.
- **Future:** B2B/fleet features (accounts, bulk pricing, net-30, quotes). Architected for now, not built. Fleet CTA present on trucks site.
- **Future:** CRM integration (HubSpot/Zoho/etc.) if it improves lead handling.

**Roles & workflow:**
- **Admin (project manager):** Full control, reviews and publishes all listings.
- **Employees (5–10):** Create draft listings from phone, submit for admin review.
- **Approval workflow:** Employee submits → admin reviews/edits → admin publishes.

**Phasing:**
- **Phase 1 (current focus):** Rebuild the trucks site. ~20 listings, lead-gen only.
- **Phase 2:** Rebuild parts, migrate from WooCommerce, set up 301 redirects.
- **Phase 3+:** B2B/fleet features, CRM integration.

**Constraints:**
- Budget: low. Self-hosting is fine.
- No hard deadline.
- Preserve sparta-motors.com as primary domain.
- One admin (project manager) + Claude Code doing the actual build. No developer on staff.

---

## 2. WORKING STYLE — Delegation & Description

The project uses this workflow throughout:

**I describe → Claude proposes options with tradeoffs → I approve → Claude executes.**

Design work (moodboards, wireframes, mockups) happens in Claude.ai chat. Actual build (code, deployment, admin config) happens in Claude Code. Stakeholder design review happens BEFORE build begins.

Claude presents 2-3 options with real tradeoffs for major decisions, waits for approval, then executes. Doesn't build without approval.

---

## 3. APPROVED DECISIONS

### 3.1 Tech Stack ✅

**Frontend:** Next.js
**CMS / Backend:** Payload CMS (open-source, self-hosted, TypeScript-based)
**Hosting:** Small VPS (specific provider — Hetzner or DigitalOcean — to be chosen at build time)
**CDN / Security / Redirects:** Cloudflare (free tier)
**Email:** SMTP through the existing business email (whatever address the project manager already uses). No separate transactional email service like Resend at launch. Can be added later if deliverability issues arise.

**Estimated monthly cost:** $10-20 total.

**Why this stack:**
- Payload gives us native draft/publish workflow, custom fields, role-based access — everything Phase 1 needs out of the box.
- Next.js handles frontend performance, SEO, mobile responsiveness.
- Phase 2 parts + checkout adds to Payload without a rewrite (Parts collection, Orders collection, Stripe integration).
- Phase 3 B2B/fleet features (accounts, bulk pricing, quotes) also additive.
- Payload's admin panel is mobile-responsive out of the box — employees can upload phone photos from the field.

**Ruled out:**
- WordPress/WooCommerce (project manager wants to leave it)
- Shopify (fights the custom truck fields, monthly floor cost)
- Squarespace/Wix/Webflow (can't handle the employee approval workflow)
- Sanity/Contentful (Phase 2 pricing risk and awkward checkout)

### 3.2 Sitemap & Information Architecture ✅

**Public site structure:**
```
sparta-motors.com/
│
├── /                          Home
├── /inventory                 All trucks (filterable)
│   ├── /inventory/box-trucks
│   ├── /inventory/reefers
│   ├── /inventory/day-cabs
│   ├── /inventory/flat-beds
│   ├── /inventory/dump-trucks
│   └── /inventory/tow-trucks
├── /trucks/[vin-or-slug]      Individual truck detail page
├── /financing                 Financing info + pre-qual CTA
├── /fleet                     Fleet / bulk inquiries
├── /about                     About Sparta Motors
├── /contact                   Contact page
└── /parts                     (Phase 2 — reserved URL, not built now)
```

**Key IA decisions:**
- **Inventory: Hybrid approach.** Main `/inventory` page + dedicated category pages for each body type. Category pages have SEO copy above filtered inventory.
- **Financing:** Dedicated page. Sparta does not finance directly but works with lenders and banks. Positioning: "we connect you with a lender."
- **Fleet:** Dedicated `/fleet` page. Positioned as **sourcing partner** (not manufacturer, not fleet stockist). Copy angle: "growing your fleet? Tell us what you need, we'll source it as trucks become available."
- **About:** Short and functional. Location, years in business, brief intro, hours, contact info. No founder story, no testimonials required.

**Truck listing fields** (for Payload data model):
Year, Make, Model, Trim, Body type (box/reefer/day cab/flat bed/dump/tow), Mileage, VIN, Condition, Price, Engine, Transmission, Fuel type, Drivetrain, GVWR/payload class, Photos (multiple, mobile-uploaded), Description, Optional spec sheet PDF.

**Standard lead form fields:**
Name, phone, email, message, truck of interest (auto-filled with VIN when applicable), financing interest (yes/no), trade-in (yes/no + basic details if yes).

**Fleet inquiry form fields** (separate from standard lead form):
Company name, contact name, phone, email, fleet size, trucks needed, timeline, message.

### 3.3 Admin-Side (Payload) Collections ✅

**Phase 1 collections:**
- **Trucks** — all listing fields above. Draft/published status. Assigned employee (who created it). Timestamps.
- **Leads** — every form submission across the site. Fields: name, phone, email, message, form source (which page/truck), financing interest, trade-in details, timestamp, status (new / contacted / closed). Filterable and exportable.
- **FleetInquiries** — separate collection with fleet-specific fields.
- **Users** — admin (1) + employees (5-10). Two roles: Admin and Employee.
- **Media** — photo library, auto-organized by truck.
- **Pages** — for editable content on Home, About, Financing, Fleet, Contact so copy can be updated without a developer.

**Workflow rules:**
- Employees can create Trucks in draft status only, upload photos, and edit their own drafts.
- Employees cannot publish, cannot delete, cannot edit other employees' drafts.
- Admin sees everything, edits everything, publishes or unpublishes at will.
- Leads and FleetInquiries: both admin and employees can view and update status; only admin can delete.

**Phase 2 additions (architected for, not built now):**
- Parts collection with fitment data
- Orders collection for checkout
- Customers collection for B2B accounts
- PriceGroups for bulk/fleet pricing tiers
- Cross-linking between Trucks and Parts

### 3.4 Brand Direction — "Workhorse Industrial" ✅

**Overall feel:** Heavy, grounded, no-nonsense. Modern diesel-shop meets clean web design. Confident but not aggressive. Speaks to small-business owners who need trucks that work.

**Bar to beat (reference):** carstradainc.com
**What we're avoiding:** Carsforsale-style templates. Lifestyle-truck brand vibes. Anything that reads "creative agency" or "premium."

#### Typography

- **Headlines:** Barlow Condensed (Google Fonts), weights 700-800. Condensed, industrial, confident.
- **Body:** Inter (Google Fonts), weights 400-500. Highly legible, modern, businesslike.
- **Numbers / specs / mono:** JetBrains Mono (Google Fonts), weights 400-500. Used for VINs, prices, mileage, dates, phone numbers — anywhere technical data appears.

#### Color palette

**Primary:**
- Sparta Black: `#1A1A1A` (backgrounds, headlines)
- Bone: `#F5F3F0` (page background — light hero uses `#EFEEEA` when blending with truck sequence)

**Accent:**
- Safety Orange: `#F26B0F` (primary CTA, hero moments, highlights)
- Hi-Vis Amber: `#F5A623` (Sparta Parts alt accent — Phase 2)

**Neutrals:**
- Charcoal: `#2C2C2A`
- Iron: `#5F5E5A`
- Concrete: `#B4B2A9`
- Chalk: `#D3D1C7`
- Warm Off-White: `#EEECE5` (secondary section backgrounds, breadcrumb bar)

#### Tone of voice

- Short sentences. Specs before adjectives.
- Direct, confident, no fluff.
- Example (sounds like Sparta): *"2019 Isuzu NPR-HD. 87,000 miles. 16-foot box, aluminum roll-up door. Runs strong, ready to work."*
- Not like Sparta: *"Exceptional. Premier. Luxury. Elevate your fleet. Experience the difference."*

#### Logo

**Primary lockup: Option D — Geometric mark + horizontal wordmark**
- Simple geometric mark: orange-outlined square with white/black abstract "chevron + horizontal line" (represents both an "A" shape and a truck grille abstractly)
- "SPARTA MOTORS" wordmark in Barlow Condensed, bold, uppercase, condensed
- Works on light or dark backgrounds

**Backup lockup: Option A — Pure wordmark, monospace subtitle**
- Used in tight spaces: favicons, truck decals, invoice footers, mobile nav
- "SPARTA MOTORS" wordmark, with a small orange monospace subtitle like "EST. 2018 · CHARLOTTE NC"

**Phase 2 family:** "SPARTA PARTS" uses the same mark and typography — just swap "MOTORS" for "PARTS." Immediate visual family, no rebrand needed.

### 3.5 Home Page Layout — "Variation B" ✅

**Selected from a comparison of Variation A (light everywhere), B (light hero, dark supporting sections), and a dark-heavy alternative.**

**Section-by-section palette:**
- **Nav:** Dark (`#1A1A1A`), sticky at top
- **Hero:** Light (`#EFEEEA` — matches truck image background)
- **Shop by body type (categories):** Light background, dark category tiles
- **Featured inventory:** Light background, white cards with dark accents
- **How we work (trust strip):** Dark background, orange accents, light text
- **Fleet CTA:** Full-width orange strip (`#F26B0F`)
- **Footer:** Deep dark (`#0F0F0F`) with subtle SPARTA watermark bleeding across

Alternating dark/light gives visual rhythm without exhausting the eye. The dark "How we work" section is the industrial anchor. The orange fleet CTA is the clear conversion moment.

### 3.6 Hero — Scroll-Driven Truck Disassembly ✅

**Inspiration:** apple.com/airpods scroll-scrubbed product reveal.

**Concept:** As the user scrolls down the hero section, they see a 3D-rendered Isuzu box truck disassemble piece by piece — box container floats up, cab lifts, chassis + drivetrain + wheels become visible. Message: **"We show you what's inside every truck before you buy."** This is the brand thesis ("inspected inside and out, honest specs") delivered as an interaction.

**Structure:**
- Hero section is 250vh tall (2.5 screens of scroll depth).
- Inside: 100vh sticky container pinned during scroll.
- Truck image fills the sticky viewport edge-to-edge (`object-fit: cover`, `object-position: center 55%`).
- Page background matches truck image backdrop (`#EFEEEA`) for seamless blend.
- Gradient overlay at bottom fades to background color for text readability.

**Scroll-linked animation:**
- Scroll progress (0 to 1) drives which frame of the 240-frame image sequence is visible.
- At build time: 240 PNGs (1280×720) become a single optimized WebM video, scrubbed by scroll position.
- User controls the animation with scroll direction — scrolling back up reassembles the truck.

**Three text phases fade in/out at scroll depths:**

- **Phase 1 (0-25% visible, 25-35% fade out):**
  - Header: "◆ 01 · THE TRUCK"
  - Display: "Used commercial trucks for working businesses."
  - Lead: "Box trucks, reefers, day cabs, dump trucks, tow rigs. Every truck inspected before it goes on the lot."

- **Phase 2 (35-45% fade in, 45-60% visible, 60-70% fade out):**
  - Header: "◆ 02 · THE INSPECTION"
  - Display: "Inspected inside and out. Every truck."
  - Lead: "If it doesn't run right, we don't sell it. Real mileage, real photos, real condition notes."

- **Phase 3 (70-80% fade in, 80-100% visible):**
  - Header: "◆ 03 · THE PROMISE"
  - Display: "You see everything — before you buy."
  - CTAs: [Browse inventory →] [Fleet inquiries]

**Additional hero elements:**
- Small "EST. 2018 · CHARLOTTE, NC" tag top-left in orange monospace.
- Phase indicator (three dots) top-right — active phase shown in orange.
- "SCROLL" indicator bottom-right — fades out once user starts scrolling.
- Subtle "SPARTA" background watermark at very low opacity behind everything.

**Assets required for build:**
- 240-frame image sequence (1280×720 PNGs) — project manager has these on their computer, not yet in the repo (too large for chat upload). Depicts an Isuzu box truck fully assembled at frame 1, fully exploded/disassembled by frame 240. The image has a warm light-gray (`#EFEEEA`-ish) studio backdrop.
- At build time, these 240 PNGs get converted to a WebM video (~500KB-1MB total) using ffmpeg. Preserves quality, plays smoothly at 60fps, downloads fast even on 4G.

### 3.7 Motion & Interaction Palette ✅

**Overall motion personality:** Crisp and functional, not cinematic. Timings 200-400ms. Easing `cubic-bezier(0.25, 0.1, 0.25, 1)`.

**Six motion moments across the site:**

1. **Scroll-driven hero** (described above — the headline motion piece)
2. **Sticky-stacking on "Shop by body type"** — as user scrolls the categories section, each of the 6 category cards sticks at the top with a subtle scale-down (0.03 per card behind), each card offset by 28px
3. **FadeIn on scroll** — every major section fades up 30px + opacity 0→1 as it enters the viewport, `once: true` so no re-triggering
4. **Character-by-character reveal** on the hero subhead + "How we work" pillars — reads as "typing on" quickly (~800ms total)
5. **Subtle gradient on the giant SPARTA wordmark** in hero — dark charcoal to slightly lighter charcoal
6. **Hover states:**
   - Truck cards: lift 2px, subtle shadow, photo scales up 2% (frame stays fixed), 200ms
   - Buttons: orange lightens + scales 1.02, dark buttons brighten, 150ms
   - Category tiles: mono number shifts from orange to white, 1px orange border appears, 150ms
   - Nav links: underline draws in from left, 150ms

**What we're NOT doing:**
- No autoplay video, no background loops (except the scroll-driven hero)
- No magnetic mouse-follow (feels agency, wrong signal)
- No page transitions (instant navigation, every second matters for lead-gen)
- No animated gradients or color shifts on brand colors
- No parallax on background elements (mobile jitter)

**Accessibility:**
- All motion respects `prefers-reduced-motion`
- When set: scroll-scrub becomes instant frame swap, character reveals instant, sticky-stacking becomes standard stacking, FadeIn instant

**Performance targets:**
- Marquee (if we add one later) runs at 60fps on mid-tier phones (iPhone 12, mid-range Android)
- Time-to-Interactive under 2.5s on 4G
- Motion library size under 40kb gzipped (Framer Motion tree-shaken)

### 3.8 Truck Detail Page ✅ (NEW)

**The money page.** Approximately 80% of conversions happen here — this is where a customer decides to inquire about a specific truck. Every element is optimized for that decision.

**Pattern reference:** Facebook Marketplace product listing (mobile-first, familiar, forgiving of variable phone-quality photos).

**Page structure (top to bottom):**

1. **Nav** (dark, sticky, same as Home)
2. **Breadcrumb bar** — Home / Inventory / [Body Type] / [Truck Name]. Warm off-white background (`#EEECE5`).
3. **Main content grid** (two columns on desktop, stacked on mobile):
   - Left column (main): photos + all truck info
   - Right column (sticky sidebar): lead form
4. **Similar trucks section** (below main content, full width)
5. **Footer** (matches Home)
6. **Mobile sticky bar** at bottom of viewport (only appears below 900px width)

**Left column contents (top to bottom):**

**A) Photo gallery** — Marketplace-style:
- Single large photo, 16:10 aspect ratio, fills the gallery frame
- Prev / next arrow buttons (rounded, semi-transparent, hover to orange)
- Photo counter in top-right ("3 / 12"), monospace, semi-transparent background
- Body type badge in top-left (e.g., "BOX TRUCK")
- Thumbnail strip below, horizontally scrollable, active thumb has orange border
- Click thumb to jump; use arrow keys or click prev/next to cycle
- Mobile: swipeable with touch (in real build); click for lightbox (in real build)

**B) Title + Price block** (white card, 24px padding):
- Left side: small mono year and make ("2019 · ISUZU"), big Barlow Condensed model name ("NPR-HD 16FT Box Truck"), badges below (body type filled dark, class + fuel as outline badges)
- Right side, right-aligned: small "PRICE" label, big orange monospace amount ($34,900), small "OBO · Trade-ins welcome" note underneath
- Bottom of card: Key Specs Bar (4 columns): Mileage / VIN / Condition / Stock #

**C) Description block** (white card):
- Section label: "◆ DESCRIPTION"
- Section title: "About this truck"
- 2-4 paragraphs in Sparta's voice — direct, spec-forward, mentions inspection status

**D) Full spec table** (white card):
- Section label: "◆ FULL SPECIFICATIONS"
- Section title: "Technical details"
- 16 fields in 2 columns: Year, Make, Model, Trim, Body Type, GVWR, Engine, Horsepower, Transmission, Drivetrain, Fuel Type, Fuel Capacity, Payload Class, Body Length, Cab, Exterior Color
- Each row: label (mono, gray, small caps) on left, value (mono, black, medium weight) on right, thin bottom border

**E) Spec sheet PDF download** (dark card, only if uploaded):
- Left: PDF icon (orange outline), title "Spec sheet", filename + file size in mono
- Right: orange "Download ↓" button

**Right column: Sticky lead form (desktop, 380px wide):**

- **Sticky positioning:** `top: 88px` (below nav)
- **Header** (dark background, orange accent):
  - Label: "◆ INQUIRE"
  - Title: "Contact about this truck"
  - Subtitle: "We usually reply within a few hours."
- **Truck of interest tag** (orange background, prominent):
  - Small "TRUCK OF INTEREST" label
  - Bold truck name — auto-filled from the current listing, cannot be edited
- **Form fields:**
  1. Full name (text, required)
  2. Phone (tel, required)
  3. Email (email, required)
  4. Message (textarea, optional)
  5. Checkbox: "Interested in financing" + description "We'll connect you with a partner lender."
  6. Checkbox: "Have a trade-in" + description "Trading in a truck? Tell us about it."
     - **When checked, reveals 3 additional fields:** Year/Make/Model, Mileage, Condition (brief)
  7. Submit button: orange, full-width, "Send inquiry →"
- **Footer:** warm off-white background, "OR CALL DIRECTLY" label, phone number in mono

**Mobile behavior (below 900px width):**
- Two-column layout collapses to single column
- Lead form moves below all truck content, no longer sticky
- Key specs bar collapses from 4 columns to 2
- Full spec table collapses to single column
- **Sticky bottom bar appears** — fixed to bottom of viewport, dark background:
  - Left button: "Call" — transparent with light border
  - Right button: "Inquire →" — orange, primary
  - Body padding-bottom is added so content doesn't hide behind the bar

**Similar trucks section:**
- Full-width section below main content, warm background
- Section label: "◆ SIMILAR BOX TRUCKS"
- Section title: "Others you might like"
- 3 truck cards in a grid (same design as Home page featured inventory)
- **Query logic:** same body type only (for launch). Same-make and price-range filters can be added later.

**Hover states on this page:**
- Truck cards (similar section): lift 2px, subtle shadow appears
- Prev/next gallery buttons: background shifts to orange
- Thumbnail: opacity 0.55 → 1 on hover
- Submit button: subtle scale to 1.01
- Form inputs: border color changes to orange on focus

**Keyboard support:**
- Arrow keys (← →) cycle through gallery photos
- Tab navigation through form fields in logical order
- Enter submits form

---

## 4. ASSETS ON HAND (Project Manager's Side)

- **240-frame image sequence:** Isuzu box truck disassembly, 1280×720 PNGs, saved locally. Full sequence is ~100MB uncompressed. Two frames (first + last) have been shared into this project's design chat.
- **Old sparta-motors.com site:** Live, contains existing truck photos (rough phone-quality) that may be reusable for real listings during Phase 1 launch.
- **Old sparta-parts.com site:** Live on WordPress + WooCommerce. Not touched until Phase 2.
- **Business email:** Project manager has an existing business email for lead notifications. Exact address to be confirmed at build time.

## 5. ASSETS NEEDED (Not Yet Determined)

- **VPS provider account:** To be created during build (recommendation: Hetzner CX22 or DigitalOcean $6 droplet).
- **Cloudflare account:** Free tier, to be created during build.
- **SMTP credentials** for the business email — to be provided by the project manager at build time.
- **Real truck listing photos:** ~20 trucks × 5-15 photos each. Project manager and employees will populate via the Payload admin during launch prep.
- **Company logo files (if using Option D as-designed):** Currently the logo exists only as HTML/SVG rendered in mockups. At build time, a designer could refine this to a proper SVG file, or Claude Code can generate the final SVG from the mockup version.

---

## 6. WHAT'S COMPLETE / WHAT'S REMAINING

### ✅ Complete
- Tech stack decision
- Sitemap & IA
- Payload collections & workflow rules
- Brand direction (typography, color, tone, logo)
- Home page layout (Variation B)
- Home page hero (scroll-driven disassembly)
- Motion palette
- **Truck Detail page** (NEW — full spec above)

### ⏳ Remaining design work (in priority order)
1. **Inventory listing page** — the browse experience. Filter sidebar (body type, make, year, mileage, price, condition), sort options, grid of truck cards. Also serves as template for the six category pages (`/inventory/box-trucks`, `/inventory/reefers`, etc.).
2. **Financing / Fleet / About / Contact pages** — content-and-form pages, likely bundled into one design pass since they share layout patterns.
3. **Admin dashboard preview** — Payload admin. Employee truck-creation form, draft submission flow, admin review/approval interface, lead management screen. Meaningful effort but critical.
4. **Mobile mockups** — of Home, Truck Detail (mobile pattern already spec'd above), and admin. Most traffic and ALL employee admin usage will be here.

### 🔨 Then, when design is complete
Write the **full Claude Code build brief** — a comprehensive document combining this save-state + all remaining design decisions. That document gets pasted into Claude Code to actually build the site.

### 🚀 Then, build phase in Claude Code
- Scaffold Next.js + Payload project
- Configure VPS + Cloudflare + domain + SSL
- Build data model, collections, workflow rules
- Build public site pages
- Build Payload admin customizations
- Migrate any content from old site
- Wire SMTP for lead notifications
- Convert 240-frame sequence to WebM
- QA, launch, hand off admin/employee training docs

---

## 7. KEY DECISIONS RATIONALE (Reference)

### Why the scroll-driven hero fits Sparta
Every other used truck dealer shows the shiny exterior. Sparta shows what's inside. The disassembly IS the "honest specs" brand pillar, delivered visually before the customer reads a word. It's mechanical honesty made physical. Genuinely differentiates from Carsforsale, Ritchie Bros, Commercial Truck Trader.

### Why light hero (Variation B) beat dark
Every truck dealer online defaults to dark and heavy. Going light in the hero is differentiating. The truck image sits on a light gray studio background naturally — so light hero blends seamlessly with the disassembly sequence. Dark supporting sections still deliver the industrial anchor.

### Why the Truck Detail page uses the Marketplace pattern
Familiar to every customer. Forgiving of variable phone-quality photos (only the currently-featured photo needs to be great). Mobile-first by design. Doesn't feel like a landing page — feels like a real listing where the buyer is here to inquire, not be sold to.

### Why the lead form is sticky on desktop, sticky-bar on mobile
The lead form is the whole point of the page. On desktop, sticky-sidebar keeps it always visible without stealing photo real estate. On mobile, a persistent sticky-bar with [Call] and [Inquire] preserves both conversion paths (Sparta customers skew phone-happy — small-business owners often prefer to call rather than fill a form).

### Why "Fleet" page is a sourcing partner, not a supplier
Sparta doesn't manufacture, doesn't stock fleet inventory, can't promise "we'll deliver 20 box trucks next month." Honest positioning: "Tell us what you need, we'll source it as trucks come available." Captures the fleet lead without overpromising.

### Why Payload beat WordPress and Sanity
- Payload: native draft/publish workflow, custom collections defined in code, mobile-responsive admin out of the box, self-hosted so low ongoing cost, Phase 2 checkout adds cleanly.
- WordPress: plugin sprawl, dated admin UX, exactly what we're leaving.
- Sanity: cloud pricing risk at scale, checkout requires bolt-on, vendor lock-in.

### Why we're avoiding transactional email service at launch
Business email SMTP works fine at low volume (~20 leads/day). Zero added cost. Free. If deliverability becomes a problem later, one-file swap to Resend or Postmark.

---

## 8. WHERE WE LEFT OFF

**Last action:** Approved the Truck Detail page mockup. All Marketplace-style patterns, sticky sidebar form on desktop, sticky bottom bar on mobile, similar trucks section, and complete spec table are locked in.

**Immediate next step:** Design the **Inventory listing page** (`/inventory`). This is the third-most-important customer page and doubles as the template for the six category pages (`/inventory/box-trucks`, `/inventory/reefers`, `/inventory/day-cabs`, `/inventory/flat-beds`, `/inventory/dump-trucks`, `/inventory/tow-trucks`). Should include:
- Filter sidebar (body type, make, year range, mileage range, price range, condition)
- Sort options (newest, price low-to-high, price high-to-low, mileage)
- Grid of truck cards (matching Home + Truck Detail card style)
- Pagination or infinite scroll
- Category-specific SEO copy at the top (short paragraph, 100-200 words) for the six body-type variants

**How to resume:**
Paste this document into a new Claude chat and say: *"This is my saved state for the Sparta Motors website redesign. Read this document. Ready to work on the Inventory listing page next — same treatment as previous pages (standalone HTML mockup that opens in a browser at real desktop width)."*

---

## 9. WORKING PREFERENCES (Learned Over This Project)

- Project manager prefers seeing options and picking, over Claude picking for them.
- Standalone HTML mockup files (viewable in browser at real desktop width) work better than in-chat widgets for design review — chat widgets get squeezed into narrow panels and misrepresent the real design.
- Design iterations are cheap here; build iterations are expensive in Claude Code. Finish design cheap, build once.
- Motion should serve the brand, not showcase itself. The reference to the 3D creator's portfolio was for FLAVOR, not for direct copying.
- When quality-of-mockup issues come up, remember: the real build fixes preview artifacts. Don't over-iterate on things that will resolve themselves during actual construction.
- Version-control every design milestone: after each page is approved, update this save-state doc AND commit the corresponding HTML mockup to the repo. Insurance against context loss.

---

## 10. REPO STRUCTURE (Suggested)

Current suggested structure for the `sparta-motors` GitHub repo during the design phase:

```
sparta-motors/
├── sparta-motors-save-state.md    (this document, updated after every milestone)
├── mockups/
│   ├── sparta-scroll-hero-v2.html    (Home page — scroll-driven hero)
│   └── sparta-truck-detail.html       (Truck Detail page)
└── (future: /code, /assets, /docs added when Claude Code takes over)
```

Once Claude Code takes over and starts building the real Next.js + Payload project, that codebase will live at the root of this repo alongside the design mockups. The mockups stay in the repo as reference — they're the "what we wanted it to look like" documentation.

---

**End of save-state document v2.**
