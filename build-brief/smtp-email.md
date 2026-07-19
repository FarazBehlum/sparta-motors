# Integration — SMTP Email Notifications

Lead notifications, fleet inquiry notifications, and internal workflow notifications flow through email. Sent via SMTP through Sparta's existing business email.

## Why SMTP through business email

- **Zero cost.** No new service, no monthly fee.
- **Sparta already has the account.** Business email at `info@sparta-motors.com` (or the Sparta admin's chosen inbox) exists — we just use its SMTP.
- **Low volume.** Peak of ~30-40 emails per day (leads, fleet inquiries, employee submissions, admin publish notifications). Well within any email provider's SMTP limits.
- **Deliverability is fine.** Sparta sends transactional emails from its own domain to its own inbox — no risk of spam-filter surprises like there would be with a bulk sender.

**If deliverability becomes a problem later:** swap to Resend or Postmark. Because everything goes through nodemailer, this is a one-config-file change (~10 lines).

## Configuration

Environment variables:

```
SMTP_HOST=smtp.gmail.com          # or the provider's SMTP host
SMTP_PORT=587                     # STARTTLS
SMTP_USER=info@sparta-motors.com  # the sending account
SMTP_PASSWORD=<app password>      # NEVER the account's real password
SMTP_FROM=info@sparta-motors.com
NOTIFICATION_TO=admin@sparta-motors.com  # where lead notifications land
```

**Notes:**
- Use an app-specific password if the provider supports it (Gmail requires this for SMTP; Google Workspace supports it via 2FA + app password)
- The `SMTP_FROM` should match `SMTP_USER` to avoid SPF/DKIM issues
- Employees also receive notifications (draft published, sent back) — those go to their `email` field in the User record

## Package

Use `nodemailer`. Standard, well-maintained, works with any SMTP provider.

## Email types

### 1. New lead notification

**Trigger:** POST to `/api/leads` succeeds
**To:** `NOTIFICATION_TO`
**Subject:** `[NEW LEAD] {source flag} - {truck year make model or 'General inquiry'}`
- `{source flag}` is `TRUCK INQUIRY`, `FINANCING PRE-QUAL`, or `GENERAL CONTACT`
- If financing interest checked: append `· FINANCING`
- If trade-in included: append `· TRADE-IN`

**Body:**

```
NEW LEAD

Source: {source}
Received: {formatted timestamp}

CONTACT
{fullName}
{phone}
{email}

TRUCK OF INTEREST
{truck year make model} (if applicable, else "None specified")
Stock #{stockNumber} · VIN {vin} · {price} · {mileage} miles

MESSAGE
{message or "No message provided"}

FLAGS
Financing: {Yes / No}
Trade-in: {Yes / No}
If trade-in:
  Year/Make/Model: {tradeInYearMakeModel}
  Mileage: {tradeInMileage}
  Condition: {tradeInCondition}
Heard about us: {heardAboutUs or "Not specified"}

---
View this lead in admin: {admin URL to lead detail}
Reply-to: {customer email}
```

Reply-To header set to the customer's email so admin can just hit reply.

### 2. New fleet inquiry notification

**Trigger:** POST to `/api/fleet-inquiries` succeeds
**Subject:** `[FLEET INQUIRY] {companyName} - {fleetSize} trucks, {timeline}`

**Body:**

```
NEW FLEET INQUIRY

Received: {formatted timestamp}

COMPANY
{companyName}
Contact: {contactName}
{phone}
{email}

REQUIREMENTS
Fleet size: {fleetSize}
Timeline: {timeline}

TRUCKS NEEDED
{trucksNeeded}

Heard about us: {heardAboutUs or "Not specified"}

---
View this inquiry in admin: {admin URL}
Reply-to: {customer email}
```

### 3. Draft submitted for review notification

**Trigger:** Truck status transitions from `draft` to `pending-review`
**To:** `NOTIFICATION_TO`
**Subject:** `[DRAFT REVIEW] {truck year make model} from {employee name}`

**Body:**

```
NEW DRAFT READY FOR REVIEW

Submitted by: {employee first name} {employee last name}
Submitted at: {formatted timestamp}

TRUCK
{year} {make} {model} {trim}
Stock #{stockNumber}
{mileage} miles · {condition} · {price}
{photos count} photos attached
Spec sheet: {Yes if attached, else "No"}

---
Review this draft: {admin URL to draft review page}
```

### 4. Draft published notification

**Trigger:** Truck status transitions from `pending-review` to `published`
**To:** Employee who created the draft (from `assignedEmployee`)
**Subject:** `Your listing is live: {truck year make model}`

**Body:**

```
Your truck listing is now live on the public site.

TRUCK
{year} {make} {model}
Stock #{stockNumber}
Public URL: {https://sparta-motors.com/trucks/[slug]}

Great work — customers can now see this listing and inquire about it.

--
Sparta Motors admin
```

### 5. Draft sent back notification

**Trigger:** Truck status transitions from `pending-review` to `draft` (with a `reviewNote`)
**To:** Employee who created the draft
**Subject:** `Changes needed on draft: {truck year make model}`

**Body:**

```
Your draft needs some changes before it can be published.

TRUCK
{year} {make} {model}
Stock #{stockNumber}

NOTES FROM ADMIN
{reviewNote}

Edit your draft: {admin URL to edit the draft}

--
Sparta Motors admin
```

## Email template implementation

Templates should be plain text primarily (with an optional HTML version). Plain text ensures:
- No email-client rendering quirks
- Fast to send
- Easy to read on any device
- Doesn't get flagged as promotional

If HTML versions are added later, keep them extremely simple — table-based layout, no responsive frameworks, minimal styling.

Store templates in `/lib/email-templates/` as plain TypeScript template functions:

```ts
export function newLeadEmail(lead: Lead, truck?: Truck): { subject: string; body: string } {
  // build subject and body
}
```

## Rate limits and error handling

- Retry failed sends up to 3 times with exponential backoff (1s, 3s, 10s)
- Log all send attempts (success + failure) to a `/logs/email.log` or Payload logging
- If SMTP is unreachable for >5 minutes, alert admin via a fallback (e.g., write to a special queue that gets checked on next successful send)
- Never block the API response on email delivery. Form submission returns success as soon as the DB record is created; email is sent asynchronously.

## Data privacy

- Do not include full VIN or full customer address in email body (VIN is fine; sensitive personal data like SSN never goes in email)
- Email logs (if kept) are on the same VPS as the app — no third-party service handling customer data
- No customer email addresses are added to any marketing list or sent to third parties

## Testing during build

For local development:
- Set `SMTP_HOST=localhost` with a dev SMTP catcher like Mailhog or Ethereal
- All emails render in the catcher UI without actually sending
- Verified before staging

For staging:
- Use a real SMTP account (test Gmail account or the actual business account)
- Send to a test inbox that the project manager controls
- Verify:
  - Subject lines are correct
  - Formatting is readable on desktop and mobile email clients
  - Reply-To header works (replies go to the customer)
  - No spam-filter flags

## What good implementation looks like

- Lead notifications arrive in the business inbox within 30 seconds of form submission
- Emails are readable at a glance — the admin can see who inquired, what truck, and any flags without opening the admin panel
- Reply-to means admin can hit "reply" and message the customer directly
- Emails never get lost — every send is logged, failures retry, alerts fire if SMTP is down for too long
- Employee notifications feel appropriate — not spammy, only when there's real action to take
- Zero cost, forever
