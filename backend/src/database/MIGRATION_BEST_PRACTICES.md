# Migration Best Practices

## Migration File Structure

### Standard Format

Every migration file should follow this structure:

```sql
-- UP
-- Brief description of what this migration does
-- 
-- Details:
-- - What tables/columns are created/modified
-- - What indexes are added
-- - Any data transformations

-- Create table
CREATE TABLE IF NOT EXISTS example_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_example_table_name ON example_table(name);

-- DOWN
-- How to rollback this migration
-- Always provide a rollback path

DROP INDEX IF EXISTS idx_example_table_name;
DROP TABLE IF EXISTS example_table;
```

## Rules

### 1. Always Use IF NOT EXISTS / IF EXISTS

```sql
-- ✅ Good
CREATE TABLE IF NOT EXISTS users (...);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ❌ Bad
CREATE TABLE users (...);  -- Fails if table exists
```

### 2. Make Migrations Idempotent

Migrations should be safe to run multiple times:

```sql
-- ✅ Good - Idempotent
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;

-- ❌ Bad - Not idempotent
ALTER TABLE users ADD COLUMN phone VARCHAR(20);  -- Fails on second run
```

### 3. Use Transactions for Data Migrations

```sql
-- ✅ Good
BEGIN;

UPDATE users SET status = 'active' WHERE status IS NULL;
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';

COMMIT;

-- ❌ Bad - No transaction
UPDATE users SET status = 'active' WHERE status IS NULL;
-- If next line fails, data is inconsistent
ALTER TABLE users ALTER COLUMN status SET DEFAULT 'active';
```

### 4. Always Provide DOWN Migration

```sql
-- ✅ Good
-- UP
CREATE TABLE example (...);

-- DOWN
DROP TABLE example;

-- ❌ Bad - No rollback
-- UP
CREATE TABLE example (...);
-- No DOWN section
```

### 5. Use Descriptive Names

```sql
-- ✅ Good
-- 20240101000000_add_user_preferences_column.sql
-- 20240102000000_create_family_members_table.sql

-- ❌ Bad
-- 20240101000000_update.sql
-- 20240102000000_fix.sql
```

### 6. Never Modify Executed Migrations

- ✅ Create a new migration to fix issues
- ❌ Never edit an already-executed migration

### 7. Test Migrations

```bash
# Test locally first
supabase db reset

# Test rollback
supabase migration list
# Manually test DOWN migration
```

## Common Patterns

### Adding a Column

```sql
-- UP
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;

-- DOWN
ALTER TABLE users 
DROP COLUMN IF EXISTS phone,
DROP COLUMN IF EXISTS email_verified;
```

### Creating a Table with Foreign Key

```sql
-- UP
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_family_id 
ON family_members(family_id);

CREATE INDEX IF NOT EXISTS idx_family_members_user_id 
ON family_members(user_id);

-- DOWN
DROP TABLE IF EXISTS family_members;
```

### Data Migration

```sql
-- UP
BEGIN;

-- Migrate data
UPDATE users 
SET subscription_tier = 'premium' 
WHERE subscription_tier = 'pro';

-- Update schema
ALTER TABLE users 
ALTER COLUMN subscription_tier 
TYPE VARCHAR(20) 
USING CASE 
  WHEN subscription_tier = 'premium' THEN 'premium'
  WHEN subscription_tier = 'basic' THEN 'basic'
  ELSE 'free'
END;

COMMIT;

-- DOWN
BEGIN;

ALTER TABLE users 
ALTER COLUMN subscription_tier 
TYPE VARCHAR(20) 
USING CASE 
  WHEN subscription_tier = 'premium' THEN 'pro'
  WHEN subscription_tier = 'basic' THEN 'basic'
  ELSE 'free'
END;

UPDATE users 
SET subscription_tier = 'pro' 
WHERE subscription_tier = 'premium';

COMMIT;
```

### Adding Indexes

```sql
-- UP
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email) 
WHERE email IS NOT NULL;

-- DOWN
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_created_at;
DROP INDEX IF EXISTS idx_users_email_unique;
```

## Seed Data in Migrations

Only seed reference data (never user data):

```sql
-- UP
INSERT INTO locales (code, name, native_name) VALUES
  ('en', 'English', 'English'),
  ('es', 'Spanish', 'Español'),
  ('fr', 'French', 'Français')
ON CONFLICT (code) DO NOTHING;

-- DOWN
DELETE FROM locales WHERE code IN ('en', 'es', 'fr');
```

## Performance Considerations

### Large Tables

For large tables, use batched updates:

```sql
-- UP
DO $$
DECLARE
  batch_size INTEGER := 1000;
  updated_count INTEGER;
BEGIN
  LOOP
    UPDATE users 
    SET status = 'active' 
    WHERE status IS NULL 
      AND id IN (
        SELECT id FROM users 
        WHERE status IS NULL 
        LIMIT batch_size
      );
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    EXIT WHEN updated_count = 0;
    
    COMMIT;
  END LOOP;
END $$;
```

### Adding Indexes Concurrently

```sql
-- UP
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email 
ON users(email);

-- Note: CONCURRENTLY cannot be used in transactions
-- DOWN
DROP INDEX CONCURRENTLY IF EXISTS idx_users_email;
```

## Security

### Never Include Sensitive Data

```sql
-- ❌ Bad - Never do this
INSERT INTO users (email, password) VALUES 
  ('admin@example.com', 'plaintext_password');

-- ✅ Good - Use environment or separate seed
-- Migration only creates structure
CREATE TABLE users (...);
```

## Checklist

Before committing a migration:

- [ ] Migration is idempotent
- [ ] DOWN migration is provided
- [ ] Uses IF NOT EXISTS / IF EXISTS
- [ ] Tested locally with `supabase db reset`
- [ ] Tested rollback
- [ ] No sensitive data included
- [ ] Descriptive filename and comments
- [ ] Indexes added for foreign keys
- [ ] Transactions used for data changes

