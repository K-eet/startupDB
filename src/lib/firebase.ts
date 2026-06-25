import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (prevent re-initialization in development with hot reload).
// Only the app is initialized here, importing just firebase/app. Firestore and
// Auth are initialized by their own consumers (getFirestore/getAuth on `app`) so
// that importing one SDK doesn't drag in the other — keeps Firestore out of the
// directory/auth bundles and vice versa.
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
