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
  fastify.get('/api/videos', async (request) => {
    const { filterTags: raw } = request.query as { filterTags?: string }
    const filterTags: string[] = raw ? JSON.parse(raw) : []

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
    const { id: videoId, tags: userTags = [] } = request.body as {
      id: string
      tags: string[]
    }

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
