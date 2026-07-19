# Sparta Motors — Website Redesign

Rebuild of [sparta-motors.com](https://sparta-motors.com), a used commercial truck dealer in Spartanburg, SC. This repo contains the full design phase output — build brief, mockups, and architecture decisions — for a rebuild currently entering the build phase.

**Status:** Design phase complete. Build phase beginning.

---

## What's in this repo

### 📋 `/build-brief/`

The complete build brief — 25 modular Markdown docs covering every technical, design, and workflow decision. This is the reference document Claude Code will use during the build.

Start with [`build-brief/README.md`](./build-brief/README.md) for the table of contents.

Highlights:

- **[Project context](./build-brief/00-project-context.md)** — Business, customer, and goals
- **[Tech stack](./build-brief/01-tech-stack.md)** — Next.js + Payload CMS + PostgreSQL on a small VPS (~$10/month total)
- **[Data model](./build-brief/02-data-model.md)** — Every collection, field, and permission rule
- **[Design system](./build-brief/04-design-system.md)** — "Workhorse industrial" — Barlow Condensed + Inter + JetBrains Mono, Sparta Black + Bone + Safety Orange
- **[Page specs](./build-brief/pages/)** — One doc per public page
- **[Admin workflow](./build-brief/admin/)** — Employee draft → admin review → publish
- **[Integrations](./build-brief/integrations/)** — Scroll-driven hero video, Leaflet map, SMTP email

### 🎨 `/mockups/`

Standalone HTML mockups produced during the design phase. Open any file in a browser to see the actual design intent — every design decision in the build brief has a corresponding visual here.

- `sparta-scroll-hero-v2.html` — Home page with scroll-driven truck disassembly hero
- `sparta-truck-detail.html` — Truck detail page (Facebook Marketplace pattern)
- `sparta-inventory.html` — Inventory browse with Leaflet map
- `sparta-content-pages.html` — Financing, Fleet, About, Contact
- `sparta-admin.html` — Admin dashboard (4 screens with working navigation)
- `sparta-mobile.html` — Mobile mockups: Home, Truck Detail, Admin form

---

## Project overview

Sparta Motors sells used medium- and heavy-duty commercial trucks — box trucks, reefers, day cabs, flatbeds, dump trucks, tow trucks — to small-business owners who need working vehicles. The current site is a dated WordPress build with phone-quality photos and no meaningful mobile experience.

The rebuild targets:

1. **More qualified leads** through clearer inventory presentation and stronger CTAs
2. **Mobile-first employee workflow** — staff can create truck listings from their phones at the lot
3. **A modern, trustworthy visual identity** — "workhorse industrial" aesthetic
4. **Foundation for Phase 2** — Sparta Parts consolidates from `sparta-parts.com` in the next phase

## Phasing

- **Phase 1 (current):** Rebuild trucks site as lead-gen only. ~20 listings.
- **Phase 2 (deferred):** Consolidate Sparta Parts into `/parts` with direct-purchase checkout. 301 redirects from `sparta-parts.com`.
- **Phase 3 (architected for):** B2B/fleet accounts, bulk pricing, quote generation, CRM integration.

## Working style

Design phase used a Delegation & Description model: the project manager described intent, Claude proposed options with tradeoffs, project manager selected, Claude executed. The same model continues in Claude Code for the build phase.

## Credits

Design phase produced collaboratively between the project manager (business decisions) and Claude (architecture, design proposals, mockups). All decisions documented in `/build-brief/`.
