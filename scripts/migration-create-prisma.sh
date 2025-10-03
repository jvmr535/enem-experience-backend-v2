#!/usr/bin/env fish
set cli1 $argv[1]

if test -z "$cli1"
    echo "Usage: fish scripts/migration-create-prisma.sh <migration_name>"
    exit 1
end

# Create migration using Prisma's built-in migration system
echo "Creating migration: $cli1"
npx prisma migrate dev --name $cli1 --create-only

# Apply migration to remote database
echo "Applying migration to remote database..."
npx wrangler d1 migrations apply enem-experience-db --remote

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration created and applied successfully!"