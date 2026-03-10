#!/bin/sh
set -e

# Ensure prisma directory exists (Render mounts persistent disk here)
mkdir -p /app/prisma

# Copy schema if missing (disk mount hides the original)
if [ ! -f /app/prisma/schema.prisma ]; then
  cp /app/db-template/schema.prisma /app/prisma/schema.prisma
fi

# Initialize SQLite DB from pre-built template if not exists
if [ ! -f /app/prisma/dev.db ]; then
  echo "==> Copying pre-built database template..."
  cp /app/db-template/template.db /app/prisma/dev.db
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
