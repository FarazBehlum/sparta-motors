import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload.config'

/**
 * Dev-only sample inventory. Uploads two placeholder photos (the hero-video
 * frames in the repo root) and creates ~10 published trucks across every body
 * type so the inventory + truck-detail pages have realistic data to render.
 *
 * Idempotent: skips entirely if any trucks already exist.
 * Run with: npm run seed:trucks
 */
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

type Make =
  | 'isuzu' | 'hino' | 'freightliner' | 'nissan' | 'volvo'
  | 'peterbilt' | 'kenworth' | 'mack' | 'international' | 'other'

type Sample = {
  year: number
  make: Make
  model: string
  trim?: string
  bodyType: 'box-truck' | 'reefer' | 'landscaper' | '26ft-box-truck' | 'dump-truck' | 'tow-truck'
  price: number
  condition: 'excellent' | 'good' | 'fair'
  mileage: number
  fuelType: 'diesel' | 'gasoline'
  gvwr?: number
  payloadClass?: 'class-3' | 'class-4' | 'class-5' | 'class-6' | 'class-7' | 'class-8'
  engine?: string
  transmission?: string
  drivetrain?: 'RWD' | '4WD' | 'AWD'
  featured?: boolean
  description: string
}

const SAMPLES: Sample[] = [
  {
    year: 2019, make: 'isuzu', model: 'NPR-HD', trim: '16FT Box', bodyType: 'box-truck',
    price: 34900, condition: 'good', mileage: 87432, fuelType: 'diesel', gvwr: 14500,
    payloadClass: 'class-4', engine: '5.2L Diesel I4', transmission: 'Auto · 6-spd', drivetrain: 'RWD',
    featured: true,
    description:
      '2019 Isuzu NPR-HD with 87,432 miles. 16-foot aluminum box body with roll-up door, ready to work. Inspected on the lot, runs strong, no known issues.',
  },
  {
    year: 2020, make: 'hino', model: '268', trim: '24FT Box', bodyType: 'box-truck',
    price: 46500, condition: 'excellent', mileage: 61200, fuelType: 'diesel', gvwr: 25950,
    payloadClass: 'class-6', engine: '6.4L Diesel I6', transmission: 'Auto · 6-spd', drivetrain: 'RWD',
    featured: true,
    description:
      '2020 Hino 268 with a 24-foot box and tuck-away liftgate. One owner, dealer-maintained. Clean inside and out.',
  },
  {
    year: 2018, make: 'freightliner', model: 'M2 106', trim: 'Reefer', bodyType: 'reefer',
    price: 58900, condition: 'good', mileage: 124800, fuelType: 'diesel', gvwr: 33000,
    payloadClass: 'class-7', engine: 'Cummins B6.7', transmission: 'Auto · Allison', drivetrain: 'RWD',
    featured: true,
    description:
      '2018 Freightliner M2 106 refrigerated unit. Thermo King reefer, runs cold. Great for produce and cold-chain delivery.',
  },
  {
    year: 2021, make: 'isuzu', model: 'NRR', trim: '20FT Reefer', bodyType: 'reefer',
    price: 52400, condition: 'excellent', mileage: 43900, fuelType: 'diesel', gvwr: 19500,
    payloadClass: 'class-5', engine: '5.2L Diesel I4', transmission: 'Auto · 6-spd', drivetrain: 'RWD',
    description:
      '2021 Isuzu NRR with a 20-foot insulated reefer body. Low miles, tight thermostat, ready for daily routes.',
  },
  {
    year: 2017, make: 'freightliner', model: 'Cascadia', trim: 'Day Cab', bodyType: 'landscaper',
    price: 42900, condition: 'good', mileage: 389400, fuelType: 'diesel', gvwr: 52000,
    payloadClass: 'class-8', engine: 'Detroit DD13', transmission: '10-spd Manual', drivetrain: 'RWD',
    description:
      '2017 Freightliner Cascadia day cab. Detroit power, strong runner for regional and yard work. Fresh DOT inspection.',
  },
  {
    year: 2016, make: 'volvo', model: 'VNL 300', trim: 'Day Cab', bodyType: 'landscaper',
    price: 38500, condition: 'fair', mileage: 512300, fuelType: 'diesel', gvwr: 52000,
    payloadClass: 'class-8', engine: 'Volvo D13', transmission: 'I-Shift Auto', drivetrain: 'RWD',
    description:
      '2016 Volvo VNL 300 day cab. Higher miles but priced to move. I-Shift transmission, comfortable cab. Solid work truck.',
  },
  {
    year: 2019, make: 'international', model: 'MV607', trim: 'Flatbed', bodyType: '26ft-box-truck',
    price: 47800, condition: 'good', mileage: 98700, fuelType: 'diesel', gvwr: 26000,
    payloadClass: 'class-6', engine: 'Cummins B6.7', transmission: 'Auto · Allison', drivetrain: 'RWD',
    featured: true,
    description:
      '2019 International MV607 with a 20-foot steel flatbed and stake pockets. Ready for hauling equipment and materials.',
  },
  {
    year: 2015, make: 'kenworth', model: 'T370', trim: 'Dump', bodyType: 'dump-truck',
    price: 61500, condition: 'good', mileage: 176400, fuelType: 'diesel', gvwr: 33000,
    payloadClass: 'class-7', engine: 'PACCAR PX-9', transmission: 'Auto · Allison', drivetrain: '4WD',
    description:
      '2015 Kenworth T370 dump truck. 10-foot steel dump body, dual hydraulics. Well-maintained, ready for site work.',
  },
  {
    year: 2018, make: 'peterbilt', model: '348', trim: 'Dump', bodyType: 'dump-truck',
    price: 72900, condition: 'excellent', mileage: 121000, fuelType: 'diesel', gvwr: 35000,
    payloadClass: 'class-7', engine: 'PACCAR PX-9', transmission: 'Auto · Allison', drivetrain: 'RWD',
    description:
      '2018 Peterbilt 348 dump. Clean body, tight hydraulics, ready to haul. Great condition for the year.',
  },
  {
    year: 2020, make: 'freightliner', model: 'M2 106', trim: 'Rollback Tow', bodyType: 'tow-truck',
    price: 89500, condition: 'excellent', mileage: 74300, fuelType: 'diesel', gvwr: 33000,
    payloadClass: 'class-7', engine: 'Cummins B6.7', transmission: 'Auto · Allison', drivetrain: 'RWD',
    featured: true,
    description:
      '2020 Freightliner M2 106 rollback with a 22-foot steel bed and wheel-lift. Turnkey recovery rig, low hours.',
  },
]

