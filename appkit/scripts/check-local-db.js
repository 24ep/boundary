const { Client } = require('pg');
async function check() {
  const client = new Client({ connectionString: 'postgresql://postgres:postgres@localhost:5432/postgres' });
  await client.connect();
  const res = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name = 'audit_logs'");
  console.log('Results for audit_logs:', JSON.stringify(res.rows, null, 2));
  await client.end();
}
check();
