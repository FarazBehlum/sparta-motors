# 08 — Launch and Handoff

The final steps: DNS cutover, admin/employee training, and first-week monitoring.

## Pre-launch checklist

Everything in `07-qa-checklist.md` must be complete first. Then:

- [ ] Backups are running and verified
- [ ] Cloudflare account is set up and DNS records are pre-configured (not yet active)
- [ ] SSL certificate is installed on the origin server
- [ ] Uptime monitoring is set up (UptimeRobot or similar)
- [ ] Admin account created with strong password
- [ ] At least two employee accounts created for launch-day testing
- [ ] Content is fully migrated (all inventory, all page copy)
- [ ] Real business phone, email, and address are in Settings

## DNS cutover

The moment of launch.

### Timing

Pick a low-traffic day and time. For Sparta:
- **Best:** Saturday afternoon or Sunday morning
- **Avoid:** Monday mornings (business inquiry peak), Friday afternoons (end-of-week rush)

Give yourself a 4-hour window on the calendar with no other commitments.

### Steps

**1. Take a final backup of the old WordPress site.** Even though it's being replaced, save a snapshot in case anything urgent needs to be recovered (photos, old inventory data).

**2. Verify the new site is production-ready.**
- Direct browse to the origin server's IP address (with the correct Host header) to confirm it's fully working
- Or use a hosts file entry to hit the new server as if it were sparta-motors.com

**3. Update DNS.**
- Change the A record for `sparta-motors.com` in Cloudflare to point to the new server IP
- Change the A record for `www.sparta-motors.com` to point to the new server IP
- Keep Cloudflare proxy ON (orange cloud)

**4. Verify propagation.**
- Cloudflare DNS updates propagate within 1-5 minutes globally
- Check from a mobile device on cellular (not on the office WiFi, which may cache)
- Use tools like `dig sparta-motors.com` from a terminal, or dnschecker.org

**5. Test everything again on the live domain.**
- Home page loads
- Inventory page loads
- Truck detail loads
- All forms submit and deliver emails
- Admin login works
- Photos load through the CDN

**6. Announce launch (optional).**
- Facebook post: "New site is live at sparta-motors.com"
- Email to any customer contacts who should know
- No paid promotion at launch — let SEO ramp up organically first

### If something breaks at cutover

**Rollback strategy:**

- The old WordPress site can remain running on its old server for a few days
- If a critical bug appears, change DNS back to point at the old server
- Fix the issue on the new site, then re-cutover
- Because Cloudflare DNS propagates in minutes, rollback is fast

Never leave a broken site up for hours. Rollback within 30 minutes if a critical bug is found.

## Admin training

The admin (project manager) needs to be comfortable with:

1. **Logging in** at sparta-motors.com/admin
2. **Adding a truck listing directly** (skipping the employee draft flow)
3. **Reviewing an employee's draft** and publishing / editing / sending back
4. **Managing leads** — updating status, adding notes, exporting CSV
5. **Managing fleet inquiries** — the parallel screen
6. **Editing page content** via the Pages global
7. **Editing site settings** (phone, address, hours) via Settings global
8. **Adding a new employee** — creating a user, sending them credentials
9. **Resetting an employee's password**

**Training approach:** A single 60-90 minute walkthrough. Screen-share, do each task once with the admin driving, then let them do each task independently. Record the session for future reference.

**Written cheatsheet:** Include a one-page reference in the admin panel itself (a Payload custom view titled "Admin Guide" that lists common tasks with step-by-step instructions).

## Employee training

Each employee needs 15-30 minutes.

### The mobile truck-form workflow

Walk each employee through:

1. Log in to /admin from their phone
2. Tap "+ New Truck" from the dashboard
3. Fill out the 5 sections
4. Upload photos from the camera roll (and take new photos with camera)
5. Save as draft — see it appear in "My Drafts"
6. Come back later, edit, submit for review
7. Get the email when admin publishes

### The leads workflow

Walk employees through:

1. Log in to admin
2. See leads inbox
3. Update lead status when they contact a customer
4. Add internal notes
5. Filter and search

### Training documentation

Create a simple PDF or in-admin guide with:

- Screenshots of each step
- Common troubleshooting ("photo won't upload," "can't find my draft")
- Who to contact for help (the admin)

Include a clear note: **employees never delete anything.** If in doubt, save as draft, tell admin.

## First-week monitoring

After launch, check daily:

**Day 1:**
- Uptime monitor: no alerts?
- Leads inbox: any new leads? Did emails deliver?
- Admin can log in?
- Server load: `htop` looks fine?

**Day 2-3:**
- Any employees having trouble with the admin?
- Any customer complaints via phone about the new site?
- Google Search Console: any new crawl errors?

**Day 4-7:**
- Track lead volume vs. old site (same period last week)
- Any performance issues on specific pages?
- Any bug reports?

**Week 1 review:**

Sit down with the admin and go through:
- Was the launch smooth?
- Anything the employees are struggling with?
- Any customer feedback (positive or negative)?
- Any obvious Phase 1.5 additions to prioritize (analytics, extra features)?

## Post-launch small fixes window

Reserve time in Weeks 2-4 for small polish work:

- Typos in page content that admin catches
- Photos that need re-uploading
- Small UX tweaks based on real usage
- Employee-requested small features

These are expected — no rebuild ever launches perfect. Budget a few days across the first month for these.

## Post-launch: what to build next (Phase 1.5)

Reasonable Phase 1.5 additions, in priority order:

1. **Analytics dashboard.** Simple stats on lead volume, most-viewed trucks, conversion rates. Once there's real traffic data, this becomes valuable.
2. **In-admin notifications.** Bell icon showing recent activity, complementing email.
3. **Bulk lead actions.** Mark multiple leads as contacted, export selected.
4. **Response time tracking.** Auto-track time between lead arrival and first status change. Report on it weekly.
5. **Featured trucks toggle.** UI for admin to mark trucks as featured on the home page.
6. **Employee-specific dashboard.** Show them their own drafts, published trucks, leads count.
7. **Improved search.** Full-text search across trucks with fuzzy matching.

None of these are launch blockers. All are reasonable next steps.

## Documentation delivered at handoff

At launch, hand the project manager:

- **This build brief** — the complete design and technical reference (this folder)
- **Access credentials** — admin login, VPS SSH access, Cloudflare account, backup destination
- **Admin walkthrough recording** — the training session
- **Emergency runbook** — one-page doc: "What to do if the site goes down, if forms stop working, if you get locked out"

### Emergency runbook

**If the site is down:**
1. Check UptimeRobot — is it a real outage?
2. Check Cloudflare status page — is Cloudflare having issues?
3. SSH into the VPS and run `pm2 status` and `sudo systemctl status nginx`
4. If in doubt, contact the developer / Claude Code with the error message

**If forms stop delivering emails:**
1. Check the business email — is the SMTP account working normally?
2. Check /logs/email.log on the server for recent send attempts
3. Try submitting a form yourself — do you get the email?
4. If broken, contact the developer

**If admin login fails:**
1. Reset your password via the "Forgot password" link
2. If that fails, SSH access to the DB can reset password directly

**Contact for support:**
- Primary: Claude Code (via chat)
- Secondary: [developer/consultant contact TBD]
- VPS support: Hetzner support portal
- DNS support: Cloudflare dashboard

## What good handoff looks like

- The admin feels confident using the site within a week
- Employees are creating drafts on their phones without frustration
- Leads are flowing to the business inbox reliably
- Nothing breaks in the first month
- The admin knows exactly what to do if something does break
- Six months in, everything still works and nobody needs to touch the code
