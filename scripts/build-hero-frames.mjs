/**
 * Build the scroll-hero frame sequence.
 *
 * The hero scrubs an image sequence on a <canvas> (see src/components/home/Hero.tsx).
 * Video seeking (video.currentTime) can only land on sparse keyframes, so the
 * disassembly appeared frozen — a canvas sequence draws every frame exactly.
 *
 * Reads a folder of sequentially-numbered source frames (PNG or JPG), samples
 * them down to FRAME_COUNT evenly-spaced frames, and writes optimized WebP
 * frames to public/hero/frames/0001.webp … plus a poster from the first frame.
 *
 * The frame sequence can show anything — the hero scrubs it one frame per scroll
 * position. Number the source frames in playback order (first = start of motion).
 *
 * Usage:
 *   node scripts/build-hero-frames.mjs [sourceDir]
 * Defaults to _MConverter.eu_Video/ (the original gitignored raw material).
 */
import sharp from 'sharp'
import { mkdir, rm, readdir } from 'node:fs/promises'
import path from 'node:path'

const SRC_DIR = process.argv[2] || process.env.HERO_SRC_DIR || '_MConverter.eu_Video'
const OUT_DIR = 'public/hero/frames'
// More frames = smoother scrub (Apple-style). Kept in sync with Hero.tsx.
const FRAME_COUNT = 160
// Cap at the source width — upscaling only softens. q80 avoids visible banding
// on smooth gradients while keeping the sequence from getting too heavy.
const WIDTH = 1280
const QUALITY = 80

async function main() {
  const files = (await readdir(SRC_DIR))
    .filter((f) => /\.(png|jpe?g)$/i.test(f))
    .sort()
  if (files.length === 0) throw new Error(`No PNG frames found in ${SRC_DIR}`)
  console.log(`Source frames: ${files.length}`)

  await rm(OUT_DIR, { recursive: true, force: true })
  await mkdir(OUT_DIR, { recursive: true })

  const last = files.length - 1
  let total = 0
  for (let i = 0; i < FRAME_COUNT; i++) {
    // Evenly sample the source, always including the first and last frame.
    const srcIdx = Math.round((i * last) / (FRAME_COUNT - 1))
    const outName = String(i + 1).padStart(4, '0') + '.webp'
    const info = await sharp(path.join(SRC_DIR, files[srcIdx]))
      .resize({ width: WIDTH, withoutEnlargement: true })
      .webp({ quality: QUALITY, effort: 5, smartSubsample: true })
      .toFile(path.join(OUT_DIR, outName))
    total += info.size
  }

  // Poster = first frame, slightly higher quality (also the reduced-motion still).
  const poster = await sharp(path.join(SRC_DIR, files[0]))
    .resize({ width: 1280 })
    .jpeg({ quality: 72, mozjpeg: true })
    .toFile('public/hero/poster.jpg')

  console.log(`Wrote ${FRAME_COUNT} WebP frames @ ${WIDTH}px q${QUALITY} → ${OUT_DIR}`)
  console.log(`Frames total: ${(total / 1024 / 1024).toFixed(2)} MB`)
  console.log(`Poster: ${(poster.size / 1024).toFixed(0)} KB`)
  console.log(`FRAME_COUNT for Hero.tsx = ${FRAME_COUNT}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
