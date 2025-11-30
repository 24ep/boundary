# Database Schema, Seed, and Migration Solution

## Overview

This guide provides a comprehensive solution for managing database schema, migrations, and seed data for the Bondarys project using Supabase.

## Architecture

### Current Setup
- **Database**: PostgreSQL (via Supabase)
- **Migration System**: Custom TypeScript migration service
- **Migration Location**: `backend/src/database/migrations/`
- **Seed Location**: `backend/src/database/seed.sql`
- **Supabase Config**: `supabase/config.toml`

### Recommended Structure

```
supabase/
├── migrations/              # Supabase migrations (versioned)
│   ├── 20240101000000_initial_schema.sql
│   ├── 20240102000000_add_location_tables.sql
│   └── ...
├── seed.sql                # Seed data (development only)
└── config.toml            # Supabase configuration

backend/src/database/
├── migrations/             # Backend-specific migrations (if needed)
├── schema.sql              # Full schema dump
└── seed.sql                # Development seed data
```

## Migration Strategy

### Option 1: Supabase Native Migrations (Recommended)

Supabase CLI manages migrations automatically. Migrations are timestamped and run in order.

**Benefits:**
- ✅ Automatic versioning
- ✅ Built-in rollback support
- ✅ Integrated with Supabase CLI
- ✅ Works with `supabase db push` and `supabase db reset`

**Usage:**
```bash
# Create a new migration
supabase migration new migration_name

# Apply migrations
supabase db push

# Reset database (dev only)
supabase db reset

# Check migration status
supabase migration list
```

### Option 2: Custom Migration Service (Current)

Your existing TypeScript migration service provides more control.

**Benefits:**
- ✅ Custom validation
- ✅ Complex migration logic
- ✅ Integration with backend code
- ✅ Better error handling

**Usage:**
```bash
# Run migrations
npm run migrate:ts migrate

# Check status
npm run migrate:status

# Rollback
npm run migrate:rollback

# Create new migration
npm run migrate:create add_new_feature
```

## Best Practices

### 1. Migration File Naming

**Supabase Format:**
```
YYYYMMDDHHMMSS_description.sql
```

**Custom Format:**
```
NNN_description.sql (where NNN is sequential number)
```

### 2. Migration Structure

Every migration should have:
- **UP migration**: Changes to apply
- **DOWN migration**: How to rollback (optional but recommended)

```sql
-- UP
-- Description of what this migration does
CREATE TABLE IF NOT EXISTS new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_new_table_name ON new_table(name);

-- DOWN
-- How to rollback this migration
DROP TABLE IF EXISTS new_table;
```

### 3. Idempotent Migrations

Always use `IF NOT EXISTS` and `IF EXISTS` to make migrations idempotent:

```sql
-- ✅ Good
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ❌ Bad
CREATE TABLE users (...);  -- Will fail if table exists
```

### 4. Data Migrations

For data changes, use transactions:

```sql
-- UP
BEGIN;

UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';

COMMIT;

-- DOWN
BEGIN;

ALTER TABLE users ALTER COLUMN status DROP DEFAULT;
UPDATE users SET status = NULL WHERE status = 'active';

COMMIT;
```

### 5. Seed Data Management

**Development Seeds:**
- Use `supabase/seed.sql` for local development
- Never commit production data
- Use realistic but fake data

**Production Seeds:**
- Use migration files for essential data
- Only seed reference data (countries, locales, etc.)
- Never seed user data in production

## Implementation Guide

### Step 1: Set Up Supabase Migrations

1. **Initialize Supabase migrations folder:**
   ```bash
   mkdir -p supabase/migrations
   ```

2. **Update config.toml:**
   ```toml
   [db.migrations]
   enabled = true
   schema_paths = ["./migrations"]
   ```

3. **Create initial migration:**
   ```bash
   supabase migration new initial_schema
   ```

### Step 2: Migrate Existing Migrations

1. **Convert numbered migrations to timestamped:**
   ```bash
   # Use the migration converter script
   npm run migrate:convert
   ```

2. **Move to Supabase folder:**
   ```bash
   # Copy migrations to supabase/migrations
   cp backend/src/database/migrations/*.sql supabase/migrations/
   ```

### Step 3: Set Up Seed Data

1. **Create seed file:**
   ```bash
   touch supabase/seed.sql
   ```

2. **Update config.toml:**
   ```toml
   [db.seed]
   enabled = true
   sql_paths = ["./seed.sql"]
   ```

### Step 4: Version Control

