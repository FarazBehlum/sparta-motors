# 01 — Tech Stack

The stack was chosen with three requirements in mind:

1. **Phase 1** must be lead-generation focused, mobile-first, and buildable by a single AI-assisted developer in a reasonable time.
2. **Phase 2** parts and checkout must integrate without rewriting the foundation.
3. **Ongoing costs** must stay under $25/month total, since Sparta is a small business without a dedicated web budget.

The chosen stack meets all three.

## The stack

| Layer | Choice | Rationale |
|---|---|---|
| **Frontend framework** | Next.js (App Router) | Modern React with server-side rendering for SEO, image optimization, incremental static regeneration for inventory pages, and full-stack routing. Well-documented and Claude Code has strong familiarity. |
| **CMS / Backend** | Payload CMS (self-hosted, TypeScript) | Open-source, self-hosted headless CMS with native draft/publish workflows, role-based access control, custom collections defined in TypeScript, and a mobile-responsive admin panel out of the box. |
| **Database** | PostgreSQL (via Payload) | Payload supports Postgres natively. Handles Phase 1 easily and scales to Phase 2 e-commerce without a change. |
| **Hosting** | Single small VPS (Hetzner CX22 or DigitalOcean $6 droplet) | Both frontend and backend run on the same box. Under $10/month. See "VPS provider decision" below. |
| **CDN + DNS + SSL** | Cloudflare (free tier) | Free CDN, free SSL via Cloudflare Origin certificates, free DDoS protection, easy DNS management, page rules for 301 redirects (needed for Phase 2 sparta-parts.com redirect). |
| **Email delivery** | SMTP through the existing Sparta business email | Zero added cost. Low volume (~20 leads per day at peak). If deliverability becomes a problem, swap to a service like Resend later — one-file change. |
| **File / photo storage** | Local disk on the VPS, served through Next.js image optimization | Simplest option. Sparta will not accumulate enough photos in Phase 1 to need object storage. Phase 2 may migrate to S3-compatible storage (Cloudflare R2 is a free option). |
| **Video (scroll hero)** | WebM served as a static asset, scrubbed via scroll | See `integrations/hero-video.md` for the ffmpeg pipeline that converts the 240-frame PNG sequence into a single ~500KB video. |
| **Maps** | Leaflet.js + OpenStreetMap CartoDB Positron tiles | Free forever, no API key, no billing account. See `integrations/leaflet-map.md`. |
| **Analytics** | Deferred to Phase 1.5 | Add after launch when there's real traffic to measure. Likely candidate: Plausible or Umami (both privacy-friendly and cheap). |

**Estimated monthly total: $10-15.**

## VPS provider decision

Two options are equally good for Phase 1. Pick one at build time based on preference.

**Hetzner CX22** — €4.51/month (~$5 USD). 2 vCPU, 4GB RAM, 40GB SSD, 20TB transfer. Frankfurt or Ashburn (US East) data centers available. Best cost-to-power ratio.

**DigitalOcean Basic Droplet ($6)** — 1 vCPU, 1GB RAM, 25GB SSD, 1TB transfer. NYC, San Francisco, or Toronto. Slightly worse specs than Hetzner but more familiar interface, and the community tutorials are extensive.

**Recommendation: Hetzner** for the better specs at similar price. If any concern about invoicing (Hetzner invoices in Euros), DigitalOcean is a fine alternative.

Either provider supports the deployment approach in `05-deployment.md`.

## Framework versions

Pin these at build time and document them in the project README:

- **Next.js:** Latest stable at build time (14+ preferred for App Router maturity)
- **React:** Whatever ships with the Next.js version
- **Payload:** Latest stable (3.x preferred — it uses Next.js App Router natively, so Payload admin and public site share the same Next.js runtime)
- **Node.js:** LTS at build time
- **PostgreSQL:** 15 or newer
- **TypeScript:** Latest stable (strict mode enabled)

Payload 3.x is a strong choice specifically because it embeds inside Next.js — one process, one deployment, one Node runtime. This keeps the VPS lightweight.

## Package choices

- **Styling:** Tailwind CSS (used throughout the mockups; class-based approach maps cleanly to component patterns)
- **Animation:** Framer Motion for entrance animations, fade-ins, and stagger effects. See `04-design-system.md` for the full motion palette.
- **Form handling:** react-hook-form + Zod for validation
- **Icons:** lucide-react (matches the visual style of the icons used in mockups)
- **Fonts:** Google Fonts — Barlow Condensed, Inter, JetBrains Mono. Self-hosted via `next/font` for performance.
- **Maps:** leaflet + react-leaflet
- **Video scroll scrubbing:** GSAP ScrollTrigger (or a lightweight custom hook — see `integrations/hero-video.md` for the tradeoff)
- **Email transport:** nodemailer

