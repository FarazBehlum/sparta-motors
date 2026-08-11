# Deployment runbook — Sparta Motors

Everything needed to stand the site up on a fresh server, and everything needed
to keep it running afterwards. Written to be followed top to bottom, copy-paste,
without prior server experience. Commands prefixed `$` run on the server over SSH.

Design decisions behind this setup are in [`../build-brief/05-deployment.md`](../build-brief/05-deployment.md).
This file is the executable version of that document.

**Files in this folder**

| File | What it is |
|---|---|
| `nginx.conf` | Web-server config — terminates HTTPS, forwards to the app |
| `ecosystem.config.cjs` | PM2 process definition — keeps the app running and restarts it on crash |
| `backup.sh` | Nightly database + photo backup |

---

## Before you start

Have these five things ready. Nothing below works without them.

1. **A server.** Hetzner **CX23** (€5.49/mo ≈ $6, 2 vCPU / 4GB / 40GB, 20TB
   traffic), Ubuntu 24.04, **Falkenstein or Nuremberg (Germany)**.

   > This is the cheapest server Hetzner sells — CAX11 (ARM) is €5.99 and CPX11
   > is dearer still for half the RAM — and it is also the cheapest one that
   > meets the 4GB floor below. Price checked 2026-08-11, after the 15 June 2026
   > increase took it from €3.99 to €5.49. Hetzner has raised prices repeatedly
   > through 2026, so read the figure at checkout rather than trusting this line.

   > **Not Ashburn, and not CX22.** Hetzner's US locations only offer the CPX and
   > CCX lines — the cost-optimized CX line is Germany/Finland only — and their
   > June 2026 increase hit US CPX hardest. The equivalent US box (CPX21, 4GB) is
   > **~$43/mo**, well over the project's $25 ceiling, with far less included
   > traffic. Checked 2026-08-11; re-check before ordering, because this pricing
   > has already moved once.
   >
   > The trade-off accepted here is latency: the origin is in Europe, so requests
   > that actually reach it — filtered inventory browsing and the `/admin` screens
   > — cost roughly an extra 100ms. Cloudflare edge-caches the statically
   > rendered pages, so ordinary visitors landing on the home, about, contact and
   > category pages are unaffected.
   >
   > **4GB is not optional at this size**, because section 2.3 compiles the site
   > on the server. A 2GB box runs the site fine but can fail mid-build. If a
   > future host only offers 2GB, move the build off the server first.

2. **The domain**, with its DNS managed in Cloudflare (free plan). For
   sparta-motors.com specifically, read section 6 first — it carries live
   business email, and the nameservers are changed at **Squarespace**, not
   Hostinger.
3. **An SMTP account** for sending lead notifications — the Gmail address
   `spartamotorsllc@gmail.com` with a Google **App Password** (not the account
   password; 2FA must be on to generate one).
4. **An SSH key** on your Mac. Check with `ls ~/.ssh/*.pub`; if there is none,
   run `ssh-keygen -t ed25519`. An existing RSA key is fine — the PM's
   `~/.ssh/id_rsa.pub` is what this deployment uses.
5. **Access to this git repo** from the server (a deploy key or a personal access token).

> **Cost check:** server €5.49/mo (≈$6), Cloudflare $0, backups $0 (Cloudflare R2
> free tier), uptime monitoring $0. Total ≈$6/month — about a quarter of the $25
> target, leaving headroom for the Phase 1.5 analytics box.

---

## 1. Server setup

Do this once. Roughly 30 minutes.

### 1.1 First login and a non-root user

```bash
ssh root@YOUR_SERVER_IP

adduser sparta                      # pick a strong password, store it in a password manager
usermod -aG sudo sparta
rsync --archive --chown=sparta:sparta ~/.ssh /home/sparta
```

Open a **second terminal** and confirm `ssh sparta@YOUR_SERVER_IP` works
*before* closing the root session. If you lock yourself out, the only fix is
rebuilding the server.

### 1.2 Lock down SSH

```bash
$ sudo nano /etc/ssh/sshd_config
```

Set these three lines:

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
$ sudo systemctl restart ssh
```

### 1.3 Firewall and brute-force protection

```bash
$ sudo ufw allow OpenSSH
$ sudo ufw allow 80/tcp
$ sudo ufw allow 443/tcp
$ sudo ufw --force enable

