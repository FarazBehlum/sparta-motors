# 07 — QA Checklist

Pre-launch testing. Every item below must be verified before the DNS cutover.

Divided into: **workflow tests** (does the site do what people need it to do), **device/browser matrix** (does it work everywhere), **performance targets** (is it fast enough), and **SEO checks** (does search work).

## Workflow tests — customer side

Verify by actually doing each end-to-end, on both desktop and mobile.

### Browse and inquire

- [ ] Home page loads, hero video scrubs smoothly on scroll
- [ ] Home page loads correctly with reduced motion enabled
- [ ] "Browse inventory" CTA routes to `/inventory`
- [ ] Inventory page shows all published trucks in the grid
- [ ] Filters work: check Body Type, Make, Year range, Mileage range, Price range, Condition, Fuel Type
- [ ] Filter counts update when other filters change
- [ ] Sort dropdown works: Featured, Newest, Price Low-High, Price High-Low, Mileage Low-High
- [ ] Grid/List toggle works and persists in URL
- [ ] Clicking a truck card routes to `/trucks/[slug]`
- [ ] Truck detail page shows all fields correctly (title, price, key specs, description, spec table)
- [ ] Photo gallery works: click thumbnails, use arrows, keyboard nav
- [ ] Mobile photo gallery works: swipe left/right, dots indicate position
- [ ] Trade-in checkbox reveals additional fields when checked
- [ ] Sticky lead form stays visible on desktop while scrolling truck detail
- [ ] Mobile sticky bottom bar appears on truck detail: Call and Inquire both work

### Category pages

- [ ] `/inventory/box-trucks` loads with the body-type filter pre-applied
- [ ] SEO paragraph appears at the top
- [ ] Same experience for all 6 category pages (reefers, day cabs, flat beds, dump trucks, tow trucks)

### Form submissions

Test each form actually delivers an email to the admin inbox within 30 seconds.

- [ ] Truck detail inquiry form submits → admin receives email with truck info + customer details
- [ ] Truck detail inquiry with financing checked → email flags FINANCING
- [ ] Truck detail inquiry with trade-in → email includes trade-in details
- [ ] Financing pre-qualification form submits → email flags FINANCING PRE-QUAL
- [ ] Fleet inquiry form submits → separate FleetInquiry record + email flags FLEET
- [ ] General contact form submits → email flags GENERAL CONTACT
- [ ] All forms show success message after submit
- [ ] All forms preserve entered data if submission fails
- [ ] Client-side validation catches missing required fields
- [ ] Server-side validation is enforced (test by disabling JS or hitting the API directly)
- [ ] Rate limiting works (attempt 10 rapid submits, hit the limit)

### Static pages

- [ ] Financing page loads with all sections and correct copy
- [ ] Fleet page loads correctly
- [ ] About page loads with correct address/hours/stats from Settings
- [ ] Contact page loads with all 4 contact cards + interactive map + form
- [ ] All internal links route correctly (no 404s within the site)

### Map

- [ ] Contact page map loads with correct coordinates and marker
- [ ] Map popup opens on marker click and shows address + phone
- [ ] Map zoom in/out works
- [ ] Map drag to pan works
- [ ] Map loads lazily (not on page load if below fold)
- [ ] About page map works the same way
- [ ] Footer map works the same way

### Phone and email

- [ ] Phone number links use `tel:` on mobile (tap opens dialer)
- [ ] Email addresses link with `mailto:` (opens email client)
- [ ] Phone number matches Settings.phone across all pages
- [ ] Address matches Settings.address across all pages
- [ ] Hours match Settings across all pages

## Workflow tests — admin side

### Login and access

- [ ] Admin can log in at `/admin`
- [ ] Employee can log in at `/admin`
- [ ] Admin sees full navigation; employee sees restricted navigation
- [ ] Admin can view all trucks (drafts, pending, published, sold, archived)
- [ ] Employee sees their own drafts + all published
- [ ] Employee cannot see other employees' drafts
- [ ] Password reset workflow works (admin can reset employee passwords)

### Truck creation (employee flow)

- [ ] Employee creates a new truck draft on their phone
- [ ] Auto-generated stock number appears and cannot be edited
- [ ] All 5 form sections work (Basic Info, Key Specs, Mechanical, Photos, Description)
- [ ] Photo upload works from phone camera and camera roll
- [ ] HEIC files convert to JPG server-side
- [ ] Photo thumbnails appear immediately after upload
- [ ] Photo removal works
- [ ] Photos can be reordered (drag on desktop, or reorder buttons on mobile)
- [ ] Auto-save runs every 30 seconds and updates the timestamp
- [ ] Manual "Save as draft" works
- [ ] Preview opens the correct listing view
- [ ] Submit for Review validates all required fields
- [ ] Missing required fields highlighted in red on submit attempt
- [ ] Successful submit transitions status to pending-review

### Draft review (admin flow)

- [ ] Admin gets email notification when draft submitted
- [ ] Draft appears in admin's review queue
- [ ] Admin can view the preview + edit fields + see checklist
- [ ] All checklist items reflect actual state
- [ ] Publish action transitions status to published
- [ ] Published truck appears on public site within 60 seconds
- [ ] Send Back requires a note (button disabled without one)
- [ ] Send Back transitions status back to draft and notifies employee
- [ ] Edit Before Publishing opens edit mode
- [ ] Employee gets email notification when draft published
- [ ] Employee gets email notification when draft sent back

### Lead management

