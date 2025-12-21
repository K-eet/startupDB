'use client';

import * as React from 'react';
import { searchAction, type SearchState } from '@/app/actions';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Search } from 'lucide-react';
import StartupDirectory from '@/app/components/startup-directory';
import VCDirectory from '@/app/components/vc-directory';
import { initialStartups, initialVCFirms } from '@/lib/initial-data';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/app/components/app-shell';


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
  const [activeTab, setActiveTab] = React.useState<'startups' | 'vcs' | 'events'>('startups');

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

  return (
    <AppShell
      title="StartupDB"
      description="Malaysia's Premier Startup Community"
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
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
    </AppShell>
  );
}
