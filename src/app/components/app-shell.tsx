'use client';

import * as React from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth, preloadAuth } from '@/contexts/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/app/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Building, Rocket, Briefcase, CalendarDays, User, LogOut, Shield } from 'lucide-react';
import { RequestModal } from '@/app/components/request-modal';

export function AppShell({
  children,
  pageName,
  description,
  activeTab,
  onTabChange,
  hideHeaderActionsOnDesktop = false,
  hideTitle = false,
}: {
  children: React.ReactNode;
  pageName: string;
  description?: React.ReactNode;
  activeTab: 'startups' | 'vcs' | 'events' | 'jobs' | 'account';
  onTabChange: (tab: 'startups' | 'vcs' | 'events') => void;
  hideHeaderActionsOnDesktop?: boolean;
  hideTitle?: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isAdmin, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [addCompanyOpen, setAddCompanyOpen] = React.useState(false);

  const handleMenuClick = (tab: string) => {
    if (tab === 'startups' || tab === 'vcs') {
      if (router) {
        // If we are not on the home page, navigate to it first
        if (window.location.pathname !== '/') {
            router.push('/');
            // A bit of a hack to make sure the tab is changed after navigation
            setTimeout(() => onTabChange(tab as 'startups' | 'vcs'), 0);
        } else {
            onTabChange(tab as 'startups' | 'vcs');
        }
      }
    } else if (tab === 'Events') {
      router.push('/events');
    } else if (tab === 'Jobs') {
      router.push('/jobs');
    } else {
      toast({
        title: 'Coming Soon!',
        description: `The "${tab}" feature is not yet implemented.`,
      });
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      toast({
        title: 'Sign-in failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast({
        title: 'Sign-out failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Every nav item carries a real href so crawlers have a followable path into
  // the site. The tab items still switch in place via onClick when we're already
  // on the home page; the href is what a crawler (or middle-click) follows.
  const navItems: { label: string; tab: string; href: string; comingSoon?: boolean }[] = [
    { label: 'Companies', tab: 'startups', href: '/' },
    { label: 'VCs', tab: 'vcs', href: '/?tab=vcs' },
    { label: 'Events', tab: 'Events', href: '/events' },
    { label: 'Jobs', tab: 'Jobs', href: '/jobs', comingSoon: true },
  ];

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <header className="mb-8">
        {/* Top bar with logo, nav, and actions */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl font-bold tracking-tight">StartupDB</span>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <span className="text-muted-foreground mx-2">|</span>
              {navItems.map((item) => {
                const className = `relative px-3 py-1 text-sm font-medium transition-colors ${
                  item.comingSoon
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : (item.tab === 'startups' && activeTab === 'startups') ||
                      (item.tab === 'vcs' && activeTab === 'vcs') ||
                      (item.tab === 'Events' && activeTab === 'events')
                    ? 'text-primary hover:text-primary'
                    : 'text-muted-foreground hover:text-primary'
                }`;
                const label = (
                  <>
                    {item.label}
                    {item.comingSoon && (
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground/60">soon</span>
                    )}
                  </>
                );
                if (item.comingSoon) {
                  return (
                    <span key={item.tab} className={className} aria-disabled="true">
                      {label}
                    </span>
                  );
                }
                return (
                  <Link
                    key={item.tab}
                    href={item.href}
                    onClick={(event) => {
                      // Tab switches stay in place; let Events navigate normally.
                      if (item.tab === 'startups' || item.tab === 'vcs') {
                        if (window.location.pathname === '/') {
                          event.preventDefault();
                          onTabChange(item.tab as 'startups' | 'vcs');
                        }
                      }
                    }}
                    className={className}
                  >
                    {label}
                  </Link>
                );
              })}
              <Link
                href="/companies"
                className="px-3 py-1 text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
              >
                A–Z
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1 text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* User auth button. While auth resolves, show a neutral placeholder
                so logged-in users don't flash the sign-in icon before their avatar. */}
            {authLoading ? (
              <Skeleton className="h-8 w-8 rounded-full" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                      <AvatarFallback>
                        {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="font-normal">
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/me')}>
                    <User />
                    My Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Shield />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignIn}
                onMouseEnter={preloadAuth}
                onFocus={preloadAuth}
              >
                <User />
                <span className="sr-only">Sign in</span>
              </Button>
            )}

            {/* Mobile hamburger menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleMenuClick('startups')}>
                  <Rocket />
                  Companies
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMenuClick('vcs')}>
                  <Building />
                  VCs
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMenuClick('Events')}>
                  <CalendarDays />
                  Events
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                  <Briefcase />
                  Jobs
                  <span className="ml-auto text-[10px] text-muted-foreground">soon</span>
                </DropdownMenuItem>
                {isAdmin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Shield />
                      Admin
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page title and description */}
        {!hideTitle && (
        <div className="mt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">{pageName}</h1>
            {activeTab === 'startups' && (
              <div className={`hidden md:flex items-center gap-2 ${hideHeaderActionsOnDesktop ? 'lg:hidden' : ''}`}>
                <Button variant="default" size="sm" asChild>
                  <Link href="/community">Join our Community</Link>
                </Button>
                <Button variant="default" size="sm" onClick={() => setAddCompanyOpen(true)}>
                  Add a Company
                </Button>
              </div>
            )}
          </div>
          {activeTab === 'startups' && (
            <div className="flex md:hidden items-center gap-2 mt-3">
              <Button variant="default" size="sm" asChild>
                <Link href="/community">Join our Community</Link>
              </Button>
              <Button variant="default" size="sm" onClick={() => setAddCompanyOpen(true)}>
                Add a Company
              </Button>
            </div>
          )}
          {description && (
            <div className="text-muted-foreground mt-2">
              {description}
            </div>
          )}
        </div>
        )}
      </header>

      {children}

      <RequestModal mode="add" open={addCompanyOpen} onOpenChange={setAddCompanyOpen} />
    </main>
  );
}