// Valid 17-char VINs (no I/O/Q): 11-char base + 6-digit counter.
const VIN_BASE = 'JALC4W1638K'

async function seedTrucks() {
  const payload = await getPayload({ config: await config })

  const existing = await payload.count({ collection: 'trucks' })
  if (existing.totalDocs > 0) {
    payload.logger.info(`Trucks already exist (${existing.totalDocs}) — skipping sample seed.`)
    process.exit(0)
  }

  // Upload two shared placeholder photos.
  const photoA = await payload.create({
    collection: 'media',
    data: { alt: 'Sample commercial truck — front three-quarter view' },
    filePath: path.join(repoRoot, 'Start.jpeg'),
  })
  const photoB = await payload.create({
    collection: 'media',
    data: { alt: 'Sample commercial truck — rear view' },
    filePath: path.join(repoRoot, 'End.jpeg'),
  })
  payload.logger.info('Uploaded 2 sample photos')

  let i = 0
  for (const s of SAMPLES) {
    const vin = `${VIN_BASE}${100001 + i}`
    await payload.create({
      collection: 'trucks',
      data: {
        ...s,
        vin,
        status: 'published',
        availability: 'available',
        photos: [photoA.id, photoB.id],
      },
    })
    payload.logger.info(`Created truck: ${s.year} ${s.make} ${s.model} (${vin})`)
    i++
  }

  payload.logger.info(`Sample truck seed complete — ${SAMPLES.length} published trucks.`)
  process.exit(0)
}

seedTrucks().catch((err) => {
  console.error(err)
  process.exit(1)
})
