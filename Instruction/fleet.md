# Fleet Page (`/fleet`)

Positions Sparta as a **sourcing partner** for small businesses growing their truck fleets. Not a fleet supplier, not a manufacturer, not a stockist of dozens of matching units. Honest positioning about what Sparta actually does.

**Mockup reference:** `/mockups/sparta-content-pages.html` (Page 2 of 4)

## Positioning and copy tone

- Realistic — Sparta can source fleet inquiries, but not overnight and not in large batches
- No fake corporate language ("we specialize in fleet operations") — Sparta is a small business talking to other small businesses
- Timelines honest: some body types take weeks to source; be upfront

## Page structure

1. Nav (site-wide)
2. Page header (dark, with "FLEET" watermark)
3. How we source (3-step process)
4. What we can source (list of body types with timing notes)
5. Fleet inquiry CTA + form
6. Footer (site-wide)

## Page header

Dark section with watermark.

- Breadcrumb: `Home / Fleet`
- Label: `◆ FLEET & BULK SOURCING`
- Display title: `Growing your fleet? We source the trucks.`
- Subtitle: `Sparta Motors doesn't warehouse fleet inventory. What we do is source used commercial trucks for small businesses and growing fleets — tell us the spec, and we find it as trucks come available.`

## Section 1 — How we source (3 steps)

Light background.

- Label: `◆ HOW WE SOURCE`
- Title: `Straightforward. No guessing games.`
- Lead: `Three steps. No pressure, no hidden fees, no promises we can't keep.`

**01 · Tell us the spec**
Body type, quantity, budget range, timeline. The more specific the better — helps us know exactly what to keep an eye out for.

**02 · We source it**
We keep an ongoing lookout at auctions, trade-ins, and our network. If a truck matches your spec, we grab it and let you know.

**03 · You get first look**
Fleet inquiries get first look at matched trucks — before anything hits public inventory. See it, drive it, decide.

## Section 2 — What we can source

Warm off-white background.

- Label: `◆ WHAT WE SOURCE`
- Title: `Every body type we carry.`
- Lead: `If we sell it as a single unit, we can source it in quantity. Timelines vary by body type and market — box trucks and day cabs move fastest.`

**Info list (6 items in 2-column grid):**

- **Box Trucks** — 14-26ft. Most common. Fast to source, wide availability.
- **Day Cabs** — Class 6-8. Freightliner, Hino, Isuzu, Peterbilt. Regional lookout.
- **Reefers** — Refrigerated box units. Slower to source, but doable — allow 2-8 weeks.
- **Dump Trucks** — 6-10 wheel. Construction, landscaping, aggregate hauling.
- **Tow Trucks** — Rollback, wheel lift, wrecker. Specialized — allow more time.
- **Flat Beds** — Class 5-7. Cabinet, chipper, service, landscape. Regional availability varies.

## Section 3 — Fleet inquiry CTA + form

Dark section.

- Label: `◆ START HERE`
- Title: `Start a fleet inquiry.`
- Lead: `Fill this out — the more you tell us, the faster we can start sourcing.`

**CTA block:**

**Left side:**
- Heading: `Fleet inquiry form`
- Description: `Different from our standard lead form — this one captures fleet-specific info so we know exactly what to source. You'll hear back within a business day.`
- Below: `Prefer to talk it through? Call us — (704) 555-0184.`

**Right side — the form (fleet-specific fields):**

1. **Company name** (required)
2. **Contact name** (required)
3. **Phone** (required)
4. **Email** (required)
5. **Fleet size** (required dropdown):
   - 1–3 trucks
   - 4–10 trucks
   - 10+ trucks
6. **Timeline** (required dropdown):
   - ASAP
   - 1–3 months
   - 3–6 months
   - Ongoing / open
7. **Trucks needed** (required textarea; placeholder "e.g. 3 box trucks 16ft+, diesel, under $40k each, prefer Isuzu or Hino...")
8. Submit button: `Send fleet inquiry →`

**Form behavior:**
- Endpoint: `POST /api/fleet-inquiries` (different from standard leads — writes to `FleetInquiries` collection)
- Email notification includes "FLEET INQUIRY" flag in subject line, and includes fleet-specific fields prominently

## Data requirements

- Fetch `fleet` page from Pages global
- Post to `/api/fleet-inquiries` on submit

## SEO

**Meta tags:**

- Title: `Fleet Truck Sourcing — Sparta Motors, Charlotte NC`
- Description: `Fleet and bulk sourcing for used commercial trucks. We source box trucks, day cabs, dump trucks, and more for growing businesses. Charlotte, NC.`

## What good implementation looks like

- The three-step process reads honestly, not salesy
- The body type list acknowledges real timing tradeoffs (reefers take longer, tow trucks are specialized)
- The form's fleet-specific fields (fleet size, timeline) are prominent
- Fleet inquiries are clearly flagged in the admin so admin knows they're not just a standard lead
