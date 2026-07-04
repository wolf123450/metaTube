import type { FastifyInstance } from 'fastify'
import { google } from 'googleapis'
import prisma from '../db.js'

const youtube = google.youtube({ version: 'v3', auth: process.env.YOUTUBE_API_KEY })

function formatVideo(video: {
  videoId: string
  title: string | null
  tags: { tag: { name: string } }[]
}) {
  return {
    id: video.videoId,
    title: video.title,
    tags: video.tags.map((vt) => vt.tag.name),
  }
}

export async function videoRoutes(fastify: FastifyInstance) {
  fastify.get('/api/videos', async (request, reply) => {
    const { filterTags: raw } = request.query as { filterTags?: string }
    let filterTags: string[] = []
    if (raw) {
      try {
        const parsed: unknown = JSON.parse(raw)
        if (!Array.isArray(parsed)) throw new Error()
        filterTags = parsed as string[]
      } catch {
        return reply.status(400).send({ error: 'filterTags must be a JSON array' })
      }
    }

    const where = filterTags.length
      ? { tags: { some: { tag: { name: { in: filterTags } } } } }
      : {}

    const videos = await prisma.video.findMany({
      where,
      include: { tags: { include: { tag: true } } },
    })

    return videos.map(formatVideo)
  })

  fastify.post('/api/addVideo', async (request, reply) => {
    const body = request.body as { id?: unknown; tags?: unknown } | null
    if (!body || typeof body.id !== 'string' || !body.id) {
      return reply.status(400).send({ error: 'id (string) is required' })
    }
    const videoId = body.id
    const userTags: string[] = Array.isArray(body.tags) ? (body.tags as string[]) : []

    const ytResponse = await youtube.videos.list({ id: [videoId], part: ['snippet'] })
    const snippet = ytResponse.data.items?.[0]?.snippet
    const title = snippet?.title ?? ''
    const ytTags: string[] = snippet?.tags ?? []

    const video = await prisma.video.upsert({
      where: { videoId },
      create: { videoId, title },
      update: { title, updatedAt: new Date() },
    })

    const allTags = [...new Set([...userTags, ...ytTags])]

    const existingLinks = await prisma.videoTag.findMany({
      where: { videoId: video.id },
    })
    const existingTagIds = new Set(existingLinks.map((l) => l.tagId))

    for (const name of allTags) {
      const tag = await prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
      if (!existingTagIds.has(tag.id)) {
        await prisma.videoTag.create({ data: { videoId: video.id, tagId: tag.id } })
      }
    }

    return reply.status(204).send()
  })
}
