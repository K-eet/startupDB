'use client';

import Link from 'next/link';
import * as React from 'react';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { CompanyList } from './components/company-list';
import { DraftList } from './components/draft-list';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Inbox } from 'lucide-react';

export default function AdminPage() {
  const { companies, loading, error } = useAllCompanies();
  // Draft count fills in once the Drafts tab has loaded (DraftList reports
  // back via onCount). Published docs come from useAllCompanies, which
  // deliberately excludes unpublished drafts, so this can't come from there.
  const [draftCount, setDraftCount] = React.useState<number | null>(null);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load companies: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Companies</h1>
          {!loading && (
            <p className="text-sm text-muted-foreground">{companies.length} companies total</p>
          )}
        </div>
        <Button variant="outline" asChild>
          <Link href="/admin/queue">
            <Inbox className="h-4 w-4" />
            Moderation queue
          </Link>
        </Button>
      </div>
      <Tabs defaultValue="published">
        <TabsList>
          <TabsTrigger value="published">
            Published{!loading ? ` (${companies.length})` : ''}
          </TabsTrigger>
          <TabsTrigger value="drafts">
            Drafts{draftCount !== null ? ` (${draftCount})` : ''}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="published" className="mt-6">
          <CompanyList companies={companies} loading={loading} />
        </TabsContent>
        <TabsContent value="drafts" className="mt-6">
          <DraftList onCount={setDraftCount} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
