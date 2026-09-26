// @vitest-environment node
import { getPayload, type Payload } from 'payload'
import { randomUUID } from 'node:crypto'
import sharp from 'sharp'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { configureTestDatabase } from '../helpers/testDatabase'
import type { User } from '@/payload-types'

let payload: Payload
let admin: User
let employee: User
let otherEmployee: User
let photoId: number
const truckIds: number[] = []
const userIds: number[] = []
const suffix = randomUUID()

const truckData = () => ({
  status: 'draft' as const,
  availability: 'available' as const,
  year: 2020,
  make: 'isuzu' as const,
  model: 'Test truck',
  bodyType: 'box-truck' as const,
  price: 25000,
  mileage: 10000,
  fuelType: 'diesel' as const,
  description: 'Permission regression fixture',
  photos: [photoId],
})

async function createTruck(user: User, status: 'draft' | 'pending-review' | 'published' = 'draft') {
  const truck = await payload.create({
    collection: 'trucks',
    data: { ...truckData(), status },
    user,
    overrideAccess: false,
  })
  truckIds.push(truck.id)
  return truck
}

describe('collection permissions', () => {
  beforeAll(async () => {
    configureTestDatabase()
    const { default: config } = await import('@/payload.config')
    payload = await getPayload({ config })
    for (const role of ['admin', 'employee', 'employee'] as const) {
      const user = await payload.create({
        collection: 'users',
        data: {
          email: `${userIds.length}-${suffix}@example.test`,
          password: randomUUID(),
          firstName: 'Test',
          lastName: 'Permissions',
          role,
        },
      })
      userIds.push(user.id)
      if (role === 'admin') admin = user
      else if (!employee) employee = user
      else otherEmployee = user
    }
    const buffer = await sharp({ create: { width: 8, height: 8, channels: 3, background: '#fff' } })
      .png()
      .toBuffer()
    const photo = await payload.create({
      collection: 'media',
      data: { alt: 'Test fixture' },
      file: { data: buffer, mimetype: 'image/png', name: `${suffix}.png`, size: buffer.length },
    })
    photoId = photo.id
  }, 180000)

  afterAll(async () => {
    if (!payload) return
    try {
      for (const id of truckIds) await payload.delete({ collection: 'trucks', id })
      if (photoId) await payload.delete({ collection: 'media', id: photoId })
      for (const id of userIds) await payload.delete({ collection: 'users', id })
    } finally {
      await payload.destroy()
    }
  }, 60000)

  it('denies anonymous access to users and leads', async () => {
    for (const collection of ['users', 'leads'] as const) {
      await expect(payload.find({ collection, overrideAccess: false })).rejects.toThrow()
    }
  })

  it('denies anonymous truck creation', async () => {
    await expect(
      payload.create({ collection: 'trucks', data: truckData(), overrideAccess: false }),
    ).rejects.toThrow()
  })

  it.each(['published', 'archived'] as const)(
    'prevents employees creating %s trucks',
    async (status) => {
      await expect(
        payload.create({
          collection: 'trucks',
          data: { ...truckData(), status },
          user: employee,
          overrideAccess: false,
        }),
      ).rejects.toThrow('Only admins')
    },
  )

  it('allows draft/review transitions but prevents publishing and archiving', async () => {
    const truck = await createTruck(employee)
    for (const status of ['pending-review', 'draft'] as const) {
      const updated = await payload.update({
        collection: 'trucks',
        id: truck.id,
        data: { status },
        user: employee,
        overrideAccess: false,
      })
      expect(updated.status).toBe(status)
    }
    for (const status of ['published', 'archived'] as const) {
      await expect(
        payload.update({
          collection: 'trucks',
          id: truck.id,
          data: { status },
          user: employee,
          overrideAccess: false,
        }),
      ).rejects.toThrow('Only admins')
    }
  })

  it('keeps employee ownership server-controlled', async () => {
    const truck = await payload.create({
      collection: 'trucks',
      data: { ...truckData(), assignedEmployee: otherEmployee.id },
      user: employee,
      overrideAccess: false,
      depth: 0,
    })
    truckIds.push(truck.id)
    expect(truck.assignedEmployee).toBe(employee.id)
    const updated = await payload.update({
      collection: 'trucks',
      id: truck.id,
      data: { assignedEmployee: otherEmployee.id },
      user: employee,
      overrideAccess: false,
      depth: 0,
    })
    expect(updated.assignedEmployee).toBe(employee.id)
  })

  it('hides drafts from anonymous readers and other employees', async () => {
    const truck = await createTruck(employee)
    for (const user of [undefined, otherEmployee]) {
      const result = await payload.find({
        collection: 'trucks',
        where: { id: { equals: truck.id } },
        user,
        overrideAccess: false,
      })
      expect(result.docs).toHaveLength(0)
    }
    await expect(
      payload.update({
        collection: 'trucks',
        id: truck.id,
        data: { model: 'Changed' },
        user: otherEmployee,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('allows admin publishing and blocks employee edits after publication', async () => {
    const truck = await createTruck(employee, 'pending-review')
    const published = await payload.update({
      collection: 'trucks',
      id: truck.id,
      data: { status: 'published' },
      user: admin,
      overrideAccess: false,
    })
    expect(published.status).toBe('published')
    await expect(
      payload.update({
        collection: 'trucks',
        id: truck.id,
        data: { model: 'Changed' },
        user: employee,
        overrideAccess: false,
      }),
    ).rejects.toThrow()
    const result = await payload.find({
      collection: 'trucks',
      where: { id: { equals: truck.id } },
      overrideAccess: false,
    })
    expect(result.docs).toHaveLength(1)
  })
})
