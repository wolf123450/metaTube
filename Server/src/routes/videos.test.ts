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
