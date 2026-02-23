'use client';

import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, adminLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !adminLoading && (!user || !isAdmin)) {
      router.replace('/');
    }
  }, [user, isAdmin, loading, adminLoading, router]);

  if (loading || adminLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <header className="mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">StartupDB</span>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg font-medium text-muted-foreground">Admin Dashboard</span>
          </div>
        </div>
      </header>
      {children}
    </main>
  );
}
