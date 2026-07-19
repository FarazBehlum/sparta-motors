import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { getDashboardData, type ActivityItem } from '../../lib/admin-dashboard'
import { formatDateTime } from '../../lib/format'

const LEADS_NEW = '/admin/collections/leads?where[status][equals]=new'
const TRUCKS_PENDING = '/admin/collections/trucks?where[status][equals]=pending-review'
const TRUCKS_PUBLISHED = '/admin/collections/trucks?where[status][equals]=published'
const FLEET_ALL = '/admin/collections/fleet-inquiries'
const NEW_TRUCK = '/admin/collections/trucks/create'
const EXPORT_ALL = '/api/leads/export-csv'
const EXPORT_WEEK = '/api/leads/export-csv?days=7'

function greeting(name?: string): string {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  return name ? `${day} · Welcome back, ${name}.` : day
}

function StatCard({
  label,
  value,
  change,
  href,
  hot,
}: {
  label: string
  value: number
  change: string
  href: string
  hot?: boolean
}) {
  return (
    <a className="sd-stat" href={href}>
      <span className="sd-stat__label">{label}</span>
      <span className="sd-stat__view">VIEW →</span>
      <span className={`sd-stat__value${hot ? ' sd-stat__value--hot' : ''}`}>{value}</span>
      <span className="sd-stat__change">{change}</span>
    </a>
  )
}

function ActivityRow({ item }: { item: ActivityItem }) {
  return (
    <li className="sd-act">
      <span className={`sd-dot sd-dot--${item.dot}`} aria-hidden="true" />
      <span className="sd-act__body">
        <span className="sd-act__text">
          {item.text}
          {item.truck ? <strong className="sd-act__truck"> {item.truck}</strong> : null}
        </span>
        <span className="sd-act__meta">
          {item.tag ? <span className="sd-act__tag">{item.tag}</span> : null}
          {formatDateTime(item.when)}
        </span>
      </span>
    </li>
  )
}

const Dashboard: React.FC<AdminViewServerProps> = async ({ initPageResult }) => {
  const { req } = initPageResult
  const user = req.user as { firstName?: string; role?: string } | null
  const data = await getDashboardData(req.payload, req)

  const subtitleBits: string[] = []
  if (data.pendingReview > 0) subtitleBits.push(`${data.pendingReview} draft${data.pendingReview === 1 ? '' : 's'} to review`)
  if (data.newLeads > 0) subtitleBits.push(`${data.newLeads} new lead${data.newLeads === 1 ? '' : 's'}`)
  const context = subtitleBits.length ? subtitleBits.join(', ') + '.' : 'All caught up.'

  return (
    <div className="sd">
      <DashboardStyles />

      <header className="sd-head">
        <div>
          <p className="sd-kicker">◆ WELCOME BACK</p>
          <h1 className="sd-title">Dashboard.</h1>
          <p className="sd-sub">{greeting(user?.firstName)} · {context}</p>
        </div>
        <div className="sd-head__actions">
          <a className="sd-btn sd-btn--ghost" href={EXPORT_ALL}>Export CSV</a>
          <a className="sd-btn sd-btn--primary" href={NEW_TRUCK}>+ New Truck</a>
        </div>
      </header>

      <section className="sd-stats">
        <StatCard
          label="NEW LEADS"
          value={data.newLeads}
          change={
            data.newLeadsSinceYesterday > 0
              ? `↑ ${data.newLeadsSinceYesterday} since yesterday`
              : 'No new leads today'
          }
          href={LEADS_NEW}
          hot
        />
        <StatCard
          label="DRAFTS TO REVIEW"
          value={data.pendingReview}
          change={
            data.oldestPendingDays != null
              ? `Oldest: ${data.oldestPendingDays} day${data.oldestPendingDays === 1 ? '' : 's'} ago`
              : 'Queue is clear'
          }
          href={TRUCKS_PENDING}
        />
        <StatCard
          label="PUBLISHED TRUCKS"
          value={data.publishedTrucks}
          change={data.publishedThisWeek > 0 ? `↑ ${data.publishedThisWeek} this week` : '—'}
          href={TRUCKS_PUBLISHED}
        />
        <StatCard
          label="FLEET INQUIRIES"
          value={data.fleetThisWeek}
          change={`Total: ${data.fleetTotal}`}
          href={FLEET_ALL}
        />
      </section>

      <section className="sd-split">
        <div className="sd-panel">
          <div className="sd-panel__head">
            <h2 className="sd-panel__title">Recent activity</h2>
            <a className="sd-panel__link" href="/admin/collections/leads">VIEW ALL →</a>
          </div>
          {data.activity.length ? (
            <ul className="sd-actlist">
              {data.activity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </ul>
          ) : (
            <p className="sd-empty">No recent activity yet. Leads and published trucks will appear here.</p>
          )}
        </div>

        <div className="sd-panel">
          <div className="sd-panel__head">
            <h2 className="sd-panel__title">Quick actions</h2>
          </div>
          <div className="sd-qa">
            <a className="sd-qacard sd-qacard--dark" href={TRUCKS_PENDING}>
              <span className="sd-qacard__body">
                <strong>Review drafts</strong>
                <span>
                  {data.pendingReview
                    ? `${data.pendingReview} employee submission${data.pendingReview === 1 ? '' : 's'} waiting`
                    : 'No drafts waiting'}
                </span>
              </span>
              {data.pendingReview ? <span className="sd-badge">{data.pendingReview}</span> : null}
            </a>
            <a className="sd-qacard" href={LEADS_NEW}>
              <span className="sd-qacard__body">
                <strong>View new leads</strong>
                <span>{data.newLeads ? `${data.newLeads} unanswered ${data.newLeads === 1 ? 'inquiry' : 'inquiries'}` : 'All leads handled'}</span>
              </span>
              {data.newLeads ? <span className="sd-badge">{data.newLeads}</span> : null}
            </a>
            <a className="sd-qacard" href={NEW_TRUCK}>
              <span className="sd-qacard__body">
                <strong>Add a truck yourself</strong>
                <span>Skip the review process</span>
              </span>
            </a>
            <a className="sd-qacard" href={EXPORT_WEEK}>
              <span className="sd-qacard__body">
                <strong>Export leads report</strong>
                <span>Past-week CSV for spreadsheet</span>
              </span>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

/** Scoped styles for the dashboard — brand palette, no external deps. */
const DashboardStyles = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
.sd { --sd-black:#1a1a1a; --sd-bone:#f5f3f0; --sd-warm:#eeece5; --sd-orange:#f26b0f;
  --sd-iron:#5f5e5a; --sd-line:#e3e1da; --sd-green:#16803b; --sd-gray:#9b998f;
  max-width:1280px; margin:0 auto; padding:8px 4px 48px; }
.sd a { text-decoration:none; }
.sd-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; margin-bottom:28px; }
.sd-kicker { margin:0 0 6px; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.14em; color:var(--sd-orange); }
.sd-title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:40px; line-height:1; letter-spacing:-.01em; color:var(--sd-black); text-transform:none; }
.sd-sub { margin:8px 0 0; color:var(--sd-iron); font-size:14px; }
.sd-head__actions { display:flex; gap:10px; }
.sd-btn { display:inline-flex; align-items:center; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid transparent; cursor:pointer; white-space:nowrap; }
.sd-btn--ghost { border-color:var(--sd-line); color:var(--sd-black); background:transparent; }
.sd-btn--ghost:hover { background:var(--sd-warm); }
.sd-btn--primary { background:var(--sd-orange); color:#fff; }
.sd-btn--primary:hover { background:#d95c08; }

.sd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
.sd-stat { position:relative; display:flex; flex-direction:column; background:#fff; border:1px solid var(--sd-line); border-radius:10px; padding:22px 24px; transition:border-color .15s, transform .15s; }
.sd-stat:hover { border-color:var(--sd-orange); transform:translateY(-1px); }
.sd-stat__label { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.1em; color:var(--sd-iron); }
.sd-stat__view { position:absolute; top:20px; right:22px; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-orange); opacity:0; transition:opacity .15s; }
.sd-stat:hover .sd-stat__view { opacity:1; }
.sd-stat__value { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:44px; line-height:1.05; margin-top:6px; color:var(--sd-black); }
.sd-stat__value--hot { color:var(--sd-orange); }
.sd-stat__change { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-iron); margin-top:4px; }

.sd-split { display:grid; grid-template-columns:1.5fr 1fr; gap:16px; }
.sd-panel { background:#fff; border:1px solid var(--sd-line); border-radius:10px; padding:24px 26px; }
.sd-panel__head { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--sd-black); padding-bottom:12px; margin-bottom:14px; }
.sd-panel__title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:22px; color:var(--sd-black); }
.sd-panel__link { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-orange); }

