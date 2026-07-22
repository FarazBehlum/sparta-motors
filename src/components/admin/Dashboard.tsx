import type { AdminViewServerProps } from 'payload'
import React from 'react'
import { getDashboardData, type ActivityItem, type LeadsDay } from '../../lib/admin-dashboard'
import { formatDateTime } from '../../lib/format'

/* Small inline stroke icons — no external icon dependency. */
const ICON: Record<string, React.ReactNode> = {
  leads: (
    <path d="M2 4h12v8H2z M2 4l6 4 6-4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  drafts: (
    <path d="M4 2h5l3 3v9H4z M9 2v3h3 M6 8h4 M6 10.5h4" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  ),
  truck: (
    <path d="M1 4h8v6H1z M9 6h3l2 2v2H9z M4.5 12.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z M11.5 12.5a1.3 1.3 0 100-2.6 1.3 1.3 0 000 2.6z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  ),
}

function StatIcon({ name }: { name: keyof typeof ICON }) {
  return (
    <svg className="sd-stat__icon" viewBox="0 0 16 16" width="18" height="18" aria-hidden="true">
      {ICON[name]}
    </svg>
  )
}

const LEADS_NEW = '/admin/collections/leads?where[status][equals]=new'
const TRUCKS_PENDING = '/admin/collections/trucks?where[status][equals]=pending-review'
const TRUCKS_PUBLISHED = '/admin/collections/trucks?where[status][equals]=published'
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
  icon,
  hot,
}: {
  label: string
  value: number
  change: string
  href: string
  icon: keyof typeof ICON
  hot?: boolean
}) {
  return (
    <a className="sd-stat" href={href}>
      <span className="sd-stat__top">
        <StatIcon name={icon} />
        <span className="sd-stat__label">{label}</span>
      </span>
      <span className="sd-stat__view">VIEW →</span>
      <span className={`sd-stat__value${hot ? ' sd-stat__value--hot' : ''}`}>{value}</span>
      <span className="sd-stat__change">{change}</span>
    </a>
  )
}

/** Compact inline-SVG bar chart of leads over the last 7 days. No chart lib. */
function LeadsChart({ days }: { days: LeadsDay[] }) {
  const max = Math.max(1, ...days.map((d) => d.count))
  const total = days.reduce((s, d) => s + d.count, 0)
  return (
    <div className="sd-panel sd-chart">
      <div className="sd-panel__head">
        <h2 className="sd-panel__title">Leads · last 7 days</h2>
        <span className="sd-chart__total">{total} total</span>
      </div>
      <div className="sd-chart__bars" role="img" aria-label={`Leads per day, last 7 days: ${days.map((d) => `${d.full} ${d.count}`).join(', ')}`}>
        {days.map((d, i) => (
          <div className="sd-chart__col" key={i}>
            <span className="sd-chart__count">{d.count}</span>
            <span className="sd-chart__track">
              <span
                className="sd-chart__bar"
                style={{ height: `${Math.round((d.count / max) * 100)}%` }}
              />
            </span>
            <span className="sd-chart__day">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
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
          icon="leads"
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
          icon="drafts"
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
          icon="truck"
          change={data.publishedThisWeek > 0 ? `↑ ${data.publishedThisWeek} this week` : '—'}
          href={TRUCKS_PUBLISHED}
        />
      </section>

      <LeadsChart days={data.leadsByDay} />

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
/* Colors route through Payload's theme variables so the dashboard adapts to
   both the light and dark admin themes. Orange stays fixed — it reads on both. */
.sd { --sd-orange:#f26b0f; --sd-orange-light:#f5843a;
  --sd-text:var(--theme-elevation-1000); --sd-muted:var(--theme-elevation-500);
  --sd-card:var(--theme-elevation-0); --sd-card-alt:var(--theme-elevation-100);
  --sd-card-alt-hover:var(--theme-elevation-150);
  --sd-prominent:var(--theme-elevation-800); --sd-prominent-text:var(--theme-elevation-0);
  --sd-line:var(--theme-elevation-150); --sd-green:#3aa860; --sd-gray:#9b998f;
  max-width:1280px; margin:0 auto; padding:8px 4px 48px; }
.sd a { text-decoration:none; }
.sd-head { display:flex; justify-content:space-between; align-items:flex-end; gap:24px; flex-wrap:wrap; margin-bottom:28px; }
.sd-kicker { margin:0 0 6px; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.14em; color:var(--sd-orange); }
.sd-title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:40px; line-height:1; letter-spacing:-.01em; color:var(--sd-text); text-transform:none; }
.sd-sub { margin:8px 0 0; color:var(--sd-muted); font-size:14px; }
.sd-head__actions { display:flex; gap:10px; }
.sd-btn { display:inline-flex; align-items:center; padding:9px 16px; border-radius:8px; font-size:13px; font-weight:600; border:1px solid transparent; cursor:pointer; white-space:nowrap; transition:background .15s, filter .15s; }
.sd-btn--ghost { border-color:var(--sd-line); color:var(--sd-text); background:transparent; }
.sd-btn--ghost:hover { background:var(--sd-card-alt); }
.sd-btn--primary { background:var(--sd-orange); color:#fff; }
.sd-btn--primary:hover { background:var(--sd-orange-light); }

.sd-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; margin-bottom:28px; }
.sd-stat { position:relative; display:flex; flex-direction:column; background:var(--sd-card); border:1px solid var(--sd-line); border-radius:10px; padding:22px 24px; transition:border-color .15s, transform .15s, background .15s; }
.sd-stat:hover { border-color:var(--sd-orange); background:var(--sd-card-alt); transform:translateY(-1px); }
.sd-stat__top { display:flex; align-items:center; gap:8px; }
.sd-stat__icon { color:var(--sd-orange); flex:0 0 auto; }
.sd-stat__label { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; letter-spacing:.1em; color:var(--sd-muted); }
.sd-stat__view { position:absolute; top:20px; right:22px; font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-orange); opacity:0; transition:opacity .15s; }
.sd-stat:hover .sd-stat__view { opacity:1; }
.sd-stat__value { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:800; font-size:44px; line-height:1.05; margin-top:6px; color:var(--sd-text); }
.sd-stat__value--hot { color:var(--sd-orange); }
.sd-stat__change { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-muted); margin-top:4px; }

.sd-chart { margin-bottom:28px; }
.sd-chart__total { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-muted); }
.sd-chart__bars { display:grid; grid-template-columns:repeat(7,1fr); gap:10px; align-items:end; height:132px; padding-top:6px; }
.sd-chart__col { display:flex; flex-direction:column; align-items:center; gap:6px; height:100%; justify-content:flex-end; }
.sd-chart__count { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-muted); }
.sd-chart__track { position:relative; width:100%; max-width:44px; flex:1 1 auto; display:flex; align-items:flex-end; background:var(--sd-card-alt); border-radius:5px; overflow:hidden; }
.sd-chart__bar { width:100%; min-height:3px; border-radius:5px 5px 0 0; background:linear-gradient(180deg,var(--sd-orange-light),var(--sd-orange)); transition:height .2s; }
.sd-chart__day { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-muted); }

