import express, { Response } from 'express';
import { body } from 'express-validator';
import { getSupabaseClient } from '../services/supabaseService';
import { authenticateToken, requireFamilyMember, AuthenticatedRequest } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { query } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken as any);

// Get user's hourse
router.get('/my-hourse', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;

    // Get hourse details
    const { data: hourse, error: familyError } = await supabase
      .from('families')
      .select(`
        id,
        name,
        type,
        description,
        invite_code,
        created_at,
        owner_id
      `)
      .eq('id', familyId)
      .single();

    if (familyError || !hourse) {
      return res.status(404).json({
        error: 'hourse not found',
        message: 'hourse not found'
      });
    }

    // Get hourse members
    const { data: members, error: membersError } = await supabase
      .from('family_members')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('family_id', familyId);

    if (membersError) {
      console.error('Error fetching hourse members:', membersError);
      return res.status(500).json({
        error: 'Failed to fetch hourse members',
        message: 'An error occurred while fetching hourse members'
      });
    }

    // Get hourse stats
    const { count: messageCount } = await supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    const { count: locationCount } = await supabase
      .from('location_history')
      .select('id', { count: 'exact' })
      .eq('family_id', familyId);

    res.json({
      hourse: {
        ...hourse,
        members: members?.map(member => ({
          id: member.user_id,
          firstName: (member.users as any)?.first_name,
          lastName: (member.users as any)?.last_name,
          email: (member.users as any)?.email,
          avatar: (member.users as any)?.avatar_url,
          role: member.role,
          joinedAt: member.joined_at,
          isOnline: Math.random() > 0.3, // TODO: Implement real online status
          notifications: Math.floor(Math.random() * 5)
        })) || [],
        stats: {
          totalMessages: messageCount || 0,
          totalLocations: locationCount || 0,
          totalMembers: members?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Get hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Update hourse
router.put('/my-hourse', [
  requireFamilyMember as any,
  body('name').optional().trim().isLength({ min: 1 }),
  body('description').optional().trim(),
  body('type').optional().isIn(['hourse', 'friends', 'sharehouse'])
], validateRequest, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;
    const { name, description, type } = req.body;

    // Check if user is owner or admin
    if (familyRole !== 'owner' && familyRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only hourse owners and admins can update hourse details'
      });
    }

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (type) updateData.type = type;

    const { data: hourse, error } = await supabase
      .from('families')
      .update(updateData)
      .eq('id', familyId)
      .select()
      .single();

    if (error) {
      console.error('Update hourse error:', error);
      return res.status(500).json({
        error: 'Failed to update hourse',
        message: 'An error occurred while updating hourse details'
      });
    }

    res.json({
      message: 'hourse updated successfully',
      hourse
    });

  } catch (error) {
    console.error('Update hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Invite member to hourse
router.post('/invite', [
  requireFamilyMember as any,
  body('email').isEmail().normalizeEmail(),
  body('message').optional().trim()
], validateRequest, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;
    const { email, message } = req.body;

    // Check if user can invite members
    if (familyRole !== 'owner' && familyRole !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only hourse owners and admins can invite members'
      });
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('family_members')
      .select('user_id, users(email)')
      .eq('family_id', familyId);

    const isAlreadyMember = existingMember?.some(
      member => (member.users as any)?.email === email
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        error: 'User already a member',
        message: 'This user is already a member of your hourse'
      });
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('family_invitations')
      .select('id')
      .eq('family_id', familyId)
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return res.status(400).json({
        error: 'Invitation already sent',
        message: 'An invitation has already been sent to this email'
      });
    }

    // Create invitation
    const { data: invitation, error } = await supabase
      .from('family_invitations')
      .insert({
        family_id: familyId,
        email,
        invited_by: req.user.id,
        message: message || '',
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })
      .select()
      .single();

    if (error) {
      console.error('Create invitation error:', error);
      return res.status(500).json({
        error: 'Failed to send invitation',
        message: 'An error occurred while sending the invitation'
      });
    }

    // TODO: Send email invitation
    console.log('TODO: Send email invitation to:', email);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation
    });

  } catch (error) {
    console.error('Invite member error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Get hourse invitations
router.get('/invitations', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;

    const { data: invitations, error } = await supabase
      .from('family_invitations')
      .select(`
        id,
        email,
        message,
        status,
        created_at,
        expires_at,
        users!invited_by (
          first_name,
          last_name
        )
      `)
      .eq('family_id', familyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get invitations error:', error);
      return res.status(500).json({
        error: 'Failed to fetch invitations',
        message: 'An error occurred while fetching invitations'
      });
    }

    res.json({
      invitations: invitations?.map(invitation => ({
        id: invitation.id,
        email: invitation.email,
        message: invitation.message,
        status: invitation.status,
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
        invitedBy: invitation.users ? 
          `${(invitation.users as any).first_name} ${(invitation.users as any).last_name}` : 
          'Unknown'
      })) || []
    });

  } catch (error) {
    console.error('Get invitations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Leave hourse
router.post('/leave', requireFamilyMember as any, async (req: any, res: Response) => {
  try {
    const supabase = getSupabaseClient();
    const familyId = req.familyId;
    const familyRole = req.familyRole;

    // Check if user is the owner
    if (familyRole === 'owner') {
      // Check if there are other members
      const { count } = await supabase
        .from('family_members')
        .select('user_id', { count: 'exact' })
        .eq('family_id', familyId);

      if (count && count > 1) {
        return res.status(400).json({
          error: 'Cannot leave hourse',
          message: 'As the owner, you must transfer ownership or remove all other members before leaving'
        });
      }

      // If owner is the only member, delete the hourse
      await supabase
        .from('families')
        .delete()
        .eq('id', familyId);
    } else {
      // Remove user from hourse
      await supabase
        .from('family_members')
        .delete()
        .eq('family_id', familyId)
        .eq('user_id', req.user.id);
    }

    res.json({
      message: 'Successfully left the hourse'
    });

  } catch (error) {
    console.error('Leave hourse error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;

// Get events for a specific hourse (must be a member of that hourse)
router.get(
  '/:familyId/events',
  [
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601(),
    query('type').optional().isString(),
    query('createdBy').optional().isUUID(),
  ],
  validateRequest,
  async (req: any, res: Response) => {
    try {
      const supabase = getSupabaseClient();
      const { familyId } = req.params as { familyId: string };
      const { startDate, endDate, type, createdBy } = req.query as Record<string, string>;

      // Verify requester is a member of the requested hourse
      const { data: membership } = await supabase
        .from('family_members')
        .select('user_id')
        .eq('family_id', familyId)
        .eq('user_id', req.user.id)
        .single();
      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this hourse',
        });
      }

      let queryBuilder = supabase
        .from('events')
        .select('*')
        .eq('family_id', familyId)
        .order('start_date', { ascending: true });

      if (startDate) queryBuilder = queryBuilder.gte('start_date', startDate);
      if (endDate) queryBuilder = queryBuilder.lte('end_date', endDate);
      if (type) queryBuilder = queryBuilder.eq('event_type', type);
      if (createdBy) queryBuilder = queryBuilder.eq('created_by', createdBy);

      const { data, error } = await queryBuilder;
      if (error) {
        console.error('Get hourse events error:', error);
        return res.status(500).json({ error: 'Failed to fetch hourse events' });
      }

      return res.json({ events: data || [] });
    } catch (error) {
      console.error('Get hourse events error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);
