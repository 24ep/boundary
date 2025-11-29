import express from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { pool } from '../database/connection';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get safety incidents for admin
router.get('/incidents', async (req: AuthenticatedRequest, res) => {
  try {
    const { family_id, status, type, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        sa.id,
        sa.family_id,
        sa.user_id,
        sa.type,
        sa.title,
        sa.message,
        sa.location_data,
        sa.status,
        sa.priority,
        sa.expires_at,
        sa.created_at,
        sa.updated_at,
        sa.acknowledged_by,
        sa.acknowledged_at,
        sa.resolved_by,
        sa.resolved_at,
        sa.device_info,
        sa.app_version,
        sa.battery_level,
        sa.network_type,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url,
        f.name as family_name
      FROM safety_alerts sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN families f ON sa.family_id = f.id
      WHERE 1=1
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (family_id) {
      query += ` AND sa.family_id = $${paramCount++}`;
      params.push(family_id);
    }
    
    if (status) {
      query += ` AND sa.status = $${paramCount++}`;
      params.push(status);
    }
    
    if (type) {
      query += ` AND sa.type = $${paramCount++}`;
      params.push(type);
    }
    
    query += ` ORDER BY sa.created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // Transform the data to match the expected format
    const incidents = await Promise.all(result.rows.map(async (row) => {
      // Fetch emergency contacts for this incident
      const contactsQuery = `
        SELECT 
          ec.id,
          ec.name,
          ec.phone,
          ec.email,
          ec.relationship,
          sic.contacted,
          sic.contacted_at
        FROM emergency_contacts ec
        LEFT JOIN safety_incident_contacts sic ON ec.id = sic.contact_id AND sic.incident_id = $1
        WHERE ec.family_id = $2 AND ec.is_active = true
      `;
      const contactsResult = await pool.query(contactsQuery, [row.id, row.family_id]);
      
      // Fetch family members for this incident
      const membersQuery = `
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          fm.role,
          sifm.notified,
          sifm.notified_at
        FROM family_members fm
        JOIN users u ON fm.user_id = u.id
        LEFT JOIN safety_incident_family_members sifm ON u.id = sifm.user_id AND sifm.incident_id = $1
        WHERE fm.family_id = $2
      `;
      const membersResult = await pool.query(membersQuery, [row.id, row.family_id]);
      
      return {
        id: row.id,
        family_id: row.family_id,
        user_id: row.user_id,
        type: row.type,
        title: row.title,
        message: row.message,
        location_data: row.location_data,
        status: row.status,
        priority: row.priority,
        expires_at: row.expires_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        acknowledged_by: row.acknowledged_by,
        acknowledged_at: row.acknowledged_at,
        resolved_by: row.resolved_by,
        resolved_at: row.resolved_at,
        user: {
          id: row.user_id,
          first_name: row.first_name,
          last_name: row.last_name,
          email: row.email,
          phone: row.phone,
          avatar_url: row.avatar_url
        },
        family_name: row.family_name,
        emergency_contacts: contactsResult.rows.map(contact => ({
          id: contact.id,
          name: contact.name,
          phone: contact.phone,
          email: contact.email,
          relationship: contact.relationship,
          contacted: contact.contacted || false,
          contacted_at: contact.contacted_at
        })),
        family_members: membersResult.rows.map(member => ({
          id: member.id,
          name: `${member.first_name} ${member.last_name}`,
          role: member.role,
          notified: member.notified || false,
          notified_at: member.notified_at
        })),
        device_info: row.device_info,
        app_version: row.app_version,
        battery_level: row.battery_level,
        network_type: row.network_type
      };
    }));
    
    res.json({ incidents });
  } catch (error) {
    console.error('Get safety incidents error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch safety incidents'
    });
  }
});

// Get single safety incident
router.get('/incidents/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        sa.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        u.avatar_url,
        f.name as family_name
      FROM safety_alerts sa
      LEFT JOIN users u ON sa.user_id = u.id
      LEFT JOIN families f ON sa.family_id = f.id
      WHERE sa.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Safety incident not found'
      });
    }
    
    const incident = result.rows[0];
    
    // TODO: Fetch emergency contacts and family members
    const formattedIncident = {
      id: incident.id,
      family_id: incident.family_id,
      user_id: incident.user_id,
      type: incident.type,
      title: incident.title,
      message: incident.message,
      location_data: incident.location_data,
      status: incident.status,
      priority: incident.priority,
      expires_at: incident.expires_at,
      created_at: incident.created_at,
      updated_at: incident.updated_at,
      user: {
        id: incident.user_id,
        first_name: incident.first_name,
        last_name: incident.last_name,
        email: incident.email,
        phone: incident.phone,
        avatar_url: incident.avatar_url
      },
      family_name: incident.family_name,
      emergency_contacts: [],
      family_members: [],
      device_info: null,
      app_version: null,
      battery_level: null,
      network_type: null
    };
    
    res.json(formattedIncident);
  } catch (error) {
    console.error('Get safety incident error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to fetch safety incident'
    });
  }
});

// Acknowledge safety incident
router.patch('/incidents/:id/acknowledge', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    
    const query = `
      UPDATE safety_alerts 
      SET 
        status = 'acknowledged',
        acknowledged_by = $1,
        acknowledged_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [adminId, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Safety incident not found'
      });
    }
    
    res.json({
      message: 'Safety incident acknowledged successfully',
      incident: result.rows[0]
    });
  } catch (error) {
    console.error('Acknowledge safety incident error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to acknowledge safety incident'
    });
  }
});

// Resolve safety incident
router.patch('/incidents/:id/resolve', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user?.id;
    
    const query = `
      UPDATE safety_alerts 
      SET 
        status = 'resolved',
        resolved_by = $1,
        resolved_at = NOW(),
        updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [adminId, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Safety incident not found'
      });
    }
    
    res.json({
      message: 'Safety incident resolved successfully',
      incident: result.rows[0]
    });
  } catch (error) {
    console.error('Resolve safety incident error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to resolve safety incident'
    });
  }
});

export default router;
