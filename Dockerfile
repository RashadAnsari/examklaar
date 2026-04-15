FROM oven/bun:1.2 AS builder
WORKDIR /app

# These vars are baked into the client bundle at build time
ARG SUPABASE_PUBLIC_URL
ARG SUPABASE_PUBLISHABLE_DEFAULT_KEY
ENV SUPABASE_PUBLIC_URL=$SUPABASE_PUBLIC_URL
ENV SUPABASE_PUBLISHABLE_DEFAULT_KEY=$SUPABASE_PUBLISHABLE_DEFAULT_KEY

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Use Debian-based Node (not Alpine) so glibc native addons
# (onnxruntime-node, sharp) work correctly at runtime.
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app ./

USER nextjs
EXPOSE 3000
ENV HOSTNAME=0.0.0.0

CMD ["node_modules/.bin/next", "start"]