$ sudo apt update && sudo apt upgrade -y
$ sudo apt install -y fail2ban unattended-upgrades
$ sudo systemctl enable --now fail2ban
$ sudo dpkg-reconfigure -plow unattended-upgrades    # choose Yes
```

Postgres is deliberately **not** opened to the internet — the app talks to it
over localhost.

### 1.4 Runtime dependencies

```bash
# Node 22 LTS (Next 16 requires 20.9+; 22 is the current long-term-support line)
$ curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
$ sudo apt install -y nodejs postgresql nginx git ffmpeg
$ sudo npm install -g pm2

$ node -v      # expect v22.x
```

`ffmpeg` is there for image conversions (HEIC photos off an iPhone).

### 1.5 Database

Pick a long random password and save it — you'll need it in step 2.2.

```bash
$ openssl rand -base64 24        # copy the output; this is DB_PASSWORD
$ sudo -u postgres psql
```

```sql
CREATE DATABASE sparta_motors;
CREATE USER sparta WITH PASSWORD 'PASTE_DB_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE sparta_motors TO sparta;
ALTER DATABASE sparta_motors OWNER TO sparta;
\q
```

The `ALTER DATABASE ... OWNER` line matters: without it the `sparta` user can
connect but cannot create tables, and the migration in step 2.4 fails.

### 1.6 Directories

```bash
$ sudo mkdir -p /var/www/sparta-motors /var/log/sparta /var/backups/sparta
$ sudo chown -R sparta:sparta /var/www/sparta-motors /var/log/sparta /var/backups/sparta
```

---

## 2. Deploy the application

### 2.1 Get the code

```bash
$ git clone YOUR_REPO_URL /var/www/sparta-motors
$ cd /var/www/sparta-motors
$ npm ci
```

### 2.2 Environment file

```bash
$ nano /var/www/sparta-motors/.env
```

Paste this and fill in every `REPLACE_` value:

```bash
# --- Database ---
DATABASE_URL=postgres://sparta:REPLACE_DB_PASSWORD@localhost:5432/sparta_motors

# --- Security ---
# Generate with: openssl rand -hex 32
# Changing this later logs everyone out and invalidates password-reset links.
PAYLOAD_SECRET=REPLACE_WITH_64_RANDOM_HEX_CHARS

# --- Site identity ---
# No trailing slash. Baked into the build: sitemap, canonical tags, OG images,
# and the admin links inside notification emails all read from it.
NEXT_PUBLIC_SITE_URL=https://REPLACE_DOMAIN
PAYLOAD_PUBLIC_SERVER_URL=https://REPLACE_DOMAIN

# --- Uploaded photos ---
# Must match the `alias` path in deploy/nginx.conf.
MEDIA_DIR=/var/www/sparta-motors/media

# --- Email ---
# Gmail requires an App Password, not the normal account password.
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=spartamotorsllc@gmail.com
SMTP_PASSWORD=REPLACE_GMAIL_APP_PASSWORD
SMTP_FROM=spartamotorsllc@gmail.com
# Where new-lead notifications land.
NOTIFICATION_TO=spartamotorsllc@gmail.com

# --- First admin login (used once, by `npm run seed`) ---
SEED_ADMIN_EMAIL=REPLACE_ADMIN_EMAIL
SEED_ADMIN_PASSWORD=REPLACE_STRONG_PASSWORD
```

```bash
$ chmod 600 /var/www/sparta-motors/.env
```

This file holds every credential the site has. It is gitignored and must never
be committed.

> **If `SMTP_HOST` is left empty**, the site still works and leads still save —
> notification emails are written to the log instead of being sent. Sending is
> not required to launch, but it is how the business finds out about a lead
> without checking the dashboard.

### 2.3 Build

```bash
$ cd /var/www/sparta-motors
$ npm run build
```

Takes 2–4 minutes. `NEXT_PUBLIC_SITE_URL` is read **at build time**, so if you
change the domain later you must rebuild, not just restart.

### 2.4 Create the database tables

```bash
$ NODE_ENV=production npm run migrate
```

Expect `Migrated: 20260730_220544_initial`. This creates all 26 tables. Confirm
with `npm run migrate:status`.

> **Why this step exists.** In local development Payload compares the code to
> the database and silently patches the schema on boot. That behaviour is turned
> off when `NODE_ENV=production`, precisely so the live database is never
> altered by accident. Production schema changes only ever happen through a
> migration file that was reviewed and committed. See "Changing the data model"
> below.

### 2.5 Create the admin account and starting content

```bash
$ NODE_ENV=production npm run seed
```

Creates the admin user from `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, the
Settings global (phone, address, hours), and the five editable pages. It is safe
to re-run — it skips anything that already exists.

