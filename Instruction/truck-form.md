# Admin — Truck Form (Employee View)

The employee truck-creation experience. This is the highest-leverage admin screen because it's used by 5-10 employees from their phones every time a new truck arrives on the lot.

**Mockup reference (desktop):** `/mockups/sparta-admin.html` — Screen 2 (Truck Form)
**Mockup reference (mobile):** `/mockups/sparta-mobile.html` — Phone 3 (Admin Truck Form)

## Design principle

**Optimized for phone-first use at the lot, one-handed, potentially in bright sunlight.**

- Big tap targets
- Vertical single-column form on mobile
- Sticky action bar at the bottom (Save Draft / Submit)
- Auto-save every few seconds so nothing is lost
- Photos are the star — upload is huge and obvious
- Draft badge always visible so users know the state

## Layout

**Desktop:**
- Screen header (label + title + subtitle + status badge)
- Form organized into 5 numbered sections (cards, stacked vertically)
- Sticky bottom action bar (Save Draft, Preview, Submit)

**Mobile:**
- Same content, single column throughout
- Compact header
- Form section headers show step number ("1 / 5", "2 / 5" etc.)
- Bottom sticky bar with just Save Draft + Submit (Preview goes into a menu, or is available after saving)

## Screen header

**Desktop:**

- Label: `◆ EMPLOYEE VIEW` (or `◆ ADD A TRUCK` if admin is using it)
- Title: `Add a truck.` (or `Editing draft` if editing existing)
- Subtitle: `Fill out what you know. Save as draft anytime, submit when ready for admin review.`
- Right side: Draft status badge

**Draft badge:**
- Small orange dot + text "DRAFT · UNSAVED CHANGES" (or "DRAFT · AUTO-SAVED 2 MIN AGO")
- Background: warm orange (`#FDF3EB`)
- Text: dark warning color (`#B84A2F`)
- Barlow Condensed 700 uppercase

## Form sections

Five sections. Each is a white card with a header showing the section name and step counter.

### Section 1 — Basic Info

Header: "Basic Info" (left) + "STEP 1 OF 5" (right, mono orange).

**Fields:**

Row 1 (3-column on desktop, single column mobile):
- Year (number, required)
- Make (select, required)
- Body Type (select, required)

Row 2 (2-column on desktop):
- Model (text, required)
- Trim / Configuration (text, optional)

### Section 2 — Key Specs

Header: "Key Specs" + "STEP 2 OF 5".

Row 1 (2-column):
- Mileage (number, required)
- VIN (text, required, monospace, helper text: "17 characters")

Row 2 (3-column):
- Condition (select, required — options: Excellent, Good, Fair)
- Price ($, number)
- Stock # (text, auto-generated, disabled, gray background)

### Section 3 — Mechanical

Header: "Mechanical" + "STEP 3 OF 5".

Row 1 (3-column):
- Engine (text)
- Transmission (select)
- Fuel Type (select)

Row 2 (3-column):
- Drivetrain (select)
- GVWR (number, in lb)
- Payload Class (select)

### Section 4 — Photos

Header: "Photos" + "STEP 4 OF 5".

This is the most important section on mobile. Employees at the lot need to be able to upload 5-15 photos quickly from their phone.

**Upload area:**

- Big dashed border rectangle, `#B4B2A9` border
- Background: warm light gray
- Icon: orange up-arrow (32px on desktop, 26px on mobile)
- Title: "Tap to upload photos" (mobile) or "Drop photos here or click to browse" (desktop)
- Subtitle: "JPG, PNG, or HEIC · Up to 20 photos · From your phone camera or camera roll"
- Full-width on mobile, centered on desktop

**Photo thumbnails grid (below upload area):**

- 4-column grid on desktop, 3-column on mobile
- Each thumbnail:
  - 4:3 aspect ratio
  - Border-radius 6px
  - Photo number in top-left (mono, small, black background)
  - Remove button in top-right (small red X in circle)
- Drag-to-reorder (desktop) — Phase 1 nice-to-have, not blocker
- First photo becomes the primary/hero photo on the public listing

