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

# Prisma migration engine requires OpenSSL on Alpine
RUN apk add --no-cache openssl

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/dist ./dist
COPY --from=base /app/prisma ./prisma

EXPOSE 4000

# Push schema to DB then start
CMD npx prisma db push --accept-data-loss && node dist/server.js
