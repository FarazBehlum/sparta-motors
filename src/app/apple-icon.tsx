import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/**
 * Apple touch icon — the Sparta diamond, orange on black.
 *
 * The diamond is drawn as a path, not typed as the character ◆. Satori (which
 * renders this) has no glyph for U+25C6 in its bundled font, so it tried to
 * fetch one at build time, the request 400'd, and the icon shipped as an orange
 * tofu box — the "missing glyph" rectangle — on the home screen of anyone who
 * saved the site. Same path as app/icon.svg, so the two marks stay identical.
 *
 * No rounded corners on purpose: iOS applies its own mask, and baking one in
 * leaves dark corners outside it.
 */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1a1a1a',
        }}
      >
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M16 5l8 11-8 11-8-11z" fill="#f26b0f" />
        </svg>
      </div>
    ),
    { ...size },
  )
}
