'use client'

import { useEffect } from 'react'
import { useDocumentInfo, useDocumentTitle } from '@payloadcms/ui'

const CREATE_TITLE = 'Add a New Truck'

/**
 * Invisible field on the Trucks edit view. A brand-new truck has no composed
 * title, so the header `<h1>` would read "[Untitled]". We rewrite it to
 * "Add a New Truck" on the create page only; on the edit page we leave the real
 * composed truck title in place.
 *
 * Why the microtask: the visible header reads from Payload's DocumentTitle
 * context, but `DocumentTitleProvider` (our ancestor) runs its own effect that
 * recomputes the title from doc data — which is empty on create, so it forces
 * "[Untitled]". Child effects fire before parent effects, so a plain
 * `setDocumentTitle` here gets clobbered on the same commit and, since the value
 * lands back on its initial "[Untitled]", React never re-renders to give us
 * another turn. Deferring into a microtask makes our write land *after* the
 * provider's, and re-running on `title` changes re-asserts it whenever the
 * provider resets (e.g. as the user types). Renders nothing.
 */
export default function TruckTitleField() {
  const { id } = useDocumentInfo()
  const { title, setDocumentTitle } = useDocumentTitle()

  const isCreate = !id

  useEffect(() => {
    if (!isCreate || title === CREATE_TITLE) return
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) setDocumentTitle(CREATE_TITLE)
    })
    return () => {
      cancelled = true
    }
  }, [isCreate, title, setDocumentTitle])

  return null
}
