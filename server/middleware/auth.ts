import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { storage } from '../storage';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

function initializeFirebaseAdmin() {
  if (!firebaseInitialized) {
    try {
      const serviceAccountPath = path.resolve(process.cwd(), 'attached_assets/asrGCAPI.json');
      console.log('Service account path:', serviceAccountPath);
      
      if (!fs.existsSync(serviceAccountPath)) {
        console.error('Service account file not found at path:', serviceAccountPath);
        throw new Error('Service account file not found');
      }
      
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      
      firebaseInitialized = true;
      console.log('Firebase Admin SDK initialized');
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
}

// Initialize Firebase on first import
initializeFirebaseAdmin();

// Augment the Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        firebaseId: string;
        email?: string;
      };
    }
  }
}

/**
 * Middleware to authenticate requests using Firebase tokens
 */
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token format' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    if (!decodedToken.uid) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }
    
    // Get user from database by Firebase ID
    const user = await storage.getUserByFirebaseId(decodedToken.uid);
    
    if (!user) {
      // If user doesn't exist yet, create a new user
      const newUser = await storage.createUser({
        username: decodedToken.email || `user_${decodedToken.uid.substring(0, 8)}`,
        email: decodedToken.email || '',
        firebaseId: decodedToken.uid,
        displayName: decodedToken.name || decodedToken.email?.split('@')[0] || 'User'
      });
      
      // Initialize user stats
      await storage.createUserStats({
        userId: newUser.id,
        minutesTranscribed: 0,
        wordsTranslated: 0,
        speechGenerated: 0,
        activeProjects: 0,
        usageCost: 0
      });
      
      req.user = {
        id: newUser.id,
        firebaseId: decodedToken.uid,
        email: decodedToken.email
      };
    } else {
      req.user = {
        id: user.id,
        firebaseId: user.firebaseId!,
        email: user.email
      };
    }
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
}

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
