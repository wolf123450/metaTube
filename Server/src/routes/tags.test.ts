import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import Fastify from 'fastify'
import { tagRoutes } from './tags.js'

vi.mock('../db.js', () => ({
  default: {
    video: { findUnique: vi.fn() },
    tag: { upsert: vi.fn() },
    videoTag: { upsert: vi.fn() },
  },
}))

import prisma from '../db.js'

describe('GET /api/tags/:videoId', () => {
  let app: ReturnType<typeof Fastify>

  beforeAll(async () => {
    app = Fastify()
    await app.register(tagRoutes)
    await app.ready()
  })

  afterAll(() => app.close())

  it('returns video with tags', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue({
      id: 1,
      videoId: 'dQw4w9WgXcQ',
      title: 'Rick Astley',
      createdAt: new Date(),
      updatedAt: null,
      tags: [{ tag: { id: 1, name: 'music' }, videoId: 1, tagId: 1 }],
    } as any)

    const res = await app.inject({
      method: 'GET',
      url: '/api/tags/dQw4w9WgXcQ',
    })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual({
      id: 'dQw4w9WgXcQ',
      tags: ['music'],
    })
  })

  it('returns 404 for unknown videoId', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue(null)

    const res = await app.inject({
      method: 'GET',
      url: '/api/tags/notareal',
    })

    expect(res.statusCode).toBe(404)
  })
})

describe('POST /api/tags/:videoId', () => {
  let app: ReturnType<typeof Fastify>

  beforeAll(async () => {
    app = Fastify()
    await app.register(tagRoutes)
    await app.ready()
  })

  afterAll(() => app.close())

  it('adds a tag to an existing video and returns 204', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue({
      id: 1, videoId: 'dQw4w9WgXcQ', title: 'Rick Astley',
      createdAt: new Date(), updatedAt: null,
    } as any)
    vi.mocked(prisma.tag.upsert).mockResolvedValue({ id: 5, name: 'newTag' } as any)
    vi.mocked(prisma.videoTag.upsert).mockResolvedValue({} as any)

    const res = await app.inject({
      method: 'POST',
      url: '/api/tags/dQw4w9WgXcQ',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tag: 'newTag' }),
    })

    expect(res.statusCode).toBe(204)
    expect(prisma.tag.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ where: { name: 'newTag' } })
    )
  })

  it('returns 404 when videoId not found', async () => {
    vi.mocked(prisma.video.findUnique).mockResolvedValue(null)

    const res = await app.inject({
      method: 'POST',
      url: '/api/tags/notareal',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tag: 'anything' }),
    })

    expect(res.statusCode).toBe(404)
  })
})
