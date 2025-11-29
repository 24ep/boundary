const supabaseService = require('./supabaseService');
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
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/user-service.log' })
  ]
});

class UserService {
  /**
   * Create a new user
   */
  async createUser(userData) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .insert([{
            email: userData.email,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone_number: userData.phoneNumber,
            date_of_birth: userData.dateOfBirth,
            notification_settings: userData.notificationSettings || {},
            preferences: userData.preferences || {},
            is_onboarding_complete: false
          }])
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('User created successfully', { userId: data.id, email: data.email });
      return data;
    } catch (error) {
      logger.error('Failed to create user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get user by ID:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .select('*')
          .eq('email', email.toLowerCase())
          .single();
      });

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return data;
    } catch (error) {
      logger.error('Failed to get user by email:', error);
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .update({
            first_name: updateData.firstName,
            last_name: updateData.lastName,
            phone_number: updateData.phoneNumber,
            date_of_birth: updateData.dateOfBirth,
            avatar_url: updateData.avatarUrl,
            notification_settings: updateData.notificationSettings,
            preferences: updateData.preferences,
            is_onboarding_complete: updateData.isOnboardingComplete,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('User updated successfully', { userId });
      return data;
    } catch (error) {
      logger.error('Failed to update user:', error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId) {
    try {
      const { error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .delete()
          .eq('id', userId);
      });

      if (error) throw error;

      logger.info('User deleted successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Failed to delete user:', error);
      throw error;
    }
  }

  /**
   * Get users by hourse ID
   */
  async getUsersByFamily(familyId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .select(`
            user_id,
            role,
            joined_at,
            users (
              id,
              email,
              first_name,
              last_name,
              avatar_url,
              phone_number,
              created_at
            )
          `)
          .eq('family_id', familyId);
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get users by hourse:', error);
      throw error;
    }
  }

  /**
   * Update user location
   */
  async updateUserLocation(userId, locationData) {
    try {
      // Update current location
      const { error: locationError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('user_locations')
          .upsert([{
            user_id: userId,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            updated_at: new Date().toISOString()
          }], {
            onConflict: 'user_id'
          });
      });

      if (locationError) throw locationError;

      // Add to location history
      const { error: historyError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('location_history')
          .insert([{
            user_id: userId,
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address
          }]);
      });

      if (historyError) throw historyError;

      logger.info('User location updated successfully', { userId });
      return true;
    } catch (error) {
      logger.error('Failed to update user location:', error);
      throw error;
    }
  }

  /**
   * Get user location
   */
  async getUserLocation(userId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('user_locations')
          .select('*')
          .eq('user_id', userId)
          .single();
      });

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get user location:', error);
      throw error;
    }
  }

  /**
   * Get user location history
   */
  async getUserLocationHistory(userId, limit = 100) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('location_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit);
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get user location history:', error);
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(searchTerm, limit = 20) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('users')
          .select('id, email, first_name, last_name, avatar_url')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
          .limit(limit);
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to search users:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const stats = {};

      // Get hourse count
      const { data: familyData, error: familyError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .select('family_id', { count: 'exact' })
          .eq('user_id', userId);
      });

      if (familyError) throw familyError;
      stats.familyCount = familyData?.length || 0;

      // Get message count
      const { data: messageData, error: messageError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('chat_messages')
          .select('id', { count: 'exact' })
          .eq('sender_id', userId);
      });

      if (messageError) throw messageError;
      stats.messageCount = messageData?.length || 0;

      // Get location history count
      const { data: locationData, error: locationError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('location_history')
          .select('id', { count: 'exact' })
          .eq('user_id', userId);
      });

      if (locationError) throw locationError;
      stats.locationHistoryCount = locationData?.length || 0;

      return stats;
    } catch (error) {
      logger.error('Failed to get user stats:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
