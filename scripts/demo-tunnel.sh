#!/usr/bin/env bash
#
# Put the LOCAL production build on a temporary public URL for a client demo.
#
#   bash scripts/demo-tunnel.sh
#
# This is NOT a deployment. It opens a Cloudflare "quick tunnel" to the app
# running on this machine. Close the terminal (or Ctrl-C) and the URL dies.
#
# Why this script exists rather than just running cloudflared: Payload checks
# the browser's Origin against its cors/csrf allowlist, which is built from
# NEXT_PUBLIC_SITE_URL + ALLOWED_ORIGINS. A quick-tunnel hostname is random and
# is in neither, so /admin login FAILS over the tunnel unless the app is
# restarted with that hostname in ALLOWED_ORIGINS. This script gets the URL
# first, then restarts the server with it set.
#
set -euo pipefail
cd "$(dirname "$0")/.."

command -v cloudflared >/dev/null || { echo "cloudflared not installed: brew install cloudflared"; exit 1; }
[ -d .next ] || { echo "No build found. Run: npm run build"; exit 1; }

LOG=$(mktemp -t sparta-tunnel)
cleanup() {
  echo ""
  echo "Shutting down the tunnel and the demo server…"
  [ -n "${TUNNEL_PID:-}" ] && kill "$TUNNEL_PID" 2>/dev/null || true
  pkill -f "next start" 2>/dev/null || true
  echo "Done. The public URL is dead."
}
trap cleanup EXIT INT TERM

echo "Starting tunnel…"
cloudflared tunnel --url http://localhost:3000 > "$LOG" 2>&1 &
TUNNEL_PID=$!

for _ in $(seq 1 60); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" 2>/dev/null | head -1 || true)
  [ -n "${URL:-}" ] && break
  sleep 1
done
[ -n "${URL:-}" ] || { echo "Tunnel failed to start. Log: $LOG"; exit 1; }

echo "Restarting the app so Payload accepts logins from that hostname…"
pkill -f "next start" 2>/dev/null || true
sleep 2
ALLOWED_ORIGINS="$URL" npm run start > /tmp/sparta-demo-server.log 2>&1 &

for _ in $(seq 1 60); do
  curl -sf -o /dev/null "$URL" 2>/dev/null && break
  sleep 2
done

cat <<EOF

──────────────────────────────────────────────────────────────
  SITE   $URL
  ADMIN  $URL/admin
──────────────────────────────────────────────────────────────

  Log in with your own account: farazbehlum@gmail.com

  Leave this terminal open — closing it kills the URL.
  This Mac must stay awake for the whole demo.

EOF

wait $TUNNEL_PID
