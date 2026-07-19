# Contact Page (`/contact`)

The definitive contact reference. Every way to reach Sparta, prominently displayed. Phone-forward because Sparta's customers are phone-happy.

**Mockup reference:** `/mockups/sparta-content-pages.html` (Page 4 of 4)

## Positioning and copy tone

- Phone number is the star — Sparta customers prefer to call
- Email works but is secondary
- Physical location matters — many customers want to walk the lot before buying
- Response time promise: "within a few hours during business hours" — this is a commitment, not marketing language

## Page structure

1. Nav (site-wide)
2. Page header (dark, with "CONTACT" watermark)
3. Contact cards (4-across grid)
4. Full-width interactive map
5. General contact form
6. Fleet CTA (site-wide)
7. Footer (site-wide)

## Page header

Dark section with watermark.

- Breadcrumb: `Home / Contact`
- Label: `◆ GET IN TOUCH`
- Display title: `Give us a call. Send us a note.`
- Subtitle: `Fastest way to get an answer is a phone call. If email works better, drop us a note — we usually respond within a few hours during business hours.`

## Contact cards (4-column grid)

Light background. 4 cards in a row on desktop, 2×2 on mobile.

Each card: white background, 10px rounded, 1px Chalk border, padding 20-22px.

**Card 1 — CALL:**
- Label: `CALL` (mono orange)
- Value: `(704) 555-0184` (Barlow Condensed 700, ~20px, dark)
- Sub: `Fastest way to get an answer. Mon–Fri 8am–6pm.`
- Phone number is a `tel:` link on mobile

**Card 2 — EMAIL:**
- Label: `EMAIL`
- Value: `info@sparta-motors.com` (slightly smaller than phone to fit; wraps if needed)
- Sub: `We reply within a few hours during business hours.`
- Email is a `mailto:` link

**Card 3 — VISIT:**
- Label: `VISIT`
- Value: address in two lines: `1234 Industrial Blvd / Charlotte, NC 28216`
- Sub: `Off I-77. Plenty of room to walk the lot.`

**Card 4 — HOURS:**
- Label: `HOURS`
- Value: `Mon–Fri 8–6 / Sat 9–3 · Sun Closed`
- Sub: `Come during hours or call ahead if you need after-hours access.`

All content pulled from Settings global.

## Full-width interactive map

Below the contact cards, still in the light section.

- Full container width (matches page container)
- 440px tall (bigger than About's or footer's map — this is where the map lives most fully)
- CartoDB Positron tiles
- Orange marker with popup showing address + phone
- Scroll-wheel zoom enabled, zoom controls in corner
- Click and drag to pan

Full spec in `integrations/leaflet-map.md`.

## General contact form

Warm off-white background.

- Label: `◆ SEND A MESSAGE`
- Title: `Or drop us a note.`
- Lead: `Not sure which truck you want? Have a general question? Send it here. We usually respond within a few hours.`

**CTA block** — two columns on desktop, stacked on mobile.

**Left column:**
- Heading: `General contact form`
- Description: `For truck-specific inquiries, use the inquiry form on the truck's listing — we can respond faster with the truck already flagged. For anything else, this form works great.`
- Below: `Urgent? Call directly — (704) 555-0184.`

**Right column — the form:**

1. **Full name** (required)
2. **Phone** (optional)
3. **Email** (required)
4. **How did you hear about us?** (dropdown, optional)
   - Google search
   - Facebook / Instagram
   - Referral
   - Drove by the lot
   - Other
5. **Message** (required textarea; placeholder "How can we help?")
6. Submit button: `Send message →`

**Form behavior:**
- Endpoint: `POST /api/leads`
- Source: `general-contact`
- No truck of interest, no financing pre-check, no trade-in fields (this is the general form)
- Email notification includes prominent "GENERAL CONTACT" flag in subject line

## Data requirements

- Fetch `contact` page from Pages global
- Fetch Settings global for phone/email/address/hours
- Post to `/api/leads` on submit

## SEO

**Meta tags:**

- Title: `Contact Sparta Motors — Charlotte NC`
- Description: `Contact Sparta Motors — used commercial truck dealer in Charlotte, NC. Call (704) 555-0184 or email info@sparta-motors.com. Mon–Fri 8am–6pm.`

**Structured data:**

- `LocalBusiness` schema with full contact info

## Accessibility

- All contact cards have clickable elements with `tel:` and `mailto:` links
- Map has an ARIA label describing what it shows
- Form has proper labels and validation

## What good implementation looks like

- Calling is one tap away on mobile (the CALL card is a huge tap target)
- The map is large and inviting — clearly interactive
- The "how did you hear about us" field feels natural, not intrusive
- Response time promise ("within a few hours") is honored — see `admin/leads-inbox.md` for the workflow
- Contact info comes from Settings global — admin updates in one place, everywhere reflects
