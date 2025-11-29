#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Bondarys Environment');

// Use single root .env for the entire repo
const envPath = path.join(__dirname, '..', '..', '.env');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating root .env file...');
  const envContent = `# Development Environment Variables
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3001

# JWT Secrets (change these in production!)
JWT_SECRET=bondarys-dev-secret-key-change-in-production
JWT_REFRESH_SECRET=bondarys-refresh-dev-secret-key-change-in-production

# Supabase Configuration (replace with your actual Supabase credentials)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:54322/postgres

# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync(envPath, envContent);
  console.log('✅ Root .env file created');
  console.log('⚠️  Please update the Supabase credentials in the root .env file');
} else {
  console.log('✅ Root .env exists');
}

// Check required keys
const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const content = fs.readFileSync(envPath, 'utf8');
const missing = required.filter(k => !new RegExp(`^${k}=.+`, 'm').test(content));
if (missing.length) {
  console.log('⚠️ Missing keys in .env:', missing.join(', '));
} else {
  console.log('✅ Required keys present');
}

// Install dependencies if node_modules doesn't exist
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    console.log('✅ Dependencies installed');
  } catch (error) {
    console.error('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
}

// Create logs directory
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
  console.log('✅ Logs directory created');
}

console.log('\n🎉 Environment setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Update your Supabase credentials in the .env file');
console.log('2. Run: node backend/setup/02-exec-sql-setup.js');
console.log('3. Run: node backend/setup/03-run-cms-migrations.js');
console.log('4. Start the backend: npm run dev');


