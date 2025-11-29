#!/usr/bin/env node

const { Client } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log('❌ DATABASE_URL missing in root .env');
    process.exit(1);
  }
  const client = new Client({ connectionString: url });
  await client.connect();
  await client.query(`
    CREATE OR REPLACE FUNCTION public.exec_sql(sql text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $$
    BEGIN
      EXECUTE sql;
    END;
    $$;

    GRANT EXECUTE ON FUNCTION public.exec_sql(text) TO service_role;
  `);
  await client.end();
  console.log('✅ exec_sql function ready');
}

main().catch((e) => { console.error(e.message); process.exit(1); });


