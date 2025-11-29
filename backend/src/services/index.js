// Import all services
const emailService = require('./emailService');
const smsService = require('./smsService');
const pushService = require('./pushService');
const storageService = require('./storageService');
const notificationService = require('./notificationService');
const analyticsService = require('./analyticsService');
const databaseService = require('./databaseService');
const searchService = require('./searchService');
const backupService = require('./backupService');
const geofenceService = require('./geofenceService');
const encryptionService = require('./encryptionService');
const healthService = require('./healthService');
const schedulerService = require('./schedulerService');
const reportingService = require('./reportingService');
const auditService = require('./auditService');

// Initialize services
const initializeServices = async () => {
  try {
    console.log('Initializing services...');
    
    // Initialize core services
    await databaseService.connect();
    if (typeof encryptionService.initialize === 'function') {
      await encryptionService.initialize();
    }
    if (typeof healthService.initialize === 'function') {
      await healthService.initialize();
    }
    
    // Initialize communication services
    if (typeof emailService.initialize === 'function') {
      await emailService.initialize();
    }
    if (typeof smsService.initialize === 'function') {
      await smsService.initialize();
    }
    if (typeof pushService.initialize === 'function') {
      await pushService.initialize();
    }
    
    // Initialize utility services
    if (typeof storageService.initialize === 'function') {
      await storageService.initialize();
    }
    if (typeof notificationService.initialize === 'function') {
      await notificationService.initialize();
    }
    if (typeof analyticsService.initialize === 'function') {
      await analyticsService.initialize();
    }
    if (typeof searchService.initialize === 'function') {
      await searchService.initialize();
    }
    if (typeof backupService.initialize === 'function') {
      await backupService.initialize();
    }
    if (typeof geofenceService.initialize === 'function') {
      await geofenceService.initialize();
    }
    if (typeof schedulerService.initialize === 'function') {
      await schedulerService.initialize();
    }
    if (typeof reportingService.initialize === 'function') {
      await reportingService.initialize();
    }
    if (typeof auditService.initialize === 'function') {
      await auditService.initialize();
    }
    
    console.log('All services initialized successfully');
  } catch (error) {
    console.error('Service initialization error:', error);
    throw error;
  }
};

module.exports = {
  initializeServices,
  emailService,
  smsService,
  pushService,
  storageService,
  notificationService,
  analyticsService,
  databaseService,
  searchService,
  backupService,
  geofenceService,
  encryptionService,
  healthService,
  schedulerService,
  reportingService,
  auditService
}; 