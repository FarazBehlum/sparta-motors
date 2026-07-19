# 04 — Design System

Sparta Motors' visual identity is "workhorse industrial." Modern diesel-shop meets clean web design. Confident, grounded, no-nonsense. Speaks to small-business owners who need trucks that work.

The design system below is the reference for every visual and interaction decision. Every mockup in `/mockups/` implements these tokens. Claude Code should extract these into the Tailwind config and CSS variables at build time.

---

## Typography

Three typefaces, each with a specific job. All served from Google Fonts and self-hosted via `next/font`.

### Barlow Condensed — Headlines and UI titles

**When to use:**
- Display titles (hero headlines, page titles)
- Section titles ("Shop by body type", "Featured inventory")
- Navigation labels
- Buttons
- Card headings

**Weights loaded:** 500, 600, 700, 800, 900

**Common settings:**
- Uppercase (`text-transform: uppercase`) for section labels and headings
- Letter-spacing: 0.02em to 0.04em depending on size
- Line-height: 0.95 to 1.1 depending on context (tighter for large displays)

**Example CSS:**
```css
.display-title {
  font-family: 'Barlow Condensed', sans-serif;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  line-height: 0.95;
}
```

### Inter — Body text

**When to use:**
- Paragraph text
- Descriptions
- Longer-form content
- Form input text and labels (where not monospaced)

**Weights loaded:** 400, 500, 600, 700

**Common settings:**
- Normal case
- Letter-spacing: default
- Line-height: 1.55 to 1.7 for body paragraphs, 1.2 for tight labels

### JetBrains Mono — Technical data

**When to use:**
- VINs
- Prices
- Mileage numbers
- Dates
- Phone numbers
- Stock numbers
- URL paths in documentation
- Small caps labels like "◆ FEATURED INVENTORY"

**Weights loaded:** 400, 500

**Common settings:**
- Letter-spacing: 0.05em to 0.3em depending on size (very small monospace labels use very wide letter-spacing for legibility)

The point of monospaced type on VINs and prices is to communicate "this is technical, checkable, precise data." Sparta customers appreciate seeing a VIN they can copy-paste into a report tool.

---

## Color palette

All colors are neutral or muted, with a single high-visibility accent (Safety Orange) for calls-to-action and brand moments.

### Primary

| Name | Hex | Usage |
|---|---|---|
| Sparta Black | `#1A1A1A` | Primary text on light backgrounds. Nav backgrounds. Dark section backgrounds. |
| Bone | `#F5F3F0` | Primary page background. Light text on dark backgrounds. |

### Hero-specific

| Name | Hex | Usage |
|---|---|---|
| Hero Warm Gray | `#EFEEEA` | Home hero background, matches the truck disassembly image backdrop |

### Accent

| Name | Hex | Usage |
|---|---|---|
| Safety Orange | `#F26B0F` | Primary CTA buttons. Accent lines. Active nav state. Section labels ("◆ HOW WE WORK"). Chart highlights. Sparingly used. |
| Hi-Vis Amber | `#F5A623` | Reserved for Sparta Parts in Phase 2 |

### Neutrals

| Name | Hex | Usage |
|---|---|---|
| Charcoal | `#2C2C2A` | Secondary dark backgrounds, borders on dark |
| Iron | `#5F5E5A` | Secondary body text, "muted" labels |
| Concrete | `#B4B2A9` | Tertiary text on dark backgrounds, borders |
| Chalk | `#D3D1C7` | Borders and dividers on light backgrounds |
| Warm Off-White | `#EEECE5` | Secondary section backgrounds (alternate to Bone), breadcrumb bar background |

### Semantic

| Name | Hex | Usage |
|---|---|---|
| Success Green | `#16803B` | "Contacted" lead status, checkmarks, positive changes |
| Success Light | `#EAF3DE` | Success pill backgrounds |
| Danger Red | `#B91C1C` | Required field markers, destructive action buttons (Delete, Reject) |
| Warning Orange (soft) | `#FDF3EB` | Financing flag backgrounds, draft badge backgrounds |
| Warning Orange (dark) | `#B84A2F` | Text on warning-soft backgrounds |

### As CSS variables

```css
:root {
  --sparta-black: #1A1A1A;
  --bone: #F5F3F0;
  --hero-warm-gray: #EFEEEA;
  --safety-orange: #F26B0F;
  --hi-vis-amber: #F5A623;
  --charcoal: #2C2C2A;
  --iron: #5F5E5A;
  --concrete: #B4B2A9;
  --chalk: #D3D1C7;
  --warm-off-white: #EEECE5;
  --success-green: #16803B;
  --success-light: #EAF3DE;
  --danger-red: #B91C1C;
  --warning-soft: #FDF3EB;
  --warning-dark: #B84A2F;
}
```

