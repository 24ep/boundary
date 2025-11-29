import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AdminRequest extends Request {
  admin?: {
    id: string;
    username: string;
    type: string;
  };
}

export const authenticateAdmin = async (
  req: AdminRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'No token provided'
      });
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'bondarys-dev-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as any;

    // Check if it's an admin token
    if (decoded.type !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Admin access required'
      });
    }

    // Add admin info to request
    req.admin = {
      id: decoded.id,
      username: decoded.username,
      type: decoded.type
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Invalid token'
      });
    }

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        error: 'Access denied',
        message: 'Token expired'
      });
    }

    console.error('Admin auth middleware error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Authentication failed'
    });
  }
};
