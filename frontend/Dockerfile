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

# NEXT_PUBLIC_* vars are inlined at build time by Next.js
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_LOG_LEVEL
ARG NEXT_PUBLIC_SENTRY_DSN
ARG NEXT_PUBLIC_IMAGES_BUCKET_NAME
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ARG NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
ARG NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
ARG NEXT_PUBLIC_STRIPE_PRICE_LIFETIME
ARG NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER
ARG NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC
ARG NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PRO

ENV DATABASE_URL=$DATABASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_LOG_LEVEL=$NEXT_PUBLIC_LOG_LEVEL
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_IMAGES_BUCKET_NAME=$NEXT_PUBLIC_IMAGES_BUCKET_NAME
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=$NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY
ENV NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=$NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY
ENV NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=$NEXT_PUBLIC_STRIPE_PRICE_LIFETIME
ENV NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER=$NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STARTER
ENV NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=$NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC
ENV NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PRO=$NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PRO
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
