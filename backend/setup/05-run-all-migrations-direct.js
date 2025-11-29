#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Load root .env (if present)
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });
} catch (_) {}

function readSqlFile(filePath) {
  let sql = fs.readFileSync(filePath, 'utf8');
  // Remove common psql meta-commands which are not understood by Postgres protocol
  sql = sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('\\'))
    .join('\n');
  return sql;
}

async function applySql(client, filePath) {
  const sql = readSqlFile(filePath);
  process.stdout.write(`\n📄 Running: ${path.basename(filePath)}\n`);
  process.stdout.write(`   📊 File size: ${sql.length} characters\n`);
  await client.query(sql);
  process.stdout.write('   ✅ Migration applied\n');
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not set.');
    process.exit(1);
  }

  const client = new Client({ connectionString });
  await client.connect();

  const migrationsDir = path.join(__dirname, '..', 'src', 'database', 'migrations');
  const files = fs
    .readdirSync(migrationsDir)
    .filter((f) => /^(001|002|003|005|006|007|008|009|012|013|015|016)_.*\.sql$/.test(f))
    .sort();

  console.log('📋 Running migrations against Supabase (direct Postgres connection):');
  files.forEach((f) => console.log(` - ${f}`));

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    try {
      await applySql(client, filePath);
    } catch (err) {
      console.error(`   ❌ Error in ${file}: ${err.message}`);
      await client.end();
      process.exit(1);
    }
  }

  await client.end();
  console.log('\n✅ All migrations completed.');
}

main().catch((e) => { console.error(e); process.exit(1); });