- [ ] New leads appear in admin's Leads inbox with NEW status
- [ ] Filter chips work (All, New, Contacted, Closed)
- [ ] Filter counts are accurate
- [ ] Search finds leads by name, phone, email, truck
- [ ] Clicking a lead opens the detail drawer
- [ ] Status change from drawer works and updates the list
- [ ] Internal notes save correctly
- [ ] Fleet inquiries appear in their own view with correct fields

### Media management

- [ ] Photos uploaded to a truck are accessible via the public site
- [ ] Multiple image sizes are generated (thumbnail, card, hero, full)
- [ ] Alt text field works
- [ ] Deleting a truck removes its photos or marks them for cleanup

### Settings + Pages

- [ ] Admin can edit Settings global (phone, address, hours)
- [ ] Settings changes propagate to all pages within 60 seconds
- [ ] Admin can edit Pages content (Home, About, Financing, Fleet, Contact)
- [ ] Page changes appear on the public site within 60 seconds

## Device / browser matrix

Test on real devices where possible, or use BrowserStack for coverage.

### Desktop browsers

- [ ] Chrome (latest) — Windows and macOS
- [ ] Safari 16+ — macOS
- [ ] Firefox (latest) — Windows and macOS
- [ ] Edge (latest) — Windows

### Mobile browsers

- [ ] Safari on iOS 15+ — iPhone 12, iPhone 14
- [ ] Safari on iOS 16+ — iPhone SE (small screen)
- [ ] Chrome on Android — Pixel 6+ or Samsung Galaxy S22+
- [ ] Chrome on Android — mid-tier Android device (e.g., Samsung A-series)

### Tablet

- [ ] iPad Safari (portrait and landscape)

### Specific tests per device

- [ ] Hero video scrubbing feels smooth on iPhone 12 and above
- [ ] Hero video degrades gracefully on lower-end Android
- [ ] Sticky bottom bar on truck detail sits above iOS home indicator
- [ ] Photo gallery swipe works on all mobile browsers
- [ ] Form inputs don't zoom in on iOS Safari (font-size ≥ 16px)
- [ ] Nav menu works on mobile (opens/closes correctly)

## Performance targets

Test on WebPageTest or Lighthouse from a 4G-throttled connection.

### Homepage
- [ ] Time to Interactive < 2.5s on 4G
- [ ] Largest Contentful Paint < 2.0s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Total Blocking Time < 300ms

### Truck detail
- [ ] Time to Interactive < 2.0s on 4G
- [ ] Photo gallery interactive within 1.5s

### Inventory
- [ ] Time to Interactive < 2.0s on 4G
- [ ] Filter changes feel instant (< 300ms)

### Overall
- [ ] Lighthouse Performance score ≥ 90 on mobile
- [ ] Lighthouse Accessibility score ≥ 95
- [ ] Lighthouse Best Practices score = 100
- [ ] Lighthouse SEO score ≥ 95

## SEO checks

### Meta tags
- [ ] Every page has a unique `<title>`
- [ ] Every page has a unique meta description
- [ ] Every page has an Open Graph image, title, and description
- [ ] Canonical URLs set on every page

### Sitemap and robots
- [ ] `/sitemap.xml` exists and lists all public pages + all published trucks
- [ ] `/robots.txt` exists, allows public pages, disallows `/admin` and `/api`
- [ ] Sitemap submitted to Google Search Console

### Structured data
- [ ] Truck detail pages have `Product` (or `Vehicle`) JSON-LD schema
- [ ] Home page has `Organization` schema
- [ ] Contact page has `LocalBusiness` schema
- [ ] Validated via Google's Rich Results Test tool

### Redirects
- [ ] www.sparta-motors.com redirects to sparta-motors.com (or vice versa, whichever is chosen as canonical)
- [ ] All HTTP requests redirect to HTTPS
- [ ] Trailing-slash consistency (either always or never — enforced site-wide)

## Accessibility

- [ ] Color contrast passes WCAG AA everywhere (test with axe or Wave)
- [ ] All images have alt text
- [ ] Form inputs all have labels
- [ ] Keyboard navigation works through every page
- [ ] Focus states are clearly visible
- [ ] Skip-to-content link at top of every page (or equivalent nav strategy)
- [ ] Reduced-motion preference is respected

## Security

- [ ] SSL is A-grade on SSL Labs test
- [ ] Admin routes require authentication (verify by hitting `/admin/*` while logged out)
- [ ] API endpoints reject malformed requests
- [ ] File upload accepts only images and PDFs (test rejecting .exe, .php)
- [ ] SQL injection attempts on form fields don't succeed (Payload's ORM prevents this by default; verify)
- [ ] XSS attempts in form fields are sanitized
- [ ] Passwords are hashed (bcrypt via Payload)
- [ ] `.env.production` is not committed to git and not accessible via URL

## Backup verification

- [ ] Backup script runs successfully once
- [ ] Restore a backup to a test environment successfully
- [ ] Confirm both DB and media restore correctly

## Content verification

- [ ] All 20 or so current inventory trucks have been migrated with photos
- [ ] All truck data is accurate (VIN, mileage, price, description)
- [ ] All Settings fields are filled in (real address, real phone, real hours)
- [ ] All page content is filled in (no placeholder Lorem ipsum)
- [ ] Legal callouts (financing disclaimer) appear correctly

## Final gate — user acceptance

Before launch:

- [ ] The admin (project manager) has personally clicked through every page and admin screen
- [ ] The admin has personally submitted at least one test form and received the notification
- [ ] At least two employees have used the mobile truck-form workflow to create a real draft
- [ ] The admin has approved a draft through to publish and verified it appeared correctly
- [ ] Someone outside the project (a family member, a friend, an employee) has used the site cold and given feedback

Only after all boxes are checked: DNS cutover.
