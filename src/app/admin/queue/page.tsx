'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { EmptyState } from '@/app/components/empty-state';
import { StatusPill } from '@/app/components/status-badges';
import { useToast } from '@/hooks/use-toast';
import { authedFetch, errorMessage } from '@/lib/api-client';
import { timeAgo } from '@/lib/account-data';
import { categoryLeftBorderClass, categorySolidClass, type EventCategory } from '@/lib/events-data';
import type { StoredEvent } from '@/lib/event-submission';
import { format, parseISO } from 'date-fns';
import { Check, X, Loader2, CalendarDays, MapPin, Laptop, Link2, Building2, Shield } from 'lucide-react';

type QueueEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  category: EventCategory;
  submitter: string;
  email?: string;
  submittedAt: string;
};

type QueueCompany = {
  id: string;
  type: 'add' | 'claim';
  name: string;
  url?: string;
  slug?: string;
  descriptor?: string;
  submitter: string;
  email: string;
  whatsapp?: string;
  submittedAt: string;
};

type Draft = { slug: string; name: string; descriptor: string; website: string };

type QueueResponse = {
  events: (StoredEvent & { submitterEmail?: string })[];
  requests: {
    id: string;
    type: 'add' | 'claim';
    contact: { name?: string; email?: string; whatsapp?: { e164?: string } } | null;
    company: { name?: string; url?: string; slug?: string; descriptor?: string } | null;
    submittedAt: number | null;
  }[];
  drafts: { slug: string; name: string; descriptor: string; website: string; createdAt: string | null }[];
};

const msToIso = (ms: number | null | undefined) => new Date(ms ?? Date.now()).toISOString();

function toQueueEvent(e: StoredEvent & { submitterEmail?: string }): QueueEvent {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    location: e.location,
    category: e.category,
    submitter: e.postedByName,
    email: e.submitterEmail,
    submittedAt: msToIso(e.createdAt),
  };
}

function toQueueCompany(r: QueueResponse['requests'][number]): QueueCompany {
  return {
    id: r.id,
    type: r.type,
    name: r.company?.name ?? '—',
    url: r.company?.url,
    slug: r.company?.slug,
    descriptor: r.company?.descriptor,
    submitter: r.contact?.name ?? 'Someone',
    email: r.contact?.email ?? '',
    whatsapp: r.contact?.whatsapp?.e164,
    submittedAt: msToIso(r.submittedAt),
  };
}

function RowActions({ onApprove, onReject, busy }: { onApprove: () => void; onReject: () => void; busy: boolean }) {
  return (
    <div className="flex gap-2 flex-shrink-0">
      <Button variant="outline" size="sm" className="text-destructive" disabled={busy} onClick={onReject}>
        <X className="h-4 w-4" />
        Reject
      </Button>
      <Button size="sm" disabled={busy} onClick={onApprove}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
        Approve
      </Button>
    </div>
  );
}

