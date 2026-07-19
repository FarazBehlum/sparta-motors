'use client'

import React, { useCallback } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Search, LayoutGrid, Rows3 } from 'lucide-react'
import type { Facets, SortKey, TruckFilters, ViewKey } from '@/lib/trucks-shared'
import { SORT_OPTIONS } from '@/lib/trucks-shared'
import { bodyTypeLabel, makeLabel } from '@/lib/format'

/* ------------------------------------------------------------------ */
/* Shared URL-param helper                                             */
/* ------------------------------------------------------------------ */

type Query = Record<string, string>

function useParamNav(query: Query) {
  const router = useRouter()
  const pathname = usePathname()

  const buildUrl = useCallback(
    (mutations: Record<string, string | null>) => {
      const sp = new URLSearchParams(query)
      for (const [k, v] of Object.entries(mutations)) {
        if (v == null || v === '') sp.delete(k)
        else sp.set(k, v)
      }
      const qs = sp.toString()
      return qs ? `${pathname}?${qs}` : pathname
    },
    [query, pathname],
  )

  const go = useCallback(
    (mutations: Record<string, string | null>) => {
      router.push(buildUrl(mutations), { scroll: false })
    },
    [router, buildUrl],
  )

  return { go, pathname, router }
}

function toggleCsv(current: string[], value: string): string | null {
  const set = new Set(current)
  if (set.has(value)) set.delete(value)
  else set.add(value)
  const next = [...set]
  return next.length ? next.join(',') : null
}

/* ------------------------------------------------------------------ */
/* Search bar                                                          */
/* ------------------------------------------------------------------ */

export function InventorySearch({ query, filters }: { query: Query; filters: TruckFilters }) {
  const { go } = useParamNav(query)

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const value = new FormData(e.currentTarget).get('q')
        go({ q: (value as string)?.trim() || null })
      }}
      className="flex items-stretch gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-concrete"
          aria-hidden="true"
        />
        <input
          name="q"
          type="search"
          defaultValue={filters.q ?? ''}
          placeholder="Search by VIN, stock number, or keyword..."
          aria-label="Search inventory"
          className="w-full rounded bg-charcoal py-3 pl-10 pr-3 font-mono text-sm text-bone placeholder:text-concrete focus:outline-2 focus:outline-orange"
        />
      </div>
      <button
        type="submit"
        className="rounded bg-orange px-5 font-barlow text-sm font-bold uppercase tracking-wider text-sparta-black transition hover:brightness-105"
      >
        Search
      </button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/* Filter sidebar                                                      */
/* ------------------------------------------------------------------ */