.sd-split { display:grid; grid-template-columns:1.5fr 1fr; gap:16px; }
.sd-panel { background:var(--sd-card); border:1px solid var(--sd-line); border-radius:10px; padding:24px 26px; }
.sd-panel__head { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid var(--sd-text); padding-bottom:12px; margin-bottom:14px; }
.sd-panel__title { margin:0; font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:22px; color:var(--sd-text); }
.sd-panel__link { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-orange); }

.sd-actlist { list-style:none; margin:0; padding:0; }
.sd-act { display:flex; gap:12px; padding:11px 0; border-bottom:1px solid var(--sd-line); }
.sd-act:last-child { border-bottom:0; }
.sd-dot { width:9px; height:9px; border-radius:50%; margin-top:5px; flex:0 0 auto; }
.sd-dot--orange { background:var(--sd-orange); }
.sd-dot--green { background:var(--sd-green); }
.sd-dot--gray { background:var(--sd-gray); }
.sd-act__body { display:flex; flex-direction:column; gap:3px; }
.sd-act__text { font-size:14px; color:var(--sd-text); }
.sd-act__truck { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; text-transform:uppercase; letter-spacing:.01em; }
.sd-act__meta { font-family:var(--font-mono,ui-monospace,monospace); font-size:11px; color:var(--sd-muted); display:flex; align-items:center; gap:8px; }
.sd-act__tag { background:var(--sd-card-alt); color:var(--sd-text); padding:1px 6px; border-radius:4px; letter-spacing:.08em; }
.sd-empty { color:var(--sd-muted); font-size:14px; margin:4px 0; }

.sd-qa { display:flex; flex-direction:column; gap:10px; }
.sd-qacard { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:16px 18px; border-radius:8px; background:var(--sd-card-alt); border:1px solid transparent; transition:transform .15s, background .15s, filter .15s; }
.sd-qacard:hover { transform:translateY(-1px); background:var(--sd-card-alt-hover); }
.sd-qacard__body { display:flex; flex-direction:column; gap:3px; }
.sd-qacard__body strong { font-family:var(--font-barlow,'Barlow Condensed',sans-serif); font-weight:700; font-size:17px; color:var(--sd-text); }
.sd-qacard__body span { font-size:12.5px; color:var(--sd-muted); }
.sd-qacard--dark { background:var(--sd-prominent); }
.sd-qacard--dark:hover { background:var(--sd-prominent); filter:brightness(1.25); }
.sd-qacard--dark strong { color:var(--sd-prominent-text); }
.sd-qacard--dark span { color:var(--sd-prominent-text); opacity:.72; }
.sd-badge { background:var(--sd-orange); color:#fff; font-family:var(--font-mono,ui-monospace,monospace); font-size:13px; font-weight:700; min-width:26px; height:26px; border-radius:13px; display:flex; align-items:center; justify-content:center; padding:0 8px; }

@media (max-width:1100px){ .sd-stats{ grid-template-columns:repeat(2,1fr);} .sd-split{ grid-template-columns:1fr;} }
@media (max-width:560px){ .sd-stats{ grid-template-columns:1fr;} .sd-title{ font-size:32px;} }
`,
    }}
  />
)

export default Dashboard
