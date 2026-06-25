'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

const StartupDirectory = dynamic(() => import('@/app/components/startup-directory'), {
  loading: () => (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

const VCDirectory = dynamic(() => import('@/app/components/vc-directory'), {
  loading: () => (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  ),
});
import { initialVCFirms } from '@/lib/initial-data';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/app/components/app-shell';
import Link from 'next/link';

export default function Home() {
  const [activeTab, setActiveTab] = React.useState<'startups' | 'vcs' | 'events'>('startups');

  // Fetch companies from Firestore
  const { companies, loading: companiesLoading, error: companiesError } = useAllCompanies();

  const { toast } = useToast();

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
          />
        )}
        {activeTab === 'vcs' && (
          <VCDirectory data={initialVCFirms} />
        )}
      </div>
    </AppShell>
  );
}
