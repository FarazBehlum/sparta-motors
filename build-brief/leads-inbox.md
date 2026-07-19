# Admin — Leads Inbox

Where the admin and employees manage incoming customer inquiries.

**Mockup reference:** `/mockups/sparta-admin.html` — Screen 4 (Leads Inbox)

## Purpose

Every customer form submission becomes a Lead record. This screen is where staff:
- See new leads as they come in
- Update lead status as they contact customers
- Filter/search to find specific leads
- Export lead data for reporting

Fleet inquiries appear in a separate but similar screen (`/admin/collections/fleet-inquiries`).

## Layout

- Screen header (label + title + subtitle)
- Filter chips + search bar
- Leads table (or card list on mobile)
- Pagination

## Screen header

- Label: `◆ INBOX`
- Title: `Leads.`
- Subtitle: `All customer inquiries from truck listings, financing, and general contact. Update status as you follow up.`
- Right side: `Export CSV` (ghost button) — downloads a CSV of the currently filtered leads

## Filter chips

Below the header, above the search bar. Horizontal row of filter chips.

- Each chip: pill-shape (radius 20px), padding, mono uppercase label, count in parentheses
- Active chip: `#1A1A1A` background, Bone text
- Inactive chip: transparent background, `#1A1A1A` text, thin border

**Chips (in order):**

- `ALL (23)` — default active
- `NEW (7)` — orange dot before label to draw attention
- `CONTACTED (12)`
- `CLOSED (4)`

Clicking a chip filters the table to that status. Counts update live.

**Additional filter dropdown** (right of chips): `Source: All ▾` — dropdown to filter by source (truck-inquiry, financing-prequal, general-contact).

## Search bar

Below the chips. Full-width or right-aligned depending on layout.

- Placeholder: `Search by name, phone, email, or truck info...`
- Style: light background (`#EEECE5`), mono font
- Search debounced 300ms
- Searches across: fullName, phone, email, truckOfInterest name

## Leads table

Below the search. Table layout on desktop, card list on mobile.

### Desktop columns

| Column | Content | Notes |
|---|---|---|
| Contact | Name (Barlow Condensed 700) + phone (mono, small, gray) + email (mono, small, gray) | Truncate long emails |
| Truck | Truck name (year make model, bold) OR "General inquiry" | Click routes to truck detail admin page |
| Flags | Small badges: `FIN` (financing interested), `TRADE` (has trade-in) | Only show if truthy |
| Received | Date + relative time ("2 hrs ago") | Sort default: newest first |
| Status | Status pill | Click to change status |

**Row hover:** subtle background lightening + slight left-side orange accent bar.
**Row click:** opens the lead detail (drawer on desktop, full page on mobile).

### Status pill colors

- **NEW** — orange background, dark orange text, small orange dot before label
- **CONTACTED** — green background (`#EAF3DE`), dark green text (`#16803B`), small green dot
- **CLOSED · SOLD** — gray background, dark gray text, gray dot
- **CLOSED · LOST** — gray background, dark gray text, gray dot

### Sort

- Default: `Received` desc (newest first)
- Click column header to change sort
- Ascending/descending toggle

### Pagination

Below the table:
- Left: `Showing 1-20 of 47`
- Right: page numbers or Prev/Next

Default page size: 20. Admin can increase to 50 via URL param.

## Lead detail view

When admin clicks a lead row:

**Desktop:** slide-out drawer from right side (~500px wide)

**Mobile:** full-page overlay

**Contents:**

- Contact info at top (name, phone, email — with tel: / mailto: quick actions)
- Truck of interest (if any) with link to admin view of that truck
- Message from customer (in a card)
- Flags: financing interest, trade-in details if any
- Source (mono label): `TRUCK INQUIRY`, `FINANCING PRE-QUAL`, or `GENERAL CONTACT`
- Heard about us (if provided)
- Received timestamp
- Status dropdown (change status here)
- Internal notes textarea (visible to admin and employees, not to customer)
- Save button (only enabled if changes were made)

## Bulk actions

Checkbox column on the far left of each row (desktop). Select multiple → action bar appears at top:

- `Mark selected as Contacted`
- `Export selected as CSV`
- `Delete selected` (admin only, confirmation required)

Bulk actions are Phase 1 nice-to-have, not blockers.

## Mobile behavior

- Chips scroll horizontally if they don't fit
- Table becomes a card list — each lead is a card with all key info stacked
- Cards: contact name (Barlow Condensed 700), then truck info, then meta row (received + status)
- Tapping a card opens the full-page lead detail view

## Notifications integration

New leads arrive here in real-time (or near real-time — Phase 1 might do polling every 30s). See `integrations/smtp-email.md` for the email side of notifications.

## Data requirements

- Leads collection with filter + sort + pagination
- Truck records for the "truck of interest" join
- Counts per status (for chip badges)

## Fleet inquiries — parallel screen

Fleet inquiries live at `/admin/collections/fleet-inquiries` and use the same UI pattern with different columns:

- Company (company name + contact name)
- Fleet Size (badge: 1-3, 4-10, 10+)
- Timeline (badge: ASAP, 1-3mo, 3-6mo, ongoing)
- Received
- Status (with fleet-specific statuses: new, sourcing, presented, closed-sold, closed-lost)

Everything else works the same as regular leads.

## What good implementation looks like

- New leads appear quickly (max 30 seconds after form submission)
- Status changes are fast — clicking a status pill in the drawer updates instantly
- Search returns results fast even at 500+ leads
- Filter chips make sense at a glance
- CSV export includes all fields — usable for spreadsheet or CRM import
- Mobile experience is fully functional (admin can triage leads from their phone in a pinch)
- The `FIN` and `TRADE` flags help staff prioritize hot leads

## Phase 1.5 enhancements (post-launch)

- Auto-assignment of leads to employees (round-robin or by expertise)
- Response time tracking (how long between lead arrival and first status change)
- Weekly digest email to admin summarizing lead activity
- Duplicate detection (same email/phone submitting multiple leads within a day)
- CRM sync (HubSpot, Zoho, etc.) via webhook or scheduled export
