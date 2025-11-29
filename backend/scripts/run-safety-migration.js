const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Running safety incidents admin migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../src/database/migrations/010_safety_incidents_admin.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await client.query(migrationSQL);
    
    console.log('✅ Safety incidents admin migration completed successfully!');
    
    // Verify the migration
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'safety_alerts' 
      AND column_name IN ('acknowledged_by', 'acknowledged_at', 'resolved_by', 'resolved_at', 'device_info', 'app_version', 'battery_level', 'network_type')
      ORDER BY column_name
    `);
    
    console.log('✅ Verified new columns in safety_alerts table:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type}`);
    });
    
    // Check if emergency_contacts table exists
    const contactsTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'emergency_contacts'
      )
    `);
    
    if (contactsTable.rows[0].exists) {
      console.log('✅ emergency_contacts table created successfully');
    }
    
    // Check if safety_incident_contacts table exists
    const incidentContactsTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'safety_incident_contacts'
      )
    `);
    
    if (incidentContactsTable.rows[0].exists) {
      console.log('✅ safety_incident_contacts table created successfully');
    }
    
    // Check if safety_incident_family_members table exists
    const incidentMembersTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'safety_incident_family_members'
      )
    `);
    
    if (incidentMembersTable.rows[0].exists) {
      console.log('✅ safety_incident_family_members table created successfully');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);