.sd-actlist { list-style:none; margin:0; padding:0; }
.sd-act { display:flex; gap:12px; padding:11px 0; border-bottom:1px solid var(--sd-line); }
.sd-act:last-child { border-bottom:0; }
.sd-dot { width:9px; height:9px; border-radius:50%; margin-top:5px; flex:0 0 auto; }
.sd-dot--orange { background:var(--sd-orange); }
.sd-dot--green { background:var(--sd-green); }
.sd-dot--gray { background:var(--sd-gray); }
.sd-act__body { display:flex; flex-direction:column; gap:3px; }
.sd-act__text { font-size:14px; color:var(--sd-black); }
.sd-act__truck { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; text-transform:uppercase; letter-spacing:.01em; }
.sd-act__meta { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-iron); display:flex; align-items:center; gap:8px; }
.sd-act__tag { background:var(--sd-warm); color:var(--sd-black); padding:1px 6px; border-radius:4px; letter-spacing:.08em; }
.sd-empty { color:var(--sd-iron); font-size:14px; margin:4px 0; }

.sd-qa { display:flex; flex-direction:column; gap:10px; }
.sd-qacard { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:16px 18px; border-radius:8px; background:var(--sd-warm); border:1px solid transparent; transition:transform .15s; }
.sd-qacard:hover { transform:translateY(-1px); }
.sd-qacard__body { display:flex; flex-direction:column; gap:3px; }
.sd-qacard__body strong { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:17px; color:var(--sd-black); }
.sd-qacard__body span { font-size:12.5px; color:var(--sd-iron); }
.sd-qacard--dark { background:var(--sd-black); }
.sd-qacard--dark strong { color:#fff; }
.sd-qacard--dark span { color:var(--sd-concrete,#b4b2a9); }
.sd-badge { background:var(--sd-orange); color:#fff; font-family:var(--font-mono,ui-monospace,monospace); font-size:13px; font-weight:700; min-width:26px; height:26px; border-radius:13px; display:flex; align-items:center; justify-content:center; padding:0 8px; }

@media (max-width:1100px){ .sd-stats{ grid-template-columns:repeat(2,1fr);} .sd-split{ grid-template-columns:1fr;} }
@media (max-width:560px){ .sd-stats{ grid-template-columns:1fr;} .sd-title{ font-size:32px;} }
`,
    }}
  />
)

export default Dashboard
