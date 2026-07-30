import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Dev-only: give every existing truck a VARIED set of placeholder photos so the
 * inventory grid and truck-detail galleries look populated for review. Uploads a
 * small pool of clean truck frames (orange semi at several angles + the box-truck
 * render) and assigns each truck a rotating 4-photo slice, so lead images differ.
 *
 * These are obvious stand-ins — real per-truck photos get added via the CMS later.
 * Non-destructive: updates photos on existing trucks, never deletes them.
 *
 * Run with:  npx tsx src/seed/reseed-photos.ts
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

const POOL = [
  { file: 'hero-source/0001.png', alt: 'Commercial truck — side profile (placeholder)' },
  { file: 'hero-source/0030.png', alt: 'Commercial truck — three-quarter side (placeholder)' },
  { file: 'hero-source/0060.png', alt: 'Commercial truck — three-quarter view (placeholder)' },
  { file: 'hero-source/0090.png', alt: 'Commercial truck — front three-quarter (placeholder)' },
  { file: 'hero-source/0120.png', alt: 'Commercial truck — near front (placeholder)' },
  { file: 'hero-source/0144.png', alt: 'Commercial truck — head-on (placeholder)' },
  { file: 'Start.jpeg', alt: 'Box truck — front three-quarter (placeholder)' },
]
const PHOTOS_PER_TRUCK = 4

async function run() {
  const payload = await getPayload({ config: await config })

  const ids: number[] = []
  for (const p of POOL) {
    const media = await payload.create({
      collection: 'media',
      data: { alt: p.alt },
      filePath: path.join(repoRoot, p.file),
    })
    ids.push(media.id as number)
    payload.logger.info(`Uploaded placeholder photo: ${p.file}`)
  }

  const { docs } = await payload.find({ collection: 'trucks', limit: 500, depth: 0 })
  const n = ids.length
  let i = 0
  for (const truck of docs) {
    const photos = Array.from({ length: PHOTOS_PER_TRUCK }, (_, k) => ids[(i + k) % n])
    await payload.update({ collection: 'trucks', id: truck.id, data: { photos } })
    i++
  }
  payload.logger.info(`Reseeded photos on ${docs.length} trucks (${n}-image pool).`)
  process.exit(0)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
