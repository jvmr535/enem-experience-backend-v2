#!/usr/bin/env fish
set cli1 $argv[1]

if test -z "$cli1"
    echo "Usage: fish scripts/migration-create-manual.sh <migration_name>"
    exit 1
end

set timestamp (date +"%Y%m%d%H%M%S")
set filename "migrations/$timestamp"_"$cli1".sql

# Step 1: Create migrations directory if it doesn't exist
mkdir -p migrations

echo "Creating manual migration for: $cli1"

# For this specific case, let's create the correct ALTER TABLE statement
echo "-- AddColumn" > $filename
echo 'ALTER TABLE "Post" ADD COLUMN "subtitle" TEXT;' >> $filename

echo "Migration file created: $filename"
echo "Contents:"
cat $filename

# Apply migration to remote database
echo "Applying migration to remote database..."
npx wrangler d1 migrations apply enem-experience-db --remote

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

echo "Migration completed successfully!"