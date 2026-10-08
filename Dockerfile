# syntax=docker/dockerfile:1
# The live website: Next's standalone server on Node 22, run as a non-root
# user. Built for linux/arm64 by .github/workflows/release.yml; see the
# README's "Self-hosting" section for its build arguments and environment.

FROM node:22-alpine AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 \
    COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN corepack enable pnpm

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
# Static pages are rendered here, so their canonical links need the public
# address now. Both are public values, not secrets.
ARG SITE_URL=""
ARG SITE_ENV=""
ENV SITE_URL=$SITE_URL \
    SITE_ENV=$SITE_ENV
# The API address and key are optional build secrets, so the home and
# stories pages are built with the published articles, as on Vercel. They are
# mounted for this command only and never stored in a layer.
RUN --mount=type=secret,id=api_url \
    --mount=type=secret,id=api_service_key \
    API_URL="$(cat /run/secrets/api_url 2>/dev/null || true)" \
    API_SERVICE_KEY="$(cat /run/secrets/api_service_key 2>/dev/null || true)" \
    NODE_OPTIONS=--max-old-space-size=2048 \
    pnpm build

FROM node:22-alpine
WORKDIR /app
ARG SITE_URL=""
ARG SITE_ENV=""
# Server secrets (API_URL, API_SERVICE_KEY, SITE_REVALIDATE_SECRET,
# INDEXNOW_KEY) come from the host at run time. The heap limit keeps the
# server inside its share of the 2 GB host; override it there if needed.
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    NODE_OPTIONS=--max-old-space-size=320 \
    SITE_URL=$SITE_URL \
    SITE_ENV=$SITE_ENV

# The server rewrites pages into .next as they revalidate, so the "node"
# user must own the copied tree.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/api/health || exit 1
CMD ["node", "server.js"]
