'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User, Auth } from 'firebase/auth';
import { app } from '@/lib/firebase';

// ponytail: firebase/auth (~100kB) is lazy-loaded so it stays out of the shared
// chunk on every page. Cached promise = fetched once, shared by the provider's
// onAuthStateChanged subscription, the sign-in/out handlers, and preloadAuth().
type AuthModule = typeof import('firebase/auth');
let authPromise: Promise<{ mod: AuthModule; auth: Auth }> | null = null;

function loadAuth() {
  if (!authPromise) {
    authPromise = import('firebase/auth').then((mod) => ({
      mod,
      auth: mod.getAuth(app),
    }));
  }
  return authPromise;
}

// Warm the chunk before the user clicks "sign in". signInWithPopup must open its
// window inside the click's transient user-activation window; if the chunk is
// still downloading, the await stalls past that window and the popup gets blocked.
// The provider mount already calls loadAuth(); hover-preload is belt-and-braces.
// ponytail: if popups still get blocked on strict Safari, switch to signInWithRedirect.
export function preloadAuth() {
  void loadAuth();
}

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  adminLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [adminLoading, setAdminLoading] = useState(false);

  const checkAdmin = useCallback(async (currentUser: User) => {
    setAdminLoading(true);
    try {
      const idToken = await currentUser.getIdToken();
      const res = await fetch('/api/auth/admin-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsAdmin(data.isAdmin === true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setAdminLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};
    loadAuth().then(({ mod, auth }) => {
      if (!active) return;
      unsubscribe = mod.onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        if (firebaseUser) {
          await checkAdmin(firebaseUser);
        } else {
          setIsAdmin(false);
        }
        setLoading(false);
      });
    });
    return () => {
      active = false;
      unsubscribe();
    };
  }, [checkAdmin]);

  const signInWithGoogle = useCallback(async () => {
    const { mod, auth } = await loadAuth();
    await mod.signInWithPopup(auth, new mod.GoogleAuthProvider());
  }, []);

  const signOut = useCallback(async () => {
    const { mod, auth } = await loadAuth();
    await mod.signOut(auth);
    setIsAdmin(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, loading, adminLoading, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
