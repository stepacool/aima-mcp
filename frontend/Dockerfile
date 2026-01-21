# syntax=docker.io/docker/dockerfile:1

############################
# Base (Debian, faster native deps)
############################
FROM node:22-slim AS base
WORKDIR /app

############################
# Dependencies (cached pnpm)
############################
FROM base AS deps
RUN corepack enable

COPY package.json pnpm-lock.yaml .npmrc* ./
COPY source.config.ts tsconfig.json ./
RUN mkdir -p content/docs

# 🔥 pnpm store cache (HUGE speedup)
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

############################
# Builder
############################
FROM base AS builder
RUN corepack enable

ARG DATABASE_URL
ARG BETTER_AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV CI=true

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm run build

############################
# Runner (Next.js standalone)
############################
FROM node:22-slim AS runner
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
