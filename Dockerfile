FROM oven/bun:1.3 AS builder
WORKDIR /app

# These vars are baked into the client bundle at build time
ARG GIT_SHA
ARG NODE_ENV
ARG ANALYTICS_GA_MEASUREMENT_ID
ENV GIT_SHA=$GIT_SHA
ENV NODE_ENV=$NODE_ENV
ENV ANALYTICS_GA_MEASUREMENT_ID=$ANALYTICS_GA_MEASUREMENT_ID

# next.config.ts derives the Content-Security-Policy media origins from these,
# and Next writes headers into the build output, so they must be set here too
ARG EXAM_ASSETS_BASE_URL
ARG S3_ENDPOINT
ENV EXAM_ASSETS_BASE_URL=$EXAM_ASSETS_BASE_URL
ENV S3_ENDPOINT=$S3_ENDPOINT

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build
# The runner has no bun and no source, so the admin scripts ship bundled for node
RUN bun build scripts/migrate.ts scripts/delete-user.ts \
    --target node --outdir dist/scripts

# Use Debian-based Node (not Alpine) so glibc native addons
# (sharp) work correctly at runtime.
FROM node:20-slim AS runner
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Only what the server reads at runtime: the traced standalone build (next.config.ts), its static
# files, and the migrations with the bundled scripts that apply them
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/db/migrations ./db/migrations
COPY --from=builder --chown=nextjs:nodejs /app/dist/scripts ./scripts

USER nextjs
EXPOSE 3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
