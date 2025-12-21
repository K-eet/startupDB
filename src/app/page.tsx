'use client';

import * as React from 'react';
import { searchAction, type SearchState } from '@/app/actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Menu, Building, Rocket, Briefcase, CalendarDays, LogIn } from 'lucide-react';
import StartupDirectory from '@/app/components/startup-directory';
import VCDirectory from '@/app/components/vc-directory';
import { initialStartups, initialVCFirms } from '@/lib/initial-data';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/app/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function SearchButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending ? <Loader2 className="animate-spin" /> : <Search />}
      <span className="ml-2">Search</span>
    </Button>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = React.useState('startups');

  const initialState: SearchState = {
    startups: initialStartups,
    vcs: initialVCFirms,
    error: null,
    timestamp: Date.now(),
  };

  const [state, formAction] = useActionState(searchAction, initialState);
  const { toast } = useToast();

  React.useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Search Error',
        description: state.error,
      });
    }
  }, [state.error, state.timestamp, toast]);

  const handleMenuClick = (tab: string) => {
    // For now, we'll just switch the active tab.
    // In the future, this could navigate to different pages.
    if (['startups', 'vcs'].includes(tab)) {
      setActiveTab(tab);
    } else {
      // Placeholder for other menu items
      toast({
        title: 'Coming Soon!',
        description: `The "${tab}" feature is not yet implemented.`,
      });
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <header className="flex justify-between items-center mb-8">
        <div className="text-left">
          <h1 className="text-2xl font-bold tracking-tight">StartupDB</h1>
          <p className="text-muted-foreground mt-2">
            Intelligent Search for Startups and Venture Capital
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

      <Card className="mb-8">
        <CardContent className="p-4">
          <form action={formAction} className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full">
              <Label htmlFor="keywords" className="sr-only">Search Keywords</Label>
              <Input
                id="keywords"
                name="keywords"
                type="text"
                placeholder="e.g., 'early stage fintech in London' or 'AI healthcare VCs'"
                required
                className="text-base"
              />
            </div>
            <input type="hidden" name="type" value={activeTab} />
            <SearchButton />
          </form>
        </CardContent>
      </Card>

      <div>
        {activeTab === 'startups' && <StartupDirectory data={state.startups} />}
        {activeTab === 'vcs' && <VCDirectory data={state.vcs} />}
      </div>
    </main>
  );
}
