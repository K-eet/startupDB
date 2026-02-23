import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const adminApp =
  getApps().length === 0
    ? initializeApp({ credential: applicationDefault() })
    : getApps()[0];

export const adminAuth = getAuth(adminApp);
