import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { storage } from '../storage';

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      const user = await storage.getUserByFirebaseId(decodedToken.uid);
      
      if (user) {
        req.user = {
          id: user.id,
          firebaseId: user.firebaseId!,
          email: user.email,
        };
      }
    } catch (err) {
      console.warn('Optional auth failed, continuing unauthenticated:', err.message);
    }
  }

  next();
}
