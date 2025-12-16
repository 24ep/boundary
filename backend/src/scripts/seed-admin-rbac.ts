// @ts-nocheck
import { Client } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from project root
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function seedAdminRBAC() {
    try {
        await client.connect();
        console.log('Connected to database');

        // Create admin_roles table
        console.log('Creating admin_roles table...');
        await client.query(`
      CREATE TABLE IF NOT EXISTS admin_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(50) UNIQUE NOT NULL,
          description TEXT,
          permissions JSONB DEFAULT '[]',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        // Drop and recreate admin_users table (to fix schema mismatch)
        console.log('Recreating admin_users table...');
        await client.query(`DROP TABLE IF EXISTS admin_users CASCADE;`);
        await client.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          role_id UUID REFERENCES admin_roles(id) ON DELETE SET NULL,
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

        // Insert default roles
        console.log('Inserting default roles...');
        const roles = [
            { name: 'super_admin', description: 'Full system access', permissions: ['*'] },
            { name: 'editor', description: 'Can manage pages and assets', permissions: ['pages:read', 'pages:write', 'pages:delete', 'pages:publish', 'assets:read', 'assets:write', 'assets:delete'] },
            { name: 'viewer', description: 'Read-only access', permissions: ['pages:read', 'assets:read'] }
        ];

        for (const role of roles) {
            await client.query(`
        INSERT INTO admin_roles (name, description, permissions)
        VALUES ($1, $2, $3)
        ON CONFLICT (name) DO UPDATE SET
          description = EXCLUDED.description,
          permissions = EXCLUDED.permissions,
          updated_at = NOW();
      `, [role.name, role.description, JSON.stringify(role.permissions)]);
        }

        // Get super_admin role ID
        const roleResult = await client.query(`SELECT id FROM admin_roles WHERE name = 'super_admin'`);
        const superAdminRoleId = roleResult.rows[0]?.id;

        if (!superAdminRoleId) {
            throw new Error('Super admin role not found');
        }

        // Hash password
        console.log('Creating default admin user...');
        const passwordHash = await bcrypt.hash('admin123', 10);

        // Insert default super admin user
        await client.query(`
      INSERT INTO admin_users (email, password_hash, first_name, last_name, role_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role_id = EXCLUDED.role_id,
        updated_at = NOW();
    `, ['admin@bondarys.com', passwordHash, 'Super', 'Admin', superAdminRoleId]);

        console.log('Admin RBAC seeding completed successfully! ✅');
        console.log('');
        console.log('Default credentials:');
        console.log('  Email: admin@bondarys.com');
        console.log('  Password: admin123');

    } catch (err) {
        console.error('Error seeding Admin RBAC:', err);
    } finally {
        await client.end();
    }
}

seedAdminRBAC();
