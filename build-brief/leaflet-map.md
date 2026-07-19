# Integration — Leaflet Map

Interactive map showing Sparta Motors' Charlotte location. Used on Contact, About, and Inventory pages, plus the site footer.

**Mockup reference:** All content-page mockups in `/mockups/sparta-content-pages.html` show this map; also `/mockups/sparta-inventory.html`.

## Why Leaflet + OpenStreetMap

Considered options:
- **Google Maps** — best-known, but requires API key, billing account, and $ per 1000 map loads after free tier. Overkill for a static location marker.
- **Mapbox** — nice styling, but requires account/key and per-load fees at scale.
- **Leaflet + OpenStreetMap** — completely free, no API key, no account, well-documented, works forever.

Leaflet chosen for zero cost, zero setup complexity, and no vendor account required. It's the correct choice for a small business showing a single physical location.

## Tile provider

**CartoDB Positron** (light theme via OpenStreetMap contributors).

- URL template: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png`
- Attribution: `© OpenStreetMap contributors © CARTO`

Positron gives a light, clean, muted look that matches Sparta's "workhorse industrial" aesthetic — reads more like a technical diagram than a colorful tourist map.

## Location

From the Settings global:
- `latitude` and `longitude` — the actual coordinates
- Placeholder for development: `35.2650, -80.8500` (approximate North Charlotte industrial area)
- Real coordinates will be filled in via the Settings global before launch

## Custom marker

Not the default Leaflet blue teardrop. Instead, use a custom SVG orange marker:

- Diamond or circular pin shape
- Safety Orange fill (`#F26B0F`)
- Sparta Black outline (`#1A1A1A`)
- White inner icon (small map pin, truck silhouette, or the Sparta diamond)
- Size: 32×32px

The marker should be centered on the coordinates and clickable. On click, a popup appears.

## Popup content

Dark background, orange accent, matches Sparta branding.

- Header (orange background strip): `SPARTA MOTORS` in Barlow Condensed 700 uppercase, small
- Body (dark background):
  - Address (multi-line)
  - Phone (mono, orange color)
  - `[View directions →]` link — opens Google Maps directions in a new tab, coordinates as destination

## Map controls

- **Zoom controls** — top-right corner. Dark buttons with orange hover state. Rounded 4px.
- **Scroll-wheel zoom** — enabled by default (user can zoom in/out with mouse wheel)
- **Touch zoom on mobile** — pinch to zoom, standard behavior
- **Drag to pan** — enabled
- **Attribution** — bottom-right corner, small mono text, per CartoDB requirements

## Component API

Create a reusable `<LocationMap>` component:

```tsx
type LocationMapProps = {
  height?: number | string  // e.g., 440 for Contact, 400 for About, 260 for footer
  showPopup?: boolean       // default true; false for compact footer version
  showControls?: boolean    // default true; false for footer version
}
```

Component pulls address/coords/phone from Settings global directly (via `useContext` from a SettingsProvider or via server props).

## Usage per page

- **Contact page:** 440px tall, full width of container, all controls, popup open by default on first load
- **About page:** ~400px tall, right column of a 60/40 split, all controls
- **Inventory page location section:** ~440px tall, right column of a two-column split
- **Footer:** compact ~260px, no controls, no popup, static feel

## Loading behavior

- Leaflet ships ~140KB of JS. Lazy load using `next/dynamic` with `ssr: false`
- Show a lightweight placeholder while loading (grey background with "MAP LOADING..." text in mono)
- Load only when the map enters the viewport (`react-intersection-observer` or IntersectionObserver API)
- Cache tile requests via Cloudflare CDN aggressively

## Implementation notes

**Client-only rendering.** Leaflet touches `window` on init, which breaks SSR. Use `next/dynamic({ ssr: false })` when importing the component.

**CSS.** Leaflet's stylesheet must be loaded (`leaflet/dist/leaflet.css`). Import at the top of the `<LocationMap>` component or globally.

**Custom marker.** Use a Leaflet `divIcon` for HTML/SVG-based markers instead of the built-in image marker. This lets us apply custom styles and use inline SVG for the orange pin.

**Popup styling.** Leaflet uses `.leaflet-popup-*` classes. Override in global CSS to apply Sparta's dark/orange styling.

**Attribution.** Include CartoDB and OpenStreetMap attribution as required. Small, mono, bottom-right. Do not remove — this is a licensing requirement.

## Accessibility

- Map container has `role="region"` and `aria-label="Map showing Sparta Motors location"`
- Marker button is keyboard-accessible (Enter to open popup)
- Popup contents are keyboard-navigable
- Non-map alternative: text address always appears somewhere on the page in addition to the map (not just as marker content)

## Performance

- Total added: ~140KB JS (Leaflet) + ~20KB CSS + tile images loaded lazily
- Tiles cached at Cloudflare edge after first request from any user
- Custom marker is inline SVG (no additional HTTP request)

## What good implementation looks like

- The map loads only when visible (not on page load if it's below the fold)
- The orange marker feels intentional, not slapped on
- Popup opens with Sparta's dark styling — matches the site, not the default Leaflet white
- Coordinates and address come from Settings — admin can update the pin location by editing settings without a code change
- Mobile touch interaction feels good (pinch zoom, drag pan)
- Attribution is present but unobtrusive
