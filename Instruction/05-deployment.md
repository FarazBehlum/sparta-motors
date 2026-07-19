# 05 — Deployment

Deployment approach: single small VPS, Cloudflare in front, everything self-hosted, PostgreSQL and Node running on the same box.

## Server provisioning

### Provider

Hetzner CX22 (or DigitalOcean $6 droplet). See `01-tech-stack.md` for the comparison. Recommendation: Hetzner CX22, Ashburn (US East) location for proximity to Charlotte.

**Specs:** 2 vCPU, 4GB RAM, 40GB SSD, 20TB transfer, Ubuntu 24.04 LTS.

### Initial server setup

Once the VPS is provisioned:

1. **SSH access.** Add the project manager's public SSH key. Disable password authentication in `/etc/ssh/sshd_config`.
2. **Firewall (ufw).** Allow only:
   - Port 22 (SSH)
   - Port 80 (HTTP — for Let's Encrypt if using; also redirects to HTTPS)
   - Port 443 (HTTPS)
3. **Create a non-root user.** Add to `sudo` group. Use this account for all subsequent work.
4. **Install fail2ban.** Standard SSH brute-force protection.
5. **System updates.** `apt update && apt upgrade -y`. Set up unattended upgrades for security patches.
6. **Node.js.** Install the current LTS via NodeSource or nvm.
7. **PostgreSQL.** Install PostgreSQL 15+. Create a database and user for Sparta:
   ```sql
   CREATE DATABASE sparta_motors;
   CREATE USER sparta WITH PASSWORD '<strong random password>';
   GRANT ALL PRIVILEGES ON DATABASE sparta_motors TO sparta;
   ```
8. **Nginx.** Install nginx. Will serve as reverse proxy in front of Next.js.
9. **PM2.** Install globally via npm. Used to keep the Node process running and restart on crash.
10. **ffmpeg.** Install via apt. Needed for image conversions (HEIC → JPG) done by sharp/Payload.

### Application deployment

**Option A — Deploy via git pull + build on server (simplest):**

1. Clone the git repo to `/var/www/sparta-motors/`
2. Install dependencies: `npm ci`
3. Run migrations: `npx payload migrate`
4. Build: `npm run build`
5. Start with PM2: `pm2 start npm --name sparta -- start`
6. Save PM2 state: `pm2 save && pm2 startup`

**Option B — Deploy via GitHub Actions + rsync:**

Set up a GitHub Actions workflow that:
1. Builds on GitHub's runners
2. rsyncs the built output to the server
3. Runs migrations via SSH
4. Restarts PM2

Option B is nicer once things are stable. Option A is simpler for initial launch and okay for solo-managed sites.

### Environment variables

Create `/var/www/sparta-motors/.env.production` with:

```
DATABASE_URI=postgres://sparta:<password>@localhost:5432/sparta_motors
PAYLOAD_SECRET=<generate a long random string>
SMTP_HOST=<smtp host>
SMTP_PORT=587
SMTP_USER=<email account>
SMTP_PASSWORD=<app password>
SMTP_FROM=info@sparta-motors.com
NOTIFICATION_TO=<admin email>
NEXT_PUBLIC_SITE_URL=https://sparta-motors.com
PAYLOAD_PUBLIC_SERVER_URL=https://sparta-motors.com
```

**Never commit .env files to git.** Add to `.gitignore`.

### Nginx configuration

Simple reverse proxy:

```nginx
server {
    listen 80;
    server_name sparta-motors.com www.sparta-motors.com;
    return 301 https://sparta-motors.com$request_uri;
}

server {
    listen 443 ssl http2;
    server_name sparta-motors.com;

    ssl_certificate /etc/ssl/sparta/origin.pem;
    ssl_certificate_key /etc/ssl/sparta/origin.key;

    client_max_body_size 50M;  # for photo uploads

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/sparta-motors/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

## DNS

DNS managed through Cloudflare (free tier).

**Records:**

- `A` record for `sparta-motors.com` → server IP, proxied through Cloudflare (orange cloud on)
- `A` record for `www.sparta-motors.com` → server IP, proxied
- `MX` records — preserve existing business email records (do not touch)
- `TXT` records — preserve SPF/DKIM/DMARC for the business email

**DNS cutover** happens on launch day. Update the A records to point to the new server. Because Cloudflare handles DNS, propagation is fast (usually under 5 minutes globally).

## SSL

**Use Cloudflare Origin Certificates:**

1. In the Cloudflare dashboard: SSL/TLS → Origin Server → Create Certificate
2. Choose 15-year validity (renewal is easy but this reduces maintenance)
3. Download the origin certificate and private key
4. Place at `/etc/ssl/sparta/origin.pem` and `/etc/ssl/sparta/origin.key` on the server
5. Set nginx to use these

**SSL/TLS mode in Cloudflare:** Full (strict). Cloudflare terminates SSL from the visitor, then makes a new SSL connection to the origin server. The origin cert is trusted by Cloudflare specifically.

Certificates from Cloudflare Origin are free and valid only when Cloudflare proxies traffic — but since we're using Cloudflare anyway, this is the cleanest setup.

**Alternative:** Let's Encrypt via certbot. Also free, more standard. Slightly more maintenance (auto-renewal). Either is fine.

## Cloudflare configuration

Beyond DNS and SSL:

- **Always Use HTTPS:** On. Redirects any HTTP request to HTTPS.
- **Automatic HTTPS Rewrites:** On. Fixes any leftover HTTP links in content.
- **Caching level:** Standard (this is fine for Phase 1).
- **Browser Cache TTL:** Respect Existing Headers (Next.js sets appropriate cache headers).
- **Minify:** Off. Next.js already handles minification.
- **Rocket Loader:** Off. Interferes with modern Next.js JS.
- **Firewall rules:** basic rate limiting on `/api/leads` and `/api/fleet-inquiries` to prevent spam bursts.

**Page rules (for Phase 2):**

When Phase 2 happens and sparta-parts.com consolidates:
- Cloudflare page rule: `sparta-parts.com/*` → `301 redirect` to `https://sparta-motors.com/parts/$1`

## Backups

Two backup strategies, both running:

**1. VPS provider snapshot.** Hetzner offers snapshots at €0.01/GB/month. Take a snapshot weekly. Retain 4 weeks.

**2. Database + media rsync.** Cron job that dumps the Postgres database and rsyncs both the DB dump and the `/media/` folder to a remote location weekly.

**Remote backup destination options:**
- A cheap S3 bucket (Cloudflare R2 has 10GB free tier)
- A second VPS at a different provider
- Backblaze B2 storage (very cheap)

**Backup script (`/home/sparta/backup.sh`):**

```bash
#!/bin/bash
DATE=$(date +%Y-%m-%d)
BACKUP_DIR=/tmp/backup-$DATE

mkdir -p $BACKUP_DIR

# Database dump
pg_dump -U sparta sparta_motors > $BACKUP_DIR/db.sql

# Media
tar czf $BACKUP_DIR/media.tar.gz /var/www/sparta-motors/media/

# Push to remote (using rclone or similar)
rclone copy $BACKUP_DIR sparta-backups:$DATE/

# Cleanup local
rm -rf $BACKUP_DIR
```

Add to crontab: `0 3 * * 0 /home/sparta/backup.sh` (every Sunday at 3 AM).

## Monitoring

Phase 1 keeps monitoring simple:

- **Uptime:** free tier of UptimeRobot or similar. Pings the homepage every 5 minutes. Alerts via email if down for 15+ minutes.
- **Server health:** `htop`, `df`, and PM2's `pm2 status` used on-demand via SSH. No dedicated monitoring stack at Phase 1 (adds cost and complexity for a small site).
- **Application errors:** PM2 logs at `/root/.pm2/logs/`. Rotated weekly.
- **Nginx logs:** `/var/log/nginx/access.log` and `error.log`.

**Phase 1.5:** Consider adding a proper monitoring service (UptimeRobot Pro, Better Uptime, or a simple statuspage) once there's real traffic to monitor.

## Payload media handling on this server

- Uploads land at `/var/www/sparta-motors/media/` (or wherever Payload's `staticDir` is configured)
- Nginx serves them directly with appropriate cache headers
- Cloudflare caches them at edge, so the origin only serves each file once
- If media grows past 5GB, migrate to Cloudflare R2 (still free at 10GB) — one-config-file change in Payload

## Rollback strategy

If a deploy breaks something:

1. **Immediate:** revert to the previous git commit and redeploy
2. **Database schema changes:** Payload's migration files are versioned; revert with `npx payload migrate:down`
3. **Full recovery from backup:** restore the latest DB dump + media archive to a fresh install if needed

## Cost summary

| Item | Cost |
|---|---|
| Hetzner CX22 | ~$5/month |
| Cloudflare (DNS, CDN, SSL, page rules) | $0 |
| Backup destination (R2 or similar) | $0-1/month |
| UptimeRobot free tier | $0 |
| Domain renewal | ~$12/year existing |
| **Total** | **~$5-6/month** |

## What good implementation looks like

- The server is reproducible — provisioning scripts or documented setup steps so we could rebuild it in a couple hours if needed
- Deploys are boring — a git pull, a build, a PM2 reload, and done
- SSL is automatic — Cloudflare Origin cert is valid for 15 years, no cron job renewal needed
- Backups actually work — test the restore process at least once during setup
- Server monitoring alerts to a phone number the admin actually checks
- The whole thing costs under $10/month
