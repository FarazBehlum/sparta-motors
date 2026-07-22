'use client'

import React, { useState } from 'react'

/**
 * Per-card actions for the Draft Review queue. Talks to Payload's REST API with
 * the admin's session cookie, so collection access control still applies
 * (e.g. only admins can delete). On success the page reloads so both the queue
 * and the sidebar "Draft review" badge reflect the change.
 *
 * - Publish   → status: published (blocked client-side without a photo)
 * - Edit      → opens the full listing form
 * - Send back → status: draft (+ optional reviewNote → emails the employee)
 * - Delete    → removes the listing (admin only)
 */

type Props = {
  truckId: number | string
  title: string
  canPublish: boolean
}

async function extractError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (Array.isArray(data?.errors) && data.errors[0]?.message) return data.errors[0].message
    if (typeof data?.message === 'string') return data.message
  } catch {
    /* fall through */
  }
  if (res.status === 403) return 'You do not have permission to do that.'
  return 'Something went wrong. Please try again.'
}

const DraftReviewActions: React.FC<Props> = ({ truckId, title, canPublish }) => {
  const [busy, setBusy] = useState<null | 'publish' | 'sendback' | 'delete'>(null)
  const [error, setError] = useState<string | null>(null)
  const editHref = `/admin/collections/trucks/${truckId}`

  const mutate = async (
    kind: 'publish' | 'sendback' | 'delete',
    method: 'PATCH' | 'DELETE',
    body?: Record<string, unknown>,
  ) => {
    setError(null)
    setBusy(kind)
    try {
      const res = await fetch(`/api/trucks/${truckId}`, {
        method,
        credentials: 'include',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!res.ok) {
        setError(await extractError(res))
        setBusy(null)
        return
      }
      // Reload so the queue and the nav badge both update.
      window.location.reload()
    } catch {
      setError('Network error. Please try again.')
      setBusy(null)
    }
  }

  const onPublish = () => {
    if (!canPublish) return
    mutate('publish', 'PATCH', { status: 'published' })
  }

  const onSendBack = () => {
    const note = window.prompt(
      `Send "${title}" back to the employee?\n\nOptional note (they'll get it by email):`,
      '',
    )
    if (note === null) return // cancelled
    mutate('sendback', 'PATCH', { status: 'draft', reviewNote: note.trim() })
  }

  const onDelete = () => {
    if (!window.confirm(`Delete "${title}"? This permanently removes the listing.`)) return
    mutate('delete', 'DELETE')
  }

  return (
    <div className="dra">
      {error ? <p className="dra__error">{error}</p> : null}

      <div className="dra__row">
        <button
          type="button"
          className="dra__btn dra__btn--publish"
          onClick={onPublish}
          disabled={busy !== null || !canPublish}
          title={canPublish ? 'Publish this listing' : 'Add a photo first (use Edit)'}
        >
          {busy === 'publish' ? 'Publishing…' : 'Publish'}
        </button>
        <a className="dra__btn dra__btn--edit" href={editHref}>
          Edit
        </a>
      </div>

      <div className="dra__row">
        <button
          type="button"
          className="dra__btn dra__btn--ghost"
          onClick={onSendBack}
          disabled={busy !== null}
        >
          {busy === 'sendback' ? 'Sending…' : 'Send back'}
        </button>
        <button
          type="button"
          className="dra__btn dra__btn--danger"
          onClick={onDelete}
          disabled={busy !== null}
        >
          {busy === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
      </div>

      {!canPublish ? (
        <p className="dra__hint">Add at least one photo (Edit) before this can be published.</p>
      ) : null}

      <style
        dangerouslySetInnerHTML={{
          __html: `
.dra { margin-top:6px; display:flex; flex-direction:column; gap:8px; }
.dra__error { margin:0; padding:8px 10px; background:rgba(192,57,43,.1); color:#c0392b; border-radius:6px; font-size:12.5px; }
.dra__row { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
.dra__btn { display:inline-flex; align-items:center; justify-content:center; padding:9px 12px; border-radius:7px; font-size:13px; font-weight:600; border:1px solid transparent; cursor:pointer; text-decoration:none; transition:background .12s, filter .12s, border-color .12s; }
.dra__btn:disabled { opacity:.55; cursor:not-allowed; }
.dra__btn--publish { background:#f26b0f; color:#fff; }
.dra__btn--publish:not(:disabled):hover { background:#f5843a; }
.dra__btn--edit { background:var(--theme-elevation-100); color:var(--theme-elevation-1000); }
.dra__btn--edit:hover { background:var(--theme-elevation-150); }
.dra__btn--ghost { background:transparent; border-color:var(--theme-elevation-200); color:var(--theme-elevation-800); }
.dra__btn--ghost:not(:disabled):hover { background:var(--theme-elevation-100); }
.dra__btn--danger { background:transparent; border-color:rgba(192,57,43,.4); color:#c0392b; }
.dra__btn--danger:not(:disabled):hover { background:rgba(192,57,43,.08); }
.dra__hint { margin:0; font-size:11.5px; color:var(--theme-elevation-500); }
`,
        }}
      />
    </div>
  )
}

export default DraftReviewActions
