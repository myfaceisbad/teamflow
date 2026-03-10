#!/bin/sh
set -e

# If no database exists, copy pre-built template (no prisma CLI needed at runtime)
if [ ! -f /app/prisma/dev.db ]; then
  echo "==> Copying pre-built database template..."
  cp /app/prisma/template.db /app/prisma/dev.db
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
