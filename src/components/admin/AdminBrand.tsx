import React from 'react'

/**
 * Renders at the very top of the admin left-nav (registered first in
 * `beforeNavLinks`). Two jobs:
 *  1. Shows the Sparta Motors wordmark as the sidebar's company header.
 *  2. Injects global admin CSS that darkens the left nav (Sparta black) with
 *     light text, so the sidebar reads distinctly against the white content.
 * Colors are fixed (not theme vars) because the sidebar is intentionally dark
 * even though the rest of the admin is locked to the light theme.
 */
const AdminBrand: React.FC = () => (
  <div className="sm-brand">
    <span className="sm-brand__mark" aria-hidden="true">
      ◆
    </span>
    <span className="sm-brand__word">
      <b>SPARTA</b> MOTORS
    </span>

    <style
      dangerouslySetInnerHTML={{
        __html: `
/* --- Sparta Motors branded dark sidebar --- */
.nav { background:#1a1a1a; border-right-color:#2b2b2b !important; }
.nav__link { color:#d9d5cd; }
.nav__link:hover { color:#ffffff; }
.nav__link--active { color:#f26b0f; }
.nav__link-indicator { background:#f26b0f; }
.nav-group__toggle, .nav-group__indicator, .nav__label { color:#8f8c84; }
.nav-group__toggle:hover { color:#d9d5cd; }
.nav__controls, .nav__log-out { color:#d9d5cd; }
.nav__log-out:hover { color:#f26b0f; }
.nav svg { color:currentColor; }

/* Company header at the top of the sidebar */
.sm-brand { display:flex; align-items:center; gap:8px; padding:2px 6px 16px; }
.sm-brand__mark { color:#f26b0f; font-size:15px; line-height:1; }
.sm-brand__word { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:600; letter-spacing:.03em; text-transform:uppercase; font-size:21px; line-height:1; color:#f26b0f; }
.sm-brand__word b { color:#f5f3f0; font-weight:800; }
`,
      }}
    />
  </div>
)

export default AdminBrand