function CompanyRow({
  req,
  busy,
  onApprove,
  onReject,
}: {
  req: QueueCompany;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const isClaim = req.type === 'claim';
  return (
    <div className="bg-card border border-border p-4">
      <div className="flex items-start gap-4 flex-wrap">
        <div className="w-11 h-11 flex-shrink-0 border border-border bg-muted flex items-center justify-center font-bold">
          {req.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-base font-bold tracking-tight">{req.name}</span>
            <span
              className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 border ${
                isClaim ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' : 'bg-primary text-primary-foreground border-primary'
              }`}
            >
              {isClaim ? 'Ownership claim' : 'New company'}
            </span>
          </div>
          {req.descriptor && (
            <p className="text-sm text-muted-foreground leading-snug mb-2">{req.descriptor}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground mb-2.5">
            {req.url && (
              <span className="flex items-center gap-1.5">
                <Link2 className="h-3.5 w-3.5" />
                {req.url}
              </span>
            )}
            {isClaim && req.slug && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                Listing: {req.slug}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2.5 pt-2.5 border-t border-border/60 flex-wrap">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-[10px] font-bold">{req.submitter.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              <span className="text-foreground font-semibold">{req.submitter}</span> · {req.email}
              {req.whatsapp ? ` · ${req.whatsapp}` : ''}
            </span>
            <span className="text-xs text-muted-foreground ml-auto">{timeAgo(req.submittedAt)}</span>
          </div>
        </div>
        <RowActions busy={busy} onApprove={onApprove} onReject={onReject} />
      </div>
    </div>
  );
}

export default function ModerationQueuePage() {
  const { toast } = useToast();
  const [eventItems, setEventItems] = React.useState<QueueEvent[] | null>(null);
  const [companyItems, setCompanyItems] = React.useState<QueueCompany[] | null>(null);
  const [draftItems, setDraftItems] = React.useState<Draft[] | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await authedFetch('/api/admin/queue');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as QueueResponse;
      setEventItems(data.events.map(toQueueEvent));
      setCompanyItems(data.requests.map(toQueueCompany));
      setDraftItems(data.drafts.map(({ slug, name, descriptor, website }) => ({ slug, name, descriptor, website })));
    } catch {
      setEventItems([]);
      setCompanyItems([]);
      setDraftItems([]);
    }
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);

  const events = eventItems ?? [];
  const companies = companyItems ?? [];
  const drafts = draftItems ?? [];
  const addReqs = companies.filter((c) => c.type === 'add');
  const claimReqs = companies.filter((c) => c.type === 'claim');
  const loading = eventItems === null || companyItems === null || draftItems === null;
  const total = events.length + companies.length + drafts.length;

  async function resolveEvent(ev: QueueEvent, action: 'approve' | 'reject') {
    setBusyId(ev.id);
    const res = await (action === 'approve'
      ? authedFetch(`/api/events/${ev.id}/approve`, { method: 'POST' })
      : authedFetch(`/api/events/${ev.id}`, { method: 'DELETE' }));
    setBusyId(null);
    if (!res.ok) {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    setEventItems((prev) => (prev ?? []).filter((x) => x.id !== ev.id));
    if (action === 'approve') toast({ title: 'Event approved', description: `“${ev.title}” is now live.` });
    else toast({ title: 'Event rejected', description: `“${ev.title}” was declined.`, variant: 'destructive' });
  }

  async function resolveCompany(req: QueueCompany, action: 'approve' | 'reject') {
    setBusyId(req.id);
    const res = await authedFetch(`/api/requests/${req.id}/${action}`, { method: 'POST' });
    setBusyId(null);
    if (!res.ok) {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    setCompanyItems((prev) => (prev ?? []).filter((x) => x.id !== req.id));
    if (action === 'approve' && req.type === 'add') {
      // Approved new companies land in Drafts (hidden) until published.
      toast({ title: 'Company approved', description: `${req.name} added as a draft — enrich and publish it below.` });
      load();
      return;
    }
    const noun = req.type === 'claim' ? 'Claim' : 'Company';
    if (action === 'approve')
      toast({ title: `${noun} approved`, description: `${req.name} ownership granted.` });
    else toast({ title: `${noun} rejected`, description: `${req.name} was declined.`, variant: 'destructive' });
  }

  async function publishDraft(draft: Draft) {
    setBusyId(draft.slug);
    const res = await authedFetch(`/api/admin/companies/${draft.slug}/publish`, { method: 'POST' });
    setBusyId(null);
    if (!res.ok) {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    setDraftItems((prev) => (prev ?? []).filter((x) => x.slug !== draft.slug));
    toast({ title: 'Company published', description: `${draft.name} is now live in the directory.` });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Admin · Moderation</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5">
              <Shield className="h-3 w-3" />
              Restricted
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Moderation queue</h1>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold tracking-tight leading-none">{total}</div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mt-1">Awaiting review</div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground max-w-xl leading-relaxed mb-6">
        Pending events, new-company and claim requests, and unpublished drafts land here.
        Approving an event publishes it; approving a new company creates a hidden draft to enrich and publish.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
      <Tabs defaultValue="events">
        <TabsList>
          <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          <TabsTrigger value="add">Add requests ({addReqs.length})</TabsTrigger>
          <TabsTrigger value="claims">Claim requests ({claimReqs.length})</TabsTrigger>
          <TabsTrigger value="drafts">Drafts ({drafts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="mt-6">
          {events.length === 0 ? (
            <EmptyState
              icon={Check}
              title="Events queue is clear"
              body="No unaffiliated event submissions are waiting. New submissions from users without a company membership will appear here for review."
            />
          ) : (
            <div className="space-y-3">
              {events.map((ev) => (
                <div key={ev.id} className={`bg-card border border-border border-l-4 ${categoryLeftBorderClass[ev.category]} p-4`}>
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                        <span className="text-base font-bold tracking-tight">{ev.title}</span>
                        <Badge className={categorySolidClass[ev.category]}>{ev.category}</Badge>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-2.5">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {format(parseISO(ev.date), 'EEE, d MMM')} · {ev.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          {ev.location === 'Online' ? <Laptop className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
                          {ev.location}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 pt-2.5 border-t border-border/60">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] font-bold">{ev.submitter.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">
                          <span className="text-foreground font-semibold">{ev.submitter}</span> · {ev.email}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">{timeAgo(ev.submittedAt)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2.5">
                      <StatusPill tone="pending">Unaffiliated submitter</StatusPill>
                      <RowActions
                        busy={busyId === ev.id}
                        onApprove={() => resolveEvent(ev, 'approve')}
                        onReject={() => resolveEvent(ev, 'reject')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="add" className="mt-6">
          {addReqs.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No new-company requests"
              body="Submissions from the “Add a company” flow show up here. Approving creates a hidden draft you enrich and publish from the Drafts tab."
            />
          ) : (
            <div className="space-y-3">
              {addReqs.map((req) => (
                <CompanyRow
                  key={req.id}
                  req={req}
                  busy={busyId === req.id}
                  onApprove={() => resolveCompany(req, 'approve')}
                  onReject={() => resolveCompany(req, 'reject')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="claims" className="mt-6">
          {claimReqs.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No claim requests"
              body="Ownership claims on existing listings show up here. Approving grants the submitter ownership of the company."
            />
          ) : (
            <div className="space-y-3">
              {claimReqs.map((req) => (
                <CompanyRow
                  key={req.id}
                  req={req}
                  busy={busyId === req.id}
                  onApprove={() => resolveCompany(req, 'approve')}
                  onReject={() => resolveCompany(req, 'reject')}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          {drafts.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No drafts"
              body="Approved new companies land here hidden from the directory. Enrich each one in the edit form, then publish it to make it public."
            />
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div key={draft.slug} className="bg-card border border-border p-4">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="w-11 h-11 flex-shrink-0 border border-border bg-muted flex items-center justify-center font-bold">
                      {draft.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-[220px]">
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <span className="text-base font-bold tracking-tight">{draft.name}</span>
                        <span className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 border bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                          Hidden draft
                        </span>
                      </div>
                      {draft.descriptor && (
                        <p className="text-sm text-muted-foreground leading-snug mb-2">{draft.descriptor}</p>
                      )}
                      {draft.website && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Link2 className="h-3.5 w-3.5" />
                          {draft.website}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/companies/${draft.slug}/edit`}>Edit</Link>
                      </Button>
                      <Button size="sm" disabled={busyId === draft.slug} onClick={() => publishDraft(draft)}>
                        {busyId === draft.slug ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                        Publish
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
      )}
    </div>
  );
}