**Upload behavior:**

- Tap the upload area → mobile file picker opens with camera option
- Photos upload in parallel (up to 3 at once)
- Progress indicator on each thumbnail while uploading
- Failed uploads show retry button
- HEIC files auto-convert to JPG server-side (Payload can handle this via sharp)
- Large files (>5MB) auto-resize before upload to keep storage lean

### Section 5 — Description & Spec Sheet

Header: "Description & Spec Sheet" + "STEP 5 OF 5".

**Description field:**

- Label: "Description" + helper: "(condition notes, history, anything the customer should know)"
- Textarea, 4-6 rows minimum, resizable
- Placeholder: "e.g., One-owner delivery route out of Charlotte. Runs strong, no known issues..."

**Spec sheet PDF:**

- Label: "Spec Sheet PDF" + helper: "(optional — attach a dealer sheet if you have one)"
- If no file attached: gray row with paperclip icon + "No file attached" + "Attach PDF" button on right
- If file attached: filename + file size + Remove button

## Sticky bottom action bar

**Desktop:**

- Left side: `[Save as draft]` (ghost button) + "Last saved 2 min ago" (mono, small)
- Right side: `[Preview]` (ghost) + `[Submit for Review →]` (primary orange)

**Mobile:**

Two buttons only (Preview omitted for space):

- `[Save Draft]` (left, ghost, ~40% width)
- `[Submit →]` (right, primary orange, ~60% width)

Preview on mobile is accessible from a small link or menu — not critical for the primary flow.

## Behavior

### Auto-save

- Form auto-saves as draft every 30 seconds if there are unsaved changes
- Timestamp displays "Last saved X ago" next to the Save Draft button
- If user has been idle for 5+ minutes without changes, stop auto-saving until they interact again

### Manual save

- "Save as draft" button explicitly saves
- Shows a subtle success indicator ("Draft saved") for 2 seconds

### Preview

- "Preview" button opens a new tab showing the public listing preview at `/admin/preview/[draft-id]`
- The preview page has a banner: "PREVIEW MODE — This truck is not yet published"

### Submit for Review

- On click, form validates: all required fields must be filled, at least one photo uploaded
- If valid: status transitions from `draft` to `pending-review`, admin gets email notification, employee redirected to their "My drafts" page with success message
- If invalid: highlights missing fields in red, scrolls to the first error, shows a summary message at the top

### Field-level validation

- **VIN:** 17 characters, alphanumeric only, no I/O/Q (real VINs exclude these). Validate on blur, show error if invalid.
- **Mileage:** Must be positive number
- **Price:** Must be positive number
- **Year:** Between 1990 and current year + 1

### Save-in-progress states

- Form fields disabled during save (brief — usually <500ms)
- If user tries to navigate away with unsaved changes, browser confirmation dialog: "You have unsaved changes. Are you sure you want to leave?"

## Data model interactions

On create:
- Payload's `beforeCreate` hook sets `assignedEmployee` to current user, generates stock number, generates slug
- Photos upload to `/uploads/trucks/[stock-number]/`

On save-as-draft:
- Simple update; status remains `draft`

On submit-for-review:
- Status transitions to `pending-review`
- Cannot be edited by employee until admin acts on it

## Mobile design specifics

Beyond just responsive layout, the mobile version:

- Uses larger font sizes for inputs to prevent iOS zoom-in on focus
- Numeric inputs use `type="number"` and `inputmode="numeric"` for numeric keyboard
- Textareas expand to fit content
- Focus states are highly visible (orange border)
- All tappable elements are at least 44px tall
- The sticky bottom bar sits above the iOS home indicator with safe-area padding

## What good implementation looks like

- An employee can add a full truck listing on their phone in under 5 minutes (assuming photos are already on the phone)
- If they get interrupted, they can come back later and the draft is saved
- Photo uploads work reliably even on 4G/LTE
- Validation errors are clear and specific ("VIN must be 17 characters" not "Invalid input")
- The form feels forgiving — nothing catastrophic happens if the employee taps the wrong thing
- Admin can also use this same form to add trucks directly (skipping the review workflow)
