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

async function getDatabaseStats() {
  try {
    console.log('📊 Gathering database statistics...\n');

    // Initialize Supabase service
    await supabaseService.initialize();

    // Get database statistics
    const stats = await supabaseService.getDatabaseStats();
    
    console.log('📈 Table Statistics:');
    console.log('┌─────────────────────────┬─────────┬─────────────┐');
    console.log('│ Table Name              │ Records │ Status      │');
    console.log('├─────────────────────────┼─────────┼─────────────┤');

    const tableNames = [
      'users',
      'families', 
      'family_members',
      'family_invitations',
      'user_locations',
      'location_history',
      'geofences',
      'location_shares',
      'location_requests',
      'chat_rooms',
      'chat_messages',
      'chat_message_reactions',
      'chat_message_reads',
      'notifications',
      'scheduled_notifications',
      'emergency_alerts',
      'emergency_contacts',
      'safety_checks',
      'safety_check_responses',
      'events',
      'tasks',
      'expenses',
      'shopping_list',
      'photos',
      'documents'
    ];

    let totalRecords = 0;
    let errorCount = 0;

    for (const tableName of tableNames) {
      const tableStats = stats[tableName];
      let recordCount = 'N/A';
      let status = '❌ Error';

      if (tableStats) {
        if (tableStats.error) {
          status = `❌ ${tableStats.error}`;
          errorCount++;
        } else {
          recordCount = tableStats.count || 0;
          status = '✅ OK';
          totalRecords += recordCount;
        }
      }

      const paddedTableName = tableName.padEnd(23);
      const paddedCount = recordCount.toString().padStart(7);
      const paddedStatus = status.padEnd(11);

      console.log(`│ ${paddedTableName} │ ${paddedCount} │ ${paddedStatus} │`);
    }

    console.log('└─────────────────────────┴─────────┴─────────────┘');
    console.log(`\n📊 Summary:`);
    console.log(`   Total Records: ${totalRecords.toLocaleString()}`);
    console.log(`   Tables with Errors: ${errorCount}`);
    console.log(`   Tables OK: ${tableNames.length - errorCount}`);

    // Get health status
    const healthStatus = await supabaseService.getHealthStatus();
    console.log(`\n🏥 Health Status:`);
    console.log(`   Response Time: ${healthStatus.responseTime}ms`);
    console.log(`   Connection Retries: ${healthStatus.connectionRetries}`);
    console.log(`   Last Check: ${healthStatus.timestamp}`);

    // Performance metrics
    console.log(`\n⚡ Performance:`);
    if (healthStatus.responseTime < 100) {
      console.log('   Response Time: 🟢 Excellent (< 100ms)');
    } else if (healthStatus.responseTime < 500) {
      console.log('   Response Time: 🟡 Good (< 500ms)');
    } else {
      console.log('   Response Time: 🔴 Slow (> 500ms)');
    }

    if (healthStatus.connectionRetries === 0) {
      console.log('   Connection Stability: 🟢 Excellent (no retries)');
    } else if (healthStatus.connectionRetries < 3) {
      console.log('   Connection Stability: 🟡 Good (< 3 retries)');
    } else {
      console.log('   Connection Stability: 🔴 Poor (> 3 retries)');
    }

    console.log('\n✅ Database statistics gathered successfully!');

  } catch (error) {
    console.error('\n❌ Failed to gather database statistics:', error.message);
    process.exit(1);
  }
}

// Run stats if called directly
if (require.main === module) {
  getDatabaseStats();
}

module.exports = getDatabaseStats;
