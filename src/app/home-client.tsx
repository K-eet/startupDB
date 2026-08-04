'use client';

import * as React from 'react';
// Imported statically, NOT via next/dynamic. A dynamic() boundary streams a
// Suspense fallback into the document and hides the real markup in a
// `<div hidden>` that an inline $RC script reveals — so a JS-less crawler sees
// the spinner and none of the directory. The bundle split isn't worth that for
// the page's main content.
import StartupDirectory from '@/app/components/startup-directory';
import VCDirectory from '@/app/components/vc-directory';
import { initialVCFirms } from '@/lib/initial-data';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { useToast } from '@/hooks/use-toast';
import { AppShell } from '@/app/components/app-shell';
import Link from 'next/link';
import type { Company } from '@/types/company';
import type { DirectoryStats } from '@/lib/directory-stats';

/**
 * Interactive half of the directory. Everything data-dependent arrives as props
 * from the server page so the initial HTML is complete for crawlers; the client
 * only takes over for filtering, search and the tab switch.
 */
export function HomeClient({
  initialCompanies,
  stats,
  initialTab = 'startups',
}: {
  initialCompanies: Company[];
  stats: DirectoryStats;
  initialTab?: 'startups' | 'vcs';
}) {
  const [activeTab, setActiveTab] = React.useState<'startups' | 'vcs' | 'events'>(initialTab);

  const { companies, loading: companiesLoading, error: companiesError } =
    useAllCompanies(initialCompanies);

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
            stats={stats}
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
