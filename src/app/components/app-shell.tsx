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
import { Menu, Building, Rocket, Briefcase, CalendarDays, LogIn } from 'lucide-react';

export function AppShell({
  children,
  pageName,
  description,
  activeTab,
  onTabChange,
}: {
  children: React.ReactNode;
  pageName: string;
  description: string;
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

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight">
            StartupDB <span className="text-muted-foreground">/ {pageName}</span>
          </h1>
          <p className="text-muted-foreground mt-2">
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleMenuClick('startups')}>
                <Rocket />
                Startup Directory
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuClick('vcs')}>
                <Building />
                VC Directory
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('Jobs')}>
                <Briefcase />
                Jobs
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMenuClick('Events')}>
                <CalendarDays />
                Events
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleMenuClick('Sign Up/Login')}>
                <LogIn />
                Sign Up/Login
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {children}
    </main>
  );
}
