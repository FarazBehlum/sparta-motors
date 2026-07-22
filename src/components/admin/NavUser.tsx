'use client'

import React from 'react'
import { useAuth } from '@payloadcms/ui'

/**
 * Renders at the top of the admin left-nav (registered as `beforeNavLinks`).
 * Shows who's signed in + a log-out link. `/admin/account` and `/admin/logout`
 * are Payload's built-in routes. Styling routes through the admin theme vars so
 * it adapts to light/dark.
 */
const NavUser: React.FC = () => {
  const { user } = useAuth()
  const u = user as { firstName?: string; lastName?: string; email?: string; role?: string } | null

  const name = [u?.firstName, u?.lastName].filter(Boolean).join(' ') || u?.email || 'Account'
  const initial = (name.trim()[0] || 'U').toUpperCase()

  return (
    <div className="sd-navuser">
      <a className="sd-navuser__id" href="/admin/account" title="Account settings">
        <span className="sd-navuser__avatar" aria-hidden="true">
          {initial}
        </span>
        <span className="sd-navuser__meta">
          <span className="sd-navuser__name">{name}</span>
          {u?.role ? <span className="sd-navuser__role">{u.role}</span> : null}
        </span>
      </a>
      <a className="sd-navuser__logout" href="/admin/logout">
        Log out
      </a>

      <style
        dangerouslySetInnerHTML={{
          __html: `
/* Styled for the dark Sparta sidebar (see AdminBrand). */
.sd-navuser { display:flex; align-items:center; gap:8px; padding:2px 4px 14px; margin-bottom:10px; border-bottom:1px solid #2b2b2b; }
.sd-navuser__id { display:flex; align-items:center; gap:10px; flex:1 1 auto; min-width:0; text-decoration:none; border-radius:8px; padding:6px; transition:background .15s; }
.sd-navuser__id:hover { background:rgba(255,255,255,.06); }
.sd-navuser__avatar { flex:0 0 auto; width:34px; height:34px; border-radius:50%; background:#f26b0f; color:#fff; display:flex; align-items:center; justify-content:center; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:16px; }
.sd-navuser__meta { display:flex; flex-direction:column; min-width:0; }
.sd-navuser__name { font-weight:600; font-size:14px; color:#f5f3f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.sd-navuser__role { font-family:var(--font-mono,ui-monospace,monospace); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:#8f8c84; }
.sd-navuser__logout { flex:0 0 auto; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.06em; text-transform:uppercase; color:#d9d5cd; text-decoration:none; padding:6px 8px; border-radius:6px; border:1px solid #3a3a3a; transition:color .15s, border-color .15s; }
.sd-navuser__logout:hover { color:#f26b0f; border-color:#f26b0f; }
`,
        }}
      />
    </div>
  )
}

export default NavUser
