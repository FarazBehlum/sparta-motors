'use client'

import React, { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Custom sidebar section rendered in `beforeNavLinks` (below the brand + user,
 * above the auto-generated collection groups). Two jobs:
 *
 *  1. Renders the "Dashboard" link and a cohesive "Inventory" group
 *     (All trucks / Add a truck / Draft review + live pending badge) that the
 *     auto-nav can't express. These reuse Payload's `nav__link` classes so they
 *     look identical to the auto links.
 *  2. Injects global CSS that (a) hides the now-redundant auto "Inventory" group
 *     — the Trucks collection stays fully accessible, only its duplicate nav
 *     entry is hidden — and (b) gives every nav option a small icon, so the
 *     custom Inventory items and the auto Leads / Content / Team links share one
 *     consistent iconed look.
 *
 * Icons are injected as CSS mask-images keyed off each link's href, so they
 * ride the link's text color (inheriting hover/active states automatically).
 */

const isActive = (pathname: string, href: string, match: 'exact' | 'prefix') => {
  const clean = (s: string) => (s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s)
  const p = clean(pathname)
  const h = clean(href)
  return match === 'prefix' ? p === h || p.startsWith(h + '/') : p === h
}

const AdminNavLinks: React.FC = () => {
  const pathname = usePathname() || ''
  const [pending, setPending] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    fetch('/api/trucks?where[status][equals]=pending-review&limit=0&depth=0', {
      credentials: 'include',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d && typeof d.totalDocs === 'number') setPending(d.totalDocs)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [pathname])

  const link = (href: string, label: string, match: 'exact' | 'prefix', badge?: number) => {
    const active = isActive(pathname, href, match)
    return (
      <a href={href} className={`nav__link smnav-link${active ? ' nav__link--active' : ''}`}>
        <span className="nav__link-label">{label}</span>
        {badge ? <span className="smnav-badge">{badge}</span> : null}
      </a>
    )
  }

  return (
    <div className="smnav">
      {link('/admin', 'Dashboard', 'exact')}

      <p className="smnav-group">Inventory</p>
      {link('/admin/collections/trucks', 'All trucks', 'exact')}
      {link('/admin/collections/trucks/create', 'Add a truck', 'exact')}
      {link('/admin/draft-review', 'Draft review', 'prefix', pending ?? undefined)}

      <NavIconStyles />
    </div>
  )
}

/**
 * Global nav styling: hide the redundant auto Inventory group, style the custom
 * section to match the auto links, and mask-icon every option.
 */
const NavIconStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
/* Hide the auto-generated Inventory group — the custom section above replaces it.
   (The Trucks collection routes stay fully accessible.) */
#nav-group-Inventory { display:none !important; }

/* Fleet feature retired — hide its nav entry but keep the collection + its data
   reachable by direct URL (/admin/collections/fleet-inquiries). */
.nav__link[href$="/collections/fleet-inquiries"] { display:none !important; }

/* Custom section spacing + group label to match the auto group labels. */
.smnav { display:flex; flex-direction:column; gap:2px; margin-bottom:6px; }
/* Match the auto group labels (Leads / Content / Team): title case, same size/color. */
.smnav-group { margin:16px 0 6px; padding:0 8px; font-size:13px; font-weight:500; color:#8f8c84; }
.smnav-link { display:flex !important; align-items:center; }
.smnav-badge { margin-left:auto; background:#f26b0f; color:#fff; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; font-weight:700; min-width:20px; height:20px; border-radius:10px; display:flex; align-items:center; justify-content:center; padding:0 6px; }

/* --- Icon system: a small mask-image before every option. Shares the link's
   text color so hover/active states carry through. --- */
.nav__link[href$="/admin"]::before,
.nav__link[href$="/collections/trucks"]::before,
.nav__link[href$="/collections/trucks/create"]::before,
.nav__link[href$="/draft-review"]::before,
.nav__link[href$="/collections/leads"]::before,
.nav__link[href$="/collections/media"]::before,
.nav__link[href$="/collections/pages"]::before,
.nav__link[href$="/collections/users"]::before,
.nav__link[href$="/globals/settings"]::before {
  content:""; flex:0 0 auto; display:inline-block; width:16px; height:16px; margin-right:10px; vertical-align:-3px;
  background-color:currentColor;
  -webkit-mask-repeat:no-repeat; mask-repeat:no-repeat;
  -webkit-mask-position:center; mask-position:center;
  -webkit-mask-size:contain; mask-size:contain;
}
.nav__link[href$="/admin"]::before { -webkit-mask-image:var(--ic-dashboard); mask-image:var(--ic-dashboard); }
.nav__link[href$="/collections/trucks"]::before { -webkit-mask-image:var(--ic-truck); mask-image:var(--ic-truck); }
.nav__link[href$="/collections/trucks/create"]::before { -webkit-mask-image:var(--ic-plus); mask-image:var(--ic-plus); }
.nav__link[href$="/draft-review"]::before { -webkit-mask-image:var(--ic-review); mask-image:var(--ic-review); }
.nav__link[href$="/collections/leads"]::before { -webkit-mask-image:var(--ic-mail); mask-image:var(--ic-mail); }
.nav__link[href$="/collections/media"]::before { -webkit-mask-image:var(--ic-image); mask-image:var(--ic-image); }
.nav__link[href$="/collections/pages"]::before { -webkit-mask-image:var(--ic-doc); mask-image:var(--ic-doc); }
.nav__link[href$="/collections/users"]::before { -webkit-mask-image:var(--ic-users); mask-image:var(--ic-users); }
.nav__link[href$="/globals/settings"]::before { -webkit-mask-image:var(--ic-gear); mask-image:var(--ic-gear); }

/* Icon path definitions (mask data-URIs). */
.nav {
  --ic-dashboard:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'%3E%3Cpath d='M2 2h5v5H2z M9 2h5v5H9z M2 9h5v5H2z M9 9h5v5H9z'/%3E%3C/svg%3E");
  --ic-truck:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'%3E%3Cpath d='M1 4h8v6H1z M9 6h3l2 2v2H9z M4.5 12.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z M11.5 12.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z'/%3E%3C/svg%3E");
  --ic-plus:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M8 3v10 M3 8h10'/%3E%3C/svg%3E");
  --ic-review:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round' stroke-linecap='round'%3E%3Cpath d='M4 2h5l3 3v9H4z M9 2v3h3 M6 8.5l1.4 1.4L10 7'/%3E%3C/svg%3E");
  --ic-mail:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'%3E%3Cpath d='M2 4h12v8H2z M2 4l6 4 6-4'/%3E%3C/svg%3E");
  --ic-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'%3E%3Cpath d='M2 3h12v10H2z M6 7a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4z M3 11l3.5-3 2.5 2.5 2.5-2 2.5 2.5'/%3E%3C/svg%3E");
  --ic-doc:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round'%3E%3Cpath d='M4 2h5l3 3v9H4z M9 2v3h3 M6 8h4 M6 10.5h4'/%3E%3C/svg%3E");
  --ic-users:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round' stroke-linecap='round'%3E%3Cpath d='M6 7.5a2.3 2.3 0 100-4.6 2.3 2.3 0 000 4.6z M1.6 14c.2-2.4 2-3.8 4.4-3.8s4.2 1.4 4.4 3.8 M11 7.5a2 2 0 10-1.6-3.2 M11 10.4c1.9.1 3.2 1.4 3.4 3.3'/%3E%3C/svg%3E");
  --ic-gear:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='none' stroke='%23000' stroke-width='1.4' stroke-linejoin='round' stroke-linecap='round'%3E%3Cpath d='M8 5.6a2.4 2.4 0 100 4.8 2.4 2.4 0 000-4.8z M8 1.5v2 M8 12.5v2 M1.5 8h2 M12.5 8h2 M3.4 3.4l1.4 1.4 M11.2 11.2l1.4 1.4 M12.6 3.4l-1.4 1.4 M4.8 11.2l-1.4 1.4'/%3E%3C/svg%3E");
}
`,
    }}
  />
)

export default AdminNavLinks
