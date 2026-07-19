# Admin — Draft Review Screen

The admin's interface for reviewing and approving employee-submitted truck drafts.

**Mockup reference:** `/mockups/sparta-admin.html` — Screen 3 (Draft Review)

## Purpose

An employee has submitted a truck draft. The admin needs to:
1. See what the truck will look like when published
2. Verify all information is correct
3. Edit anything that needs fixing
4. Decide: publish, edit-and-publish, or send back to employee

## Layout

- Screen header (label + title + subtitle + "All drafts (X)" back link)
- Submission metadata bar (who submitted, when, how long ago, draft ID)
- Two-column grid:
  - **Left (larger):** Live preview of the public listing
  - **Right (~400px):** Decision panel + checklist

## Screen header

- Label: `◆ REVIEW & APPROVE`
- Title: `Draft review.`
- Subtitle: `Review the employee's submission, edit anything, then publish, request changes, or reject.`
- Right side: `← All drafts (3)` ghost button — returns to the draft queue

## Metadata bar

Below the header. Warm off-white background, rounded, padding.

- Left: `Submitted by [Employee Name] · [Date + time] · [Relative time ago, bolded]`
- Right: `Draft ID: [SM-DRAFT-XXXX]`

## Left column — Live preview

A visual preview of exactly how the truck listing will appear on the public site once published.

- Tag at top: orange bar, `◆ PREVIEW: How it will appear on the public site`
- Below tag: the truck's hero photo (from photos array)
- Body-type badge in top-left corner
- Below photo: title block with year/make/model/price
- Below title block: key specs in a 2-column layout (Mileage, Condition, VIN, Engine, Transmission, GVWR, Fuel Type, Photos count)
- Below specs: description text

The preview should closely match the public truck detail page's visual layout — not just a form data dump. This lets the admin catch issues that a form-field view wouldn't show (e.g., the description looks weird when actually rendered).

## Right column — Decision panel

Sticky at the top of the viewport (like the truck detail lead form).

**Panel structure:**

**Header:**
- Title: `Decision`
- 2px orange bottom border (instead of the standard dark border used elsewhere)

**Body:**

- Short summary: "All required fields filled. 8 photos attached. VIN validated. Ready to publish, edit further, or send back."

**Decision buttons** (stacked, full width):

1. `✓ Publish to inventory` (primary orange, 14px padding)
   - Instantly transitions status to `published`
   - Sets `publishedAt` timestamp
   - Shows brief success animation, then closes review and returns to queue

2. `✎ Edit before publishing` (ghost)
   - Opens the truck form pre-populated with the draft's data
   - Admin edits anything, then clicks Publish from the form
   - Same result as if admin had built the truck themselves

3. `↩ Send back with changes` (danger red border, transparent background)
   - Requires a note in the comment box (see below) — button is disabled until a note is written
   - On confirm: status transitions back to `draft`, note saved to `reviewNote` field, employee gets email notification

**Comment box** (below decision buttons):

- Label: `◆ NOTE TO EMPLOYEE (optional)`
- Textarea, 60-80px min height
- Placeholder: "e.g., Great listing — publishing as-is. Or: Nice work, but please retake photo #3, it's blurry..."
- If admin clicks Publish without a note, that's fine
- If admin clicks Send Back, a note is required

## Automated checklist panel

Below the decision panel (still in the right column).

Panel with title `Checklist`.

**Items:**

Each item is a row with a colored dot + text:

- **✓ All required fields filled** (green if all filled, red if missing anything with a "See section X" link)
- **✓ VIN format looks valid** (green if 17 chars valid, red if invalid)
- **✓ Photos uploaded (X)** (green if ≥1, red if 0)
- **○ Spec sheet PDF (optional)** (gray if not attached, green if attached — but no red because it's optional)

Admin uses this at a glance to know if a draft is technically publishable. If everything is green, publish is safe. If anything red, likely needs edit or send-back.

## Decision panel behavior

- **Publish** — immediate action, no confirmation needed (the two-column layout with checklist gives enough confidence)
- **Edit before publishing** — routes to the truck form in edit mode
- **Send back** — shows a confirmation modal since it undoes work

## Mobile behavior

Two-column layout collapses to single column below ~1000px viewport.

- Preview appears first
- Decision panel + checklist below
- Decision panel is not sticky on mobile (already at the bottom, user just scrolls)

## Data requirements

- Truck record with status `pending-review`
- The truck's assigned employee record (for the "Submitted by" info)

## Navigation

- Back link → draft queue (`/admin/review-queue` or similar)
- After decision → return to draft queue OR next draft in queue (nice-to-have: "Save & review next")

## What good implementation looks like

- Preview is genuinely accurate — admin isn't surprised by anything when the truck goes live
- Checklist confirms at a glance whether the draft is technically ready
- Decision is a single click when everything looks good
- The "Send back" flow is only used when there's actual feedback for the employee — it's not the default action
- Notes to employee arrive in their inbox quickly (email) and appear in the admin next time they view the draft
