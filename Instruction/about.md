# About Page (`/about`)

Short and functional. Sparta doesn't need a founder story or team photos — it needs to communicate credibility, location, and the "how we work" pillar. Everything else is on other pages.

**Mockup reference:** `/mockups/sparta-content-pages.html` (Page 3 of 4)

## Positioning and copy tone

- Family-run business, not a corporate dealer
- Established (Est. 2018, ~7 years in Charlotte)
- Serves working small businesses
- Direct and functional — no long-winded copy

## Page structure

1. Nav (site-wide)
2. Page header (dark, with "ABOUT" watermark)
3. Intro paragraph
4. Stats strip
5. "How we work" callout
6. Location section (map + address + hours)
7. Footer (site-wide)

## Page header

Dark section with watermark.

- Breadcrumb: `Home / About`
- Label: `◆ ABOUT SPARTA MOTORS`
- Display title: `Trucks for working businesses. Since 2018.`

## Intro paragraph (single section)

Light background. Container narrower than other sections (`max-w: 900px`).

Copy (should be editable via Payload):

> Sparta Motors is a family-run used commercial truck dealer based in Charlotte, NC. We opened our doors in 2018 and have spent every year since building a reputation for straight talk, honest specs, and trucks that show up to work. We sell to landscapers, delivery operators, tow companies, contractors, and any small business that needs a truck that runs when they turn the key.

## Stats strip

Below the intro paragraph, before the callout. Bordered top and bottom.

- 4 columns on desktop, 2×2 on mobile
- Each stat: small mono label + big Barlow Condensed number (orange) + small Inter description

**Stats (all editable in Payload):**

| Label | Value | Description |
|---|---|---|
| EST. | 2018 | Charlotte, NC |
| TRUCKS SOLD | 400+ | Small businesses served |
| BODY TYPES | 06 | Box, reefer, day cab, dump, tow, flatbed |
| BRANDS | 08 | Isuzu, Hino, Freightliner, Nissan + more |

The "400+" is a placeholder — admin will update to the real number after import. Same for other stats that need real data.

## "How we work" callout

Standard callout component: white card with orange left-border, section label + body.

- Label: `◆ HOW WE WORK`
- Body: `Every truck is inspected before it goes on our lot. If it doesn't run right, we don't sell it. Real mileage, real condition notes, real photos. VIN on every listing so you can run your own report. That's the whole model — no games, no hidden reconditioning, no upsell.`

## Location section (map + address + hours)

Warm off-white background.

- Label: `◆ FIND US`
- Title: `Come see the trucks.`
- Lead: `We're on Industrial Blvd in North Charlotte. Easy off I-77, plenty of room to walk the lot.`

**Below the lead:** two-column layout (single column on mobile).

**Left column (60% width):** Address/hours card.

- White background, 10px rounded, 1px Chalk border, padding 24px 26px
- Three groups separated by margin:
  - **Address:** heading "ADDRESS" + address as monospace multi-line
  - **Hours:** heading "HOURS" + Mon-Fri / Sat / Sun with day labels in orange
  - **Contact:** heading "CONTACT" + phone + email

**Right column (~40% width):** Leaflet map.

- 400-440px tall
- CartoDB Positron tiles
- Orange marker with popup
- Full spec in `integrations/leaflet-map.md`

Address, hours, phone all come from the Settings global.

## Data requirements

- Fetch `about` page from Pages global for editable copy
- Fetch Settings global for address/hours/contact info

## SEO

**Meta tags:**

- Title: `About Sparta Motors — Used Commercial Trucks in Charlotte NC`
- Description: `Family-run used commercial truck dealer in Charlotte, NC. Serving small businesses since 2018.`

**Structured data:**

- `LocalBusiness` schema (address, hours, phone)

## What good implementation looks like

- The page is genuinely short — feels like it's easy to read in under 30 seconds
- The stats strip communicates credibility without needing a testimonials section
- The location map is inviting and clearly interactive
- Address/hours/phone come from the Settings global — admin can update in one place and it propagates everywhere (Contact page, About page, footer)
