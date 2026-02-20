const { Client } = require('pg');

async function discover() {
  const dbs = [
    { name: 'Railway', url: "postgresql://postgres:EiLTGaCpAAItsFeFGKayThIscerwWSEj@crossover.proxy.rlwy.net:23873/railway" },
    { name: 'Local/Docker', url: "postgresql://postgres:postgres@localhost:5432/postgres" }
  ];

  for (const db of dbs) {
    console.log(`\n--- Checking ${db.name} ---`);
    const client = new Client({ connectionString: db.url });
    try {
      await client.connect();
      console.log('Connected.');
      
      const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name IN ('core', 'admin', 'bondarys')");
      console.log('Existing target schemas:', schemas.rows.map(r => r.schema_name));

      const tables = await client.query(`
        SELECT table_schema, table_name 
        FROM information_schema.tables 
        WHERE table_name = 'audit_logs' OR table_name = 'AuditLog'
      `);
      console.log('AuditLog tables found:', tables.rows);

      if (tables.rows.length === 0) {
        console.log('Table NOT found. Attempting creation...');
        await client.query('CREATE SCHEMA IF NOT EXISTS admin');
        await client.query(`
          CREATE TABLE admin.audit_logs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            application_id UUID,
            actor_type VARCHAR(50) NOT NULL,
            actor_id UUID,
            action VARCHAR(100) NOT NULL,
            table_name VARCHAR(100),
            record_id UUID,
            old_values JSONB,
            new_values JSONB,
            ip_address INET,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          )
        `);
        console.log('Table created.');
      }
    } catch (err) {
      console.error(`Error with ${db.name}:`, err.message);
    } finally {
      await client.end();
    }
  }
}

discover();
