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
    new winston.transports.File({ filename: 'logs/hourse-service.log' })
  ]
});

class FamilyService {
  /**
   * Create a new hourse
   */
  async createFamily(familyData) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('families')
          .insert([{
            name: familyData.name,
            description: familyData.description,
            created_by: familyData.createdBy,
            settings: familyData.settings || {}
          }])
          .select()
          .single();
      });

      if (error) throw error;

      // Add creator as admin member
      await this.addFamilyMember(data.id, familyData.createdBy, 'admin');

      logger.info('hourse created successfully', { familyId: data.id, name: data.name });
      return data;
    } catch (error) {
      logger.error('Failed to create hourse:', error);
      throw error;
    }
  }

  /**
   * Get hourse by ID
   */
  async getFamilyById(familyId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('families')
          .select(`
            *,
            family_members (
              user_id,
              role,
              joined_at,
              users (
                id,
                email,
                first_name,
                last_name,
                avatar_url
              )
            )
          `)
          .eq('id', familyId)
          .single();
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get hourse by ID:', error);
      throw error;
    }
  }

  /**
   * Update hourse
   */
  async updateFamily(familyId, updateData) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('families')
          .update({
            name: updateData.name,
            description: updateData.description,
            settings: updateData.settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', familyId)
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('hourse updated successfully', { familyId });
      return data;
    } catch (error) {
      logger.error('Failed to update hourse:', error);
      throw error;
    }
  }

  /**
   * Delete hourse
   */
  async deleteFamily(familyId) {
    try {
      const { error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('families')
          .delete()
          .eq('id', familyId);
      });

      if (error) throw error;

      logger.info('hourse deleted successfully', { familyId });
      return true;
    } catch (error) {
      logger.error('Failed to delete hourse:', error);
      throw error;
    }
  }

  /**
   * Add member to hourse
   */
  async addFamilyMember(familyId, userId, role = 'member') {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .insert([{
            family_id: familyId,
            user_id: userId,
            role: role
          }])
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('hourse member added successfully', { familyId, userId, role });
      return data;
    } catch (error) {
      logger.error('Failed to add hourse member:', error);
      throw error;
    }
  }

  /**
   * Remove member from hourse
   */
  async removeFamilyMember(familyId, userId) {
    try {
      const { error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .delete()
          .eq('family_id', familyId)
          .eq('user_id', userId);
      });

      if (error) throw error;

      logger.info('hourse member removed successfully', { familyId, userId });
      return true;
    } catch (error) {
      logger.error('Failed to remove hourse member:', error);
      throw error;
    }
  }

  /**
   * Update hourse member role
   */
  async updateFamilyMemberRole(familyId, userId, newRole) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .update({ role: newRole })
          .eq('family_id', familyId)
          .eq('user_id', userId)
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('hourse member role updated successfully', { familyId, userId, newRole });
      return data;
    } catch (error) {
      logger.error('Failed to update hourse member role:', error);
      throw error;
    }
  }

  /**
   * Get families for user
   */
  async getFamiliesForUser(userId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .select(`
            role,
            joined_at,
            families (
              id,
              name,
              description,
              settings,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', userId);
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get families for user:', error);
      throw error;
    }
  }

  /**
   * Check if user is hourse member
   */
  async isFamilyMember(familyId, userId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .select('role')
          .eq('family_id', familyId)
          .eq('user_id', userId)
          .single();
      });

      if (error && error.code !== 'PGRST116') throw error;
      return data ? data.role : null;
    } catch (error) {
      logger.error('Failed to check hourse membership:', error);
      throw error;
    }
  }

  /**
   * Get hourse members
   */
  async getFamilyMembers(familyId) {
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
              phone_number
            )
          `)
          .eq('family_id', familyId)
          .order('joined_at', { ascending: true });
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get hourse members:', error);
      throw error;
    }
  }

  /**
   * Create hourse invitation
   */
  async createFamilyInvitation(familyId, email, role = 'member') {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_invitations')
          .insert([{
            family_id: familyId,
            email: email.toLowerCase(),
            role: role,
            status: 'pending'
          }])
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('hourse invitation created successfully', { familyId, email, role });
      return data;
    } catch (error) {
      logger.error('Failed to create hourse invitation:', error);
      throw error;
    }
  }

  /**
   * Get hourse invitations
   */
  async getFamilyInvitations(familyId) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_invitations')
          .select('*')
          .eq('family_id', familyId)
          .order('created_at', { ascending: false });
      });

      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('Failed to get hourse invitations:', error);
      throw error;
    }
  }

  /**
   * Update invitation status
   */
  async updateInvitationStatus(invitationId, status) {
    try {
      const { data, error } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_invitations')
          .update({
            status: status,
            updated_at: new Date().toISOString()
          })
          .eq('id', invitationId)
          .select()
          .single();
      });

      if (error) throw error;

      logger.info('Invitation status updated successfully', { invitationId, status });
      return data;
    } catch (error) {
      logger.error('Failed to update invitation status:', error);
      throw error;
    }
  }

  /**
   * Get hourse statistics
   */
  async getFamilyStats(familyId) {
    try {
      const stats = {};

      // Get member count
      const { data: memberData, error: memberError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('family_members')
          .select('id', { count: 'exact' })
          .eq('family_id', familyId);
      });

      if (memberError) throw memberError;
      stats.memberCount = memberData?.length || 0;

      // Get message count
      const { data: messageData, error: messageError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('chat_rooms')
          .select(`
            id,
            chat_messages (id)
          `)
          .eq('family_id', familyId);
      });

      if (messageError) throw messageError;
      stats.messageCount = messageData?.reduce((total, room) => total + (room.chat_messages?.length || 0), 0) || 0;

      // Get event count
      const { data: eventData, error: eventError } = await supabaseService.executeQuery(async (client) => {
        return await client
          .from('events')
          .select('id', { count: 'exact' })
          .eq('family_id', familyId);
      });

      if (eventError) throw eventError;
      stats.eventCount = eventData?.length || 0;

      return stats;
    } catch (error) {
      logger.error('Failed to get hourse stats:', error);
      throw error;
    }
  }
}

module.exports = new FamilyService();
