# 06 — Phase 2 Architecture

Phase 2 is the parts consolidation: bring sparta-parts.com onto sparta-motors.com/parts, add e-commerce checkout, and lay the groundwork for B2B/fleet features.

**Phase 2 is not being built now.** This doc documents the architectural decisions Phase 1 needs to make in order to accommodate Phase 2 without a rewrite.

## Phase 2 scope

At a high level, Phase 2 adds:

1. **Parts catalog.** Hundreds of SKUs with fitment data, category browse, part detail pages.
2. **Direct checkout.** Stripe integration for individual parts orders.
3. **Cross-linking.** Truck pages show "Common parts for this model." Part pages show "Compatible trucks in stock."
4. **Domain consolidation.** sparta-parts.com 301-redirects to sparta-motors.com/parts.
5. **B2B foundations.** Customer accounts, wholesale pricing tiers, quote generation. Architected for, not built.

## What Phase 1 must get right for Phase 2

### 1. Tech stack must support e-commerce

**Payload supports e-commerce well.** With a `Products` (or `Parts`) collection and Stripe integration via a Payload plugin or custom endpoints, checkout is doable without changing the stack.

Next.js supports Stripe checkout with the standard `@stripe/stripe-js` and `stripe-node` libraries. Nothing about Phase 1's setup precludes this.

**PostgreSQL scales fine.** A parts catalog of a few thousand SKUs is trivial for Postgres. No index changes needed until much later.

### 2. URL patterns must not conflict

Phase 1 must not use these URL patterns for anything else:

- `/parts` — Phase 2 parts landing / category browse
- `/parts/[category]` — Phase 2 part category pages
- `/parts/[slug]` — Phase 2 individual part
- `/cart` — Phase 2 shopping cart
- `/checkout` — Phase 2 checkout flow
- `/account` — Phase 2 customer account (Phase 3+)

Confirmed in `03-sitemap-routing.md`. Phase 1 does not use these URLs.

### 3. Design system must extend cleanly

The design system in `04-design-system.md` is deliberately generic enough to extend to parts:

- **Typography** — Same fonts. Parts pages use Barlow Condensed for headings, Inter for body, JetBrains Mono for SKUs and prices.
- **Colors** — Sparta Parts gets a distinct accent: **Hi-Vis Amber (`#F5A623`)** vs. Sparta Motors' Safety Orange. This reinforces the sibling relationship (Motors and Parts are related but distinguishable). Otherwise the palette is shared.
- **Layout patterns** — Card grids, hero patterns, section labels — all reusable for parts.
- **Component library** — Every component built in Phase 1 (nav, footer, section headers, cards) should be reusable in Phase 2.

### 4. Database schema must accommodate parts

Phase 1's Payload collections leave room for Phase 2's `Parts`, `Orders`, `Customers`, and `PriceGroups` collections without conflicts. New collections are just new tables — no changes to existing tables required.

Cross-referencing between trucks and parts (Phase 2 cross-linking) is handled via a Payload `relationship` field: `Parts.compatibleTrucks: relationship to Trucks` (many-to-many).

### 5. Auth must scale to customers

Phase 1's Users collection covers admin + employees. Phase 2 adds a `Customers` collection (or extends Users with a `role: 'customer'` value). Payload's built-in auth handles both.

## Phase 2 architecture — the parts side

### New collection: Parts

**Fields (draft — to be refined at Phase 2 planning):**

| Field | Type | Notes |
|---|---|---|
| `sku` | Text | Unique |
| `name` | Text | Display name |
| `description` | Rich text | |
| `photos` | Media relationship (array) | |
| `price` | Number | Cents |
| `stockQuantity` | Number | Inventory level |
| `category` | Select or relationship | |
| `brand` | Text | |
| `compatibleTrucks` | Relationship to Trucks | Many-to-many, for cross-linking |
| `fitment` | JSON or structured group | Detailed fitment data — make/model/year applicability |
| `weight` | Number | For shipping calc |
| `dimensions` | Group (l/w/h) | For shipping calc |
| `status` | Select | draft, published, discontinued, out-of-stock |

### New collection: Orders

**Fields:**

- Order number (auto-generated)
- Customer info (name, email, phone, shipping/billing address)
- Line items (array of Part relationship + quantity + price)
- Subtotal, tax, shipping, total
- Payment status (from Stripe)
- Fulfillment status (pending, shipped, delivered, refunded)
- Tracking number
- Timestamps

### New collection: Customers (Phase 2 onward)

Simple at Phase 2:
- Email, name, phone, addresses
- Optional password (guest checkout allowed)

