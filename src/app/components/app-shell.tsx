'use client';

import * as React from 'react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/app/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Menu, Building, Rocket, Briefcase, CalendarDays, User } from 'lucide-react';

export function AppShell({
  children,
  pageName,
  description,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  pageName: string;
  description?: React.ReactNode;
  activeTab: 'startups' | 'vcs' | 'events';
  onTabChange: (tab: 'startups' | 'vcs' | 'events') => void;
}) {
  const router = useRouter();
  const { toast } = useToast();

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
    } else {
      toast({
        title: 'Coming Soon!',
        description: `The "${tab}" feature is not yet implemented.`,
      });
    }
  };

  const handleLoginClick = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The "Sign Up/Login" feature is not yet implemented.',
    });
  };

  const navItems = [
    { label: 'Companies', tab: 'startups' },
    { label: 'VCs', tab: 'vcs' },
    { label: 'Events', tab: 'Events' },
    { label: 'Jobs', tab: 'Jobs' },
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
              {navItems.map((item) => (
                <button
                  key={item.tab}
                  onClick={() => handleMenuClick(item.tab)}
                  className={`px-3 py-1 text-sm font-medium transition-colors hover:text-primary ${
                    (item.tab === 'startups' && activeTab === 'startups') ||
                    (item.tab === 'vcs' && activeTab === 'vcs')
                      ? 'text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            {/* User icon for login (desktop and mobile) */}
            <Button variant="ghost" size="icon" onClick={handleLoginClick}>
              <User />
              <span className="sr-only">Sign up or log in</span>
            </Button>

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
                <DropdownMenuItem onClick={() => handleMenuClick('Jobs')}>
                  <Briefcase />
                  Jobs
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page title and description */}
        <div className="mt-6">
          <h1 className="text-xl font-semibold tracking-tight">{pageName}</h1>
          {description && (
            <div className="text-muted-foreground mt-2">
              {description}
            </div>
          )}
        </div>
      </header>

      {children}
    </main>
  );
}
