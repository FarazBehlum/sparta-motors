/**
 * PM2 process definition for the Sparta Motors app.
 *
 * Used on the server as:
 *   pm2 start deploy/ecosystem.config.cjs
 *   pm2 save && pm2 startup      # survive a reboot
 *
 * `.cjs`, not `.js`: package.json sets "type": "module", so a plain .js file
 * here would be treated as ESM and `module.exports` would throw.
 */
module.exports = {
  apps: [
    {
      name: 'sparta',
      cwd: '/var/www/sparta-motors',

      // Call Next's binary directly rather than going through `npm start`. npm
      // would sit in the process tree as a middleman that swallows signals, so
      // `pm2 reload` wouldn't shut the app down cleanly.
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',

      // One process. The site is a handful of pages backed by Postgres on the
      // same box; cluster mode would multiply DB connections for no gain, and
      // the in-memory form rate limiter (src/lib/rate-limit.ts) is per-process,
      // so multiple workers would each grant their own quota.
      instances: 1,
      exec_mode: 'fork',

      env: {
        // Load-bearing. Payload's Postgres adapter auto-pushes schema changes
        // whenever NODE_ENV is not 'production' — on the live database that
        // could alter or drop columns without a migration. Never remove this.
        NODE_ENV: 'production',
        NODE_OPTIONS: '--no-deprecation',
        PORT: '3000',
      },

      // Everything else (DATABASE_URL, PAYLOAD_SECRET, SMTP_*) comes from the
      // .env file in `cwd`, which Next loads itself at startup.

      max_memory_restart: '1G',
      autorestart: true,
      // If it dies 10 times inside a minute, stop trying — something is broken
      // (bad env, DB down) and a restart loop just buries the real error.
      max_restarts: 10,
      min_uptime: '60s',

      error_file: '/var/log/sparta/error.log',
      out_file: '/var/log/sparta/out.log',
      merge_logs: true,
      time: true,
    },
  ],
}
