#!/usr/bin/env fish
set cli1 $argv[1]

if test -z "$cli1"
    echo "Usage: fish scripts/migration-create.sh <migration_name>"
    exit 1
end

set timestamp (date +"%Y%m%d%H%M%S")
set filename "migrations/$timestamp"_"$cli1".sql
set baseline_schema ".migration_baseline.prisma"

# Step 1: Create migrations directory if it doesn't exist
mkdir -p migrations

echo "Generating migration diff against current database state..."

# Check if we have a baseline schema file
if test -f "$baseline_schema"
    echo "Using existing baseline schema for comparison..."
    
    # Generate diff between baseline and current schema
    npx prisma migrate diff \
      --from-schema-datamodel $baseline_schema \
      --to-schema-datamodel ./prisma/schema.prisma \
      --script \
      --output $filename
      
else
    echo "No baseline found. Creating initial migration..."
    
    # Create initial migration
    npx prisma migrate diff \
      --from-empty \
      --to-schema-datamodel ./prisma/schema.prisma \
      --script \
      --output $filename
end

# Check if the migration file was created and has content
if test -f "$filename" -a -s "$filename"
    echo "Migration file created: $filename"
    echo "Contents:"
    cat $filename
    
    echo ""
    echo "Applying migration to remote database..."
    npx wrangler d1 migrations apply enem-experience-db --remote
    
    # Update the baseline schema to current state after successful migration
    echo "Updating baseline schema..."
    cp prisma/schema.prisma $baseline_schema
    
    echo "Generating Prisma client..."
    npx prisma generate
    
    echo "Migration completed successfully!"
else
    echo "No changes detected. Migration file not created or is empty."
    # Remove empty file if it exists
    if test -f "$filename"
        rm "$filename"
    end
end