### 2.6 Start it

```bash
$ cd /var/www/sparta-motors
$ pm2 start deploy/ecosystem.config.cjs
$ pm2 save
$ pm2 startup          # prints one more command — run it, it survives reboots
$ pm2 status           # expect status "online"
$ curl -I localhost:3000
```

A `200 OK` from that last command means the app is up.

---

## 3. Web server and HTTPS

### 3.1 Cloudflare origin certificate

In the Cloudflare dashboard → **SSL/TLS → Origin Server → Create Certificate**.
Accept the defaults, choose **15 years**, and copy the two blocks it shows you
(you cannot view the key again after leaving the page).

```bash
$ sudo mkdir -p /etc/ssl/sparta
$ sudo nano /etc/ssl/sparta/origin.pem     # paste the certificate
$ sudo nano /etc/ssl/sparta/origin.key     # paste the private key
$ sudo chmod 600 /etc/ssl/sparta/origin.key
```

Then set **SSL/TLS → Overview → Full (strict)**.

### 3.2 nginx

```bash
$ sudo cp /var/www/sparta-motors/deploy/nginx.conf /etc/nginx/sites-available/sparta-motors
$ sudo sed -i 's/REPLACE_DOMAIN/yourdomain.com/g' /etc/nginx/sites-available/sparta-motors
$ sudo ln -sf /etc/nginx/sites-available/sparta-motors /etc/nginx/sites-enabled/
$ sudo rm -f /etc/nginx/sites-enabled/default
$ sudo nginx -t && sudo systemctl reload nginx
```

`nginx -t` must say "syntax is ok" before you reload.

### 3.3 Cloudflare settings

- **DNS:** `A` record for the apex domain → server IP, proxy **on** (orange cloud).
  Same for `www`.
- **Leave `MX` and `TXT` records alone** — those carry the business email. Breaking
  them stops mail delivery.
- SSL/TLS → Edge Certificates: **Always Use HTTPS** on, **Automatic HTTPS Rewrites** on.
- Speed → Optimization: **Rocket Loader off**, **Minify off**. Both interfere with
  how Next.js loads its JavaScript.
- Caching level: Standard. Browser Cache TTL: Respect Existing Headers.

---

## 4. Backups

```bash
$ sudo cp /var/www/sparta-motors/deploy/backup.sh /usr/local/bin/sparta-backup
$ sudo chmod +x /usr/local/bin/sparta-backup
$ sudo -u sparta /usr/local/bin/sparta-backup      # run once now to prove it works
$ ls -la /var/backups/sparta/
```

Schedule it (`crontab -e` as the `sparta` user):

```
0 3 * * * /usr/local/bin/sparta-backup >> /var/log/sparta/backup.log 2>&1
```

**Off-server copies.** A backup that only exists on the server is lost with the
server. Create a Cloudflare R2 bucket (10GB free), `sudo apt install rclone`,
run `rclone config` to add a remote named `sparta-backups`, then set
`RCLONE_REMOTE=sparta-backups:daily` at the top of `/usr/local/bin/sparta-backup`.

**Test the restore before launch.** Untested backups fail exactly when needed:

```bash
$ sudo -u postgres createdb restore_test
$ pg_restore --no-owner --dbname="postgres://sparta:PASSWORD@localhost:5432/restore_test" /var/backups/sparta/DATE/db.dump
$ psql "postgres://sparta:PASSWORD@localhost:5432/restore_test" -c "SELECT count(*) FROM trucks;"
$ sudo -u postgres dropdb restore_test
```

Also enable weekly **Hetzner snapshots** (~$0.50/mo) — whole-server recovery,
which a database dump alone doesn't give you.

---

## 5. Monitoring

- **UptimeRobot** (free): HTTP monitor on `https://yourdomain.com`, 5-minute
  interval, email alert. Add a second monitor on `/inventory` — the home page can
  be served from cache while the app behind it is down.
