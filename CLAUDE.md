# CLAUDE.md — Sparta Motors Build

This file is your context for every session on this project. Read it first, then reference the build brief docs for specifics.

## What this project is

Rebuild of sparta-motors.com — a used commercial truck dealer in Spartanburg, SC. This is a **greenfield build** based on a complete design phase. Nothing to migrate code-wise; content will be manually re-entered via the CMS after launch.

**Current phase:** Phase 1 — trucks site as lead-generation only. ~20 truck listings. No e-commerce.

**Deferred:** Phase 2 (parts consolidation) and Phase 3 (B2B/fleet) are architected for but not built. Do not scaffold them.

## Your primary reference: `/build-brief/`

The build brief is the single source of truth for every design, technical, and workflow decision. Read files as needed for the task at hand. Do not re-litigate decisions documented in the brief.

**Reading order for orientation (first session):**

1. `build-brief/README.md` — table of contents
2. `build-brief/00-project-context.md` — the business
3. `build-brief/01-tech-stack.md` — Next.js + Payload CMS 3.x + PostgreSQL + small VPS
4. `build-brief/02-data-model.md` — every Payload collection and field
5. `build-brief/03-sitemap-routing.md` — every URL and route
6. `build-brief/04-design-system.md` — brand tokens, typography, colors, motion

**When building a specific page or feature**, read the corresponding doc:
- Public pages → `build-brief/pages/[page].md`
- Admin screens → `build-brief/admin/[screen].md`
- Integrations → `build-brief/integrations/[integration].md`

**When deploying** → `build-brief/05-deployment.md`
**When testing** → `build-brief/07-qa-checklist.md`

## Working with the project manager

The project manager is **not a developer**. Explain choices before you make them. Propose options with tradeoffs when there's a real decision to make. Do not assume familiarity with framework specifics, deployment jargon, or infrastructure.

Working style: **Delegation & Description**. Project manager describes intent. You propose options. Project manager selects. You execute.

## Non-negotiables

These are decided. Do not suggest changing them without a strong reason:

- **Framework:** Next.js (App Router)
- **CMS:** Payload CMS 3.x, self-hosted, TypeScript-defined collections
- **Database:** PostgreSQL
- **Styling:** Tailwind CSS
- **Fonts:** Barlow Condensed (headings), Inter (body), JetBrains Mono (specs/VINs/numbers). Loaded via `next/font`, self-hosted.
- **Colors:** Sparta Black `#1A1A1A`, Bone `#F5F3F0`, Safety Orange `#F26B0F`. Full palette in `build-brief/04-design-system.md`.
- **URL patterns:** `/parts/*` is reserved for Phase 2 — do not use it for anything else.

## Design fidelity

Design mockups exist locally (not in this repo yet). The project manager will attach relevant mockup HTML files when you're building specific pages. The build brief page specs describe layouts in enough detail that you can build without the mockup, but the mockup is the visual source of truth if there's ambiguity.

The project manager plans to add mockups + screenshots to `/mockups/` and `/screenshots/` folders after each page ships.

## Known gaps to fill during build

The business address, phone number, and nearest highway are placeholders throughout `/build-brief/` (marked `[PENDING]` or `[PLACEHOLDER]` in the docs). Real details will be provided by the project manager before the Contact and About pages are finalized. When that happens, update all references across the repo — not just the two pages — since the address/phone also appear in the Settings global, SEO meta tags, structured data, and the footer.

## Deferred until post-launch (Phase 1.5)

Do not build these initially, even if they seem natural:
- Analytics dashboard
- In-admin notification bell
- Bulk lead actions
- Response time tracking
- Featured trucks toggle (add the field to Truck collection, but the UI polish is Phase 1.5)
- Full-text search improvements
- Customer accounts / login

## Communication style

- Be concise — the project manager reads every response
- Propose before you build — options + tradeoffs, then wait for approval on non-trivial choices
- Ask when you genuinely need input; don't ask for permission on every small thing
- Explain terminal commands before running them
- Flag anything that might touch cost, security, or data loss loudly

## Cost target

Total ongoing cost for Phase 1 must stay under $25/month. Ideally under $15/month. If a decision would push over this, discuss first.

---

**Bottom line:** the build brief has done the thinking. Your job is to translate specs into working code, propose implementation approaches, and flag genuine uncertainty. When in doubt, read the relevant brief doc before asking.
