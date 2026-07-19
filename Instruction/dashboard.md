# Admin — Dashboard Screen

The admin home page. What the admin (or employee) sees after logging in.

**Mockup reference:** `/mockups/sparta-admin.html` — Screen 1 (Dashboard)

## Overview

Two variants:

- **Admin dashboard** — full stats, all leads, all drafts, activity feed
- **Employee dashboard** — reduced scope, focused on their own work

Both use the same layout but with different data sources.

## Layout

Top-level structure inside the admin panel:

- Top bar (dark, brand + admin tag + user + logout) — persistent across all admin screens
- Left sidebar (dark, navigation with count badges) — persistent
- Main content area (light, changes per screen)

For dashboard specifically, the main content area contains:

1. Screen header (welcome + context + action buttons)
2. Stat cards (4-across on desktop)
3. Two-column split: Recent Activity (left) + Quick Actions (right)

## Screen header

- Label (mono orange): `◆ WELCOME BACK`
- Title (Barlow Condensed 800, ~42px): `Dashboard.`
- Subtitle: Dynamic context. Examples:
  - "Wednesday, July 17 · 3 drafts to review, 4 new leads since yesterday."
  - "Monday, August 4 · All caught up."
  - Employee variant: "You have 2 drafts in progress, 1 waiting for admin review."

**Header action buttons** (right side):

- **Export report** (ghost button) — placeholder for Phase 1.5 analytics; can just download a CSV of current leads for now
- **+ New Truck** (primary orange button) — opens the truck form directly (admin can add trucks without going through employee review workflow)

## Stat cards (4-across grid)

Each card: white background, thin border, 10px rounded, padding 22px 24px. Position `relative` so a small "VIEW →" link can sit in the top-right.

**Card design:**

- Small mono label (top-left)
- Big Barlow Condensed number (below label)
- Small change indicator below (mono, colored)
- Small "VIEW →" link (top-right, mono orange)

**The 4 stats (admin view):**

| Label | Value | Change | Link target |
|---|---|---|---|
| NEW LEADS | count of leads with status `new` | ↑ X since yesterday (or ↓ or —) | `/admin/collections/leads?status=new` |
| DRAFTS TO REVIEW | count of trucks with status `pending-review` | Oldest: X days ago | `/admin/review-queue` |
| PUBLISHED TRUCKS | count of `published` trucks | ↑ X this week | `/admin/collections/trucks?status=published` |
| FLEET INQUIRIES | count of fleet inquiries this week | Total: X | `/admin/collections/fleet-inquiries` |

The NEW LEADS value uses the "hot" color (orange) for emphasis. Others are standard dark.

**Employee view stats** (if we build this variant later):
- MY DRAFTS — count of drafts I've created
- PENDING REVIEW — my drafts submitted, awaiting admin
- PUBLISHED BY ME — my drafts that got published
- NEW LEADS — same as admin (employees can see and act on leads too)

## Two-column split: Activity + Quick Actions

Below the stats, a two-column grid (1.5fr / 1fr on desktop, single column on mobile).

### Left column — Recent Activity panel

Panel style:
- White background, thin border, 10px rounded, padding 24px 26px
- Header row: title on left, "VIEW ALL →" link on right, 2px dark bottom border

**Activity feed:**

- List of the last ~15 events, most recent first
- Each row: colored dot (indicating type) + action text + metadata

**Event types and colors:**

- **Orange dot** — Lead events (new lead, lead status change)
- **Green dot** — Publish events (draft submitted, published, sold)
- **Gray dot** — General status changes (marked sold, archived)

**Example events:**

- `New lead on 2019 Isuzu NPR-HD 16FT from Marcus Wilson` · FINANCING · JUL 17 · 11:42 AM (orange)
- `New lead on 2017 Freightliner M2 Dump from Rivera Landscaping` · TRADE-IN · JUL 17 · 10:18 AM (orange)
- `Employee Jesse M. submitted new draft: 2018 Hino 195 14FT` · DRAFT SUBMITTED · JUL 17 · 9:04 AM (green)
- `Marked 2016 Freightliner M2 Flatbed as SOLD` · STATUS CHANGE · JUL 16 · 4:30 PM (gray)
- `Lead from Rodriguez Delivery marked as CONTACTED` · STATUS CHANGE · JUL 16 · 2:15 PM (orange)
- `Published 2020 Isuzu NRR 18FT to public inventory` · PUBLISHED · JUL 16 · 11:20 AM (green)

**Truck names within event text should be bolded** (Barlow Condensed 700 uppercase) so they scan quickly.

**Data source:** A `RecentActivity` view that unions events across Trucks (status changes) and Leads (create + status change) and orders by timestamp. Payload doesn't have a built-in "activity log" — build a small custom endpoint that queries the relevant collections.

### Right column — Quick Actions panel

Same panel style as Activity.

Panel contains ~4 quick action cards. Each is a clickable rectangle:

**Card 1 — "Review drafts" (dark/hot variant):**
- Background: `#1A1A1A`
- Title: "Review drafts"
- Description: "3 employee submissions waiting for you"
- Right side: orange count badge
- Click routes to draft review queue

**Card 2 — "View new leads":**
- Background: `#EEECE5`
- Title: "View new leads"
- Description: "7 unanswered inquiries"
- Right side: orange count badge

**Card 3 — "Add a truck yourself":**
- Description: "Skip the review process"
- Click routes to truck creation form (as admin)

**Card 4 — "Export leads report":**
- Description: "Weekly CSV for spreadsheet"
- Click downloads a CSV of leads from the past week

The dark "Review drafts" variant makes it the most visually prominent action — because it's the most time-sensitive thing an admin does.

Cards without count badges just show title + description, no right-side element.

## Employee-specific quick actions

If we build the employee dashboard variant:

- "Add new truck" (dark hot variant)
- "See my drafts"
- "See new leads"
- "See published trucks"

## Data requirements

- Count of leads by status
- Count of pending-review trucks + oldest submission time
- Count of published trucks + count this week
- Count of fleet inquiries this week
- Recent activity (unions events across Trucks + Leads + FleetInquiries)

Fetch server-side. For real-time feel, could revalidate every 30 seconds on client — but for Phase 1, refresh on page reload is fine.

## Mobile behavior

Everything reflows to single column below 900px viewport width. Sidebar collapses to a hamburger menu (or slides in from left). Stats stack 2×2. Quick action cards stack vertically.

The dashboard is primarily a desktop admin experience. Employees rarely see the dashboard because they usually go straight to the truck form.

## What good implementation looks like

- The activity feed feels alive — showing recent work makes the admin feel connected to what's happening
- The "3 drafts to review" badge makes the most-important action visible without being annoying
- Stats are accurate at page load (no stale data because of aggressive caching)
- Employee variant (when built) is scoped to what they can actually act on — no confusing counts of stuff they can't see
- The dashboard loads fast — under 1s to interactive

## Phase 1.5 enhancements (post-launch)

Do not build these initially, but plan for them:

- **Weekly / monthly reports** — Charts of leads over time, conversion rates, publishing velocity, response times. This is what the project manager requested for reporting. Wire up after real data flows.
- **In-admin notification bell** — Instead of relying only on email, a bell icon in the top nav shows unread notifications
- **Personalization** — Dashboard cards remember user preferences (e.g., "always show me the sold-this-week count")
- **Full-text search bar** in the top nav — search across trucks, leads, and inquiries at once
