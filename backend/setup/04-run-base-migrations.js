#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from repository root only
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function run() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase configuration (SUPABASE_URL or key)');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  const allFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^(001|002|003|015|016)_.*\.sql$/.test(f))
    .sort();

  console.log('📋 Running base migrations via exec_sql:');
  console.log(allFiles.map((f) => ` - ${f}`).join('\n'));

  for (const file of allFiles) {
    const filePath = path.join(migrationsDir, file);
    console.log(`\n📄 Running: ${file}`);
    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`   📊 File size: ${sql.length} characters`);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql });
      if (error) {
        console.log(`   ⚠️  Bulk execution failed, trying statement-by-statement: ${error.message}`);
        const statements = sql
          .split(';')
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith('--'));

        let ok = 0;
        for (let i = 0; i < statements.length; i += 1) {
          const stmt = statements[i] + ';';
          // Skip psql meta-commands if present
          if (stmt.startsWith('\\')) continue;
          const { error: stmtErr } = await supabase.rpc('exec_sql', { sql: stmt });
          if (stmtErr) {
            console.log(`     • ⚠️  Statement ${i + 1} failed: ${stmtErr.message.substring(0, 120)}...`);
          } else {
            ok += 1;
          }
        }
        console.log(`   ✅ Executed ${ok}/${statements.length} statements`);
      } else {
        console.log('   ✅ Migration applied');
      }
    } catch (e) {
      console.log(`   ❌ Error executing migration ${file}: ${e.message}`);
    }
  }

  console.log('\n✅ Base migrations run complete.');
}

run().catch((e) => { console.error(e); process.exit(1); });


