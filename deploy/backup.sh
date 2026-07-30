#!/usr/bin/env bash
#
# Sparta Motors — nightly backup of the database and uploaded media.
#
# Install on the server:
#   sudo cp deploy/backup.sh /usr/local/bin/sparta-backup
#   sudo chmod +x /usr/local/bin/sparta-backup
#   crontab -e   →   0 3 * * * /usr/local/bin/sparta-backup >> /var/log/sparta/backup.log 2>&1
#
# Restore instructions live in deploy/README.md. Test a restore once before
# launch — an untested backup is not a backup.

set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/sparta-motors}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/sparta}"
# Number of daily backups to keep on the box. Two weeks is enough to notice and
# recover from "someone deleted a truck last Tuesday".
KEEP_DAYS="${KEEP_DAYS:-14}"
# Set to an rclone remote (e.g. "sparta-backups:daily") to also push off-box.
# Leave empty and backups stay local only — which does NOT protect against the
# server itself being lost.
RCLONE_REMOTE="${RCLONE_REMOTE:-}"

DATE=$(date +%Y-%m-%d-%H%M)
STAGE="$BACKUP_DIR/$DATE"

# DATABASE_URL comes from the app's own .env, so there is one source of truth
# for the credentials.
if [ -f "$APP_DIR/.env" ]; then
  DATABASE_URL=$(grep -E '^DATABASE_URL=' "$APP_DIR/.env" | head -1 | cut -d= -f2-)
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "[$(date -Is)] FATAL: DATABASE_URL not found in $APP_DIR/.env" >&2
  exit 1
fi

mkdir -p "$STAGE"

echo "[$(date -Is)] dumping database"
# Custom format (-Fc): compressed, and restorable selectively with pg_restore.
pg_dump --format=custom --no-owner --dbname="$DATABASE_URL" --file="$STAGE/db.dump"

echo "[$(date -Is)] archiving media"
if [ -d "$APP_DIR/media" ]; then
  # -C so the archive holds relative paths and can be unpacked anywhere.
  tar czf "$STAGE/media.tar.gz" -C "$APP_DIR" media
else
  echo "[$(date -Is)] WARNING: $APP_DIR/media does not exist — no photos backed up" >&2
fi

# Fail loudly on an empty dump rather than quietly keeping a useless backup.
if [ ! -s "$STAGE/db.dump" ]; then
  echo "[$(date -Is)] FATAL: database dump is empty" >&2
  exit 1
fi

if [ -n "$RCLONE_REMOTE" ]; then
  echo "[$(date -Is)] copying to $RCLONE_REMOTE/$DATE"
  rclone copy "$STAGE" "$RCLONE_REMOTE/$DATE"
else
  echo "[$(date -Is)] NOTE: RCLONE_REMOTE unset — backup is local only"
fi

echo "[$(date -Is)] pruning backups older than $KEEP_DAYS days"
find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime "+$KEEP_DAYS" -exec rm -rf {} +

echo "[$(date -Is)] done: $STAGE ($(du -sh "$STAGE" | cut -f1))"
