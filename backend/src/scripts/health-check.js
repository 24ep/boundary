const supabaseService = require('../services/supabaseService');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

async function runHealthCheck() {
  try {
    console.log('🔍 Running database health check...\n');

    // Initialize Supabase service
    await supabaseService.initialize();

    // Get health status
    const healthStatus = await supabaseService.getHealthStatus();
    
    console.log('📊 Health Status:');
    console.log(`   Healthy: ${healthStatus.healthy ? '✅ Yes' : '❌ No'}`);
    console.log(`   Response Time: ${healthStatus.responseTime}ms`);
    console.log(`   Connection Retries: ${healthStatus.connectionRetries}`);
    console.log(`   Timestamp: ${healthStatus.timestamp}`);

    if (!healthStatus.healthy) {
      console.log(`   Error: ${healthStatus.error}`);
      process.exit(1);
    }

    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test user table access
    try {
      const { data: userTest, error: userError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .select('count')
          .limit(1);
      });
      
      if (userError) throw userError;
      console.log('   ✅ User table access: OK');
    } catch (error) {
      console.log(`   ❌ User table access: FAILED - ${error.message}`);
    }

    // Test hourse table access
    try {
      const { data: familyTest, error: familyError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('families')
          .select('count')
          .limit(1);
      });
      
      if (familyError) throw familyError;
      console.log('   ✅ hourse table access: OK');
    } catch (error) {
      console.log(`   ❌ hourse table access: FAILED - ${error.message}`);
    }

    // Test location table access
    try {
      const { data: locationTest, error: locationError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('user_locations')
          .select('count')
          .limit(1);
      });
      
      if (locationError) throw locationError;
      console.log('   ✅ Location table access: OK');
    } catch (error) {
      console.log(`   ❌ Location table access: FAILED - ${error.message}`);
    }

    console.log('\n✅ Database health check completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Health check failed:', error.message);
    process.exit(1);
  }
}

// Run health check if called directly
if (require.main === module) {
  runHealthCheck();
}

module.exports = runHealthCheck;
