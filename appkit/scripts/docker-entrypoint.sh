#!/bin/sh
set -e

echo "🚀 Starting UniApps Admin Server Bootstrap..."

# Run prisma db push to ensure schema is in sync
# In a real production environment, you should use prisma migrate deploy
# but for this environment, db push is used to ensure all 4 schemas are synced.
echo "🔄 Synchronizing database schema..."
npx prisma db push --accept-data-loss --skip-generate

echo "🌱 Seeding administrative user..."
node scripts/seed-admin.js

echo "✅ Database synchronization and seeding complete."

# Start the application
echo "🎬 Starting application..."
exec "$@"
