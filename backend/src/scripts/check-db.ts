
// @ts-nocheck
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

async function check() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query('SELECT id, slug, title, status FROM pages');
        console.log('Pages found:', res.rows);

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

check();
