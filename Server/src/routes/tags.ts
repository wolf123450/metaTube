import type { FastifyInstance } from 'fastify'
import prisma from '../db.js'

export async function tagRoutes(fastify: FastifyInstance) {
  fastify.get('/api/tags/:videoId', async (request, reply) => {
    const { videoId } = request.params as { videoId: string }

    const video = await prisma.video.findUnique({
      where: { videoId },
      include: { tags: { include: { tag: true } } },
    })

    if (!video) return reply.status(404).send({ error: 'Not found' })

    return { id: video.videoId, tags: video.tags.map((vt) => vt.tag.name) }
  })

  fastify.post('/api/tags/:videoId', async (request, reply) => {
    const { videoId } = request.params as { videoId: string }
    const { tag: tagName } = request.body as { tag: string }

    const video = await prisma.video.findUnique({ where: { videoId } })
    if (!video) return reply.status(404).send({ error: 'Not found' })

    const tag = await prisma.tag.upsert({
      where: { name: tagName },
      create: { name: tagName },
      update: {},
    })

    await prisma.videoTag.upsert({
      where: { videoId_tagId: { videoId: video.id, tagId: tag.id } },
      create: { videoId: video.id, tagId: tag.id },
      update: {},
    })

    return reply.status(204).send()
  })
}
