import 'dotenv/config'
import Fastify from 'fastify'
import { videoRoutes } from './routes/videos.js'
import { tagRoutes } from './routes/tags.js'

const fastify = Fastify({ logger: true })

fastify.register(videoRoutes)
fastify.register(tagRoutes)

const start = async () => {
  try {
    await fastify.listen({ port: 4000, host: '0.0.0.0' })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
