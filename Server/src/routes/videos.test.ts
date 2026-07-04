import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest'
import Fastify from 'fastify'
import { videoRoutes } from './videos.js'

vi.mock('../db.js', () => ({
  default: {
    video: {
      findMany: vi.fn(),
      upsert: vi.fn(),
    },
    tag: { upsert: vi.fn() },
    videoTag: { findMany: vi.fn(), create: vi.fn() },
  },
}))

vi.mock('googleapis', () => ({
  google: {
    youtube: () => ({
      videos: {
        list: vi.fn().mockResolvedValue({
          data: {
            items: [{ snippet: { title: 'Test Video', tags: ['funny', 'test'] } }],
          },
        }),
      },
    }),
  },
}))

import prisma from '../db.js'

describe('GET /api/videos', () => {
  let app: ReturnType<typeof Fastify>

  beforeAll(async () => {
    app = Fastify()
    await app.register(videoRoutes)
    await app.ready()
  })

  afterAll(() => app.close())

  it('returns empty array when no videos', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue([])

    const res = await app.inject({ method: 'GET', url: '/api/videos' })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual([])
  })

  it('returns formatted videos when no filter', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue([
      {
        id: 1,
        videoId: 'dQw4w9WgXcQ',
        title: 'Rick Astley',
        createdAt: new Date(),
        updatedAt: null,
        tags: [{ tag: { id: 1, name: 'music' }, videoId: 1, tagId: 1 }],
      } as any,
    ])

    const res = await app.inject({ method: 'GET', url: '/api/videos' })

    expect(res.statusCode).toBe(200)
    expect(JSON.parse(res.body)).toEqual([
      { id: 'dQw4w9WgXcQ', title: 'Rick Astley', tags: ['music'] },
    ])
  })

  it('passes filterTags to prisma where clause', async () => {
    vi.mocked(prisma.video.findMany).mockResolvedValue([])

    await app.inject({
      method: 'GET',
      url: '/api/videos?filterTags=["music","gaming"]',
    })

    expect(prisma.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          tags: { some: { tag: { name: { in: ['music', 'gaming'] } } } },
        },
      })
    )
  })
})

describe('POST /api/addVideo', () => {
  let app: ReturnType<typeof Fastify>

  beforeAll(async () => {
    app = Fastify()
    await app.register(videoRoutes)
    await app.ready()
  })

  afterAll(() => app.close())

  it('upserts video and merges YouTube + user tags, returns 204', async () => {
    vi.mocked(prisma.video.upsert).mockResolvedValue({
      id: 1, videoId: 'dQw4w9WgXcQ', title: 'Test Video',
      createdAt: new Date(), updatedAt: null,
    } as any)
    vi.mocked(prisma.tag.upsert).mockResolvedValue({ id: 1, name: 'funny' } as any)
    vi.mocked(prisma.videoTag.findMany).mockResolvedValue([])
    vi.mocked(prisma.videoTag.create).mockResolvedValue({} as any)

    const res = await app.inject({
      method: 'POST',
      url: '/api/addVideo',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: 'dQw4w9WgXcQ', tags: ['myTag'] }),
    })

    expect(res.statusCode).toBe(204)
    // YouTube mock returns ['funny', 'test'], user sends ['myTag'] → 3 tag upserts
    expect(prisma.tag.upsert).toHaveBeenCalledTimes(3)
  })
})
