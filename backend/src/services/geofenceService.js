const hourse = require('../models/hourse');
const Location = require('../models/Location');
const User = require('../models/User');
const notificationService = require('./notificationService');

class GeofenceService {
  constructor() {
    this.geofenceTypes = {
      HOME: 'home',
      WORK: 'work',
      SCHOOL: 'school',
      CUSTOM: 'custom',
    };

    this.breachTypes = {
      ENTER: 'enter',
      EXIT: 'exit',
      BOTH: 'both',
    };
  }

  // Create a new geofence
  async createGeofence(userId, geofenceData) {
    try {
      const {
        name,
        type,
        coordinates,
        radius,
        notifications = true,
        breachType = this.breachTypes.BOTH,
        description,
      } = geofenceData;

      // Validate coordinates
      if (!this.isValidCoordinates(coordinates)) {
        throw new Error('Invalid coordinates provided');
      }

      // Validate radius
      if (radius < 50 || radius > 50000) {
        throw new Error('Radius must be between 50 and 50,000 meters');
      }

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create geofence object
      const geofence = {
        name,
        type,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(coordinates.lng), parseFloat(coordinates.lat)],
        },
        radius,
        notifications,
        breachType,
        description,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add geofence to user
      if (!user.geofences) {
        user.geofences = [];
      }

      user.geofences.push(geofence);
      await user.save();

      console.log(`✅ Geofence "${name}" created for user ${userId}`);

      return {
        success: true,
        geofence: {
          id: geofence._id || user.geofences[user.geofences.length - 1]._id,
          ...geofence,
        },
      };
    } catch (error) {
      console.error('Create geofence error:', error);
      throw error;
    }
  }

  // Update an existing geofence
  async updateGeofence(userId, geofenceId, updateData) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const geofenceIndex = user.geofences.findIndex(g => g._id.toString() === geofenceId);
      if (geofenceIndex === -1) {
        throw new Error('Geofence not found');
      }

      const geofence = user.geofences[geofenceIndex];

      // Update fields
      if (updateData.name) geofence.name = updateData.name;
      if (updateData.type) geofence.type = updateData.type;
      if (updateData.coordinates) {
        if (!this.isValidCoordinates(updateData.coordinates)) {
          throw new Error('Invalid coordinates provided');
        }
        geofence.coordinates = {
          type: 'Point',
          coordinates: [parseFloat(updateData.coordinates.lng), parseFloat(updateData.coordinates.lat)],
        };
      }
      if (updateData.radius !== undefined) {
        if (updateData.radius < 50 || updateData.radius > 50000) {
          throw new Error('Radius must be between 50 and 50,000 meters');
        }
        geofence.radius = updateData.radius;
      }
      if (updateData.notifications !== undefined) geofence.notifications = updateData.notifications;
      if (updateData.breachType) geofence.breachType = updateData.breachType;
      if (updateData.description !== undefined) geofence.description = updateData.description;

      geofence.updatedAt = new Date();

      await user.save();

      console.log(`✅ Geofence "${geofence.name}" updated for user ${userId}`);

      return {
        success: true,
        geofence: {
          id: geofence._id,
          ...geofence.toObject(),
        },
      };
    } catch (error) {
      console.error('Update geofence error:', error);
      throw error;
    }
  }

  // Delete a geofence
  async deleteGeofence(userId, geofenceId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const geofenceIndex = user.geofences.findIndex(g => g._id.toString() === geofenceId);
      if (geofenceIndex === -1) {
        throw new Error('Geofence not found');
      }

      const deletedGeofence = user.geofences.splice(geofenceIndex, 1)[0];
      await user.save();

      console.log(`✅ Geofence "${deletedGeofence.name}" deleted for user ${userId}`);

      return {
        success: true,
        message: 'Geofence deleted successfully',
      };
    } catch (error) {
      console.error('Delete geofence error:', error);
      throw error;
    }
  }

  // Get user's geofences
  async getUserGeofences(userId) {
    try {
      const user = await User.findById(userId).select('geofences');
      if (!user) {
        throw new Error('User not found');
      }

      return user.geofences || [];
    } catch (error) {
      console.error('Get user geofences error:', error);
      throw error;
    }
  }

  // Check if user is inside any geofence
  async checkGeofenceStatus(userId, location) {
    try {
      const user = await User.findById(userId).populate('hourse');
      if (!user) {
        throw new Error('User not found');
      }

      const results = [];

      // Check user's own geofences
      if (user.geofences && user.geofences.length > 0) {
        for (const geofence of user.geofences) {
          const status = this.isInsideGeofence(location, geofence);
          results.push({
            geofenceId: geofence._id,
            name: geofence.name,
            type: geofence.type,
            status,
            userOwned: true,
          });
        }
      }

      // Check hourse geofences
      if (user.hourse) {
        const hourse = await hourse.findById(user.hourse).populate('members');
        if (hourse && hourse.geofences && hourse.geofences.length > 0) {
          for (const geofence of hourse.geofences) {
            const status = this.isInsideGeofence(location, geofence);
            results.push({
              geofenceId: geofence._id,
              name: geofence.name,
              type: geofence.type,
              status,
              userOwned: false,
              familyId: hourse._id,
            });
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Check geofence status error:', error);
      throw error;
    }
  }

  // Monitor geofence breaches
  async monitorGeofenceBreaches(userId, location) {
    try {
      const user = await User.findById(userId).populate('hourse');
      if (!user) {
        throw new Error('User not found');
      }

      const breaches = [];

      // Check user's geofences
      if (user.geofences && user.geofences.length > 0) {
        for (const geofence of user.geofences) {
          const breach = await this.checkGeofenceBreach(user, geofence, location);
          if (breach) {
            breaches.push(breach);
          }
        }
      }

      // Check hourse geofences
      if (user.hourse) {
        const hourse = await hourse.findById(user.hourse).populate('members');
        if (hourse && hourse.geofences && hourse.geofences.length > 0) {
          for (const geofence of hourse.geofences) {
            const breach = await this.checkGeofenceBreach(user, geofence, location, hourse);
            if (breach) {
              breaches.push(breach);
            }
          }
        }
      }

      return breaches;
    } catch (error) {
      console.error('Monitor geofence breaches error:', error);
      throw error;
    }
  }

  // Check if a specific geofence breach occurred
  async checkGeofenceBreach(user, geofence, location, hourse = null) {
    try {
      const isInside = this.isInsideGeofence(location, geofence);
      const geofenceId = geofence._id.toString();

      // Get last known status
      const lastStatus = await this.getLastGeofenceStatus(user._id, geofenceId);

      // Check for breach
      let breachType = null;
      let shouldNotify = false;

      if (isInside && lastStatus && !lastStatus.isInside) {
        // User entered geofence
        if (geofence.breachType === this.breachTypes.ENTER || geofence.breachType === this.breachTypes.BOTH) {
          breachType = this.breachTypes.ENTER;
          shouldNotify = true;
        }
      } else if (!isInside && lastStatus && lastStatus.isInside) {
        // User exited geofence
        if (geofence.breachType === this.breachTypes.EXIT || geofence.breachType === this.breachTypes.BOTH) {
          breachType = this.breachTypes.EXIT;
          shouldNotify = true;
        }
      }

      // Update last known status
      await this.updateGeofenceStatus(user._id, geofenceId, {
        isInside,
        location,
        timestamp: new Date(),
      });

      if (shouldNotify && geofence.notifications) {
        // Send notification
        await this.sendGeofenceBreachNotification(user, geofence, breachType, hourse);
      }

      if (breachType) {
        return {
          geofenceId: geofence._id,
          name: geofence.name,
          type: geofence.type,
          breachType,
          location,
          timestamp: new Date(),
          user: {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
          },
          hourse: hourse ? {
            id: hourse._id,
            name: hourse.name,
          } : null,
        };
      }

      return null;
    } catch (error) {
      console.error('Check geofence breach error:', error);
      return null;
    }
  }

  // Check if location is inside geofence
  isInsideGeofence(location, geofence) {
    try {
      const userLat = parseFloat(location.lat);
      const userLng = parseFloat(location.lng);
      const fenceLat = geofence.coordinates.coordinates[1];
      const fenceLng = geofence.coordinates.coordinates[0];
      const radius = geofence.radius;

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(userLat, userLng, fenceLat, fenceLng);

      return distance <= radius;
    } catch (error) {
      console.error('Is inside geofence error:', error);
      return false;
    }
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Validate coordinates
  isValidCoordinates(coordinates) {
    if (!coordinates || typeof coordinates !== 'object') {
      return false;
    }

    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    return !isNaN(lat) && !isNaN(lng) &&
           lat >= -90 && lat <= 90 &&
           lng >= -180 && lng <= 180;
  }

  // Get last known geofence status
  async getLastGeofenceStatus(userId, geofenceId) {
    try {
      // This would typically be stored in a separate collection or cache
      // For now, we'll use a simple in-memory approach
      const key = `${userId}_${geofenceId}`;
      return global.geofenceStatusCache ? global.geofenceStatusCache[key] : null;
    } catch (error) {
      console.error('Get last geofence status error:', error);
      return null;
    }
  }

  // Update geofence status
  async updateGeofenceStatus(userId, geofenceId, status) {
    try {
      // This would typically be stored in a separate collection or cache
      // For now, we'll use a simple in-memory approach
      if (!global.geofenceStatusCache) {
        global.geofenceStatusCache = {};
      }

      const key = `${userId}_${geofenceId}`;
      global.geofenceStatusCache[key] = status;
    } catch (error) {
      console.error('Update geofence status error:', error);
    }
  }

  // Send geofence breach notification
  async sendGeofenceBreachNotification(user, geofence, breachType, hourse = null) {
    try {
      const action = breachType === this.breachTypes.ENTER ? 'entered' : 'left';
      const title = `🚪 Geofence Alert`;
      const message = `${user.firstName} ${user.lastName} has ${action} ${geofence.name}`;

      // Get recipients
      let recipients = [];

      if (hourse) {
        // Notify hourse members
        const familyMembers = await User.find({
          _id: { $in: hourse.members },
          _id: { $ne: user._id },
        });
        recipients = familyMembers;
      } else {
        // Notify user's emergency contacts
        if (user.emergencyContacts && user.emergencyContacts.length > 0) {
          const contactUsers = await User.find({
            phoneNumber: { $in: user.emergencyContacts.map(c => c.phoneNumber) },
          });
          recipients = contactUsers;
        }
      }

      // Send notifications
      if (recipients.length > 0) {
        await notificationService.sendGeofenceBreach(user, geofence, breachType, recipients);
      }

      console.log(`✅ Geofence breach notification sent for ${user.firstName} ${action} ${geofence.name}`);
    } catch (error) {
      console.error('Send geofence breach notification error:', error);
    }
  }

  // Get geofence statistics
  async getGeofenceStats(userId, timeRange = '7d') {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = {
        totalGeofences: user.geofences ? user.geofences.length : 0,
        activeGeofences: 0,
        breachCount: 0,
        geofenceTypes: {},
        recentBreaches: [],
      };

      // Count active geofences
      if (user.geofences) {
        for (const geofence of user.geofences) {
          if (geofence.notifications) {
            stats.activeGeofences++;
          }

          // Count by type
          stats.geofenceTypes[geofence.type] = (stats.geofenceTypes[geofence.type] || 0) + 1;
        }
      }

      // Get recent breaches (this would typically come from a separate collection)
      // For now, we'll return empty array
      stats.recentBreaches = [];

      return stats;
    } catch (error) {
      console.error('Get geofence stats error:', error);
      throw error;
    }
  }

  // Bulk geofence operations
  async bulkUpdateGeofences(userId, updates) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const results = [];

      for (const update of updates) {
        try {
          if (update.action === 'create') {
            const result = await this.createGeofence(userId, update.data);
            results.push({ id: update.id, success: true, result });
          } else if (update.action === 'update') {
            const result = await this.updateGeofence(userId, update.geofenceId, update.data);
            results.push({ id: update.id, success: true, result });
          } else if (update.action === 'delete') {
            const result = await this.deleteGeofence(userId, update.geofenceId);
            results.push({ id: update.id, success: true, result });
          }
        } catch (error) {
          results.push({ id: update.id, success: false, error: error.message });
        }
      }

      return {
        success: true,
        results,
        total: updates.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
      };
    } catch (error) {
      console.error('Bulk update geofences error:', error);
      throw error;
    }
  }

  // Export geofences
  async exportGeofences(userId, format = 'json') {
    try {
      const geofences = await this.getUserGeofences(userId);

      switch (format.toLowerCase()) {
        case 'json':
          return JSON.stringify(geofences, null, 2);
        case 'csv':
          return this.convertGeofencesToCSV(geofences);
        case 'kml':
          return this.convertGeofencesToKML(geofences);
        default:
          throw new Error('Unsupported export format');
      }
    } catch (error) {
      console.error('Export geofences error:', error);
      throw error;
    }
  }

  // Convert geofences to CSV
  convertGeofencesToCSV(geofences) {
    const headers = ['Name', 'Type', 'Latitude', 'Longitude', 'Radius', 'Notifications', 'Description'];
    const rows = geofences.map(g => [
      g.name,
      g.type,
      g.coordinates.coordinates[1],
      g.coordinates.coordinates[0],
      g.radius,
      g.notifications ? 'Yes' : 'No',
      g.description || '',
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Convert geofences to KML
  convertGeofencesToKML(geofences) {
    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Bondarys Geofences</name>
    ${geofences.map(g => `
    <Placemark>
      <name>${g.name}</name>
      <description>${g.description || ''}</description>
      <Circle>
        <center>
          <longitude>${g.coordinates.coordinates[0]}</longitude>
          <latitude>${g.coordinates.coordinates[1]}</latitude>
        </center>
        <radius>${g.radius}</radius>
      </Circle>
    </Placemark>`).join('')}
  </Document>
</kml>`;

    return kml;
  }
}

module.exports = new GeofenceService(); 