- **Logs:** `pm2 logs sparta`, or `/var/log/sparta/error.log`.
- **Health:** `pm2 status`, `df -h` (disk), `free -m` (memory), `htop`.

Photos are the thing that fills a 40GB disk. Check `df -h` monthly; at 80% either
resize the server or move media to Cloudflare R2.

---

## 6. Launch day

Full checklist in [`../build-brief/08-launch-handoff.md`](../build-brief/08-launch-handoff.md).
Short version:

1. Confirm the site works on the server IP before touching DNS. From your Mac, add
   a temporary line to `/etc/hosts`: `YOUR_SERVER_IP yourdomain.com`, then browse
   the real domain. **Remove the line afterwards.**
2. Enter the real truck listings and photos through `/admin`. Do this *before*
   cutover so nobody lands on an empty inventory.
3. Submit one of each form yourself and confirm the email arrives.
4. Switch the Cloudflare `A` records to the new IP. Propagation is 1–5 minutes.
5. Re-test on a phone over cellular, not office WiFi.
6. Submit the sitemap in Google Search Console: `https://yourdomain.com/sitemap.xml`.
7. Leave the old site running for a few days. If something is badly wrong, point
   DNS back — that is the rollback, and it takes minutes.

---

## 7. Shipping an update

Every subsequent deploy, once the site is live:

```bash
$ cd /var/www/sparta-motors
$ git pull
$ npm ci
$ NODE_ENV=production npm run migrate     # no-op when there is nothing new
$ npm run build
$ pm2 reload sparta
```

`pm2 reload` (not `restart`) waits for in-flight requests to finish first.

**Rollback:**

```bash
$ cd /var/www/sparta-motors
$ git log --oneline -5          # find the last good commit
$ git checkout GOOD_COMMIT_SHA
$ npm ci && npm run build && pm2 reload sparta
```

Code rolls back in a minute. A database migration does not roll back
automatically — `npm run payload migrate:down` reverses the most recent one, but
restoring from the nightly dump is the safer move if data is involved.

---

## 8. Changing the data model

Adding or changing a field in `src/collections/*.ts` changes the database shape.
On a developer machine that happens automatically. In production it does not, so
the change has to be captured in a migration file:

```bash
# on the developer machine, after editing a collection
npm run migrate:create describe_the_change
git add src/migrations && git commit
```

Then deploy as in section 7 — `npm run migrate` applies it.

Skipping this is the most likely way to break the live site: the code expects a
column the database doesn't have, and every page 500s.

---

## 9. Troubleshooting

| Symptom | Cause and fix |
|---|---|
| **502 Bad Gateway** | App isn't running. `pm2 status`, then `pm2 logs sparta --lines 50`. |
| **App won't start** | Usually `.env`. Check `DATABASE_URL` and that Postgres is up: `sudo systemctl status postgresql`. |
| **Every page 500s after a deploy** | Migration wasn't run. `NODE_ENV=production npm run migrate`. |
| **Photos upload but don't display** | `MEDIA_DIR` in `.env` doesn't match the `alias` in the nginx config. |
| **Large photo upload fails** | `client_max_body_size` in nginx must exceed Payload's 64MB cap. Both are already set (80M). |
| **Forms return 429** | Rate limiter: 5 submissions per 10 minutes per visitor. Expected under spam; if a real customer hits it, raise the limit in `src/lib/rate-limit.ts`. |
| **No lead emails** | `pm2 logs sparta | grep email`. `[email:disabled]` means `SMTP_HOST` is unset; `[email:failed]` means the credentials are wrong — regenerate the Gmail App Password. **Leads are still saved either way** — check `/admin`. |
| **Locked out of admin** | Use the password-reset link. If email is down, an admin can be recreated by re-running `npm run seed` with a new `SEED_ADMIN_EMAIL`. |
| **Site is slow** | `htop` and `df -h`. A full disk is the usual cause. |

---

## 10. Credentials to hand over at launch

Store in a password manager, not in this repo:

- Server IP + the `sparta` user's SSH key and password
- Postgres password
- `PAYLOAD_SECRET`
- Cloudflare account login
- Gmail App Password for SMTP
- Payload admin login
- Backup destination (R2) credentials
