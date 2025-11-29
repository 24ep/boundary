#!/usr/bin/env node

import { migrationService } from '../services/migrationService';
import { Command } from 'commander';

const program = new Command();

program
  .name('migrate')
  .description('Bondarys Database Migration Tool')
  .version('1.0.0');

// Migrate command
program
  .command('migrate')
  .description('Run pending migrations')
  .action(async () => {
    try {
      console.log('🚀 Starting database migration...');
      const result = await migrationService.migrate();
      
      if (result.success) {
        console.log(`✅ Migration completed successfully: ${result.message}`);
        if (result.executedMigrations && result.executedMigrations.length > 0) {
          console.log('📋 Executed migrations:');
          result.executedMigrations.forEach(id => console.log(`  - ${id}`));
        }
      } else {
        console.error(`❌ Migration failed: ${result.message}`);
        if (result.failedMigrations && result.failedMigrations.length > 0) {
          console.error('📋 Failed migrations:');
          result.failedMigrations.forEach(migration => {
            console.error(`  - ${migration.id}: ${migration.error}`);
          });
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Migration process failed:', error);
      process.exit(1);
    }
  });

// Rollback command
program
  .command('rollback')
  .description('Rollback the last migration')
  .option('-s, --steps <number>', 'Number of migrations to rollback', '1')
  .action(async (options) => {
    try {
      const steps = parseInt(options.steps);
      console.log(`🔄 Rolling back last ${steps} migration(s)...`);
      
      const result = await migrationService.rollback(steps);
      
      if (result.success) {
        console.log(`✅ Rollback completed successfully: ${result.message}`);
        if (result.executedMigrations && result.executedMigrations.length > 0) {
          console.log('📋 Rolled back migrations:');
          result.executedMigrations.forEach(id => console.log(`  - ${id}`));
        }
      } else {
        console.error(`❌ Rollback failed: ${result.message}`);
        if (result.failedMigrations && result.failedMigrations.length > 0) {
          console.error('📋 Failed rollbacks:');
          result.failedMigrations.forEach(migration => {
            console.error(`  - ${migration.id}: ${migration.error}`);
          });
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Rollback process failed:', error);
      process.exit(1);
    }
  });

// Status command
program
  .command('status')
  .description('Show migration status')
  .action(async () => {
    try {
      console.log('📊 Migration Status:');
      const status = await migrationService.status();
      
      console.log(`\n📈 Total migrations: ${status.total}`);
      console.log(`✅ Executed: ${status.executed.length}`);
      console.log(`⏳ Pending: ${status.pending.length}`);
      
      if (status.executed.length > 0) {
        console.log('\n✅ Executed migrations:');
        status.executed.forEach(migration => {
          console.log(`  - ${migration.id} (${migration.executed_at})`);
        });
      }
      
      if (status.pending.length > 0) {
        console.log('\n⏳ Pending migrations:');
        status.pending.forEach(id => {
          console.log(`  - ${id}`);
        });
      }
      
      if (status.pending.length === 0 && status.executed.length > 0) {
        console.log('\n🎉 All migrations are up to date!');
      }
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
      process.exit(1);
    }
  });

// Create command
program
  .command('create <name>')
  .description('Create a new migration file')
  .action(async (name) => {
    try {
      console.log(`📝 Creating migration: ${name}`);
      const migrationId = await migrationService.createMigration(name);
      console.log(`✅ Migration created: ${migrationId}.sql`);
      console.log(`📁 File location: src/database/migrations/${migrationId}.sql`);
    } catch (error) {
      console.error('❌ Failed to create migration:', error);
      process.exit(1);
    }
  });

// Validate command
program
  .command('validate')
  .description('Validate migration files')
  .action(async () => {
    try {
      console.log('🔍 Validating migration files...');
      const validation = await migrationService.validate();
      
      if (validation.valid) {
        console.log('✅ All migration files are valid');
      } else {
        console.error('❌ Validation failed:');
        validation.errors.forEach(error => {
          console.error(`  - ${error.file}: ${error.error}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Validation process failed:', error);
      process.exit(1);
    }
  });

// Reset command
program
  .command('reset')
  .description('Reset database and re-run all migrations (DANGEROUS!)')
  .option('--confirm', 'Skip confirmation prompt')
  .action(async (options) => {
    try {
      if (!options.confirm) {
        console.log('⚠️  WARNING: This will drop ALL tables and data!');
        console.log('This action cannot be undone.');
        console.log('Use --confirm flag to proceed without confirmation.');
        process.exit(1);
      }
      
      console.log('🔄 Resetting database...');
      const result = await migrationService.reset();
      
      if (result.success) {
        console.log(`✅ Database reset completed: ${result.message}`);
        if (result.executedMigrations && result.executedMigrations.length > 0) {
          console.log('📋 Re-executed migrations:');
          result.executedMigrations.forEach(id => console.log(`  - ${id}`));
        }
      } else {
        console.error(`❌ Database reset failed: ${result.message}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('❌ Database reset process failed:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
