# Sparta Motors — Website Rebuild

### → **[View the live site: sparta-motors.com](https://sparta-motors.com)** ←

A ground-up replacement for the website of a used commercial truck dealer in Spartanburg, SC. The old site was a dated WordPress/WooCommerce build with phone-quality photos and no real mobile experience. This repo holds the design brief that specified the replacement, the Next.js + Payload CMS application that implements it, and the runbook that deploys it.

**Status: live in production**, serving [sparta-motors.com](https://sparta-motors.com) since August 2026.

Worth a look if you are browsing the code: the [home page](https://sparta-motors.com), the [inventory browser](https://sparta-motors.com/inventory) and its filters, and any truck from that grid for the detail page — gallery, lightbox, specs, and inquiry form. Individual truck URLs are not linked here on purpose: sold listings retire themselves after seven days, so any link to one would eventually rot.

---

## Table of contents

- [What shipped](#what-shipped)
- [Tech stack](#tech-stack)
- [Repo map](#repo-map)
- [How this was built](#how-this-was-built)
- [Engineering decisions worth reading](#engineering-decisions-worth-reading)
- [Infrastructure](#infrastructure)
- [Testing](#testing)
- [Running it locally](#running-it-locally)
- [Deploying](#deploying)
- [What was deliberately not built](#what-was-deliberately-not-built)

---

## What shipped

### Public site

| Route | What it does |
| --- | --- |
| `/` | Home: hero photo band, animated driving truck, live inventory count, category grid, lead capture |
| `/inventory` | Browse and filter all published trucks |
| `/inventory/[category]` | One page per body type, with its own SEO copy |
| `/trucks/[slug]` | Truck detail: gallery, lightbox, specs, inspection notes, walkaround video, inquiry form |
| `/financing` | The lender's credit application, embedded, plus a lighter "talk first" contact path |
| `/about` | Company story and business details |
| `/contact` | Contact form, hours, and a map |
| `/parts` | Informational page linking out to the separate Sparta Parts storefront |

Nine truck categories: box trucks, reefers, landscapers, 26ft box trucks, dump trucks, tow trucks, tank trucks, garbage trucks, and specialty trucks.

Supporting behaviour across the site:

- **Structured data and SEO** — canonical URLs on every page, generated `robots.txt` and `sitemap.xml`, `AutoDealer` and `Product` JSON-LD, dynamic Open Graph images.
- **Search-ranking preservation** — more than 30 legacy WordPress and WooCommerce URLs (`/shop`, `/product/*`, `/product-category/*`, `/make/*`, `/styles/*`, and the rest) 301-redirect to their new equivalents, so the rebuild inherited the old site's rankings rather than starting over.
- **Lead handling** — every inquiry form writes a Lead record and fires an SMTP notification. Rate limited to 5 submissions per 10 minutes per IP.
- **Accessibility** — hero and category-tile text contrast is measured against the actual background pixels by an automated test, not eyeballed.

### Admin (Payload CMS)

Built so a staff member can list a truck from their phone, standing at the lot:

- **Custom dashboard** — inventory and lead counts, plus a 7-day leads bar chart.
- **Draft review queue** — employees create listings as drafts; an admin publishes, edits, sends back, or deletes them from a dedicated `/admin/draft-review` screen.
- **Multi-photo upload** — drag several photos at once, reorder them, first one becomes the lead image.
- **Sale states** — trucks move available → pending → sold. Sold trucks stay publicly visible for 7 days (a stale Google result is still a live buyer) and then retire themselves automatically.
- **Inspection records** — an optional per-area rating and notes block that only renders publicly when it has been filled in, so nothing is fabricated.
- **CSV lead export** — staff-only, Excel-compatible, filterable by status and date range.
- **Branded theme** — the admin is styled to match the site rather than left as stock Payload.

---

## Tech stack

| Layer | Choice | Notes |
| --- | --- | --- |
| Framework | Next.js 16 (App Router) | React 19 |
| CMS | Payload CMS 3.86, self-hosted | Collections defined in TypeScript, in this repo |
| Database | PostgreSQL | Schema managed by committed migrations |
| Styling | Tailwind CSS 4 | |
| Motion | Framer Motion | Used only for the hero truck |
| Forms | React Hook Form + Zod | |
| Email | Nodemailer over SMTP | Retries 3×, logs to console when unconfigured |
| Images | Sharp | |
| Hosting | Hetzner VPS + nginx + PM2, Cloudflare in front | |
| Tests | Vitest (unit/integration) + Playwright (e2e) | |

Fonts are Barlow Condensed for headings, Inter for body, and JetBrains Mono for specs, VINs, and numbers — self-hosted via `next/font`. The palette is Sparta Black `#1A1A1A`, Bone `#F5F3F0`, and Safety Orange `#F26B0F`.

---

## Repo map

```
build-brief/     25 markdown docs — the design phase output that specified the build
src/
  app/(frontend)/  public pages
  app/(payload)/   admin panel and API routes
  collections/     Trucks, Leads, Media, Pages, Users, FleetInquiries
  globals/         site Settings
  components/      46 components across home/, inventory/, truck/, nav/, admin/, content/, map/
  lib/             queries, formatting, structured data, rate limiting, email, VIN handling
  migrations/      three committed Postgres migrations
  seed/            bootstrap seed (admin user, Settings, pages)
  proxy.ts         Next 16 middleware
deploy/          production runbook, nginx config, PM2 config, backup script
tests/           integration and end-to-end specs
scripts/         brand asset and hero frame build scripts
```

Roughly 13,000 lines of TypeScript across the application, and about 5,000 lines of design brief behind it.

---

## How this was built

The design phase came first and produced `/build-brief/` — 25 docs covering the business context, tech stack, data model, sitemap, design system, one spec per page, one per admin screen, plus deployment and QA checklists. The build then followed those specs rather than improvising, and the brief was corrected in place whenever the code proved it wrong.

The working model throughout: the project manager described intent, Claude proposed options with tradeoffs, the project manager selected, Claude executed.

### Timeline

**July 2026 — foundation and first build**

Payload backend scaffolded, then the frontend built in an agreed order: global chrome and design-system components → inventory browse and truck detail → home page → content pages → admin polish and lead email → QA and SEO hardening. The original home page used a scroll-scrubbed canvas hero built from 160 WebP frames, because the source video only had a couple of keyframes and seeking it looked frozen.

Mid-July the Fleet lead-gen feature was cut and replaced with an informational Parts section pointing at the separate Sparta storefront — the fleet data was preserved rather than dropped, in case Phase 3 revives it.

Late July: truck condition ratings were removed from the public site at the client's request (no truck should read as "bad"), walkaround video support was added, the demo inventory was wiped in preparation for real listings, and the real launch blocker was found and fixed — there were no database migrations at all, so a fresh production database would have started with zero tables. That work also produced the deploy runbook in `deploy/`.

**August 2026 — the hero rewrite, hardening, and launch**

The scroll hero was cut. It fought the scroll, delayed the content, and loaded slowly, so it was replaced with a static photo band and a small animated SVG truck. The home page dropped from about 6.9 MB to under 700 KB.

Then a security and SEO pass ahead of cutover: closing fields that were leaking through the public API, hardening the admin session, escaping CSV formula injection in the lead export, fixing a rate limiter that could be bypassed by rotating a request header, and adding the legacy WooCommerce redirects.

The site went live around 16 August. Everything after that has been production work against a real site: an iPhone admin upload bug, real photography replacing placeholders, three new truck categories, the lender's credit application, and layout work for large monitors.

---

## Engineering decisions worth reading

A few choices in here were not obvious, and the reasoning matters more than the diff.

**The map costs nothing.** The brief specified Leaflet and explicitly rejected Google Maps over the API key, billing account, and per-load pricing. That rejection was aimed at the Maps *JavaScript* API — the plain **embed** needs no key, no cloud project, no card on file, and has no usage cap. When the client said Google Maps was more familiar to their customers, Leaflet came out entirely: two dependencies, a component, and 87 lines of CSS deleted. The embed is lazy-mounted on scroll because it pulls about a megabyte of Google's JavaScript.

**Sold trucks fail open.** A sold truck stays public for seven days, then redirects to `/inventory` rather than 404ing — a stale search result is still a real buyer, and a redirect keeps them. If the sold timestamp is missing or unparseable the truck stays *visible*, deliberately, so a data problem can never silently erase inventory.

**The admin had to work on a phone, and `100vh` broke that.** Staff photograph trucks at the lot and upload from an iPhone. Payload's upload drawer is `position: fixed; height: 100vh`, and on iOS Safari `100vh` is the toolbar-*hidden* height — so the drawer laid out taller than the visible viewport and the Save button rendered underneath Safari's toolbar, with no way to scroll to it. The fix is one line of CSS overriding it to `100dvh`. Worth noting: headless browsers cannot reproduce this, because Playwright's fixed viewport makes `dvh` and `vh` identical. It took a real device to see it and a real device to confirm the fix.

**Contrast is measured, not judged.** The hero text sits over a photograph of white trucks at sunset on wet tarmac, and the scrim that made it readable had to change direction responsively — vertical on mobile, horizontal on desktop — because `bg-cover` crops to the photo's centre and a left-to-right fade protects nothing when the copy spans full width. Rather than trust the eye, `tests/e2e/hero-contrast.e2e.spec.ts` screenshots the running page, finds the brightest pixel under each glyph, and computes the actual contrast ratio.

**Rate limiting is in-process on purpose.** The limiter is an in-memory fixed window, which is correct for a single-VPS Phase 1 and cheaper than adding Redis. The tradeoff is documented where it matters: PM2 must not run in cluster mode, or each worker would keep its own counter.

**The financing form is the lender's, not ours.** The embedded credit application collects Social Security numbers. It posts directly from the iframe to the form provider and never touches this server, which means those submissions deliberately do not become Lead records. The section copy says so plainly, so the third-party branding does not read as a bug. A shorter first-party contact form was kept alongside it for anyone who would rather talk first.

---

## Infrastructure

A single small Hetzner VPS running Ubuntu, with nginx in front of the Next.js process under PM2, PostgreSQL on the same box, and Cloudflare handling DNS and edge caching. Running on one server was a deliberate constraint — the whole project was built to a tight monthly hosting budget, and everything from the in-process rate limiter to compiling the site on the server follows from that.

Two consequences worth knowing:

- **The origin sits in Europe, not the US.** Hetzner's US regions only offer their pricier instance lines, and the cost-optimized line this runs on is Germany/Finland only. The tradeoff is roughly 100ms extra latency on requests that actually reach the origin — filtered inventory browsing and `/admin`. Cloudflare edge-caches the statically rendered pages, so ordinary visitors landing on home, about, contact, and category pages are unaffected.
- **RAM is sized for building, not serving.** The site compiles on the server, which needs meaningfully more memory than serving it does. A smaller box runs the site fine but can fail mid-build.

`deploy/README.md` is the full runbook: server sizing and current pricing, SSH hardening, firewall and fail2ban, Postgres, nginx, PM2, TLS, nightly backups with a tested restore, launch-day steps, and rollback.

---

## Testing

```bash
npm run test:int    # Vitest — 12 tests
npm run test:e2e    # Playwright
npm run lint
```

Integration tests cover the API surface and the sold-visibility rules, including the exact millisecond boundary of the 7-day grace period and every fail-open case. End-to-end specs cover the admin dashboard, public navigation, hero contrast, and sticky-element behaviour on truck pages.

---

## Running it locally

Requires Node 18.20+ (20.9+ recommended; production runs 22 LTS) and a local PostgreSQL database.

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URL and the rest
npm run seed              # creates the admin user, Settings, and pages
npm run dev
```

The site is at `http://localhost:3000`, the admin at `/admin`.

Local development uses Payload's schema push, not migrations — so `npm run migrate` against a development database will fail with "relation already exists", which is expected. Migrations exist for fresh and production databases. Any change to a collection needs `npm run migrate:create <name>`, and the generated file **must** be committed or production will break on the next deploy.

---

## Deploying

`deploy/README.md` is the authoritative runbook, from a bare Ubuntu box to a running site. The routine update path, once the server exists:

```bash
git pull
npm ci
NODE_ENV=production npm run migrate
npm run build
pm2 reload sparta
```

`NODE_ENV=production` is load-bearing in the PM2 config: without it, Payload's schema push could alter the live database instead of leaving it to migrations.

---

## What was deliberately not built

**Phase 1.5** — analytics dashboard, in-admin notification bell, bulk lead actions, response-time tracking, featured-trucks UI polish, full-text search improvements, customer accounts.

**Phase 2 (architected for, not scaffolded)** — consolidating Sparta Parts into `/parts` with direct-purchase checkout and 301s from the existing parts domain. The `/parts/*` URL space is reserved for it.

**Phase 3 (architected for)** — B2B and fleet accounts, bulk pricing, quote generation, CRM integration.

**Facebook Marketplace sync** — researched and rejected. True two-way sync is impossible: there is no public API to create Marketplace listings or read them back. The only viable direction is a one-way vehicle catalog feed with about a day of lag, and third-party auto-posters carry ban risk. Parked rather than built.

---

## Credits

Built collaboratively: the project manager owned business decisions and direction, Claude handled architecture, design proposals, and implementation. Every decision of consequence is documented — the reasoning in `/build-brief/`, the tradeoffs in the commit history.
