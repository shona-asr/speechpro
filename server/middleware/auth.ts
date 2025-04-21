import { Request, Response, NextFunction } from 'express';
import { db } from '../db';
import { users } from '@shared/schema';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        firebaseId: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Firebase tokens
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // For development, we'll just check if the token exists
    // In production, you should verify the token with your auth service
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, token)
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if the authenticated user has admin privileges
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  // In a real application, we would check if the user has admin role
  // For simplicity, we'll just check a specific user ID
  if (req.user.id !== 1) {
    return res.status(403).json({ message: 'Forbidden: Admin privileges required' });
  }
  
  next();
}
