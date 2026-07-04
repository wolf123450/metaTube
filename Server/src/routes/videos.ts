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

  // POST /api/addVideo stub — implemented in Task 4
  fastify.post('/api/addVideo', async (_request, reply) => {
    return reply.status(501).send({ error: 'Not implemented yet' })
  })
}
