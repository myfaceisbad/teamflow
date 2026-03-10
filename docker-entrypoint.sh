#!/bin/sh
set -e

# Initialize SQLite DB and seed if not exists
if [ ! -f /app/prisma/dev.db ]; then
  echo "==> Initializing database..."
  npx prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss
  echo "==> Seeding demo data..."
  node prisma/seed.js
  echo "==> Database ready!"
else
  echo "==> Database already exists, skipping init."
fi

echo ""
echo "============================================"
echo "  TeamFlow is starting on port ${PORT:-3000}"
echo "  http://localhost:${PORT:-3000}"
echo ""
echo "  Demo accounts:"
echo "    admin@teamflow.dev / password123"
echo "    manager1@teamflow.dev / password123"
echo "    member1@teamflow.dev / password123"
echo "============================================"
echo ""

exec "$@"
