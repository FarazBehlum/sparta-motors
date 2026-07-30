import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { DefaultTemplate } from '@payloadcms/next/templates'
import type { Truck, User } from '@/payload-types'
import { truckPrimaryPhoto } from '../../lib/media'
import { formatPrice, formatMileage, formatDateTime, makeLabel, bodyTypeLabel } from '../../lib/format'
import DraftReviewActions from './DraftReviewActions'

/**
 * Custom admin view at /admin/draft-review. A Marketplace-style approval queue:
 * every truck an employee submitted for review (status = pending-review) shows
 * as a card with its photo, specs, and per-card actions (Publish / Edit /
 * Send back / Delete). Server component — the interactive buttons live in the
 * DraftReviewActions client child.
 */

function truckTitle(t: Truck): string {
  return [t.year, makeLabel(t.make), t.model, t.trim].filter(Boolean).join(' ')
}

function employeeName(assigned: Truck['assignedEmployee']): string | null {
  if (assigned && typeof assigned === 'object') {
    const u = assigned as User
    const name = [u.firstName, u.lastName].filter(Boolean).join(' ').trim()
    return name || u.email || null
  }
  return null
}

function ReviewCard({ truck }: { truck: Truck }) {
  const photo = truckPrimaryPhoto(truck, 'card')
  const submittedBy = employeeName(truck.assignedEmployee)
  const specs = [
    formatMileage(truck.mileage),
    bodyTypeLabel(truck.bodyType),
    truck.fuelType ? truck.fuelType[0].toUpperCase() + truck.fuelType.slice(1) : null,
    truck.condition ? truck.condition[0].toUpperCase() + truck.condition.slice(1) : null,
  ].filter(Boolean) as string[]

  return (
    <article className="dr-card">
      <div className="dr-card__media">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt={photo.alt} />
        ) : (
          <div className="dr-card__nophoto">
            <span>No photo</span>
            <small>Required before publishing</small>
          </div>
        )}
        <span className="dr-card__stock">{truck.stockNumber ?? '—'}</span>
      </div>

      <div className="dr-card__body">
        <div className="dr-card__headrow">
          <h2 className="dr-card__title">{truckTitle(truck)}</h2>
          <span className="dr-card__price">{formatPrice(truck.price)}</span>
        </div>

        <ul className="dr-card__specs">
          {specs.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>

        {truck.vin && <p className="dr-card__vin">VIN {truck.vin}</p>}

        <p className="dr-card__meta">
          {submittedBy ? <>Submitted by <strong>{submittedBy}</strong> · </> : null}
          Updated {formatDateTime(truck.updatedAt)}
        </p>

        <DraftReviewActions
          truckId={truck.id}
          title={truckTitle(truck)}
          canPublish={!!photo}
        />
      </div>
    </article>
  )
}

const DraftReview: React.FC<AdminViewServerProps> = async ({
  initPageResult,
  params,
  searchParams,
}) => {
  const { req } = initPageResult
  const result = await req.payload.find({
    collection: 'trucks',
    where: { status: { equals: 'pending-review' } },
    sort: 'updatedAt', // oldest first — review in the order submitted
    depth: 1,
    limit: 100,
    req,
  })
  const trucks = result.docs as Truck[]
  const n = trucks.length

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={initPageResult.locale}
      params={params}
      payload={req.payload}
      permissions={initPageResult.permissions}
      req={req}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={initPageResult.visibleEntities}
    >
      <div className="dr">
        <DraftReviewStyles />

      <header className="dr-head">
        <div>
          <p className="dr-kicker">◆ REVIEW QUEUE</p>
          <h1 className="dr-title">Draft review.</h1>
          <p className="dr-sub">
            {n
              ? `${n} truck${n === 1 ? '' : 's'} submitted for review — publish, edit, or send back.`
              : 'Nothing waiting for review right now.'}
          </p>
        </div>
        <a className="dr-btn dr-btn--ghost" href="/admin/collections/trucks">
          All trucks →
        </a>
      </header>

      {n ? (
        <section className="dr-grid">
          {trucks.map((t) => (
            <ReviewCard key={t.id} truck={t} />
          ))}
        </section>
      ) : (
        <div className="dr-empty">
          <p className="dr-empty__lead">Queue is clear. 🎉</p>
          <p className="dr-empty__sub">
            When an employee submits a draft for review, it appears here for you to publish.
          </p>
          <a className="dr-btn dr-btn--primary" href="/admin/collections/trucks/create">
            + Add a truck yourself
          </a>
        </div>
      )}
      </div>
    </DefaultTemplate>
  )
}

const DraftReviewStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
.dr { --dr-orange:#f26b0f; --dr-orange-light:#f5843a;
  --dr-text:var(--theme-elevation-1000); --dr-muted:var(--theme-elevation-500);
  --dr-card:var(--theme-elevation-0); --dr-alt:var(--theme-elevation-100);
  --dr-line:var(--theme-elevation-150); --dr-red:#c0392b;
  max-width:1280px; margin:0 auto; padding:8px 4px 48px; }
.dr a { text-decoration:none; }
.dr-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; margin-bottom:28px; }
.dr-kicker { margin:0 0 6px; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.14em; color:var(--dr-orange); }
.dr-title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:40px; line-height:1; letter-spacing:-.01em; color:var(--dr-text); text-transform:none; }
.dr-sub { margin:8px 0 0; color:var(--dr-muted); font-size:14px; }

.dr-btn { display:inline-flex; align-items:center; justify-content:center; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid transparent; cursor:pointer; white-space:nowrap; transition:background .15s, filter .15s, border-color .15s; }
.dr-btn--ghost { border-color:var(--dr-line); color:var(--dr-text); background:transparent; }
.dr-btn--ghost:hover { background:var(--dr-alt); }
.dr-btn--primary { background:var(--dr-orange); color:#fff; }
.dr-btn--primary:hover { background:var(--dr-orange-light); }

.dr-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:18px; }
.dr-card { display:flex; flex-direction:column; background:var(--dr-card); border:1px solid var(--dr-line); border-radius:12px; overflow:hidden; transition:border-color .15s, box-shadow .15s; }
.dr-card:hover { border-color:var(--dr-orange); box-shadow:0 6px 20px rgba(0,0,0,.06); }
.dr-card__media { position:relative; aspect-ratio:4/3; background:var(--dr-alt); }
.dr-card__media img { width:100%; height:100%; object-fit:cover; display:block; }
.dr-card__nophoto { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2px; color:var(--dr-muted); }
.dr-card__nophoto span { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:18px; text-transform:uppercase; letter-spacing:.02em; }
.dr-card__nophoto small { font-size:11px; color:var(--dr-red); }
.dr-card__stock { position:absolute; top:10px; left:10px; background:rgba(26,26,26,.82); color:#f5f3f0; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; padding:3px 8px; border-radius:5px; }
.dr-card__body { display:flex; flex-direction:column; gap:8px; padding:16px 18px 18px; }
.dr-card__headrow { display:flex; justify-content:space-between; align-items:baseline; gap:12px; }
.dr-card__title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:20px; line-height:1.1; color:var(--dr-text); }
.dr-card__price { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:20px; color:var(--dr-orange); white-space:nowrap; }
.dr-card__specs { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:6px; }
.dr-card__specs li { background:var(--dr-alt); color:var(--dr-text); font-size:12px; padding:2px 8px; border-radius:5px; }
.dr-card__vin { margin:2px 0 0; font-family:var(--font-mono,ui-monospace,monospace); font-size:11.5px; color:var(--dr-muted); letter-spacing:.02em; }
.dr-card__meta { margin:0 0 4px; font-size:12px; color:var(--dr-muted); }
.dr-card__meta strong { color:var(--dr-text); font-weight:600; }

.dr-empty { text-align:center; padding:64px 24px; background:var(--dr-card); border:1px dashed var(--dr-line); border-radius:12px; }
.dr-empty__lead { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:24px; color:var(--dr-text); }
.dr-empty__sub { margin:8px auto 20px; max-width:420px; color:var(--dr-muted); font-size:14px; }

@media (max-width:560px){ .dr-title{ font-size:32px;} .dr-grid{ grid-template-columns:1fr;} }
`,
    }}
  />
)

export default DraftReview
