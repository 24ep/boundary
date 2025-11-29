#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function execSql(supabase, sql) {
  const { error } = await supabase.rpc('exec_sql', { sql });
  if (error) throw new Error(error.message);
}

async function main() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE key in .env');
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log('📋 Ensuring core extensions and tables exist...');

  // Enable pgcrypto for gen_random_uuid()
  try {
    await execSql(supabase, 'CREATE EXTENSION IF NOT EXISTS pgcrypto;');
    console.log('   ✅ pgcrypto extension ready');
  } catch (e) {
    console.log('   ⚠️ pgcrypto ensure error:', e.message);
  }

  // users
  await execSql(supabase, `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`);
  console.log('   ✅ users');

  // families
  await execSql(supabase, `CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'hourse' CHECK (type IN ('hourse', 'friends', 'sharehouse')),
    description TEXT,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invite_code VARCHAR(10) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`);
  console.log('   ✅ families');

  // family_members
  await execSql(supabase, `CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(family_id, user_id)
  );`);
  console.log('   ✅ family_members');

  // user_preferences
  await execSql(supabase, `CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interests TEXT[],
    personality_traits TEXT[],
    expectations TEXT[],
    how_did_you_hear VARCHAR(255),
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
  );`);
  console.log('   ✅ user_preferences');

  console.log('✅ Core bootstrap complete');
}

main().catch((e) => { console.error('❌ Bootstrap failed:', e.message || e); process.exit(1); });


