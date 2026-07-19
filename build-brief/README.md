# Sparta Motors — Website Build Brief

This is the complete build brief for the Sparta Motors website rebuild — a used commercial truck dealer in Charlotte, NC. It documents every technical, design, and workflow decision made during the design phase, and is intended to serve as the reference document for the actual build in Claude Code.

The design phase happened as an extended collaboration between the project manager (business owner) and Claude. Every decision here has been reviewed and approved. No open questions remain that would block build.

**Project status:** Design phase complete. Build phase beginning.

---

## How to use this brief

If you are **building this site** (in Claude Code): start with `00-project-context.md` for orientation, then `01-tech-stack.md` for the technical foundation, then work through the numbered docs. Reference `/pages/`, `/admin/`, and `/integrations/` for specific implementation details. Cross-reference the mockup files in `/mockups/` — they are the source of truth for visual design.

If you are **reviewing this project** (portfolio visitor, potential collaborator, or stakeholder): the numbered docs give you the shape of the project. `00-project-context.md` explains what Sparta Motors is and why we're rebuilding. `04-design-system.md` covers the brand direction. Each page doc explains a specific customer-facing screen.

If you are the **project manager** during build: refer here whenever Claude Code asks a question about scope, design, or workflow. This document is the single source of truth. If something isn't in this brief, it's either flagged as deferred (Phase 1.5 or Phase 2), or it's a decision that needs to be made in the moment.

---

## Table of contents

### Foundation

- **[00-project-context.md](./00-project-context.md)** — The business, the customer, the goals, and the phasing (Phase 1 trucks, Phase 2 parts, Phase 3 B2B/fleet).
- **[01-tech-stack.md](./01-tech-stack.md)** — Next.js frontend, Payload CMS backend, small VPS hosting, Cloudflare CDN, SMTP through the existing business email. Total cost: $10-20/month.
- **[02-data-model.md](./02-data-model.md)** — Every Payload collection, every field, every relationship, every permission rule. This is the schema.
- **[03-sitemap-routing.md](./03-sitemap-routing.md)** — Every URL, every route, every 301 redirect (Phase 2).

### Design

- **[04-design-system.md](./04-design-system.md)** — Typography (Barlow Condensed / Inter / JetBrains Mono), color palette (Sparta Black, Bone, Safety Orange, industrial neutrals), spacing, motion palette, all as tokens ready to drop into Tailwind config.

### Public pages

- **[pages/home.md](./pages/home.md)** — Home page with the scroll-driven truck disassembly hero.
- **[pages/truck-detail.md](./pages/truck-detail.md)** — Individual truck listing (`/trucks/[vin-slug]`). The money page — where conversion happens.
- **[pages/inventory.md](./pages/inventory.md)** — Inventory browse (`/inventory`), plus 6 category pages (`/inventory/box-trucks`, `/inventory/reefers`, etc.).
- **[pages/financing.md](./pages/financing.md)** — Financing explainer and pre-qual form.
- **[pages/fleet.md](./pages/fleet.md)** — Fleet & bulk sourcing.
- **[pages/about.md](./pages/about.md)** — About Sparta Motors.
- **[pages/contact.md](./pages/contact.md)** — Contact page with full-width map.

### Admin (Payload)

- **[admin/workflow.md](./admin/workflow.md)** — The draft → review → publish workflow. Employee vs. admin permissions.
- **[admin/dashboard.md](./admin/dashboard.md)** — Admin home screen: stats, activity feed, quick actions.
- **[admin/truck-form.md](./admin/truck-form.md)** — The employee truck-creation experience. Mobile-first.
- **[admin/draft-review.md](./admin/draft-review.md)** — Admin's draft approval interface.
- **[admin/leads-inbox.md](./admin/leads-inbox.md)** — Leads management and filtering.

### Integrations

- **[integrations/leaflet-map.md](./integrations/leaflet-map.md)** — Leaflet + OpenStreetMap CartoDB Positron. Used on Contact, About, and the footer.
- **[integrations/smtp-email.md](./integrations/smtp-email.md)** — Lead notification pipeline via the business email's SMTP.
- **[integrations/hero-video.md](./integrations/hero-video.md)** — Scroll-driven video pipeline: 240-frame image sequence → WebM → scroll-scrubbed.

### Deployment and launch

- **[05-deployment.md](./05-deployment.md)** — VPS provisioning, DNS, SSL, Cloudflare, backups, environment variables.
- **[06-phase2-architecture.md](./06-phase2-architecture.md)** — How Sparta Parts and B2B/fleet features integrate later without a rewrite.
- **[07-qa-checklist.md](./07-qa-checklist.md)** — Pre-launch testing across devices, browsers, and workflows.
- **[08-launch-handoff.md](./08-launch-handoff.md)** — DNS cutover, admin training, employee training, first-week monitoring.

---

## Companion assets

- **`/mockups/`** — Standalone HTML mockups produced during the design phase. Every design decision in this brief has a corresponding visual in the mockups folder. Open them in a browser to see the actual design intent.
  - `sparta-scroll-hero-v2.html` — Home page
  - `sparta-truck-detail.html` — Truck detail page
  - `sparta-inventory.html` — Inventory (with Leaflet map)
  - `sparta-content-pages.html` — Financing, Fleet, About, Contact (bundled)
  - `sparta-admin.html` — Admin dashboard (4 screens with working navigation)
  - `sparta-mobile.html` — Mobile mockups (Home, Truck Detail, Admin form)

- **`sparta-motors-save-state.md`** — The original design-phase save-state document. Kept for historical reference. This build brief supersedes it.

---

## Working style, briefly

The design phase used a Delegation & Description model: the project manager described the intent, Claude proposed options with tradeoffs, the project manager selected, and Claude executed. That same model should continue in Claude Code — Claude Code proposes an implementation approach, the project manager reviews, then Claude Code builds.

The project manager is not a developer. Claude Code should not assume familiarity with framework specifics, deployment jargon, or infrastructure concepts. When a question comes up that requires developer-level context, Claude Code should explain enough for the project manager to make an informed decision, then proceed.

---

## Design phase credits

Every design decision documented here was made collaboratively between the project manager (business owner and product decisions) and Claude (architecture, design proposals, and mockup production). The design phase spanned multiple sessions across roughly two weeks and produced six full-fidelity HTML mockup files plus this brief.

The goal: hand off to Claude Code a build brief so complete that no design decisions remain to be re-litigated during build — only implementation.
