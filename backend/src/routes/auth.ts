import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getSupabaseClient } from '../services/supabaseService';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 1 }).withMessage('Password is required'),
];

// Helper function to generate JWT token
const generateToken = (userId: string, email: string) => {
  const secret = process.env.JWT_SECRET || 'bondarys-dev-secret-key';
  if ((process.env.NODE_ENV === 'production') && secret === 'bondarys-dev-secret-key') {
    throw new Error('JWT_SECRET is not set in production');
  }
  return jwt.sign(
    { id: userId, email },
    secret,
    { expiresIn: '7d' }
  );
};

// Helper function to generate refresh token
const generateRefreshToken = (userId: string) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'bondarys-refresh-secret-key';
  if ((process.env.NODE_ENV === 'production') && secret === 'bondarys-refresh-secret-key') {
    throw new Error('JWT_REFRESH_SECRET is not set in production');
  }
  return jwt.sign(
    { id: userId, type: 'refresh' },
    secret,
    { expiresIn: '30d' }
  );
};

// Register endpoint
router.post('/register', registerValidation, async (req: any, res: any) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      email,
      password,
      firstName,
      lastName,
      familyOption,
      familyCode,
      familyName,
      familyType,
      inviteEmails = [],
      interests = [],
      personalityTraits = [],
      expectations = [],
      howDidYouHear = ''
    } = req.body;

    // Check if we're in demo mode (no Supabase configured)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const token = generateToken('demo-user-id', email);
      const refreshToken = generateRefreshToken('demo-user-id');
      
      return res.status(201).json({
        message: 'Account created successfully (demo mode)',
        token,
        accessToken: token,
        refreshToken,
        user: {
          id: 'demo-user-id',
          email,
          firstName,
          lastName,
          avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
          familyId: '1'
        }
      });
    }

    const supabase = getSupabaseClient();

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        avatar_url: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('id, email, first_name, last_name, avatar_url, created_at')
      .single();

    if (userError) {
      console.error('User creation error:', userError);
      return res.status(500).json({
        error: 'Failed to create user',
        message: 'An error occurred while creating your account'
      });
    }

    // Handle hourse creation or joining
    let familyId = null;
    if (familyOption === 'create' && familyName) {
      // Create new hourse
      const { data: hourse, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          type: familyType || 'hourse',
          owner_id: user.id,
          description: `${familyName} hourse group`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id')
        .single();

      if (hourse && !familyError) {
        familyId = hourse.id;

        // Add user as hourse member
        await supabase
          .from('family_members')
          .insert({
            family_id: hourse.id,
            user_id: user.id,
            role: 'owner',
            joined_at: new Date().toISOString()
          });

        // Send invitations if provided
        if (inviteEmails.length > 0) {
          const invitations = inviteEmails.map((inviteEmail: string) => ({
            family_id: hourse.id,
            email: inviteEmail,
            invited_by: user.id,
            status: 'pending',
            created_at: new Date().toISOString()
          }));

          await supabase
            .from('family_invitations')
            .insert(invitations);
        }
      }
    } else if (familyOption === 'join' && familyCode) {
      // Join existing hourse using code
      const { data: hourse } = await supabase
        .from('families')
        .select('id')
        .eq('invite_code', familyCode)
        .single();

      if (hourse) {
        familyId = hourse.id;
        
        // Add user as hourse member
        await supabase
          .from('family_members')
          .insert({
            family_id: hourse.id,
            user_id: user.id,
            role: 'member',
            joined_at: new Date().toISOString()
          });
      }
    }

    // Store user preferences
    if (interests.length > 0 || personalityTraits.length > 0 || expectations.length > 0) {
      await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          interests,
          personality_traits: personalityTraits,
          expectations,
          how_did_you_hear: howDidYouHear,
          created_at: new Date().toISOString()
        });
    }

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        created_at: new Date().toISOString()
      });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url,
        familyId
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Login endpoint
router.post('/login', loginValidation, async (req: any, res: any) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if we're in demo mode (no Supabase configured)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const token = generateToken('demo-user-id', email);
      const refreshToken = generateRefreshToken('demo-user-id');
      
      return res.json({
        message: 'Login successful (demo mode)',
        token,
        accessToken: token,
        refreshToken,
        user: {
          id: 'demo-user-id',
          email,
          firstName: 'Demo',
          lastName: 'User',
          avatar: '👤',
          familyId: '1',
          familyName: 'Demo hourse'
        }
      });
    }

    const supabase = getSupabaseClient();

    // Find user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, password_hash, first_name, last_name, avatar_url, is_active')
      .eq('email', email)
      .single();

    if (userError || !user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({
        error: 'Account disabled',
        message: 'Your account has been disabled'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Get user's hourse
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, families(id, name)')
      .eq('user_id', user.id)
      .single();

    // Generate tokens
    const token = generateToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: user.id,
        token: refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });

    res.json({
      message: 'Login successful',
      token,
      accessToken: token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url,
        familyId: familyMember?.family_id || null,
        familyName: (familyMember?.families as any)?.name || null
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Refresh token endpoint
router.post('/refresh', async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
        message: 'No refresh token provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'bondarys-refresh-secret-key'
    ) as any;

    const supabase = getSupabaseClient();

    // Check if refresh token exists and is valid
    const { data: tokenRecord } = await supabase
      .from('refresh_tokens')
      .select('user_id, expires_at')
      .eq('token', refreshToken)
      .eq('user_id', decoded.id)
      .single();

    if (!tokenRecord || new Date(tokenRecord.expires_at) < new Date()) {
      return res.status(401).json({
        error: 'Invalid refresh token',
        message: 'Refresh token is invalid or expired'
      });
    }

    // Get user details
    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, avatar_url')
      .eq('id', decoded.id)
      .single();

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'User associated with token not found'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id);

    // Remove old refresh token and add new one
    await supabase
      .from('refresh_tokens')
      .delete()
      .eq('token', refreshToken);

    await supabase
      .from('refresh_tokens')
      .insert({
        user_id: user.id,
        token: newRefreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString()
      });

    res.json({
      token: newToken,
      accessToken: newToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      error: 'Invalid refresh token',
      message: 'Failed to refresh token'
    });
  }
});

