'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EmptyState } from '@/app/components/empty-state';
import { DraftList } from '@/app/admin/components/draft-list';
import { StatusPill } from '@/app/components/status-badges';
import { useToast } from '@/hooks/use-toast';
import { authedFetch, errorMessage } from '@/lib/api-client';
import { timeAgo } from '@/lib/account-data';
import { categoryLeftBorderClass, categorySolidClass, type EventCategory } from '@/lib/events-data';
import type { StoredEvent } from '@/lib/event-submission';
import { format, parseISO } from 'date-fns';
import { Check, X, Loader2, CalendarDays, MapPin, Laptop, Link2, Building2, Shield, Pencil, Trash2 } from 'lucide-react';

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
  entityName?: string;
  url?: string;
  slug?: string;
  descriptor?: string;
  submitter: string;
  email: string;
  whatsapp?: string;
  submittedAt: string;
};

type QueueSignup = {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  org: string;
  role: string;
  working: string;
  status: string;
  submittedAt: string;
};

type QueueResponse = {
  events: (StoredEvent & { submitterEmail?: string })[];
  requests: {
    id: string;
    type: 'add' | 'claim';
    contact: { name?: string; email?: string; whatsapp?: { e164?: string } } | null;
    company: { name?: string; entityName?: string; url?: string; slug?: string; descriptor?: string } | null;
    submittedAt: number | null;
  }[];
  signups: {
    id: string;
    name: string;
    email: string;
    whatsapp: string;
    org: string;
    role: string;
    working: string;
    status: string;
    submittedAt: number | null;
  }[];
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
    entityName: r.company?.entityName,
    url: r.company?.url,
    slug: r.company?.slug,
    descriptor: r.company?.descriptor,
    submitter: r.contact?.name ?? 'Someone',
    email: r.contact?.email ?? '',
    whatsapp: r.contact?.whatsapp?.e164,
    submittedAt: msToIso(r.submittedAt),
  };
}

function toQueueSignup(s: QueueResponse['signups'][number]): QueueSignup {
  return { ...s, submittedAt: msToIso(s.submittedAt) };
}

const SIGNUP_FIELDS: { key: keyof QueueSignup; label: string; textarea?: boolean }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'role', label: 'Role' },
  { key: 'org', label: 'Organisation' },
  { key: 'status', label: 'Status' },
  { key: 'working', label: 'Working on', textarea: true },
];

