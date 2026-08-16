import { ImageResponse } from 'next/og'

export const alt = 'Sparta Motors · Used Commercial Trucks in Spartanburg, SC'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Default social-share card for the whole frontend. Truck pages override this
 * with the truck's own photo (see trucks/[slug]/page.tsx generateMetadata).
 *
 * Keep this card to characters the bundled font actually has. The brand's ◆
 * eyebrow marker used to lead the line below, but Satori has no glyph for
 * U+25C6 in its default font and tried to fetch one at build time; the request
 * 400s ("Failed to load dynamic font for ◆"), the build logs an error, and the
 * card shipped with a tofu box in the top-left corner of every link preview.
 * The ◆ still appears everywhere on the site itself, where a real webfont
 * renders it.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#161513',
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: 24,
            letterSpacing: 8,
            color: '#f26b0f',
            textTransform: 'uppercase',
          }}
        >
          Est. 2018 · Spartanburg, SC
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              display: 'flex',
              fontSize: 112,
              fontWeight: 800,
              color: '#f5f3f0',
              textTransform: 'uppercase',
              lineHeight: 1,
            }}
          >
            Sparta Motors
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: '#b4b2a9', marginTop: 24, maxWidth: 940 }}>
            Used commercial trucks for working businesses: box trucks, reefers, day cabs, dump &amp; tow.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              display: 'flex',
              background: '#f26b0f',
              color: '#1a1a1a',
              fontSize: 26,
              fontWeight: 700,
              padding: '12px 28px',
              borderRadius: 8,
              textTransform: 'uppercase',
              letterSpacing: 2,
            }}
          >
            Browse inventory
          </div>
          <div style={{ display: 'flex', color: '#b4b2a9', fontSize: 24 }}>
            Honest specs. Real photos. Inspected.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
