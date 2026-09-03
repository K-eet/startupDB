'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, FilePenLine, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/app/components/empty-state';
import { authedFetch, errorMessage } from '@/lib/api-client';
import { timeAgo } from '@/lib/account-data';

type Draft = {
  id: string;
  slug: string;
  name: string;
  descriptor: string;
  url: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export function DraftList({ onCount }: { onCount?: (n: number) => void }) {
  const [drafts, setDrafts] = React.useState<Draft[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch('/api/admin/companies');
        if (!res.ok) throw new Error(await errorMessage(res));
        const data = (await res.json()) as { drafts: Draft[] };
        if (cancelled) return;
        setDrafts(data.drafts);
        onCount?.(data.drafts.length);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : 'Failed to load drafts.');
      }
    })();
    return () => {
      cancelled = true;
    };
    // onCount is a stable setState from the parent — not a dep.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">Failed to load drafts: {error}</p>
      </div>
    );
  }

  if (drafts === null) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (drafts.length === 0) {
    return (
      <EmptyState
        icon={Check}
        title="No drafts awaiting review"
        body="Approved “Add a company” requests land here as hidden drafts. Enrich one via its edit page, then approve & publish, save as a draft, or delete."
      />
    );
  }

  return (
    <div className="space-y-3">
      {drafts.map((d) => (
        <div key={d.id} className="bg-card border border-border p-4">
          <div className="flex items-start gap-4 flex-wrap">
            <div className="w-11 h-11 flex-shrink-0 border border-border bg-muted flex items-center justify-center font-bold">
              {d.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                <span className="text-base font-bold tracking-tight">{d.name}</span>
                <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                  Draft · hidden
                </span>
              </div>
              {d.descriptor && (
                <p className="text-sm text-muted-foreground leading-snug mb-2">{d.descriptor}</p>
              )}
              {d.url && <p className="text-xs text-muted-foreground mb-2.5">{d.url}</p>}
              {d.createdAt && (
                <p className="text-xs text-muted-foreground">Submitted {timeAgo(d.createdAt)}</p>
              )}
            </div>
            <Button size="sm" asChild className="flex-shrink-0">
              <Link href={`/admin/companies/${d.slug}/edit`}>
                <FilePenLine className="h-4 w-4" />
                Enrich
              </Link>
            </Button>
          </div>
        </div>
      ))}
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1">
        <Pencil className="h-3 w-3" />
        Enrich opens the full edit page — approve &amp; publish, save as a draft, or delete from there.
      </p>
    </div>
  );
}