function CheckGroup({
  title,
  paramKey,
  options,
  selected,
  counts,
  labelFn,
  query,
}: {
  title: string
  paramKey: string
  options: string[]
  selected: string[]
  counts: Record<string, number>
  labelFn: (v: string) => string
  query: Query
}) {
  const { go } = useParamNav(query)
  const available = options.filter((o) => (counts[o] ?? 0) > 0)
  if (!available.length) return null

  return (
    <fieldset className="border-t border-chalk py-4">
      <legend className="mb-3 font-barlow text-base font-bold uppercase tracking-wide text-sparta-black">
        {title}
      </legend>
      <div className="flex flex-col gap-2">
        {available.map((opt) => (
          <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => go({ [paramKey]: toggleCsv(selected, opt) })}
              className="h-4 w-4 accent-orange"
            />
            <span className="flex-1 text-iron">{labelFn(opt)}</span>
            <span className="font-mono text-xs text-concrete">({counts[opt]})</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function RangeGroup({
  title,
  minKey,
  maxKey,
  range,
  step,
  format,
  minVal,
  maxVal,
  query,
}: {
  title: string
  minKey: string
  maxKey: string
  range: [number, number]
  step: number
  format: (n: number) => string
  minVal?: number
  maxVal?: number
  query: Query
}) {
  const { go } = useParamNav(query)
  const [lo, hi] = range
  if (hi <= lo) return null

  // Build discrete option stops from lo..hi by step (inclusive of both ends).
  const stops: number[] = []
  const start = Math.floor(lo / step) * step
  for (let v = Math.max(start, 0); v <= hi + step; v += step) stops.push(v)
  if (stops[0] > lo) stops.unshift(lo)
  if (stops[stops.length - 1] < hi) stops.push(hi)

  return (
    <fieldset className="border-t border-chalk py-4">
      <legend className="mb-3 font-barlow text-base font-bold uppercase tracking-wide text-sparta-black">
        {title}
      </legend>
      <div className="flex items-center gap-2">
        <select
          aria-label={`${title} minimum`}
          value={minVal ?? ''}
          onChange={(e) => go({ [minKey]: e.target.value || null })}
          className="w-full rounded border border-chalk bg-white px-2 py-2 font-mono text-xs text-sparta-black"
        >
          <option value="">Min</option>
          {stops.map((s) => (
            <option key={s} value={s}>
              {format(s)}
            </option>
          ))}
        </select>
        <span className="text-concrete">–</span>
        <select
          aria-label={`${title} maximum`}
          value={maxVal ?? ''}
          onChange={(e) => go({ [maxKey]: e.target.value || null })}
          className="w-full rounded border border-chalk bg-white px-2 py-2 font-mono text-xs text-sparta-black"
        >
          <option value="">Max</option>
          {stops.map((s) => (
            <option key={s} value={s}>
              {format(s)}
            </option>
          ))}
        </select>
      </div>
    </fieldset>
  )
}

const MAKE_ORDER = [
  'isuzu', 'freightliner', 'hino', 'nissan', 'volvo',
  'peterbilt', 'kenworth', 'mack', 'international', 'other',
]
const BODY_ORDER = ['box-truck', 'reefer', 'day-cab', 'flat-bed', 'dump-truck', 'tow-truck']

export function FilterSidebar({
  query,
  filters,
  facets,
  lockedBody,
}: {
  query: Query
  filters: TruckFilters
  facets: Facets
  lockedBody?: string
}) {
  const { router, pathname } = useParamNav(query)

  const clearAll = () => {
    // Keep only the view style; drop every filter + sort.
    const view = query.view ? `?view=${query.view}` : ''
    router.push(`${pathname}${view}`, { scroll: false })
  }

  return (
    <aside className="lg:sticky lg:top-[88px]">
      <div className="flex items-center justify-between pb-1">
        <h2 className="font-barlow text-base font-bold uppercase tracking-wide text-sparta-black">
          Filters
        </h2>
        <button
          type="button"
          onClick={clearAll}
          className="font-mono text-[10px] uppercase tracking-wider text-orange hover:underline"
        >
          Clear all
        </button>
      </div>

      {lockedBody ? (
        <fieldset className="border-t border-chalk py-4">
          <legend className="mb-3 font-barlow text-base font-bold uppercase tracking-wide text-sparta-black">
            Body Type
          </legend>
          <span className="inline-flex items-center gap-2 rounded bg-sparta-black px-3 py-1.5 font-barlow text-xs font-bold uppercase tracking-wider text-bone">
            {bodyTypeLabel(lockedBody)}
          </span>
        </fieldset>
      ) : (
        <CheckGroup
          title="Body Type"
          paramKey="body"
          options={BODY_ORDER}
          selected={filters.body}
          counts={facets.body}
          labelFn={bodyTypeLabel}
          query={query}
        />
      )}

      <CheckGroup
        title="Make"
        paramKey="make"
        options={MAKE_ORDER}
        selected={filters.make}
        counts={facets.make}
        labelFn={makeLabel}
        query={query}
      />

      <RangeGroup
        title="Year"
        minKey="year_min"
        maxKey="year_max"
        range={facets.yearRange}
        step={1}
        format={(n) => String(n)}
        minVal={filters.yearMin}
        maxVal={filters.yearMax}
        query={query}
      />

      <RangeGroup
        title="Mileage"
        minKey="mileage_min"
        maxKey="mileage_max"
        range={facets.mileageRange}
        step={25000}
        format={(n) => n.toLocaleString('en-US')}
        minVal={filters.mileageMin}
        maxVal={filters.mileageMax}
        query={query}
      />

      <RangeGroup
        title="Price"
        minKey="price_min"
        maxKey="price_max"
        range={facets.priceRange}
        step={5000}
        format={(n) => `$${n.toLocaleString('en-US')}`}
        minVal={filters.priceMin}
        maxVal={filters.priceMax}
        query={query}
      />

      <CheckGroup
        title="Condition"
        paramKey="condition"
        options={['excellent', 'good', 'fair']}
        selected={filters.condition}
        counts={facets.condition}
        labelFn={(v) => v[0].toUpperCase() + v.slice(1)}
        query={query}
      />

      <CheckGroup
        title="Fuel Type"
        paramKey="fuel"
        options={['diesel', 'gasoline']}
        selected={filters.fuel}
        counts={facets.fuel}
        labelFn={(v) => v[0].toUpperCase() + v.slice(1)}
        query={query}
      />
    </aside>
  )
}

/* ------------------------------------------------------------------ */
/* Toolbar (sort + grid/list toggle)                                  */
/* ------------------------------------------------------------------ */

function ViewButton({
  view,
  label,
  icon,
  active,
  onSelect,
}: {
  view: ViewKey
  label: string
  icon: React.ReactNode
  active: boolean
  onSelect: (view: ViewKey) => void
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={`${label} view`}
      onClick={() => onSelect(view)}
      className={`inline-flex h-9 w-9 items-center justify-center rounded transition ${
        active ? 'bg-sparta-black text-bone' : 'text-iron hover:text-sparta-black'
      }`}
    >
      {icon}
    </button>
  )
}

export function InventoryToolbar({
  query,
  filters,
  showing,
  total,
}: {
  query: Query
  filters: TruckFilters
  showing: number
  total: number
}) {
  const { go } = useParamNav(query)
  const selectView = (view: ViewKey) => go({ view: view === 'grid' ? null : view })

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-chalk pb-4">
      <p className="font-mono text-sm text-iron" aria-live="polite">
        Showing <span className="font-bold text-sparta-black">{showing}</span> of{' '}
        <span className="font-bold text-sparta-black">{total}</span> trucks
      </p>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-iron">Sort</span>
          <select
            value={filters.sort}
            onChange={(e) => go({ sort: e.target.value === 'featured' ? null : (e.target.value as SortKey) })}
            className="rounded border border-chalk bg-white px-2 py-1.5 font-barlow text-sm font-semibold uppercase tracking-wide text-sparta-black"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-1 rounded border border-chalk p-0.5">
          <ViewButton
            view="grid"
            label="Grid"
            icon={<LayoutGrid size={18} />}
            active={filters.view === 'grid'}
            onSelect={selectView}
          />
          <ViewButton
            view="list"
            label="List"
            icon={<Rows3 size={18} />}
            active={filters.view === 'list'}
            onSelect={selectView}
          />
        </div>
      </div>
    </div>
  )
}
