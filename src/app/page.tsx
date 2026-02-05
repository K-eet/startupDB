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
import { initialVCFirms } from '@/lib/initial-data';
import { useAllCompanies } from '@/hooks/useCompanies';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/app/components/app-shell';
import Link from 'next/link';


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

  // Fetch companies from Firestore
  const { companies, loading: companiesLoading, error: companiesError } = useAllCompanies();

  const initialState: SearchState = {
    startups: [],
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

  React.useEffect(() => {
    if (companiesError) {
      toast({
        variant: 'destructive',
        title: 'Error Loading Companies',
        description: companiesError,
      });
    }
  }, [companiesError, toast]);

  const pageName = activeTab === 'startups' ? 'Directory' : 'VC Directory';

  return (
    <AppShell
      pageName={pageName}
      description={
        <>
          <p>The StartupDB Directory is a structured, continuously updated list of technology companies operating in Malaysia.</p>
          <Link href="/categorisation" className="text-primary hover:underline">
            Learn how we categorise technology companies →
          </Link>
        </>
      }
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      <div>
        {activeTab === 'startups' && (
          <StartupDirectory
            data={companies}
            loading={companiesLoading}
            searchBar={
              <Card>
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
            }
          />
        )}
        {activeTab === 'vcs' && (
          <VCDirectory
            data={state.vcs}
            searchBar={
              <Card>
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
            }
          />
        )}
      </div>
    </AppShell>
  );
}
