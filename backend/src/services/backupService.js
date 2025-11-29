const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);
const archiver = require('archiver');
const User = require('../models/User');
const hourse = require('../models/hourse');
const Subscription = require('../models/Subscription');
const EmergencyAlert = require('../models/EmergencyAlert');
const SafetyCheck = require('../models/SafetyCheck');
const Message = require('../models/Message');
const Location = require('../models/Location');
const Chat = require('../models/Chat');

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_DIR || './backups';
    this.backupTypes = {
      FULL: 'full',
      INCREMENTAL: 'incremental',
      DIFFERENTIAL: 'differential',
      EXPORT: 'export',
    };
    
    this.backupFormats = {
      JSON: 'json',
      CSV: 'csv',
      XML: 'xml',
      BSON: 'bson',
    };
  }

  // Create full backup
  async createFullBackup(options = {}) {
    try {
      console.log('🔄 Starting full backup...');

      const {
        includeFiles = true,
        includeMedia = true,
        compression = true,
        encryption = false,
        password = null,
      } = options;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `full-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      // Create backup directory
      await this.ensureBackupDirectory();

      // Create database backup
      const dbBackup = await this.createDatabaseBackup(backupPath);

      // Create files backup if requested
      let filesBackup = null;
      if (includeFiles) {
        filesBackup = await this.createFilesBackup(backupPath, includeMedia);
      }

      // Create metadata
      const metadata = await this.createBackupMetadata({
        type: this.backupTypes.FULL,
        timestamp,
        backupName,
        dbBackup,
        filesBackup,
        options,
      });

      // Compress backup if requested
      let finalBackupPath = backupPath;
      if (compression) {
        finalBackupPath = await this.compressBackup(backupPath, backupName);
      }

      // Encrypt backup if requested
      if (encryption && password) {
        finalBackupPath = await this.encryptBackup(finalBackupPath, password);
      }

      console.log('✅ Full backup completed successfully');
      
      return {
        success: true,
        backupPath: finalBackupPath,
        backupName,
        timestamp,
        metadata,
        size: await this.getBackupSize(finalBackupPath),
      };
    } catch (error) {
      console.error('❌ Full backup failed:', error);
      throw error;
    }
  }

  // Create incremental backup
  async createIncrementalBackup(lastBackupDate, options = {}) {
    try {
      console.log('🔄 Starting incremental backup...');

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `incremental-backup-${timestamp}`;
      const backupPath = path.join(this.backupDir, backupName);

      await this.ensureBackupDirectory();

      // Get changes since last backup
      const changes = await this.getChangesSince(lastBackupDate);

      // Create incremental database backup
      const dbBackup = await this.createIncrementalDatabaseBackup(backupPath, changes);

      // Create metadata
      const metadata = await this.createBackupMetadata({
        type: this.backupTypes.INCREMENTAL,
        timestamp,
        backupName,
        lastBackupDate,
        changes,
        dbBackup,
        options,
      });

      console.log('✅ Incremental backup completed successfully');
      
      return {
        success: true,
        backupPath,
        backupName,
        timestamp,
        metadata,
        changes: Object.keys(changes).length,
        size: await this.getBackupSize(backupPath),
      };
    } catch (error) {
      console.error('❌ Incremental backup failed:', error);
      throw error;
    }
  }

  // Create data export
  async createDataExport(format = this.backupFormats.JSON, options = {}) {
    try {
      console.log(`🔄 Starting data export (${format})...`);

      const {
        collections = ['users', 'families', 'subscriptions', 'messages', 'alerts'],
        filters = {},
        includeSensitiveData = false,
      } = options;

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const exportName = `data-export-${format}-${timestamp}`;
      const exportPath = path.join(this.backupDir, exportName);

      await this.ensureBackupDirectory();

      const exportData = {};

      // Export each collection
      for (const collection of collections) {
        exportData[collection] = await this.exportCollection(collection, format, filters, includeSensitiveData);
      }

      // Save export file
      const exportFile = await this.saveExportFile(exportPath, exportData, format);

      // Create metadata
      const metadata = await this.createBackupMetadata({
        type: this.backupTypes.EXPORT,
        format,
        timestamp,
        exportName,
        collections,
        filters,
        includeSensitiveData,
      });

      console.log('✅ Data export completed successfully');
      
      return {
        success: true,
        exportPath: exportFile,
        exportName,
        format,
        timestamp,
        metadata,
        collections: Object.keys(exportData),
        size: await this.getBackupSize(exportFile),
      };
    } catch (error) {
      console.error('❌ Data export failed:', error);
      throw error;
    }
  }

  // Restore from backup
  async restoreFromBackup(backupPath, options = {}) {
    try {
      console.log('🔄 Starting backup restoration...');

      const {
        password = null,
        validateOnly = false,
        collections = null,
        overwrite = false,
      } = options;

      // Decrypt backup if needed
      let decryptedPath = backupPath;
      if (password) {
        decryptedPath = await this.decryptBackup(backupPath, password);
      }

      // Extract backup if compressed
      let extractedPath = decryptedPath;
      if (backupPath.endsWith('.zip') || backupPath.endsWith('.tar.gz')) {
        extractedPath = await this.extractBackup(decryptedPath);
      }

      // Read metadata
      const metadata = await this.readBackupMetadata(extractedPath);

      if (validateOnly) {
        return await this.validateBackup(extractedPath, metadata);
      }

      // Restore database
      const restoreResult = await this.restoreDatabase(extractedPath, collections, overwrite);

      // Restore files if present
      let filesRestoreResult = null;
      if (metadata.filesBackup) {
        filesRestoreResult = await this.restoreFiles(extractedPath, overwrite);
      }

      console.log('✅ Backup restoration completed successfully');
      
      return {
        success: true,
        backupPath,
        metadata,
        restoreResult,
        filesRestoreResult,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Backup restoration failed:', error);
      throw error;
    }
  }

  // Create database backup
  async createDatabaseBackup(backupPath) {
    try {
      const dbBackupPath = path.join(backupPath, 'database');
      await fs.mkdir(dbBackupPath, { recursive: true });

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondarys';
      const command = `mongodump --uri="${mongoUri}" --out="${dbBackupPath}"`;

      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        console.warn('⚠️ Database backup warnings:', stderr);
      }

      return {
        path: dbBackupPath,
        collections: await this.getBackupCollections(dbBackupPath),
        size: await this.getDirectorySize(dbBackupPath),
      };
    } catch (error) {
      console.error('Database backup error:', error);
      throw error;
    }
  }

  // Create files backup
  async createFilesBackup(backupPath, includeMedia = true) {
    try {
      const filesBackupPath = path.join(backupPath, 'files');
      await fs.mkdir(filesBackupPath, { recursive: true });

      const uploadsDir = process.env.UPLOADS_DIR || './uploads';
      
      if (await this.directoryExists(uploadsDir)) {
        await this.copyDirectory(uploadsDir, filesBackupPath);
      }

      return {
        path: filesBackupPath,
        size: await this.getDirectorySize(filesBackupPath),
        includeMedia,
      };
    } catch (error) {
      console.error('Files backup error:', error);
      throw error;
    }
  }

  // Create incremental database backup
  async createIncrementalDatabaseBackup(backupPath, changes) {
    try {
      const dbBackupPath = path.join(backupPath, 'database');
      await fs.mkdir(dbBackupPath, { recursive: true });

      // Export only changed documents
      for (const [collection, documents] of Object.entries(changes)) {
        if (documents.length > 0) {
          const collectionPath = path.join(dbBackupPath, collection);
          await fs.mkdir(collectionPath, { recursive: true });

          const filePath = path.join(collectionPath, `${collection}.json`);
          await fs.writeFile(filePath, JSON.stringify(documents, null, 2));
        }
      }

      return {
        path: dbBackupPath,
        collections: Object.keys(changes),
        changes: Object.keys(changes).reduce((acc, key) => acc + changes[key].length, 0),
        size: await this.getDirectorySize(dbBackupPath),
      };
    } catch (error) {
      console.error('Incremental database backup error:', error);
      throw error;
    }
  }

  // Get changes since last backup
  async getChangesSince(lastBackupDate) {
    try {
      const changes = {};

      // Get changed users
      const changedUsers = await User.find({
        updatedAt: { $gte: new Date(lastBackupDate) },
      }).lean();
      if (changedUsers.length > 0) {
        changes.users = changedUsers;
      }

      // Get changed families
      const changedFamilies = await hourse.find({
        updatedAt: { $gte: new Date(lastBackupDate) },
      }).lean();
      if (changedFamilies.length > 0) {
        changes.families = changedFamilies;
      }

      // Get changed subscriptions
      const changedSubscriptions = await Subscription.find({
        updatedAt: { $gte: new Date(lastBackupDate) },
      }).lean();
      if (changedSubscriptions.length > 0) {
        changes.subscriptions = changedSubscriptions;
      }

      // Get new messages
      const newMessages = await Message.find({
        createdAt: { $gte: new Date(lastBackupDate) },
      }).lean();
      if (newMessages.length > 0) {
        changes.messages = newMessages;
      }

      // Get new alerts
      const newAlerts = await EmergencyAlert.find({
        createdAt: { $gte: new Date(lastBackupDate) },
      }).lean();
      if (newAlerts.length > 0) {
        changes.alerts = newAlerts;
      }

      return changes;
    } catch (error) {
      console.error('Get changes error:', error);
      throw error;
    }
  }

  // Export collection
  async exportCollection(collectionName, format, filters = {}, includeSensitiveData = false) {
    try {
      let Model;
      let selectFields = '';

      switch (collectionName) {
        case 'users':
          Model = User;
          selectFields = includeSensitiveData ? '' : '-password -refreshTokens';
          break;
        case 'families':
          Model = hourse;
          break;
        case 'subscriptions':
          Model = Subscription;
          break;
        case 'messages':
          Model = Message;
          break;
        case 'alerts':
          Model = EmergencyAlert;
          break;
        case 'safety_checks':
          Model = SafetyCheck;
          break;
        case 'locations':
          Model = Location;
          break;
        case 'chats':
          Model = Chat;
          break;
        default:
          throw new Error(`Unknown collection: ${collectionName}`);
      }

      const query = this.buildExportQuery(filters);
      const data = await Model.find(query).select(selectFields).lean();

      return data;
    } catch (error) {
      console.error(`Export collection ${collectionName} error:`, error);
      throw error;
    }
  }

  // Build export query
  buildExportQuery(filters) {
    const query = {};

    if (filters.dateFrom || filters.dateTo) {
      query.createdAt = {};
      if (filters.dateFrom) query.createdAt.$gte = new Date(filters.dateFrom);
      if (filters.dateTo) query.createdAt.$lte = new Date(filters.dateTo);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.userId) {
      query.user = filters.userId;
    }

    if (filters.familyId) {
      query.hourse = filters.familyId;
    }

    return query;
  }

  // Save export file
  async saveExportFile(exportPath, data, format) {
    try {
      let filePath;
      let content;

      switch (format) {
        case this.backupFormats.JSON:
          filePath = `${exportPath}.json`;
          content = JSON.stringify(data, null, 2);
          break;
        case this.backupFormats.CSV:
          filePath = `${exportPath}.csv`;
          content = this.convertToCSV(data);
          break;
        case this.backupFormats.XML:
          filePath = `${exportPath}.xml`;
          content = this.convertToXML(data);
          break;
        default:
          throw new Error(`Unsupported format: ${format}`);
      }

      await fs.writeFile(filePath, content);
      return filePath;
    } catch (error) {
      console.error('Save export file error:', error);
      throw error;
    }
  }

  // Convert data to CSV
  convertToCSV(data) {
    // Implementation for CSV conversion
    return 'CSV data';
  }

  // Convert data to XML
  convertToXML(data) {
    // Implementation for XML conversion
    return 'XML data';
  }

  // Compress backup
  async compressBackup(backupPath, backupName) {
    try {
      const archive = archiver('zip', { zlib: { level: 9 } });
      const compressedPath = `${backupPath}.zip`;
      const output = require('fs').createWriteStream(compressedPath);

      archive.pipe(output);
      archive.directory(backupPath, backupName);

      await archive.finalize();

      // Remove uncompressed backup
      await fs.rm(backupPath, { recursive: true, force: true });

      return compressedPath;
    } catch (error) {
      console.error('Compress backup error:', error);
      throw error;
    }
  }

  // Encrypt backup
  async encryptBackup(backupPath, password) {
    try {
      // Implementation for backup encryption
      return backupPath;
    } catch (error) {
      console.error('Encrypt backup error:', error);
      throw error;
    }
  }

  // Decrypt backup
  async decryptBackup(backupPath, password) {
    try {
      // Implementation for backup decryption
      return backupPath;
    } catch (error) {
      console.error('Decrypt backup error:', error);
      throw error;
    }
  }

  // Extract backup
  async extractBackup(backupPath) {
    try {
      // Implementation for backup extraction
      return backupPath;
    } catch (error) {
      console.error('Extract backup error:', error);
      throw error;
    }
  }

  // Restore database
  async restoreDatabase(backupPath, collections = null, overwrite = false) {
    try {
      const dbBackupPath = path.join(backupPath, 'database');

      if (overwrite) {
        // Drop existing collections
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondarys';
        const dropCommand = `mongorestore --uri="${mongoUri}" --drop "${dbBackupPath}"`;
        await execAsync(dropCommand);
      } else {
        // Restore without dropping
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bondarys';
        const restoreCommand = `mongorestore --uri="${mongoUri}" "${dbBackupPath}"`;
        await execAsync(restoreCommand);
      }

      return { success: true };
    } catch (error) {
      console.error('Restore database error:', error);
      throw error;
    }
  }

  // Restore files
  async restoreFiles(backupPath, overwrite = false) {
    try {
      const filesBackupPath = path.join(backupPath, 'files');
      const uploadsDir = process.env.UPLOADS_DIR || './uploads';

      if (overwrite) {
        await fs.rm(uploadsDir, { recursive: true, force: true });
      }

      await this.copyDirectory(filesBackupPath, uploadsDir);

      return { success: true };
    } catch (error) {
      console.error('Restore files error:', error);
      throw error;
    }
  }

  // Validate backup
  async validateBackup(backupPath, metadata) {
    try {
      // Check if all required files exist
      const requiredFiles = ['database', 'metadata.json'];
      for (const file of requiredFiles) {
        const filePath = path.join(backupPath, file);
        await fs.access(filePath);
      }

      // Validate database backup
      const dbBackupPath = path.join(backupPath, 'database');
      const collections = await this.getBackupCollections(dbBackupPath);

      return {
        valid: true,
        backupPath,
        metadata,
        collections,
        size: await this.getDirectorySize(backupPath),
      };
    } catch (error) {
      console.error('Validate backup error:', error);
      return {
        valid: false,
        error: error.message,
      };
    }
  }

  // Helper methods
  async ensureBackupDirectory() {
    await fs.mkdir(this.backupDir, { recursive: true });
  }

  async createBackupMetadata(data) {
    const metadata = {
      version: '1.0',
      created: new Date().toISOString(),
      ...data,
    };

    return metadata;
  }

  async readBackupMetadata(backupPath) {
    const metadataPath = path.join(backupPath, 'metadata.json');
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    return JSON.parse(metadataContent);
  }

  async getBackupSize(filePath) {
    const stats = await fs.stat(filePath);
    return stats.size;
  }

  async getDirectorySize(dirPath) {
    // Implementation for directory size calculation
    return 0;
  }

  async getBackupCollections(backupPath) {
    try {
      const collections = await fs.readdir(backupPath);
      const validCollections = [];
      
      for (const collection of collections) {
        if (!collection.startsWith('.')) {
          const collectionPath = path.join(backupPath, collection);
          const stats = await fs.stat(collectionPath);
          if (stats.isDirectory()) {
            validCollections.push(collection);
          }
        }
      }
      
      return validCollections;
    } catch (error) {
      return [];
    }
  }

  async directoryExists(dirPath) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  // List backups
  async listBackups() {
    try {
      await this.ensureBackupDirectory();
      const files = await fs.readdir(this.backupDir);
      
      const backups = [];
      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.stat(filePath);
        
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
        });
      }

      return backups.sort((a, b) => b.modified - a.modified);
    } catch (error) {
      console.error('List backups error:', error);
      return [];
    }
  }

  // Delete backup
  async deleteBackup(backupName) {
    try {
      const backupPath = path.join(this.backupDir, backupName);
      await fs.rm(backupPath, { recursive: true, force: true });
      
      return { success: true, deleted: backupName };
    } catch (error) {
      console.error('Delete backup error:', error);
      throw error;
    }
  }

  // Clean old backups
  async cleanOldBackups(keepDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
      
      const toDelete = backups.filter(backup => 
        new Date(backup.created) < cutoffDate
      );

      for (const backup of toDelete) {
        await this.deleteBackup(backup.name);
      }

      return {
        success: true,
        deleted: toDelete.length,
        kept: backups.length - toDelete.length,
      };
    } catch (error) {
      console.error('Clean old backups error:', error);
      throw error;
    }
  }
}

module.exports = new BackupService(); 