1. **Track migrations in Git:**
   ```bash
   git add supabase/migrations/
   git add supabase/seed.sql
   ```

2. **Never modify executed migrations:**
   - Always create new migrations for changes
   - Use rollback + new migration for fixes

## Migration Workflow

### Development Workflow

1. **Create migration:**
   ```bash
   supabase migration new add_user_preferences
   ```

2. **Write migration SQL:**
   ```sql
   -- UP
   ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
   
   -- DOWN
   ALTER TABLE users DROP COLUMN preferences;
   ```

3. **Test locally:**
   ```bash
   supabase db reset  # Resets and applies all migrations
   ```

4. **Commit and push:**
   ```bash
   git add supabase/migrations/
   git commit -m "Add user preferences column"
   ```

### Production Deployment

1. **Review migrations:**
   ```bash
   supabase migration list
   ```

2. **Apply migrations:**
   ```bash
   supabase db push
   ```

3. **Verify:**
   ```bash
   supabase migration list
   ```

## Seed Data Strategy

### Development Seeds

**Location:** `supabase/seed.sql`

```sql
-- Development seed data
-- This file runs after migrations during `supabase db reset`

-- Clear existing data (dev only)
TRUNCATE TABLE users, families, family_members CASCADE;

-- Insert test users
INSERT INTO users (email, first_name, last_name) VALUES
  ('test@example.com', 'Test', 'User'),
  ('admin@example.com', 'Admin', 'User');

-- Insert test families
INSERT INTO families (name, owner_id) VALUES
  ('Test Family', (SELECT id FROM users WHERE email = 'test@example.com'));
```

### Production Seeds

**Location:** Migration files (e.g., `017_seed_common_locales.sql`)

```sql
-- UP
-- Seed reference data that should exist in production
INSERT INTO locales (code, name, native_name) VALUES
  ('en', 'English', 'English'),
  ('es', 'Spanish', 'Español')
ON CONFLICT (code) DO NOTHING;

-- DOWN
-- Remove seeded data
DELETE FROM locales WHERE code IN ('en', 'es');
```

## Schema Management

### Full Schema Export

**Location:** `backend/src/database/schema.sql`

```bash
# Export current schema
supabase db dump --schema public > backend/src/database/schema.sql
```

### Schema Validation

```bash
# Validate schema against migrations
npm run migrate:validate

# Check for drift
supabase db diff
```

## Rollback Strategy

### Single Migration Rollback

```bash
# Using custom service
npm run migrate:rollback

# Using Supabase (manual)
# Create a new migration that reverses the changes
supabase migration new rollback_feature_x
```

### Full Database Reset (Development Only)

```bash
# Reset everything
supabase db reset

# Or using custom service
npm run migrate:reset --confirm
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Database Migrations

on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1
      
      - name: Run migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_DB_PASSWORD: ${{ secrets.SUPABASE_DB_PASSWORD }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

## Troubleshooting

### Migration Conflicts

**Problem:** Migration already executed but file changed

**Solution:**
1. Never modify executed migrations
2. Create a new migration to fix issues
3. Or rollback and re-apply

### Seed Data Issues

**Problem:** Seed data conflicts with existing data

**Solution:**
```sql
-- Use ON CONFLICT
INSERT INTO users (email, name) VALUES ('test@example.com', 'Test')
ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name;
```

### Schema Drift

**Problem:** Database schema doesn't match migrations

**Solution:**
```bash
# Generate migration from current state
supabase db diff -f fix_schema_drift

# Review and apply
supabase db push
```

## Security Considerations

1. **Never commit sensitive data** in seed files
2. **Use environment variables** for credentials
3. **Review migrations** before production deployment
4. **Backup database** before major migrations
5. **Test rollbacks** in staging environment

## Tools and Scripts

### Available Scripts

```bash
# Migration scripts
npm run migrate:ts migrate      # Run migrations
npm run migrate:status          # Check status
npm run migrate:rollback        # Rollback last migration
npm run migrate:create <name>   # Create new migration
npm run migrate:validate        # Validate migrations
npm run migrate:reset          # Reset database (dev only)

# Supabase CLI
supabase migration new <name>   # Create migration
supabase db push                # Apply migrations
supabase db reset               # Reset database
supabase migration list         # List migrations
```

## Next Steps

1. ✅ Set up Supabase migrations folder
2. ✅ Convert existing migrations
3. ✅ Create seed file structure
4. ✅ Set up CI/CD pipeline
5. ✅ Document migration workflow
6. ✅ Train team on best practices

---

**Status**: Ready for implementation
**Last Updated**: 2024

