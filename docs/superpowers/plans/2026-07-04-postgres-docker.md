# metaTube: PostgreSQL Migration + Docker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Server from MongoDB/Mongoose to PostgreSQL/Prisma, add TypeScript to the Server, update the client-side tag endpoint call, and containerize the full stack with Docker Compose.

**Architecture:** The Server is refactored from a single `server.js` file into `src/server.ts` + `src/routes/videos.ts` + `src/routes/tags.ts` + `src/db.ts`. Prisma owns schema, migrations, and type-safe queries. Docker Compose runs three services: `db` (postgres:16-alpine), `server` (Node 22), and `client` (Vite build served by nginx). The client's `/api` calls are proxied to the server in both dev (Vite proxy) and production (nginx `location /api` block).

**Tech Stack:** Fastify v5, Prisma 5, PostgreSQL 16, TypeScript 5, tsx (runtime), Vitest (tests), Docker Compose v2, nginx (client production)

---

## File Map

### New files
| Path | Responsibility |
|------|---------------|
| `Server/tsconfig.json` | TypeScript config for Server (NodeNext modules) |
| `Server/src/db.ts` | Prisma client singleton |
| `Server/src/server.ts` | Fastify app factory + startup entry point |
| `Server/src/routes/videos.ts` | `GET /api/videos`, `POST /api/addVideo` |
| `Server/src/routes/tags.ts` | `GET /api/tags/:videoId`, `POST /api/tags/:videoId` |
| `Server/src/routes/videos.test.ts` | Vitest tests for video routes |
| `Server/src/routes/tags.test.ts` | Vitest tests for tag routes |
| `Server/prisma/schema.prisma` | Relational schema: videos, tags, video_tags |
| `Server/Dockerfile` | Multi-stage Node 22 image, runs migrations then starts |
| `Client/Dockerfile` | Multi-stage Vite build → nginx |
| `docker-compose.yml` | Orchestrates db + server + client (production) |
| `docker-compose.dev.yml` | Dev override: exposes ports, mounts source, skips nginx |

