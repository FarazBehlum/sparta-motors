# Admin — Workflow and Permissions

The Payload admin is where all backend work happens. This doc defines the workflow rules and permission model. Individual screen designs are in the other docs in this folder.

## Roles

Two roles: **Admin** and **Employee**.

### Admin (one person — the project manager)

Full access to everything:
- Publish, unpublish, sold-out, archive any truck
- Edit any field on any truck at any time
- Delete trucks (soft delete; can be restored)
- Manage users (create employees, disable employees, reset passwords)
- Edit page content (Pages global) and site settings (Settings global)
- View and update all leads and fleet inquiries
- Delete leads (rare — usually just archive)

### Employees (5-10 people)

Restricted access:
- Create new truck drafts
- Upload photos to trucks they created
- Edit their own drafts
- Submit their drafts for admin review
- View published trucks
- View all leads and update lead statuses (contacted, closed, etc.)
- Cannot publish, unpublish, or delete trucks
- Cannot see other employees' drafts (only their own + everything published)
- Cannot manage users
- Cannot edit page content or settings

## Truck lifecycle

A truck moves through statuses in this order:

**draft → pending-review → published → sold → archived**

Or with rework:

**draft → pending-review → draft (sent back by admin) → pending-review → published**

### Status meanings

- **draft** — Employee is still working on it. Not visible to public. Employee can edit freely.
- **pending-review** — Employee has submitted for admin review. Employee cannot edit (locked). Admin can edit or send back.
- **published** — Live on the public site. Admin can edit; employee can view but not edit.
- **sold** — Marked as sold. Still visible in admin as historical record. Hidden from public inventory but individual truck URL still resolves (with a "SOLD" overlay) for one week, then 404s.
- **archived** — Fully hidden from public. Used for withdrawn listings or old records.

### Status transition rules

| From | To | Who can trigger |
|---|---|---|
| draft | pending-review | Employee (Submit for Review button) |
| pending-review | published | Admin (Publish button in Draft Review) |
| pending-review | draft | Admin (Send Back button — leaves a note for employee) |
| published | sold | Admin (Mark as Sold button on truck detail admin) |
| published | archived | Admin (Archive button) |
| sold | archived | Admin (Auto after 30 days, or manual) |
| any | draft | Admin (Save as Draft — for correcting mistakes) |

### What happens on each transition

- **draft → pending-review:**
  - Truck is locked for the employee (can only be edited by admin or reverted to draft)
  - Admin gets an email notification: "New draft ready for review: [truck info]"
  - Truck appears in admin's Draft Review queue
  - `pending-review` count badge on the sidebar increments

- **pending-review → published:**
  - Truck becomes visible on public site
  - `publishedAt` timestamp is set
  - Slug becomes locked (URL is now stable and could be indexed by Google)
  - Employee gets an email/notification: "Your listing for [truck info] is now live."

- **pending-review → draft (sent back):**
  - Admin's note is stored in `reviewNote` field
  - Employee gets a notification: "Your draft needs changes — see admin notes."
  - Employee can now edit again, then resubmit

- **published → sold:**
  - Truck removed from public inventory listing
  - Individual truck URL still resolves for 7 days with a "SOLD" overlay (see below)
  - After 7 days, redirects to `/inventory/[category]` (301) or 404 if category unclear
  - `soldAt` timestamp set

## Field-level permissions

Some fields on the Truck collection have restricted access even within the record:

- **`status`** — Only admin can set to `published`, `sold`, or `archived`. Employees can set to `draft` or `pending-review`.
- **`assignedEmployee`** — Set automatically on create; not editable by employees. Admin can reassign (rare).
- **`stockNumber`** — Auto-generated on create; never editable.
- **`slug`** — Auto-generated on create; admin can edit if needed (rare).
- **`reviewNote`** — Only admin can write. Employees can only read (on their own drafts).

## "SOLD" overlay behavior

When a truck is marked as sold, its individual detail page continues to work for 7 days but with an overlay:

- Full-page-width orange banner at the top: "SOLD — This truck has been sold. See our current inventory or contact us for similar options."
- The lead form is replaced with an "Interested in a similar truck?" message linking to the category page
- Photos and specs still visible so returning visitors can see what was there

After 7 days:
- URL returns 301 redirect to `/inventory/[category]`
- Truck effectively removed from crawl but historical structured data is preserved in admin

## Employee submission flow

1. Employee logs in on their phone at the lot
2. Taps "+ New Truck" from the dashboard
3. Fills out the truck form (see `admin/truck-form.md`) across 5 sections
4. Uploads photos from phone camera or camera roll
5. Optionally attaches a spec sheet PDF
6. Taps "Save as draft" if not done, or "Submit for Review" if ready
7. If submitted: truck disappears from their draft list, appears in admin's review queue
8. Employee gets notification when admin publishes or sends back

## Admin review flow

1. Admin logs in on desktop (or phone)
2. Dashboard shows "3 drafts to review" badge
3. Clicks "Review Drafts" quick action
4. Sees the review queue — pending drafts in submission order (oldest first)
5. Opens a draft to review it
6. Sees a live preview of what the listing will look like when published + a decision panel with edit access to all fields + an automated checklist (all required fields, VIN valid, photos uploaded)
7. Actions:
   - **Publish** — instant publish, no further steps
   - **Edit before publishing** — enters edit mode, admin can change anything, then publish
   - **Send back with changes** — writes a note to the employee, transitions back to `draft`

## Lead workflow

Leads have a simpler lifecycle:

**new → contacted → closed-sold** *(or)* **closed-lost**

- **new** — Just came in. Orange NEW badge. On the admin's radar.
- **contacted** — Someone (admin or employee) has reached out to the customer. Green CONTACTED badge.
- **closed-sold** — Lead converted to a sale. Gray badge with CLOSED · SOLD label.
- **closed-lost** — Lead didn't convert. Gray badge with CLOSED · LOST.

Fleet inquiries have an additional state:

**new → sourcing → presented → closed-sold** *(or)* **closed-lost**

- **sourcing** — Sparta is actively looking for a truck matching this inquiry.
- **presented** — A matched truck has been offered to the customer.

Any employee can update lead status. Anyone updating a status can also add an internal note that's stored on the lead record.

## Notifications

Notifications happen via email. In-admin bell/notification UI is a Phase 1.5 addition.

- **Lead submitted:** Email to business inbox (admin) with all lead details
- **Fleet inquiry submitted:** Email to business inbox, with prominent "FLEET" flag
- **Draft submitted for review:** Email to business inbox with truck info and link to review it
- **Draft published:** Email to the employee who submitted
- **Draft sent back:** Email to the employee with the admin's note

Emails are delivered via SMTP through the business email. See `integrations/smtp-email.md`.

## Session management

- Admin sessions last 7 days by default
- Employee sessions last 14 days (they log in less often, keeping them logged in reduces friction)
- Logout is available from the top-right of every admin page
- Password reset requires admin action for employees (self-service password reset can be added later if requested)

## Audit trail

Payload logs field-level changes to every collection. This means:
- Who changed what and when is queryable
- If an employee accidentally edits the wrong field, admin can see the history
- Not shown in UI in Phase 1 — accessible via database if needed for troubleshooting

## What good implementation looks like

- The workflow feels natural — employee never wonders "what happens if I click this button"
- Admin's queue prioritizes oldest drafts first
- Notifications arrive within seconds of the triggering action
- No one accidentally publishes or deletes something
- The "SOLD" state is graceful — customers who bookmark a truck URL don't get a hostile 404