function SignupEditDialog({
  signup,
  saving,
  onSave,
  onClose,
}: {
  signup: QueueSignup;
  saving: boolean;
  onSave: (s: QueueSignup) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = React.useState(signup);
  React.useEffect(() => setDraft(signup), [signup]);

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[460px]">
        <DialogHeader>
          <DialogTitle>Edit signup</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {SIGNUP_FIELDS.map((f) => (
            <div key={f.key} className="flex flex-col gap-1.5">
              <Label htmlFor={`signup-${f.key}`} className="text-xs uppercase tracking-wide">{f.label}</Label>
              {f.textarea ? (
                <Textarea
                  id={`signup-${f.key}`}
                  value={draft[f.key]}
                  rows={2}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              ) : (
                <Input
                  id={`signup-${f.key}`}
                  value={draft[f.key]}
                  onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button onClick={() => onSave(draft)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
  onEdit,
}: {
  req: QueueCompany;
  busy: boolean;
  onApprove: () => void;
  onReject: () => void;
  onEdit?: () => void;
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
          {req.entityName && (
            <p className="text-xs text-muted-foreground leading-snug mb-1.5">Entity: {req.entityName}</p>
          )}
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
        {onEdit ? (
          // New-company requests: review (approve → open the edit page) or reject.
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" disabled={busy} onClick={onEdit}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
              Review
            </Button>
            <Button variant="outline" size="sm" className="text-destructive" disabled={busy} onClick={onReject}>
              <X className="h-4 w-4" />
              Reject
            </Button>
          </div>
        ) : (
          <RowActions busy={busy} onApprove={onApprove} onReject={onReject} />
        )}
      </div>
    </div>
  );
}

export default function ModerationQueuePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [eventItems, setEventItems] = React.useState<QueueEvent[] | null>(null);
  const [companyItems, setCompanyItems] = React.useState<QueueCompany[] | null>(null);
  const [signupItems, setSignupItems] = React.useState<QueueSignup[] | null>(null);
  const [draftCount, setDraftCount] = React.useState<number | null>(null);
  const [editingSignup, setEditingSignup] = React.useState<QueueSignup | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    try {
      const res = await authedFetch('/api/admin/queue');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as QueueResponse;
      setEventItems(data.events.map(toQueueEvent));
      setCompanyItems(data.requests.map(toQueueCompany));
      setSignupItems(data.signups.map(toQueueSignup));
    } catch {
      setEventItems([]);
      setCompanyItems([]);
      setSignupItems([]);
    }
  }, []);
  React.useEffect(() => {
    load();
  }, [load]);

  const events = eventItems ?? [];
  const companies = companyItems ?? [];
  const signups = signupItems ?? [];
  const addReqs = companies.filter((c) => c.type === 'add');
  const claimReqs = companies.filter((c) => c.type === 'claim');
  const loading = eventItems === null || companyItems === null || signupItems === null;
  const total = events.length + companies.length + (draftCount ?? 0);

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
    const noun = req.type === 'claim' ? 'Claim' : 'Company';
    if (action === 'approve')
      toast({ title: `${noun} approved`, description: `${req.name} ownership granted.` });
    else toast({ title: `${noun} rejected`, description: `${req.name} was declined.`, variant: 'destructive' });
  }

  // Review a new-company request: approve it (creates the hidden company entry)
  // then open the full edit page, where the admin enriches it and chooses to
  // approve & publish, save as draft, or delete.
  async function reviewCompany(req: QueueCompany) {
    setBusyId(req.id);
    const res = await authedFetch(`/api/requests/${req.id}/approve`, { method: 'POST' });
    if (!res.ok) {
      setBusyId(null);
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    const { slug } = (await res.json().catch(() => ({}))) as { slug?: string };
    if (!slug) {
      setBusyId(null);
      toast({ title: 'Action failed', description: 'Entry was created without a reference.', variant: 'destructive' });
      return;
    }
    router.push(`/admin/companies/${slug}/edit`);
  }

  async function saveSignup(s: QueueSignup) {
    setBusyId(s.id);
    const res = await authedFetch(`/api/admin/signups/${s.id}`, { method: 'PATCH', body: JSON.stringify(s) });
    setBusyId(null);
    if (!res.ok) {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    setSignupItems((prev) => (prev ?? []).map((x) => (x.id === s.id ? s : x)));
    setEditingSignup(null);
    toast({ title: 'Signup updated', description: `${s.name || 'Signup'} saved.` });
  }

  async function deleteSignup(s: QueueSignup) {
    if (!window.confirm(`Delete ${s.name || 'this signup'}? This cannot be undone.`)) return;
    setBusyId(s.id);
    const res = await authedFetch(`/api/admin/signups/${s.id}`, { method: 'DELETE' });
    setBusyId(null);
    if (!res.ok) {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
      return;
    }
    setSignupItems((prev) => (prev ?? []).filter((x) => x.id !== s.id));
    toast({ title: 'Signup deleted', description: `${s.name || 'Signup'} was removed.` });
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
        Pending events, new-company and claim requests land here. Approving an event publishes it;
        reviewing a new company opens the full edit page to enrich it before approving, saving as a draft, or deleting.
        Approved companies awaiting enrichment live under Drafts.
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
          <TabsTrigger value="drafts">Drafts{draftCount !== null ? ` (${draftCount})` : ''}</TabsTrigger>
          <TabsTrigger value="community">Community ({signups.length})</TabsTrigger>
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
              body="Submissions from the “Add a company” flow show up here. Review one to open the full edit page, enrich it, then approve & publish, save as a draft, or delete."
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
                  onEdit={() => reviewCompany(req)}
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
          <DraftList onCount={setDraftCount} />
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          {signups.length === 0 ? (
            <EmptyState
              icon={Check}
              title="No community signups"
              body="Everyone who submits the “Join our community” form appears here with all their details."
            />
          ) : (
            <div className="overflow-x-auto border border-border">
              <table className="w-full min-w-[820px] text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-3 py-2 font-semibold">Name</th>
                    <th className="px-3 py-2 font-semibold">Email</th>
                    <th className="px-3 py-2 font-semibold">WhatsApp</th>
                    <th className="px-3 py-2 font-semibold">Role</th>
                    <th className="px-3 py-2 font-semibold">Organisation</th>
                    <th className="px-3 py-2 font-semibold">Working on</th>
                    <th className="px-3 py-2 font-semibold">Status</th>
                    <th className="px-3 py-2 font-semibold whitespace-nowrap">Submitted</th>
                    <th className="px-3 py-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {signups.map((s) => (
                    <tr key={s.id} className="border-b border-border/60 last:border-0 align-top">
                      <td className="px-3 py-2 font-semibold">{s.name || '—'}</td>
                      <td className="px-3 py-2 break-all">{s.email || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap tabular-nums">{s.whatsapp || '—'}</td>
                      <td className="px-3 py-2">{s.role || '—'}</td>
                      <td className="px-3 py-2">{s.org || '—'}</td>
                      <td className="px-3 py-2 min-w-[220px] text-muted-foreground">{s.working || '—'}</td>
                      <td className="px-3 py-2">{s.status || '—'}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                        {format(parseISO(s.submittedAt), 'd MMM yyyy, HH:mm')}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="outline" size="sm" disabled={busyId === s.id} onClick={() => setEditingSignup(s)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive" disabled={busyId === s.id} onClick={() => deleteSignup(s)}>
                            {busyId === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
      )}

      {editingSignup && (
        <SignupEditDialog
          signup={editingSignup}
          saving={busyId === editingSignup.id}
          onSave={saveSignup}
          onClose={() => setEditingSignup(null)}
        />
      )}
    </div>
  );
}