### As Tailwind config

```javascript
theme: {
  colors: {
    'sparta-black': '#1A1A1A',
    'bone': '#F5F3F0',
    'hero-warm': '#EFEEEA',
    'orange': '#F26B0F',
    'amber': '#F5A623',
    'charcoal': '#2C2C2A',
    'iron': '#5F5E5A',
    'concrete': '#B4B2A9',
    'chalk': '#D3D1C7',
    'warm-white': '#EEECE5',
    'success': { DEFAULT: '#16803B', light: '#EAF3DE' },
    'danger': '#B91C1C',
    'warning': { soft: '#FDF3EB', dark: '#B84A2F' },
  }
}
```

---

## Spacing scale

Use Tailwind's default spacing scale (4px increments). Common values:

- `2` (8px) — Tight component internal padding
- `3` (12px) — Small gaps
- `4` (16px) — Standard component padding
- `5` (20px) — Card padding
- `6` (24px) — Section internal spacing
- `8` (32px) — Between related sections
- `12` (48px) — Between major sections on a page
- `16` (64px) — Between hero and content

Section padding standard:
- Desktop: `py-14 px-10` (56px top/bottom, 40px sides) — 40px is what the mockups use
- Mobile: `py-8 px-5` (32px top/bottom, 20px sides)

---

## Layout tokens

### Container widths

| Context | Max width |
|---|---|
| Standard content | 1280px |
| Wide layouts (inventory, home) | 1400px |
| Narrow prose (About paragraph) | 900px |

### Grid patterns

- **Truck cards on desktop:** 3-column grid, 16px gap
- **Truck cards on mobile:** 1-column, 12px gap
- **Category tiles on desktop:** 3-column, 20px gap
- **Category tiles on mobile:** 2-column, 8px gap
- **Contact info cards:** 4-column desktop, 2-column mobile

### Border radius

- Small components (badges, chips): 3-4px
- Cards, form fields: 4-8px
- Larger cards (truck cards, dashboard panels): 10px
- Buttons: 4px
- Never use fully rounded (`border-radius: 9999px`) except for status pills and icon buttons

---

## Motion palette

Motion should feel functional and crisp, not cinematic. All easing uses `cubic-bezier(0.25, 0.1, 0.25, 1)` unless noted. Timings 150-400ms.

### The six motion moments

**1. Scroll-driven hero (Home page).**
- Video scrubs based on scroll position through the 250vh hero section
- 100vh sticky container pins during scroll
- Three text phases fade in/out at scroll depths (see `pages/home.md`)
- Full spec in `integrations/hero-video.md`

**2. Sticky-stacking (Shop by body type section).**
- Each of the 6 category cards sticks at the top as the user scrolls
- Cards behind scale down slightly (0.03 per card)
- Card offset: 28px per card
- Uses CSS `position: sticky` + a small JavaScript enhancer for the scale effect

**3. FadeIn on scroll.**
- Every major section fades up 30px + opacity 0→1 as it enters the viewport
- `once: true` — no re-triggering when scrolling back
- Duration: 400ms
- Delay staggering for grouped elements (e.g., truck cards): 60ms per card

**4. Character-by-character reveal.**
- On the hero subhead and the "How we work" pillars
- Reads as "typing on" quickly — total duration ~800ms
- Only triggers on initial page load

**5. Subtle gradient shift on SPARTA wordmark.**
- The giant "SPARTA" text in the hero has a subtle gradient from Sparta Black to a slightly lighter charcoal
- Static gradient, no animation

**6. Hover states.**
- Truck cards: lift 2px, subtle shadow (`0 6px 20px rgba(0,0,0,0.08)`), photo scales 1.02, 200ms
- Buttons: orange lightens ~5%, scales 1.02, 150ms
- Dark buttons: background lightens to Charcoal, 150ms
- Category tiles: number shifts orange → white, 1px orange border appears, 150ms
- Nav links: underline draws from left, 150ms

### What we're NOT doing

Explicit non-goals for motion:

- No autoplay video or background video loops (except the scroll-scrubbed hero, which requires user scroll to advance)
- No magnetic mouse-follow effects (feels agency, wrong signal)
- No page transitions (instant navigation matters for lead-gen speed)
- No animated color shifts on brand colors
- No parallax on background elements (causes mobile jitter)
- No spring physics (feels off-brand)

### Accessibility

All motion respects `prefers-reduced-motion: reduce`:

- Scroll-scrubbed video becomes: instant frame swap at each scroll milestone (no smooth transitions between frames)
- Character reveals: instant text appearance
- Sticky-stacking: standard vertical stacking, no scale effect
- FadeIn: instant appearance
- Hover states: color changes remain, transform/scale removed

