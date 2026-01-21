# syntax=docker.io/docker/dockerfile:1

############################
# Base
############################
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

############################
# Dependencies
############################
FROM base AS deps
RUN corepack enable

# Copy package files AND files needed by fumadocs postinstall
COPY package.json pnpm-lock.yaml .npmrc* ./
COPY source.config.ts tsconfig.json ./
# Create the content directory that fumadocs expects
RUN mkdir -p content/docs

RUN pnpm install --frozen-lockfile

############################
# Builder
############################
FROM base AS builder
RUN corepack enable

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV CI=true
RUN pnpm run build

############################
# Runner (Next.js standalone)
############################
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]