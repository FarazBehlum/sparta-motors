# Financing Page (`/financing`)

Explains how Sparta helps customers finance a truck. Positioning: **Sparta is not a lender.** Sparta connects customers with commercial lenders who specialize in used truck financing.

**Mockup reference:** `/mockups/sparta-content-pages.html` (Page 1 of 4)

## Positioning and copy tone

- Direct and honest: "we're not the lender, we're the connection"
- Not promotional: don't oversell financing options
- Empathetic to the customer's business realities: small businesses buying trucks understand cash flow and credit; the page should feel like it's from someone who understands their situation

## Page structure

1. Nav (site-wide)
2. Page header (dark, with "FINANCING" watermark)
3. How it works (3-step process)
4. What you'll need (document list + legal callout)
5. Pre-qualification CTA + form
6. Footer (site-wide)

## Page header

Dark section with watermark.

- Breadcrumb: `Home / Financing`
- Label: `◆ COMMERCIAL TRUCK FINANCING`
- Display title: `We help you get the truck.`
- Subtitle: `Sparta Motors doesn't finance directly. We work with commercial lenders and banks who do — and we'll connect you with the right one.`

## Section 1 — How it works (3 steps)

Light background. Standard section pattern.

- Label: `◆ HOW IT WORKS`
- Title: `Three steps to financing.`
- Lead: `Straightforward process. No surprises, no runaround. Most buyers get an answer within a business day.`

Three steps in a horizontal grid (stacked on mobile):

**01 · Find your truck**
Browse our inventory or tell us what you're looking for. Once you know the truck, we can move on financing in parallel.

**02 · Tell us about your business**
Fill out a short pre-qualification form. Business info, personal info, rough downpayment. Takes about 10 minutes.

**03 · We connect you with a lender**
Based on your situation, we send your info to a lender we work with who specializes in commercial vehicles. They'll reach out directly.

## Section 2 — What you'll need

Warm off-white background. Section pattern.

- Label: `◆ WHAT YOU'LL NEED`
- Title: `Documents to have ready.`
- Lead: `Every lender's list is a little different, but these are the basics. Have them ready and pre-qualification is fast.`

**Info list (6 items in a 2-column grid):**

- **Business Info** — EIN, years operating, industry, annual revenue estimate.
- **Personal Info** — Legal name, SSN, home address, approximate credit range.
- **Down Payment** — Typically 10–20% depending on credit and lender. Cash or trade-in both work.
- **Bank Statements** — Last 3 months of business bank statements. Shows the lender you can carry the payment.
- **Truck of Interest** — The specific truck you're pre-qualifying for. VIN or stock number is enough.
- **Trade-In (Optional)** — Have a truck to trade in? Year/make/model and rough condition helps us structure the deal.

**Legal callout** (below the info list):

- White card with an orange left-border
- Label: `◆ HEADS UP`
- Body: **Sparta Motors is not a lender.** We do not process loans or approve credit. Financing decisions are made by the lender, not by us. We just help make the connection so you don't have to shop lenders yourself.

This callout is important legally — Sparta must not represent itself as a lender or credit provider.

## Section 3 — Pre-qualification CTA + form

Dark section (`#1A1A1A`, Bone text).

- Label: `◆ START HERE`
- Title: `Start pre-qualification.`
- Lead: `Fill this out, and we'll get you in front of a lender who works with commercial buyers. Usually one business day for a first response.`

**CTA block** — dark card, two columns on desktop (info left, form right):

**Left side:**
- Section heading: `Pre-qualification form`
- Description: `This is our standard inquiry form with financing pre-checked. Same as the form on any truck listing — we just skip the "truck of interest" if you don't have one picked yet.`
- Below: `Prefer to talk to a person first? Call us — (704) 555-0184.`

**Right side — the form:**

Fields:
1. **Full name** (required)
2. **Phone** (required)
3. **Email** (required)
4. **Truck of interest** (optional; placeholder "VIN, stock #, or 'not sure yet'")
5. **Message** (optional; textarea; placeholder "Tell us anything relevant — trade-in, timeline, budget range...")
6. Submit button: `Start pre-qualification →`

**Form behavior:**
- Endpoint: `POST /api/leads`
- Source: `financing-prequal`
- Financing interest: automatically set to `true`
- Truck of interest: if user typed a VIN/stock #, try to match to an existing Truck record; if match, link. If not, save as free-text.
- Email notification includes prominent "FINANCING PRE-QUALIFICATION" flag in subject line

## Data requirements

- Fetch `financing` page from Pages global for editable copy
- Post to `/api/leads` on submit

## SEO

**Meta tags:**

- Title: `Commercial Truck Financing — Sparta Motors, Charlotte NC`
- Description: `Financing options for used commercial trucks. We connect small businesses with commercial lenders. Charlotte, NC.`

## Accessibility

- All form fields have labels and required attributes
- Legal callout has appropriate ARIA role
- Focus states clear on all interactive elements

## What good implementation looks like

- The three-step process reads as reassuring, not corporate
- The legal callout is prominent enough to be clear, subtle enough not to feel scary
- The form submission returns a friendly success message
- The "we're not the lender" positioning is consistent across every part of the page
