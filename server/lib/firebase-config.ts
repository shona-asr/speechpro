import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import path from 'path';
import { readFileSync } from 'fs';

// Initialize Firebase Admin only if it hasn't been initialized yet
if (getApps().length === 0) {
  const serviceAccountPath = path.join(process.cwd(), 'attached_assets', 'asr-app-bb22a-firebase.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

  initializeApp({
    credential: cert(serviceAccount)
  });
}

// Export Firebase Admin Auth
export const adminAuth = getAuth(); 