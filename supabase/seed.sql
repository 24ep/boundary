-- Seed Data for Development
-- This file is executed after migrations during `supabase db reset`
-- DO NOT include production data or sensitive information

-- Clear existing data (development only)
-- WARNING: This will delete all data in these tables
DO $$
BEGIN
  -- Only truncate in development
  IF current_setting('app.environment', true) = 'development' OR current_setting('app.environment', true) IS NULL THEN
    TRUNCATE TABLE 
      family_members,
      families,
      users
    CASCADE;
  END IF;
END $$;

-- Insert sample users (development only)
INSERT INTO users (id, email, first_name, last_name, phone, created_at, updated_at) VALUES
  (gen_random_uuid(), 'john.doe@example.com', 'John', 'Doe', '+1234567890', NOW(), NOW()),
  (gen_random_uuid(), 'jane.doe@example.com', 'Jane', 'Doe', '+1234567891', NOW(), NOW()),
  (gen_random_uuid(), 'mike.smith@example.com', 'Mike', 'Smith', '+1234567892', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Insert sample families
INSERT INTO families (id, name, description, owner_id, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  'Doe Family',
  'The main Doe family household',
  u.id,
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'john.doe@example.com'
ON CONFLICT DO NOTHING;

-- Insert family members
INSERT INTO family_members (family_id, user_id, role, joined_at)
SELECT 
  f.id,
  u.id,
  CASE 
    WHEN u.email = 'john.doe@example.com' THEN 'owner'
    ELSE 'member'
  END,
  NOW()
FROM families f
CROSS JOIN users u
WHERE f.name = 'Doe Family'
  AND u.email IN ('john.doe@example.com', 'jane.doe@example.com')
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Note: Add more seed data as needed for development
-- Always use ON CONFLICT to make seeds idempotent

