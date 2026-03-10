# ─── Stage 1: Build ───
FROM node:22-alpine AS builder
WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# Generate Prisma client & build Next.js
ENV DATABASE_URL="file:./prisma/dev.db"
RUN npx prisma generate
RUN npm run build

# Pre-create seeded database template
RUN npx prisma db push --accept-data-loss --schema=./prisma/schema.prisma --url="file:./prisma/template.db"
RUN DATABASE_URL="file:./prisma/template.db" node prisma/seed.js

# ─── Stage 2: Production ───
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Install runtime deps for native modules
RUN apk add --no-cache libstdc++

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone server (includes node_modules with all needed packages)
COPY --from=builder /app/.next/standalone ./
# Copy static assets and public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# Copy pre-built database template to a path NOT under /app/prisma
# (Render mounts a persistent disk at /app/prisma which hides image contents)
COPY --from=builder /app/prisma/template.db ./db-template/template.db
COPY --from=builder /app/prisma/schema.prisma ./db-template/schema.prisma

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Ensure writable for SQLite
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
