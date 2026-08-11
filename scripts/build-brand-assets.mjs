/**
 * Derive the site's icons and structured-data logo from the client's master
 * logo file.
 *
 *   node scripts/build-brand-assets.mjs
 *
 * The master is 1536x1024 with the mark occupying roughly the middle third and
 * the rest fully transparent. Used as-is it would be letterboxed and tiny:
 * favicons are square, so a 3:2 image gets padded, and the mark then renders at
 * a fraction of the available pixels. So the mark is trimmed to its own bounds
 * and re-centred on a square canvas.
 *
 * Two variants come out of that:
 *
 *   logo.png     transparent, for schema.org Organization.logo. Google may
 *                composite it on any background, so no baked-in colour.
 *   icon/apple   on brand black. A favicon sits in browser chrome that may be
 *                light or dark, and half this mark is dark steel — on a dark
 *                tab strip that half would vanish. The previous icon.svg made
 *                the same choice for the same reason.
 */
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'

const SRC = 'brand/logo-source.png'
const BLACK = { r: 0x1a, g: 0x1a, b: 0x1a, alpha: 1 }

if (!fs.existsSync(SRC)) {
  console.error(`Missing ${SRC} — put the master logo there and re-run.`)
  process.exit(1)
}

// Trim fully-transparent margins so the mark fills the frame.
const trimmed = await sharp(SRC).trim({ threshold: 10 }).toBuffer()
const meta = await sharp(trimmed).metadata()
const side = Math.max(meta.width, meta.height)

// Square canvas with the mark centred, plus ~8% breathing room so it is not
// flush against the edge when a platform rounds the corners.
const pad = Math.round(side * 0.08)
const square = await sharp({
  create: {
    width: side + pad * 2,
    height: side + pad * 2,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: trimmed, gravity: 'centre' }])
  .png()
  .toBuffer()

const onBlack = async (size) =>
  sharp({
    create: { width: size, height: size, channels: 4, background: BLACK },
  })
    .composite([{ input: await sharp(square).resize(size, size).toBuffer() }])
    .png()
    .toBuffer()

const outputs = [
  ['public/logo.png', await sharp(square).resize(512, 512).png({ compressionLevel: 9 }).toBuffer()],
  ['src/app/icon.png', await onBlack(512)],
  ['src/app/apple-icon.png', await onBlack(180)],
]

for (const [file, buf] of outputs) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, buf)
  const m = await sharp(buf).metadata()
  console.log(`${file.padEnd(26)} ${m.width}x${m.height}  ${(buf.length / 1024).toFixed(1)} KB`)
}
