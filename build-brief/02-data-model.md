# 02 — Data Model

This document defines every Payload collection used in Phase 1, plus the collections reserved for Phase 2. Each collection includes its fields, access rules, and hooks or relationships.

Payload collections are defined in TypeScript files under `/collections/` in the project. Payload generates the admin UI, the REST/GraphQL APIs, and the TypeScript types from these definitions.

---

## Phase 1 collections

### Users

Everyone who can log into the admin panel. Two roles: `admin` and `employee`.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| `email` | Email | Unique, used for login |
| `password` | Password | Hashed by Payload |
| `firstName` | Text | Required |
| `lastName` | Text | Required |
| `role` | Select | Options: `admin`, `employee`. Required. Default: `employee`. |
| `phone` | Text | Optional. Used for internal contact only. |

**Access rules:**

- `create`: admin only (admin adds new employees; no self-registration)
- `read`: authenticated users can read their own record; admin can read all
- `update`: users can update their own name/phone/password; only admin can change roles
- `delete`: admin only

**Admin UI notes:**

- The role field should be disabled for non-admin users
- Password field uses Payload's built-in secure password handling

**Seed data:** At initial deployment, one admin user must be created with the project manager's email. See `05-deployment.md`.

---

### Trucks

The core inventory collection. Each truck has a full spec sheet, photo gallery, and draft/published state.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `year` | Number | Yes | Model year (e.g., 2019) |
| `make` | Select | Yes | Options: `Isuzu`, `Hino`, `Freightliner`, `Nissan`, `Volvo`, `Peterbilt`, `Kenworth`, `Mack`, `International`, `Other`. Extensible via admin. |
| `model` | Text | Yes | e.g., "NPR-HD" |
| `trim` | Text | No | e.g., "16FT Box" |
| `bodyType` | Select | Yes | Options: `box-truck`, `reefer`, `day-cab`, `flat-bed`, `dump-truck`, `tow-truck`. Drives category page assignment. |
| `mileage` | Number | Yes | In miles |
| `vin` | Text | Yes | Unique. 17 characters. Validated on save. |
| `condition` | Select | Yes | Options: `excellent`, `good`, `fair` |
| `price` | Number | Yes | In USD, whole dollars |
| `engine` | Text | No | e.g., "5.2L Diesel I4" |
| `transmission` | Text | No | e.g., "Auto · 6-spd" |
| `fuelType` | Select | Yes | Options: `diesel`, `gasoline` |
| `drivetrain` | Select | No | Options: `RWD`, `4WD`, `AWD` |
| `gvwr` | Number | No | Gross vehicle weight rating in lb |
| `payloadClass` | Select | No | Options: `class-3` through `class-8` |
| `stockNumber` | Text | Auto-generated | Format: `SM-XXXX` where XXXX is a sequence. Read-only in UI. |
| `photos` | Array of Media relationships | Yes (min 1) | See Media collection. Order matters (drag-to-reorder in admin). |
| `description` | Rich text or long text | Yes | The customer-facing narrative about the truck. |
| `specSheet` | Media relationship | No | Optional PDF spec sheet upload |
| `status` | Select | Yes | Options: `draft`, `pending-review`, `published`, `sold`, `archived`. Default: `draft`. |
| `assignedEmployee` | User relationship | Yes | Who created this listing. Set automatically on create. |
| `slug` | Text | Auto-generated | For URL. Pattern: `{year}-{make}-{model}-{vin-last-4}`. Read-only. |
| `soldAt` | Date | No | Set when status changes to `sold`. |
| `publishedAt` | Date | No | Set when status changes to `published`. |
| `reviewNote` | Text (long) | No | Admin's note to employee when sending draft back for revision. Not shown publicly. |

**Access rules:**

- `create`: employees and admin
- `read`: 
  - Public API: only `published` trucks
  - Admin: all trucks; employees see all published trucks and their own drafts/pending
- `update`: 
  - Employees: can update their own drafts (status must be `draft` or `pending-review`)
  - Admin: can update anything
- `delete`: admin only

**Hooks:**

- `beforeCreate`: 
  - Set `assignedEmployee` to the current user
  - Generate `stockNumber` (increment global counter)
  - Generate `slug` from year/make/model/vin
- `beforeChange`:
  - Validate VIN format (17 alphanumeric characters, no I/O/Q)
  - If status changes to `published`, set `publishedAt`
  - If status changes to `sold`, set `soldAt`
