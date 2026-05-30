#!/bin/sh
set -e

echo "[Warrior Command Center] Starting deployment..."

# Wait for PostgreSQL to be ready (max 30 seconds)
echo "[Warrior Command Center] Waiting for database..."
for i in $(seq 1 30); do
  if node -e "const { Client } = require('pg'); const c = new Client({connectionString: process.env.DATABASE_URL}); c.connect().then(() => { c.end(); process.exit(0); }).catch(() => process.exit(1));" 2>/dev/null; then
    echo "[Warrior Command Center] Database is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "[Warrior Command Center] WARNING: Database may not be ready, proceeding anyway..."
  fi
  sleep 1
done

# Run Prisma migrations
echo "[Warrior Command Center] Running database migrations..."
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss 2>/dev/null || echo "[Warrior Command Center] Migration skipped (may already be applied)"

# Start the application
echo "[Warrior Command Center] Starting server on port ${PORT:-3000}..."
exec node dist/main.js
