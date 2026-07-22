import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** Apple touch icon — the Sparta diamond, orange on black. */
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
          color: '#f26b0f',
          fontSize: 120,
          fontWeight: 800,
        }}
      >
        ◆
      </div>
    ),
    { ...size },
  )
}