- `afterChange`:
  - If status was `draft` and changes to `pending-review`, trigger notification to admin

**Admin UI notes:**

- Group fields into tabs or panels matching the mockup structure: Basic Info / Key Specs / Mechanical / Photos / Description
- VIN field should have monospace font
- Price should format with commas ($34,900 display) but store as integer
- The status field is only shown to admins; employees see a "Save as draft" / "Submit for review" pair of buttons that map to status transitions
- The mockup at `/mockups/sparta-admin.html` (screen 2) is the source of truth for form layout
- Mobile-responsive per `/mockups/sparta-mobile.html` (phone 3)

---

### Leads

Every customer inquiry from every source (truck detail page, financing pre-qual, general contact form). Fleet inquiries are a separate collection (see below) because their fields differ substantially.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `fullName` | Text | Yes | |
| `phone` | Text | Yes | Stored as entered; formatted on display |
| `email` | Email | Yes | |
| `message` | Text (long) | No | Customer's free-text message |
| `source` | Select | Yes | Options: `truck-inquiry`, `financing-prequal`, `general-contact` |
| `truckOfInterest` | Truck relationship | No | For `truck-inquiry` type; auto-populated from the listing they came from |
| `financingInterest` | Checkbox | No | Boolean, defaults false |
| `tradeIn` | Boolean | No | If true, the trade-in group appears |
| `tradeInYearMakeModel` | Text | No | Only if `tradeIn` is true |
| `tradeInMileage` | Number | No | Only if `tradeIn` is true |
| `tradeInCondition` | Text | No | Only if `tradeIn` is true |
| `heardAboutUs` | Select | No | Options to be set by admin. E.g., `google`, `facebook`, `referral`, `drove-by-lot`, `other`. Populated at build time. |
| `status` | Select | Yes | Options: `new`, `contacted`, `closed-sold`, `closed-lost`. Default: `new`. |
| `internalNotes` | Text (long) | No | Admin/employee notes about follow-up. Not visible to customer. |
| `receivedAt` | Date | Yes | Auto-set on create |
| `contactedAt` | Date | No | Auto-set when status changes to `contacted` |
| `closedAt` | Date | No | Auto-set when status changes to closed |

**Access rules:**

- `create`: Public (no auth) — the form submission uses a rate-limited public endpoint
- `read`: admin and employees
- `update`: admin and employees (both can update status and internal notes)
- `delete`: admin only

**Hooks:**

- `afterChange`:
  - On create, send email notification to the business email (see `integrations/smtp-email.md`)
  - On status change to `contacted`, set `contactedAt`
  - On status change to closed, set `closedAt`

**Admin UI notes:**

- Table view is the primary interface (per `/mockups/sparta-admin.html` screen 4)
- Filter chips: All / New / Contacted / Closed with live counts
- Search: full-text across name, phone, email, truck info
- Status pills use color: orange (new), green (contacted), gray (closed)

---

### FleetInquiries

Fleet and bulk sourcing inquiries. Different fields from Leads because the qualifying info is different.

**Fields:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `companyName` | Text | Yes | |
| `contactName` | Text | Yes | |
| `phone` | Text | Yes | |
| `email` | Email | Yes | |
| `fleetSize` | Select | Yes | Options: `1-3`, `4-10`, `10-plus` |
| `timeline` | Select | Yes | Options: `asap`, `1-3-months`, `3-6-months`, `ongoing` |
| `trucksNeeded` | Text (long) | Yes | Free-text description of what they need |
| `heardAboutUs` | Select | No | Same options as Leads |
| `status` | Select | Yes | Options: `new`, `sourcing`, `presented`, `closed-sold`, `closed-lost`. Default: `new`. |
| `internalNotes` | Text (long) | No | |
| `receivedAt` | Date | Yes | Auto-set on create |

**Access rules and hooks:** Same pattern as Leads.

---

### Media

Photo and document uploads. Includes truck photos and optional spec-sheet PDFs.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| `alt` | Text | Alt text for accessibility. Optional at upload, but should be encouraged. |
| `filename` | Text | Set by Payload |
| `mimeType` | Text | Set by Payload |
| `filesize` | Number | Set by Payload |
| `width` | Number | For images |
| `height` | Number | For images |
| `caption` | Text | Optional |

**Image sizes generated:**