### Modified files
| Path | Change |
|------|--------|
| `Server/package.json` | Add prisma, @prisma/client, tsx, vitest, @types/*; remove mongoose, nodemon; update scripts |
| `Server/.env.example` | Replace `MONGO_PROD_URI` with `DATABASE_URL` |
| `Client/src/components/EmbeddedVideo.tsx` | Change `GET /api/addTag?...` → `POST /api/tags/:videoId` |

### Deleted files
| Path | Reason |
|------|--------|
| `Server/server.js` | Replaced by `Server/src/server.ts` |
| `Server/mongooseInterface.js` | Replaced by `Server/src/db.ts` |
| `Server/models/video.js` | Schema moved to `prisma/schema.prisma` |

---

## Task 1: Server TypeScript + Test Infrastructure

**Files:**
- Create: `Server/tsconfig.json`
- Modify: `Server/package.json`

- [ ] **Step 1.1: Update `Server/package.json`**

Replace the entire file:

```json
{
  "name": "server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "tsx src/server.ts",
    "start:prod": "node dist/server.js",
    "build": "tsc",
    "test": "vitest run",
    "test:watch": "vitest",
    "db:migrate": "prisma migrate deploy",
    "db:migrate:dev": "prisma migrate dev",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "dotenv": "^16.0.1",
    "fastify": "^5.9.0",
    "googleapis": "^173.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "prisma": "^5.22.0",
    "tsx": "^4.19.0",
    "typescript": "^5.7.0",
    "vitest": "^3.0.0"
  }
}
```

- [ ] **Step 1.2: Create `Server/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 1.3: Install dependencies**

```bash
cd Server
npm install
```

Expected: installs without errors, `node_modules/@prisma` and `node_modules/tsx` present.

- [ ] **Step 1.4: Commit**

```bash
git add Server/package.json Server/package-lock.json Server/tsconfig.json
git commit -m "chore(server): add TypeScript and Vitest infrastructure"
```

---

## Task 2: Prisma Schema and DB Client

**Files:**
- Create: `Server/prisma/schema.prisma`
- Create: `Server/src/db.ts`
- Modify: `Server/.env.example`

- [ ] **Step 2.1: Initialise Prisma**

```bash
cd Server
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma` and adds `DATABASE_URL` to `.env`. The generated schema.prisma will be replaced in the next step.

- [ ] **Step 2.2: Write `Server/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Video {
  id        Int        @id @default(autoincrement())
  videoId   String     @unique @map("video_id") @db.VarChar(11)
  title     String?
  createdAt DateTime   @default(now()) @map("created_at")
  updatedAt DateTime?  @updatedAt @map("updated_at")
  tags      VideoTag[]

  @@map("videos")
}

model Tag {
  id     Int        @id @default(autoincrement())
  name   String     @unique
  videos VideoTag[]

  @@map("tags")
}

model VideoTag {
  videoId Int   @map("video_id")
  tagId   Int   @map("tag_id")
  video   Video @relation(fields: [videoId], references: [id], onDelete: Cascade)
  tag     Tag   @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([videoId, tagId])
  @@map("video_tags")
}
```

- [ ] **Step 2.3: Update `Server/.env.example`**

```
DATABASE_URL=postgresql://metatube:metatube_dev@localhost:5432/metatube
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
```

Also update your local `Server/.env` to use a real PostgreSQL connection string. For local dev, run PostgreSQL locally or use the Docker service (Task 10) first.

- [ ] **Step 2.4: Create `Server/src/db.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
export default prisma
```

- [ ] **Step 2.5: Generate Prisma client**

```bash
cd Server
npx prisma generate
```

Expected: `Generated Prisma Client ... to ./node_modules/@prisma/client`

- [ ] **Step 2.6: Create and run initial migration** (requires a running PostgreSQL)

```bash
cd Server
npx prisma migrate dev --name init
```

Expected: creates `prisma/migrations/TIMESTAMP_init/migration.sql` and applies it to the DB.

- [ ] **Step 2.7: Commit**

```bash
git add Server/prisma Server/src/db.ts Server/.env.example Server/package-lock.json
git commit -m "feat(server): add Prisma schema (videos, tags, video_tags)"
```

---

## Task 3: Videos GET Route

**Files:**
- Create: `Server/src/routes/videos.ts`
- Create: `Server/src/routes/videos.test.ts`

- [ ] **Step 3.1: Write the failing test**

Create `Server/src/routes/videos.test.ts`:

```typescript
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
```

- [ ] **Step 3.2: Run — confirm it fails**

```bash
cd Server
npm test -- --reporter=verbose 2>&1 | head -30
```

Expected: FAIL — `Cannot find module './videos.js'`

- [ ] **Step 3.3: Create `Server/src/routes/videos.ts`** (GET only)

```typescript
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
```

- [ ] **Step 3.4: Run tests — confirm GET tests pass**

```bash
cd Server
npm test -- --reporter=verbose
```

Expected: 3 passing tests for `GET /api/videos`. `POST /api/addVideo` test (if any) is skipped.

- [ ] **Step 3.5: Commit**

```bash
git add Server/src/routes/videos.ts Server/src/routes/videos.test.ts
git commit -m "feat(server): add GET /api/videos with Prisma and tag filter"
```

---

## Task 4: Videos POST /api/addVideo Route

**Files:**
- Modify: `Server/src/routes/videos.ts`
- Modify: `Server/src/routes/videos.test.ts`

- [ ] **Step 4.1: Add failing test for POST /api/addVideo**

Append to `Server/src/routes/videos.test.ts`:

```typescript
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
```

- [ ] **Step 4.2: Run — confirm it fails**

```bash
cd Server
npm test -- --reporter=verbose
```

Expected: FAIL — `addVideo` returns 501.

- [ ] **Step 4.3: Implement `POST /api/addVideo` in `Server/src/routes/videos.ts`**

Replace the stub `fastify.post('/api/addVideo', ...)` with:

```typescript
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
```

- [ ] **Step 4.4: Run tests — confirm all pass**

```bash
cd Server
npm test -- --reporter=verbose
```

Expected: all 4 tests passing.

- [ ] **Step 4.5: Commit**

```bash
git add Server/src/routes/videos.ts Server/src/routes/videos.test.ts
git commit -m "feat(server): implement POST /api/addVideo with YouTube metadata merge"
```

---

## Task 5: Tags Routes + Client Update

**Files:**
- Create: `Server/src/routes/tags.ts`
- Create: `Server/src/routes/tags.test.ts`
- Modify: `Client/src/components/EmbeddedVideo.tsx`

- [ ] **Step 5.1: Write failing tests**

Create `Server/src/routes/tags.test.ts`:

```typescript
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
```

- [ ] **Step 5.2: Run — confirm tests fail**

```bash
cd Server
npm test -- --reporter=verbose
```

Expected: FAIL — `Cannot find module './tags.js'`

- [ ] **Step 5.3: Create `Server/src/routes/tags.ts`**

```typescript
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
```

- [ ] **Step 5.4: Run tests — confirm all pass**

```bash
cd Server
npm test -- --reporter=verbose
```

Expected: all tag route tests pass.

- [ ] **Step 5.5: Update client call in `Client/src/components/EmbeddedVideo.tsx`**

The old code uses `GET /api/addTag?videoId=...&tag=...`. Change the `tagListChanged` function:

Find this block:
```typescript
  const tagListChanged: (newTagList: string[]) => void = (newTagList) => {
    if (newTagList.length > videoData.tags.length) {
      let difference = Enumerable.from(newTagList)
        .where((item) => {
          return !videoData.tags.includes(item);
        })
        .toArray();
      for (let item of difference) {
        fetch(`/api/addTag?videoId=${videoId}&tag=${item}`);
      }
    }
    setVideoData({ id: videoData.id, tags: newTagList });
  };
```

Replace with:
```typescript
  const tagListChanged: (newTagList: string[]) => void = (newTagList) => {
    if (newTagList.length > videoData.tags.length) {
      const newTags = newTagList.filter((item) => !videoData.tags.includes(item));
      for (const tag of newTags) {
        fetch(`/api/tags/${videoId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tag }),
        });
      }
    }
    setVideoData({ id: videoData.id, tags: newTagList });
  };
```

Also remove the `Enumerable` import since it's no longer used:

Remove the line:
```typescript
import Enumerable from "linq";
```

- [ ] **Step 5.6: Commit**

```bash
git add Server/src/routes/tags.ts Server/src/routes/tags.test.ts Client/src/components/EmbeddedVideo.tsx
git commit -m "feat(server): add GET+POST /api/tags/:videoId; feat(client): update addTag to POST"
```

---

## Task 6: Fastify App Entrypoint + Remove Old Server

**Files:**
- Create: `Server/src/server.ts`
- Delete: `Server/server.js`, `Server/mongooseInterface.js`, `Server/models/video.js`

- [ ] **Step 6.1: Create `Server/src/server.ts`**

```typescript
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
```

- [ ] **Step 6.2: Smoke-test the server starts** (requires DB running and `.env` set)

```bash
cd Server
npm start
```

Expected: `Server listening at http://[::]:4000`

Press Ctrl+C to stop.

- [ ] **Step 6.3: Delete the old MongoDB files**

```bash
cd Server
rm server.js mongooseInterface.js models/video.js
rmdir models
```

- [ ] **Step 6.4: Run the full test suite to confirm nothing broke**

```bash
cd Server
npm test
```

Expected: all tests pass.

- [ ] **Step 6.5: Commit**

```bash
git add -A
git commit -m "feat(server): wire up Fastify app entrypoint; remove Mongoose files"
```

---

## Task 7: Remove Mongoose Dependency

**Files:**
- Modify: `Server/package.json`

- [ ] **Step 7.1: Remove mongoose from package.json and reinstall**

```bash
cd Server
npm uninstall mongoose
```

- [ ] **Step 7.2: Confirm no references to mongoose remain**

```bash
grep -r "mongoose" Server/src Server/package.json 2>/dev/null
```

Expected: no output.

- [ ] **Step 7.3: Run tests once more**

```bash
cd Server
npm test
```

Expected: all passing.

- [ ] **Step 7.4: Commit**

```bash
git add Server/package.json Server/package-lock.json
git commit -m "chore(server): remove Mongoose dependency"
```

---

## Task 8: Server Dockerfile

**Files:**
- Create: `Server/Dockerfile`
- Create: `Server/.dockerignore`

- [ ] **Step 8.1: Create `Server/.dockerignore`**

```
node_modules
dist
.env
*.log
```

- [ ] **Step 8.2: Create `Server/Dockerfile`**

```dockerfile
FROM node:22-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy compiled source
COPY src ./src
COPY tsconfig.json ./

# Install dev deps just for build, then prune
RUN npm ci && npm run build && npm prune --omit=dev

FROM node:22-alpine AS runtime
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

EXPOSE 4000

# Run migrations then start
CMD npx prisma migrate deploy && node dist/server.js
```

- [ ] **Step 8.3: Build and test the image** (requires Docker running)

```bash
cd Server
docker build -t metatube-server .
```

Expected: builds successfully, final image present in `docker images`.

- [ ] **Step 8.4: Commit**

```bash
git add Server/Dockerfile Server/.dockerignore
git commit -m "feat(server): add Dockerfile with migration-on-start"
```

---

## Task 9: Client Dockerfile

**Files:**
- Create: `Client/Dockerfile`
- Create: `Client/.dockerignore`
- Create: `Client/nginx.conf`

- [ ] **Step 9.1: Create `Client/.dockerignore`**

```
node_modules
dist
.env
```

- [ ] **Step 9.2: Create `Client/nginx.conf`**

This configures nginx to serve the SPA and proxy `/api` calls to the server container:

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # Proxy API calls to server
    location /api/ {
        proxy_pass http://server:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # SPA fallback — all non-file routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 9.3: Create `Client/Dockerfile`**

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

- [ ] **Step 9.4: Build and test the image**

```bash
cd Client
docker build -t metatube-client .
```

Expected: builds successfully.

- [ ] **Step 9.5: Commit**

```bash
git add Client/Dockerfile Client/.dockerignore Client/nginx.conf
git commit -m "feat(client): add Dockerfile with nginx SPA + API proxy"
```

---

## Task 10: Docker Compose

**Files:**
- Create: `docker-compose.yml`
- Create: `docker-compose.dev.yml`
- Create: `.env.example` (root level)

- [ ] **Step 10.1: Create root `.env.example`**

```
YOUTUBE_API_KEY=your_youtube_data_api_v3_key_here
POSTGRES_PASSWORD=metatube_dev
```

- [ ] **Step 10.2: Create `docker-compose.yml`** (production)

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: metatube
      POSTGRES_USER: metatube
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U metatube"]
      interval: 5s
      timeout: 5s
      retries: 5

  server:
    build: ./Server
    environment:
      DATABASE_URL: postgresql://metatube:${POSTGRES_PASSWORD}@db:5432/metatube
      YOUTUBE_API_KEY: ${YOUTUBE_API_KEY}
    ports:
      - "4000:4000"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  client:
    build: ./Client
    ports:
      - "3000:80"
    depends_on:
      - server
    restart: unless-stopped

volumes:
  postgres_data:
```

- [ ] **Step 10.3: Create `docker-compose.dev.yml`** (development override)

Used as `docker compose -f docker-compose.yml -f docker-compose.dev.yml up` for local dev. Runs only the DB in Docker so you can run server/client with hot reload outside containers.

```yaml
services:
  db:
    ports:
      - "5432:5432"

  server:
    build:
      target: base
    volumes:
      - ./Server/src:/app/src
    command: npx tsx --watch src/server.ts

  client:
    build:
      context: ./Client
      target: build
    ports:
      - "3000:3000"
    volumes:
      - ./Client/src:/app/src
    command: npx vite --host
```

- [ ] **Step 10.4: Add a root `.gitignore` or extend the existing one**

Make sure the root `.gitignore` includes:

```
.env
```

Check `D:\Projects\metaTube\.gitignore` — it already has `.env.local` entries but not `.env` itself. Add:

```
.env
```

to the root `.gitignore`.

- [ ] **Step 10.5: Test the full stack**

```bash
# From repo root
cp .env.example .env
# Edit .env to set YOUTUBE_API_KEY and POSTGRES_PASSWORD

docker compose up --build
```

Expected:
- `db` healthy after ~5s
- `server` runs migrations then listens on 4000
- `client` serves on http://localhost:3000
- Opening http://localhost:3000 shows the metaTube UI
- Video list loads (may be empty if starting fresh)

- [ ] **Step 10.6: Commit**

```bash
git add docker-compose.yml docker-compose.dev.yml .env.example .gitignore
git commit -m "feat: add Docker Compose for full-stack postgres + server + client"
```

---

## Optional Task 11: MongoDB Data Migration Script

Only needed if you have existing video data in MongoDB to preserve.

**Files:**
- Create: `Server/scripts/migrate-from-mongo.ts`

- [ ] **Step 11.1: Create `Server/scripts/migrate-from-mongo.ts`**

This script reads from MongoDB and inserts into PostgreSQL via Prisma. Run it once with both DBs accessible.

```typescript
import 'dotenv/config'
import { MongoClient } from 'mongodb'
import { PrismaClient } from '@prisma/client'

const mongoUri = process.env.MONGO_PROD_URI ?? ''
const prisma = new PrismaClient()

interface MongoVideo {
  videoId: string
  title?: string
  tags: string[]
  createdAt?: Date
}

async function main() {
  const mongo = new MongoClient(mongoUri)
  await mongo.connect()

  const db = mongo.db()
  const videos = (await db.collection('videos').find({}).toArray()) as MongoVideo[]

  console.log(`Migrating ${videos.length} videos...`)

  for (const v of videos) {
    const video = await prisma.video.upsert({
      where: { videoId: v.videoId },
      create: {
        videoId: v.videoId,
        title: v.title ?? null,
        createdAt: v.createdAt ?? new Date(),
      },
      update: { title: v.title ?? null },
    })

    for (const name of v.tags ?? []) {
      const tag = await prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      })
      await prisma.videoTag.upsert({
        where: { videoId_tagId: { videoId: video.id, tagId: tag.id } },
        create: { videoId: video.id, tagId: tag.id },
        update: {},
      })
    }

    console.log(`  ✓ ${v.videoId} (${v.tags?.length ?? 0} tags)`)
  }

  await mongo.close()
  await prisma.$disconnect()
  console.log('Migration complete.')
}

main().catch((e) => { console.error(e); process.exit(1) })
```

- [ ] **Step 11.2: Add mongodb as a temporary dev dependency**

```bash
cd Server
npm install --save-dev mongodb
```

- [ ] **Step 11.3: Run the migration**

Set `MONGO_PROD_URI` in `Server/.env`, then:

```bash
cd Server
npx tsx scripts/migrate-from-mongo.ts
```

Expected: each video logged with `✓`, then `Migration complete.`

- [ ] **Step 11.4: Remove mongodb dev dependency after migration**

```bash
cd Server
npm uninstall mongodb
```

- [ ] **Step 11.5: Commit**

```bash
git add Server/scripts/migrate-from-mongo.ts Server/package.json Server/package-lock.json
git commit -m "chore: add one-time MongoDB → PostgreSQL migration script"
```

---

## Self-Review Checklist

- [x] TypeScript setup for server — Task 1
- [x] Prisma schema (videos, tags, video_tags normalized) — Task 2
- [x] `GET /api/videos` with optional tag filter — Task 3
- [x] `POST /api/addVideo` with YouTube metadata + tag merge — Task 4
- [x] `GET /api/tags/:videoId` — Task 5
- [x] `POST /api/tags/:videoId` (replaces `GET /api/addTag`) — Task 5
- [x] Client updated to use new POST endpoint — Task 5
- [x] Old server.js / mongoose removed — Tasks 6 + 7
- [x] Server Dockerfile with `prisma migrate deploy` on startup — Task 8
- [x] Client Dockerfile with nginx proxy — Task 9
- [x] `docker-compose.yml` with health-checked postgres — Task 10
- [x] `.env.example` at root and Server levels — Tasks 2 + 10
- [x] Optional data migration script — Task 11
