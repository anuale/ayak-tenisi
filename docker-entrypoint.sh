#!/bin/sh
set -e

echo "Running Prisma schema sync..."
npx prisma db push --accept-data-loss

echo "Starting application..."
exec "$@"
