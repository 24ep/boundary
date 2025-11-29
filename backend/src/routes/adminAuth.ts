import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

// Simple admin credentials (in production, use proper authentication)
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin123' // Change this in production!
};

// Simple admin login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          id: 'admin',
          username: 'admin',
          type: 'admin'
        },
        process.env.JWT_SECRET || 'bondarys-dev-secret-key',
        { expiresIn: '24h' }
      );

      res.json({ 
        success: true,
        token,
        user: {
          id: 'admin',
          username: 'admin',
          type: 'admin'
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify token endpoint
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'bondarys-dev-secret-key') as any;
    
    res.json({ 
      success: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        type: decoded.type
      }
    });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