- `thumbnail`: 400x300, for admin thumbnails and truck-card previews on small views
- `card`: 800x600, for truck card photos in inventory and home page
- `hero`: 1600x1200, for truck detail page main gallery
- `full`: original size, for lightbox on click

Payload handles the resize pipeline automatically via `imageSizes` config on the collection.

**Access rules:**

- `create`: admin and employees
- `read`: public (photos are public assets served through the CDN)
- `update`, `delete`: admin only

**Storage:**

Phase 1: local disk on the VPS at `/var/www/sparta-motors/media/`, served through Next.js image optimization and cached at Cloudflare edge.

Phase 2: consider migrating to Cloudflare R2 or S3-compatible storage if the media library grows past 5GB.

---

### Pages

Editable page content — Home, About, Financing, Fleet, Contact copy. Structure so the admin can edit headlines and body text without a developer.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| `slug` | Select | Options: `home`, `about`, `financing`, `fleet`, `contact`. One record per slug. |
| `title` | Text | Page title, meta title default |
| `metaDescription` | Text | For SEO |
| `heroLabel` | Text | The "◆ ABOUT SPARTA MOTORS" style small label above the display title |
| `heroTitle` | Text | The big display title (multi-line, use line breaks) |
| `heroSubtitle` | Text | The paragraph under the title |
| `sections` | Blocks field | Payload's flexible content builder. See section types below. |

**Section block types** (Payload blocks — pick from these when building page content):

- `stepsBlock`: label, title, lead paragraph, array of steps (num, title, desc)
- `infoListBlock`: label, title, lead paragraph, array of items (name, description)
- `calloutBlock`: label, body text
- `formBlock`: form type selector (financing-prequal / general-contact / fleet-inquiry) — renders the appropriate form component
- `mapBlock`: address, size option (`small` / `full`) — renders the Leaflet map with the correct height
- `statsBlock`: array of stats (label, value, description)
- `richTextBlock`: rich text field

**Access rules:**

- `read`: public
- `update`: admin only

**Admin UI:** The Pages collection uses Payload's block-based content builder. Admin can rearrange sections without editing code.

---

### Settings (global)

Site-wide configuration accessible as a Payload "global" (single-record) rather than a collection.

**Fields:**

| Field | Type | Notes |
|---|---|---|
| `siteName` | Text | Default: "Sparta Motors" |
| `phone` | Text | Displayed in header, footer, everywhere `{settings.phone}` is referenced |
| `email` | Email | Business contact email; also lead notification destination |
| `address` | Group | `line1`, `line2`, `city`, `state`, `zip`, `latitude`, `longitude` |
| `hoursMonFri` | Text | e.g., "8am – 6pm" |
| `hoursSat` | Text | e.g., "9am – 3pm" |
| `hoursSun` | Text | e.g., "Closed" |
| `socialFacebook` | URL | Optional |
| `socialInstagram` | URL | Optional |

**Access rules:**

- `read`: public
- `update`: admin only

---

## Phase 2 collections (reserved, do not build now)

The following collections are anticipated for Phase 2 and are documented here so Phase 1 architectural decisions don't conflict with them. Do not create these during Phase 1.

- **Parts** — SKU, price, description, fitment data, photos, category, brand, related trucks (many-to-many with Trucks for cross-linking)
- **Orders** — customer order records for Phase 2 checkout
- **Customers** — B2B account holders for Phase 3
- **PriceGroups** — bulk/fleet pricing tiers for Phase 3

## Cross-cutting concerns

**VIN uniqueness:** VINs must be unique across the Trucks collection. Attempting to create a truck with a VIN that already exists (in any status, including `sold` or `archived`) should error with a clear message. This prevents accidentally re-listing a truck that's already sold.

**Photo requirements:** A truck cannot be published without at least one photo. This is enforced in the `beforeChange` hook when status transitions to `published`. Employees can create drafts with no photos; the requirement kicks in at publish time.

**Slug generation:** The public URL for a truck is `/trucks/{slug}`. Slugs are auto-generated at create time from year, make, model, and the last 4 characters of the VIN. If the VIN is later corrected, the slug does not auto-update — this prevents broken links. Admins can manually edit the slug if needed.

**Draft privacy:** Employee drafts are visible only to that employee and the admin. Other employees cannot see drafts that aren't their own. This is enforced in the `read` access rule.

**Search indexing:** Only `published` trucks are indexable. All other statuses are excluded from the public sitemap.xml, robots.txt disallows the admin panel, and `noindex` meta tags are set on any admin routes.
