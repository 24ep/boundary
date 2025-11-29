import dotenv from 'dotenv';
import path from 'path';

// Load env from repository root only; fallback to default lookup
const rootEnvPath = path.resolve(__dirname, '../../..', '.env');
dotenv.config({ path: rootEnvPath });
dotenv.config();

type RequiredEnv = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

const requiredKeys: Array<keyof RequiredEnv> = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
];

function getString(name: keyof RequiredEnv, fallback?: string): string {
  const value = process.env[name] ?? fallback ?? '';
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || '0.0.0.0',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  MAX_FILE_SIZE: process.env.MAX_FILE_SIZE || '10mb',

  // Supabase
  SUPABASE_URL: getString('SUPABASE_URL'),
  SUPABASE_SERVICE_ROLE_KEY: getString('SUPABASE_SERVICE_ROLE_KEY'),
} as const;

export function assertRequiredEnv(): void {
  const missing = requiredKeys.filter((k) => !env[k] || String(env[k]).includes('your-project'));
  if (missing.length > 0) {
    const detail = missing.join(', ');
    throw new Error(`Missing required environment variables: ${detail}`);
  }
}


