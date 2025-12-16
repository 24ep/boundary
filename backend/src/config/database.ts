import { Pool } from 'pg';
import { config } from './env';

const poolConfig = {
    host: config.DB_HOST,
    port: config.DB_PORT,
    database: config.DB_NAME,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    max: 20, // Max number of clients in the pool
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
};

// If DATABASE_URL is present, it overrides specific fields (pg supports this natively if passed as string, but Pool takes config object)
// For simplicity, we prefer the individual fields, but one could parse the URL.

export const pool = new Pool(poolConfig);

// Test the connection
pool.on('error', (err, client) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default {
    pool,
    query
};