## Alternatives considered and rejected

**WordPress + WooCommerce (current stack).** The reason we're rebuilding. Plugin sprawl, dated admin UX, mobile admin is poor, and the design ceiling is limited by theme constraints. Not chosen.

**Shopify.** Would fight the custom truck listing fields and requires a monthly plan floor that Sparta's low-volume model can't justify. Also, Sparta doesn't need most of Shopify's e-commerce machinery for Phase 1 (no truck checkout) and Phase 2 parts checkout is simpler than Shopify's out-of-box flows. Not chosen.

**Squarespace / Wix / Webflow.** None handle the employee draft-and-approve workflow. Squarespace and Wix have essentially no roles/permissions system for content contributors. Webflow's CMS is more capable but still doesn't support the review-before-publish flow natively. Not chosen.

**Sanity or Contentful as CMS.** Cloud-based CMS options with better DX than WordPress. Ruled out for two reasons: (1) Phase 2 checkout adds friction (either bolt on a separate e-commerce backend or fight the CMS to do something it wasn't designed for), and (2) both have pricing tiers that could bite Sparta at scale if truck listings or leads volume grows. Payload gives us the same DX with zero recurring platform cost. Not chosen.

**Strapi as CMS.** Comparable to Payload. Payload wins on two points: (a) it's built on Next.js natively (single deployment) and (b) its admin UI is more polished out of the box. Strapi is a fine alternative if Payload has problems, but Payload is the first choice.

**Static site generators (Astro, Eleventy).** Great for the public site but don't handle the admin panel + workflow requirements. Would require gluing on a separate CMS. Not chosen for the additional complexity.

## Why Payload specifically

Payload deserves extra explanation because it's the most opinionated choice in the stack.

**What it gives us:**

- **Draft/publish natively.** Payload has draft/published states built into every collection with versioning. No plugin required. Draft, submit, admin reviews, admin publishes — this is Payload's default mode.
- **Custom collections in TypeScript.** The Truck collection with its 16+ fields is defined in a single TS file. Fields are typed, validated, and generate an admin UI automatically.
- **Role-based access.** The Admin vs. Employee permission split is defined in field-level `access` functions. No plugin required.
- **Mobile-responsive admin.** The Payload admin panel works well on phones out of the box. Some CSS tuning for the truck form is documented in `admin/truck-form.md`, but the foundation is solid.
- **Media handling.** Photo uploads, image resizing (multiple sizes for responsive images), and file storage are built in.
- **Self-hosted.** No vendor lock-in, no per-seat pricing, no surprise bills.
- **Built on Next.js in v3.** One deployment, one Node process, shared session and auth.

**What we work around:**

- **Reporting/analytics.** Payload doesn't have a great built-in dashboard for business analytics. Phase 1.5 will address this (see `06-phase2-architecture.md`).
- **Search.** Payload's built-in search is basic. For Phase 1 with 20 truck listings it's more than enough. Phase 2 parts with hundreds of SKUs may need a proper search index (Meilisearch or Algolia) — deferred.

## Development environment

The project should support:

- **Local development** on macOS, Linux, or Windows (WSL2). Node LTS + Postgres running locally. `npm run dev` starts both the public site and admin at once (Payload 3.x behavior).
- **Environment variables** in `.env.local` for local dev, and set on the VPS for production. Documented in `05-deployment.md`.
- **Type safety** end-to-end. Payload generates TypeScript types for every collection. Public-site pages import those types and get autocomplete + type checking on truck data.

## Costs summary

| Item | Cost |
|---|---|
| VPS (Hetzner CX22 or DO $6) | $5-6/month |
| Domain (sparta-motors.com already owned) | ~$12/year existing |
| Cloudflare (CDN, DNS, SSL, page rules) | $0 (free tier) |
| Fonts (Google Fonts) | $0 |
| Map tiles (CartoDB via OpenStreetMap) | $0 |
| Email (SMTP through existing business email) | $0 |
| Backups (VPS provider snapshot + weekly rsync to another location) | ~$1/month |
| **Total** | **~$6-8/month** |

If Phase 1.5 adds analytics (Plausible: $9/month for Sparta's expected traffic), the total goes to ~$15-17/month. Still well under budget.
