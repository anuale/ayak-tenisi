#!/bin/sh

echo "=== Ayak Tenisi Skor - Entrypoint ==="
echo "Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL is not set! Skipping database sync."
else
  echo "Running Prisma schema sync..."
  npx prisma db push --accept-data-loss 2>&1 || echo "WARNING: Prisma db push failed, continuing anyway..."
fi

echo "=== Starting application ==="
exec "$@"
