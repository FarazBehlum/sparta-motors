# 00 — Project Context

## What Sparta Motors is

Sparta Motors is a used commercial truck dealer based in Charlotte, NC. Established in 2018. The business sells medium- and heavy-duty commercial trucks — box trucks, refrigerated units (reefers), day cabs, flatbeds, dump trucks, and tow trucks — from brands including Isuzu, Hino, Freightliner, and Nissan. Typical inventory is around 20 trucks on the lot at any time.

The business also operates a sister company, Sparta Parts, currently at a separate domain (sparta-parts.com) selling hundreds of truck parts SKUs. Sparta Parts is not part of Phase 1 of this rebuild but is architecturally accounted for.

## Who the customer is

The primary customer for Sparta Motors is the **small-business owner who needs a truck to work**. This includes:

- **Landscapers** needing dump trucks or flatbeds for hauling material and equipment
- **Delivery operators** needing box trucks for local freight
- **Tow companies** needing rollback or wheel-lift wreckers
- **Construction contractors** needing dump trucks or day cabs
- **Refrigerated delivery** operators needing reefers for food, pharmacy, or floral distribution
- **Small fleets** (1-10 trucks) looking to grow steadily rather than buy in bulk from a national dealer

These customers are typically not sophisticated web buyers. They are phone-first, browse-second, and often at a job site during their peak decision-making hours. They value: honest specs, real photos, a phone number that gets answered, and a dealer who tells them the truth about a truck's condition.

## Who the customer is *not*

Sparta Motors is not competing for:

- **Personal truck buyers** looking at F-150s and Silverados — different market, different price point
- **Large fleet operators** (100+ trucks) buying through auction or direct-from-manufacturer channels
- **Enthusiast buyers** looking for lifted, chromed, or lifestyle trucks — Sparta sells work vehicles, not toys

The site's brand direction, copy, and design decisions should all reinforce that Sparta is a **workhorse dealer for working businesses**, not a lifestyle brand or a mass-market platform.

## Business model

**Phase 1 (trucks — current focus):**
- Lead-generation only. Customers browse the inventory, view individual truck detail pages, and submit an inquiry form (or call).
- No online checkout, no reservations, no payments processed on the site.
- Every inquiry goes to the admin (project manager) via SMTP-sent email. Admin follows up personally or dispatches an employee.
- The site's job is: get more of the right customers into the sales funnel.

**Phase 2 (parts — deferred):**
- Sparta Parts consolidates onto this site at `/parts`.
- Direct-purchase e-commerce with Stripe checkout for individual parts.
- Continued lead-gen path for bulk orders and B2B accounts.
- The existing sparta-parts.com domain 301-redirects to sparta-motors.com/parts.

**Phase 3+ (B2B/fleet — architected for, not built):**
- Fleet customer accounts with saved sourcing preferences
- Bulk/wholesale pricing tiers on parts
- Net-30 terms, quote generation, PO workflows
- CRM integration (HubSpot, Zoho, or similar) if it improves lead handling

Phase 3 features should not be scaffolded during Phase 1 build, but the data model and architectural decisions should not preclude them. See `06-phase2-architecture.md` for how these hook in.

## Current sites (being replaced)

- **sparta-motors.com** — currently a basic WordPress site with dated design and phone-quality photos. This domain is preserved and is the target for the rebuild.
- **sparta-parts.com** — WooCommerce site for parts. Not touched in Phase 1. In Phase 2, this domain 301-redirects to the new consolidated site.

## Team and roles

- **Admin** — one person (the project manager and business owner). Has full access to everything: publishing, editing, deleting, user management, settings. Reviews and publishes every truck listing.
- **Employees** — 5 to 10 employees. Create draft truck listings from their phones while at the lot. Can view leads. Cannot publish trucks or delete anything. Cannot see other employees' drafts before submission.

The build should make **the employee mobile experience** a first-class concern. Employees will use the admin panel more than the admin does, and they'll use it exclusively from their phones. The admin will use the admin panel from a desktop or laptop most of the time, but should also be able to review and publish from a phone in a pinch.

## Goals for the rebuild

Explicit business goals, in priority order:

1. **More qualified leads.** The current site is underperforming. The rebuild should generate more inquiries per visitor by having clearer inventory presentation, faster load times, and stronger calls to action.
2. **Better mobile experience.** A significant portion of customer traffic and 100% of employee admin usage happens on mobile. The current site is not mobile-optimized.
3. **Modern, trustworthy visual identity.** The current site looks dated and doesn't communicate that Sparta is a professional operation. The rebuild's "workhorse industrial" brand direction directly addresses this.
4. **Simpler content management.** The current WordPress admin makes it hard to add trucks quickly. The rebuild's employee workflow (draft on phone → submit → admin publishes) should let a truck go from arrival on the lot to public listing in under an hour.
5. **Foundation for Phase 2.** Parts will consolidate here later. The tech stack, design system, and information architecture must support that without a rewrite.
6. **Better SEO.** The current site has no meaningful search presence. The rebuild should target commercial truck buyer search terms (e.g., "used Isuzu NPR for sale Charlotte", "box truck under 100k miles Charlotte NC").

## Non-goals for Phase 1

Explicit non-goals — things that are out of scope for the initial build and should be deferred:

- Online payments or checkout
- Customer accounts or logins (public site is fully anonymous)
- Analytics dashboards for the admin (Phase 1.5 — post-launch, once real data exists)
- Multi-language support
- A blog or content marketing section
- Fleet quote generation
- Trade-in valuation tools

Any of these can be added later. Do not build them now.

## Constraints

- **Budget:** Low. Self-hosting is acceptable. Total target: under $25/month in ongoing costs.
- **Deadline:** None. Quality over speed.
- **Domain:** sparta-motors.com must be preserved. Any DNS work happens at cutover; the current site keeps running until the new one is ready.
- **Developer resources:** None on staff. Claude Code does all build work. The project manager reviews decisions and handles content updates via the admin panel.
- **Design fidelity:** The mockups in `/mockups/` are the visual source of truth. Claude Code should match them closely. Design refinements during build are welcome, but structural changes should be discussed before implementing.

## What "done" looks like for Phase 1

Phase 1 is considered complete when:

- The public site at sparta-motors.com is live with all pages built (Home, Inventory, Truck Detail, Financing, Fleet, About, Contact)
- The scroll-driven hero on the Home page works smoothly on desktop and mobile
- All 20 or so current inventory listings have been migrated (photos, specs, descriptions)
- Employees can log in from their phones, create draft listings, upload photos, and submit for review
- The admin can log in, review drafts, edit as needed, publish or send back, and see leads in the inbox
- Every lead form on the site delivers an email to the business email inbox within 30 seconds of submission
- The Leaflet map on Contact, About, and the footer shows the correct address and is interactive
- SSL is active, Cloudflare is configured, and page load times are under 2.5 seconds on 4G
- Basic SEO is in place (meta tags, sitemap.xml, robots.txt, structured data for truck listings)
- Both the admin and at least two employees have been walked through the workflow and have used it end-to-end at least once