Extends in Phase 3+ for B2B:
- Company name
- Tax ID
- Assigned price group
- Payment terms (net-30, etc.)

### Cross-linking implementation

**On truck detail pages:**

Below the "Similar Trucks" section:
- Section: "Common parts for this model"
- Grid of 3-6 parts that have this truck in their `compatibleTrucks` relationship
- Each links to `/parts/[slug]`

**On part detail pages:**

Sidebar or section:
- "Compatible trucks in stock" — list of currently-published trucks that this part fits
- Powered by the reverse of the `compatibleTrucks` relationship

## sparta-parts.com redirect plan

At Phase 2 launch:

1. **Inventory the existing sparta-parts.com URLs.** Get a list of current live URLs from the existing WooCommerce site.
2. **Map old URLs to new URLs.** For each existing URL pattern, determine the new equivalent on sparta-motors.com/parts.
3. **Set up Cloudflare page rules.** 301 redirect from old URL → new URL. Cloudflare handles up to 3 page rules on free tier; more requires the $5/mo tier or manually handling at the origin.
4. **DNS update.** Point sparta-parts.com to the same Cloudflare account. Set up DNS records to route to the redirect logic.
5. **Preserve SEO.** 301 redirects pass link equity to the new URLs. Ensure Google Search Console has both old and new domain verified during the transition.

## Phase 3 — B2B / Fleet features

Not built in Phase 1 or Phase 2. Documented here so the architecture accounts for them.

**Anticipated features:**

- **Customer accounts.** Registered fleet buyers can log in, see order history, save preferences.
- **Wholesale pricing.** Different price groups (Retail, Fleet Small, Fleet Enterprise) with different prices per SKU. Applied automatically based on the logged-in customer's assigned group.
- **Net-30 terms.** For approved customers, checkout without credit card — invoice sent for later payment.
- **Quote generation.** Customer or admin can generate a formal PDF quote for a truck or parts order.
- **Saved sourcing preferences.** Fleet customers save "I'm always looking for 16ft Isuzu box trucks under $40k" — Sparta gets notified when matching inventory arrives.

**How Phase 1 accommodates:**

- Customer accounts are just an extension of the Payload auth system
- Pricing tiers are a `PriceGroups` collection joined to `Customers`
- Net-30 is a checkout flow variant (skip Stripe, generate an invoice instead)
- Quote generation reuses the truck/part data with a different rendering (PDF export)
- Saved preferences are a `SourcingPreferences` collection

None of this requires rewriting Phase 1. It's all additive.

## CRM integration (Phase 3+)

Also anticipated: connect lead workflow to a CRM like HubSpot or Zoho.

**Approach:**

- Payload's `afterChange` hooks on Leads and FleetInquiries call a CRM API on create/update
- Two-way sync possible via webhook: when the CRM updates a lead, it POSTs back to `/api/webhooks/crm-lead-update` to update the Payload record

Not built in Phase 1. Architecturally, the data is already structured for this — the Payload collections are clean and API-accessible.

## What Phase 1 should absolutely NOT do

Explicit anti-patterns:

- **Do not use the Trucks collection for anything but trucks.** No temptation to shove parts, accessories, or services in there. New concerns get new collections.
- **Do not hardcode URLs like `sparta-motors.com/trucks`.** Use environment variable `NEXT_PUBLIC_SITE_URL` so Phase 2 can add sibling paths under the same domain.
- **Do not build a "checkout in disguise" for Phase 1 leads.** Phase 1 is lead-gen only. No reservations, no deposits, no attempts at pseudo-e-commerce.
- **Do not tightly couple design tokens to "trucks" specifically.** The design system covers both trucks and parts. Nothing that says "Sparta Motors specific" — just "Sparta specific."

## Timing estimate for Phase 2

Not committed, but rough scope:

- Design + planning: 2-3 weeks
- Build: 4-6 weeks (parts collection, checkout, cross-linking, migration from WooCommerce)
- Migration testing + launch: 1-2 weeks

Total: ~8-10 weeks of work when Phase 2 begins.

## What good implementation of Phase 1 looks like (from Phase 2's perspective)

- Adding the Parts collection to Payload is a single new file (`/collections/Parts.ts`) that doesn't require changing any existing code
- The `/parts` URL space is completely available
- The design system's tokens (Tailwind config, CSS variables) can accept a new accent color (Hi-Vis Amber) without touching existing components
- Cross-linking is straightforward because the Trucks collection has stable IDs and the design system supports card grids
- Cloudflare page rules for sparta-parts.com are one config change
- The admin can add parts without a developer once the collection is defined
