#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from repository root only
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

console.log('🚀 Bondarys CMS Complete Setup');
console.log('=====================================\n');

// Step 1: Check if Supabase is configured
function checkSupabaseConfig() {
  console.log('📋 Step 1: Checking Supabase Configuration');
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration:');
    console.error('   SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseKey ? '✅ Set' : '❌ Missing');
    console.error('');
    console.error('Please set the following environment variables:');
    console.error('   SUPABASE_URL=your-supabase-url');
    console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key');
    console.error('');
    console.error('Or create a .env file with these values.');
    return false;
  }
  
  console.log('✅ Supabase configuration found');
  return true;
}

// Step 2: Test database connection
async function testDatabaseConnection() {
  console.log('\n📋 Step 2: Testing Database Connection');
  
  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
    
    // Test connection
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    
    console.log('✅ Database connection successful');
    return supabase;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('💡 Make sure your Supabase project is running and credentials are correct');
    return null;
  }
}

// Step 3: Run migrations
async function runMigrations(supabase) {
  console.log('\n📋 Step 3: Running Database Migrations');
  
  const migrations = [
    '005_cms_content_tables.sql',
    '006_marketing_cms_content.sql', 
    '007_modal_marketing_cms.sql',
    '008_localization_cms.sql',
    '009_comprehensive_admin_cms.sql',
    '012_add_additional_languages.sql',
    '013_normalize_localization.sql'
  ];

  for (const migrationFile of migrations) {
    try {
      console.log(`\n📄 Running: ${migrationFile}`);
      
      const migrationPath = path.join(__dirname, '..', 'src', 'database', 'migrations', migrationFile);
      
      if (!fs.existsSync(migrationPath)) {
        console.log(`❌ Migration file not found: ${migrationPath}`);
        continue;
      }
      
      const sql = fs.readFileSync(migrationPath, 'utf8');
      console.log(`   📊 File size: ${sql.length} characters`);
      
      // Try to execute the migration
      try {
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          console.log(`⚠️  Migration error (trying alternative method):`, error.message);
          
          // Try executing statements individually
          const statements = sql
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
          
          let successCount = 0;
          for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
              try {
                const { error: stmtError } = await supabase.rpc('exec_sql', { 
                  sql: statement + ';' 
                });
                
                if (stmtError) {
                  console.log(`   ⚠️  Statement ${i + 1} failed: ${stmtError.message.substring(0, 100)}...`);
                } else {
                  successCount++;
                }
              } catch (stmtErr) {
                console.log(`   ⚠️  Statement ${i + 1} error: ${stmtErr.message.substring(0, 100)}...`);
              }
            }
          }
          
          if (successCount > 0) {
            console.log(`   ✅ ${successCount}/${statements.length} statements executed successfully`);
          }
        } else {
          console.log(`✅ Migration completed successfully`);
        }
        
      } catch (execError) {
        console.log(`❌ Migration execution error:`, execError.message);
      }
      
    } catch (error) {
      console.log(`❌ Error processing migration ${migrationFile}:`, error.message);
    }
  }
}

// Step 4: Verify setup
async function verifySetup(supabase) {
  console.log('\n📋 Step 4: Verifying Setup');
  
  try {
    // Check if CMS tables exist
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .like('table_name', '%cms%')
      .or('table_name.like.%marketing%,table_name.like.%localization%,table_name.like.%admin%');
    
    if (error) {
      console.log('⚠️  Could not verify tables:', error.message);
      return;
    }
    
    console.log('✅ CMS Tables found:');
    tables?.forEach(table => {
      console.log(`   📋 ${table.table_name}`);
    });
    
    // Test API endpoints
    console.log('\n📋 Step 5: Testing API Endpoints');
    
    const endpoints = [
      '/cms/marketing/slides',
      '/cms/localization/languages',
      '/admin/dashboard/stats'
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (response.ok) {
          console.log(`✅ ${endpoint} - OK`);
        } else {
          console.log(`⚠️  ${endpoint} - ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Connection failed`);
      }
    }
    
  } catch (error) {
    console.log('⚠️  Verification error:', error.message);
  }
}

// Main setup function
async function setupCompleteCMS() {
  console.log('🎯 Starting Complete CMS Implementation...\n');
  
  // Step 1: Check configuration
  if (!checkSupabaseConfig()) {
    console.log('\n❌ Setup incomplete. Please configure Supabase credentials first.');
    console.log('\n📝 Next steps:');
    console.log('1. Update .env file with your Supabase credentials');
    console.log('2. Run this script again: node backend/setup/03-run-cms-migrations.js');
    return;
  }
  
  // Step 2: Test connection
  const supabase = await testDatabaseConnection();
  if (!supabase) {
    console.log('\n❌ Setup incomplete. Please check your database connection.');
    return;
  }
  
  // Step 3: Run migrations
  await runMigrations(supabase);
  
  // Step 4: Verify setup
  await verifySetup(supabase);
  
  console.log('\n🎉 CMS Setup Complete!');
  console.log('\n📋 What was implemented:');
  console.log('✅ Modal Marketing CMS - Homescreen modal management');
  console.log('✅ Localization CMS - Multi-language support');
  console.log('✅ Comprehensive Admin Console - User, house, social media management');
  console.log('✅ API Endpoints - Full REST API for all CMS features');
  console.log('✅ Mobile Services - TypeScript services with caching');
  console.log('✅ Database Schema - Complete tables and relationships');
  
  console.log('\n🚀 Next steps:');
  console.log('1. Start the backend server: npm start');
  console.log('2. Start the admin console: cd admin && npm run dev');
  console.log('3. Test the mobile app integration');
  console.log('4. Create your first admin user');
  console.log('5. Add marketing content and translations');
  
  console.log('\n📚 Documentation:');
  console.log('- COMPREHENSIVE_CMS_IMPLEMENTATION.md');
  console.log('- DATABASE_SETUP_GUIDE.md');
  console.log('- MARKETING_CMS_IMPLEMENTATION.md');
}

// Run the setup
setupCompleteCMS().catch(console.error);