---

## Iconography

Use `lucide-react` for standard UI icons (menu, close, arrow, chevron, phone, mail, etc.). Icons should be:

- Stroke width 2
- Standard sizes: 16px, 18px, 20px, 24px
- Color inherits from parent text color unless intentionally accented

For decorative brand marks (the `◆` used before section labels), just use the Unicode diamond character (◆ = U+25C6). This appears in orange throughout the site as a small brand accent.

---

## Component patterns

Key components used across the site. See individual page docs for specific implementations.

### Section label
```jsx
<div className="font-mono text-[11px] text-orange tracking-[0.3em] mb-2">
  ◆ SECTION NAME
</div>
```

### Display title
```jsx
<h1 className="font-barlow font-extrabold uppercase text-[68px] leading-[0.95] tracking-tight">
  Title text.
</h1>
```

### Truck card (grid view)
- Card: white, 10px rounded, thin border, 200ms hover
- Photo area: 160px height (or aspect-ratio 5/3), body-type badge top-left
- Info area: year/make in small mono caps, model name in Barlow Condensed 700 uppercase
- Stats bar: mileage on left, price on right, top border separator
- See `/mockups/sparta-inventory.html` for reference

### Primary CTA button
```jsx
<button className="bg-orange text-sparta-black px-5 py-3 font-barlow font-bold uppercase tracking-wider text-sm rounded hover:scale-[1.02] transition-transform">
  Browse inventory →
</button>
```

### Ghost button (secondary)
```jsx
<button className="border border-sparta-black text-sparta-black px-5 py-3 font-barlow font-bold uppercase tracking-wider text-sm rounded hover:bg-sparta-black hover:text-bone transition">
  Fleet inquiries
</button>
```

### Form field
- Label: JetBrains Mono, 10px, uppercase, tracking-wide, color Iron
- Input: 10-12px padding, 1px Chalk border, 4px border-radius, Inter 14px, focus border Safety Orange
- Required marker: red asterisk after label

### Status pill
- Base: rounded-full, small padding, tiny uppercase Barlow Condensed
- Variants: NEW (orange), CONTACTED (success green), CLOSED (gray)
- Includes a small colored dot before the label

---

## Voice and copy tone

Copy is part of the design system. Rules:

**Short sentences. Specs before adjectives. Direct, confident, no fluff.**

Sounds like Sparta:
> 2019 Isuzu NPR-HD. 87,000 miles. 16-foot box, aluminum roll-up door. Runs strong, ready to work.

Not like Sparta:
> Exceptional. Premier. Luxury. Elevate your fleet. Experience the difference.

Additional copy guidelines:

- Use active voice
- Use "we" for Sparta, "you" for the customer
- Avoid technical jargon unless it's a spec (VIN, GVWR, class 5 — fine; "leverage our expertise" — no)
- Numbers should be specific ("400+ trucks sold", not "many trucks")
- Never use exclamation points except in the admin UI on success states

---

## Mobile-specific patterns

Mobile is a first-class design surface, not a responsive afterthought.

**Nav on mobile:**
- Dark bar with brand name on left, orange "◆ CALL" button + hamburger on right
- Phone number always one tap away
- Full menu opens as a full-screen overlay (not a drawer)

**Sticky bottom bar (Truck Detail and Admin Form):**
- Fixed to bottom of viewport
- Dark background
- Two buttons side-by-side: secondary action on left (transparent with border), primary on right (orange)
- Truck detail: `[☎ Call]` + `[Inquire →]`
- Admin form: `[Save Draft]` + `[Submit →]`
- Content padding-bottom is added so nothing hides behind the bar

**Tap targets:**
- Minimum 44px height for all interactive elements
- Adequate spacing between adjacent tap targets (at least 8px)

**Photo galleries:**
- Swipe-based, not arrow-based (arrows are too small for mobile touch)
- Orange dots below the photo indicate position; active dot is elongated
- "Swipe left/right" hint appears below on first load

---

## What good implementation looks like

When Claude Code implements this design system:

- All colors reference CSS variables or Tailwind tokens — no hard-coded hex values in components
- All typography choices flow from utility classes on the fonts loaded via `next/font`
- The `◆` diamond character appears as a small orange accent throughout (this is a subtle brand signature)
- Every interactive element has hover, focus, and active states (no plain buttons)
- Motion respects `prefers-reduced-motion` on every animation
- Mobile styles are written mobile-first (base styles are mobile, `md:` prefixes add desktop styling)
- Component variants (e.g., ghost button vs. primary button, dark card vs. light card) are proper component props, not one-off classes

The `/mockups/` HTML files are the visual source of truth. If in doubt, look at the mockup.
