const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SOURCE_SUPABASE_URL = process.env.SOURCE_SUPABASE_URL; // e.g. https://xyz.supabase.co
const SOURCE_SUPABASE_KEY = process.env.SOURCE_SUPABASE_KEY; // service_role key
const DEST_DB_CONFIG = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'postgres',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres'
};

/*
  Migration Strategy:
  1. Fetch all users from Supabase Auth (requires Supabase Service Role Key)
  2. Insert into local auth.users
  3. Fetch all public tables (profiles, families, etc.)
  4. Insert into local public tables
*/

async function migrateData() {
    if (!SOURCE_SUPABASE_URL || !SOURCE_SUPABASE_KEY) {
        console.log('Skipping data migration: SOURCE_SUPABASE_URL or SOURCE_SUPABASE_KEY not provided.');
        console.log('To run migration, set these env vars and run again.');
        return;
    }

    const supabase = createClient(SOURCE_SUPABASE_URL, SOURCE_SUPABASE_KEY);
    const pgClient = new Client(DEST_DB_CONFIG);

    try {
        await pgClient.connect();
        console.log('Connected to local database.');

        // 1. Migrate Users
        console.log('Fetching users from Supabase...');
        const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) throw authError;

        console.log(`Found ${users.length} users. Migrating...`);

        for (const user of users) {
            await pgClient.query(`
        INSERT INTO auth.users (id, email, created_at, updated_at, raw_user_meta_data)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [user.id, user.email, user.created_at, user.updated_at, user.user_metadata]);
        }

        // 2. Migrate Public Tables (Example: profiles)
        const tables = ['profiles', 'families', 'family_members', 'chat_rooms', 'messages'];

        for (const table of tables) {
            console.log(`Migrating table: ${table}...`);
            const { data: rows, error: tableError } = await supabase.from(table).select('*');

            if (tableError) {
                console.warn(`Failed to fetch ${table}:`, tableError.message);
                continue;
            }

            if (rows.length === 0) continue;

            // naive insert implementation
            // In production, use pg-copy-streams or bulk insert
            for (const row of rows) {
                const keys = Object.keys(row);
                const values = Object.values(row);
                const placeholders = keys.map((_, i) => `$${i + 1}`).join(',');
                const query = `INSERT INTO public.${table} (${keys.join(',')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

                try {
                    await pgClient.query(query, values);
                } catch (e) {
                    console.error(`Failed to insert row in ${table}:`, e.message);
                }
            }
        }

        console.log('✅ Data migration complete.');

    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await pgClient.end();
    }
}

migrateData();