// Logout endpoint
router.post('/logout', authenticateToken as any, async (req: any, res: any) => {
  try {
    const { refreshToken } = req.body;
    const supabase = getSupabaseClient();

    // Remove refresh token
    if (refreshToken) {
      await supabase
        .from('refresh_tokens')
        .delete()
        .eq('token', refreshToken)
        .eq('user_id', req.user.id);
    }

    res.json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

// Get current user
router.get('/me', authenticateToken as any, async (req: any, res: any) => {
  try {
    // Check if we're in demo mode (no Supabase configured)
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.json({
        user: {
          id: req.user.id,
          email: req.user.email,
          firstName: 'Demo',
          lastName: 'User',
          avatar: '👤',
          createdAt: new Date().toISOString(),
          familyId: '1',
          familyName: 'Demo hourse',
          familyRole: 'admin'
        }
      });
    }

    const supabase = getSupabaseClient();

    const { data: user } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, avatar_url, created_at')
      .eq('id', req.user.id)
      .single();

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        message: 'User not found'
      });
    }

    // Get user's hourse
    const { data: familyMember } = await supabase
      .from('family_members')
      .select('family_id, role, families(id, name, type)')
      .eq('user_id', user.id)
      .single();

    res.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        avatar: user.avatar_url,
        createdAt: user.created_at,
        familyId: familyMember?.family_id || null,
        familyName: (familyMember?.families as any)?.name || null,
        familyRole: familyMember?.role || null
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
});

export default router;

// --- OAuth provider stubs (Google/Apple) ---
// These are placeholders to be implemented with real OAuth flows.
// GET /auth/google
router.get('/google', (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Google OAuth not configured' });
});

// GET /auth/google/callback
router.get('/google/callback', (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Google OAuth callback not configured' });
});

// GET /auth/apple
router.get('/apple', (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Apple Sign-In not configured' });
});

// POST /auth/apple/callback
router.post('/apple/callback', (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'Apple callback not configured' });
});
