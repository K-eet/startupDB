'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/app/components/app-shell';
import { EmptyState } from '@/app/components/empty-state';
import { StatusPill } from '@/app/components/status-badges';
import { OrgCard } from '@/app/me/components/org-card';
import { RequestModal } from '@/app/components/request-modal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useAccount } from '@/hooks/useAccount';
import { authedFetch, errorMessage } from '@/lib/api-client';
import {
  timeAgo,
  type Org,
  type OrgMember,
  type PendingMember,
} from '@/lib/account-data';
import {
  categoryLeftBorderClass,
  type EventType,
} from '@/lib/events-data';
import { format, parseISO } from 'date-fns';
import { Plus, Search, Building2, CalendarDays, Pencil, Trash2, LogOut, Laptop, MapPin, Clock } from 'lucide-react';

function MyEventRow({ event, onEdit, onDelete }: { event: EventType; onEdit: () => void; onDelete: (e: EventType) => void }) {
  return (
    <div className={`flex bg-card border border-border border-l-4 ${categoryLeftBorderClass[event.category]} hover:border-primary transition-colors`}>
      <div className="flex-1 min-w-0 p-4 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
            <span className="text-sm font-bold tracking-tight">{event.title}</span>
            {event.status === 'live' ? (
              <StatusPill tone="live">Live</StatusPill>
            ) : (
              <StatusPill tone="pending">Pending review</StatusPill>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {format(parseISO(event.date), 'EEE, d MMM')} · {event.time}
            </span>
            <span className="flex items-center gap-1.5">
              {event.online || event.location === 'Online' ? <Laptop className="h-3.5 w-3.5" /> : <MapPin className="h-3.5 w-3.5" />}
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {event.org ?? 'Yourself'}
            </span>
          </div>
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Edit" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive" aria-label="Delete" onClick={() => onDelete(event)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const { data, reload } = useAccount(user?.uid);

  const [deleteTarget, setDeleteTarget] = React.useState<EventType | null>(null);
  const [addOpen, setAddOpen] = React.useState(false);

  const orgs = data?.orgs ?? [];
  const claims = data?.claims ?? [];
  const myEvents = data?.events ?? [];
  const fetching = !!user && data === null;

  // Fire a mutating request, then re-fetch /api/me so the UI reflects the server.
  async function mutate(
    req: Promise<Response>,
    ok: { title: string; description: string; destructive?: boolean }
  ) {
    const res = await req;
    if (res.ok) {
      toast({ title: ok.title, description: ok.description, variant: ok.destructive ? 'destructive' : undefined });
      reload();
    } else {
      toast({ title: 'Action failed', description: await errorMessage(res), variant: 'destructive' });
    }
  }

  function approveJoin(org: Org, p: PendingMember) {
    mutate(authedFetch(`/api/requests/${p.id}/approve`, { method: 'POST' }), {
      title: 'Request approved',
      description: `${p.name} joined ${org.name}`,
    });
  }
  function rejectJoin(org: Org, p: PendingMember) {
    mutate(authedFetch(`/api/requests/${p.id}/reject`, { method: 'POST' }), {
      title: 'Request rejected',
      description: `${p.name}'s request to join ${org.name}`,
      destructive: true,
    });
  }
  function promote(org: Org, m: OrgMember) {
    mutate(
      authedFetch(`/api/orgs/${org.id}/members/${m.id}`, { method: 'PATCH', body: JSON.stringify({ role: 'owner' }) }),
      { title: 'Promoted to owner', description: `${m.name} is now an owner of ${org.name}` }
    );
  }
  function removeMember(org: Org, m: OrgMember) {
    mutate(authedFetch(`/api/orgs/${org.id}/members/${m.id}`, { method: 'DELETE' }), {
      title: 'Member removed',
      description: `${m.name} removed from ${org.name}`,
      destructive: true,
    });
  }
  function confirmDeleteEvent() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    mutate(authedFetch(`/api/events/${target.id}`, { method: 'DELETE' }), {
      title: 'Event deleted',
      description: target.title,
      destructive: true,
    });
  }

  const profileName = user?.displayName ?? 'Your account';
  const profileEmail = user?.email ?? '';
  const profileInitial = (user?.displayName ?? user?.email ?? 'U').charAt(0).toUpperCase();

  const content = (() => {
    if (loading || fetching) {
      return (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="border border-border bg-card p-4 flex gap-4 items-center">
              <Skeleton className="h-11 w-11" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-44" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (!user) {
      return (
        <EmptyState
          icon={Building2}
          title="Sign in to view your account"
          body="Your organizations, pending requests, and posted events live here once you're signed in."
        />
      );
    }

    return (
      <>
        {/* Profile head */}
        <div className="flex items-center gap-4 mb-7 pb-6 border-b border-border">
          <div className="w-14 h-14 rounded-full bg-lime-800 text-lime-100 flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {profileInitial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">My account</p>
            <h1 className="text-2xl font-bold tracking-tight leading-none mb-1">{profileName}</h1>
            <p className="text-sm text-muted-foreground">{profileEmail}</p>
          </div>
          <Button variant="outline" onClick={() => signOut().catch(() => {})}>
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Tabs defaultValue="orgs">
          <TabsList>
            <TabsTrigger value="orgs">My orgs ({orgs.length})</TabsTrigger>
            <TabsTrigger value="events">My events ({myEvents.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="orgs" className="mt-6">
            {orgs.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="You're not on any companies yet"
                body="Join your team's company or claim a listing to manage its profile, members, and events. Requests are verified before access is granted."
                action={
                  <div className="flex gap-2.5">
                    <Button onClick={() => setAddOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add your company
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/')}>
                      <Search className="h-4 w-4" />
                      Browse directory
                    </Button>
                  </div>
                }
              />
            ) : (
              <div className="space-y-6">
                {claims.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">Pending requests</p>
                    <div className="space-y-2.5">
                      {claims.map((c) => (
                        <div key={c.id} className="flex items-center gap-3.5 p-4 border border-border bg-card">
                          <div className="w-10 h-10 flex-shrink-0 border border-border bg-muted flex items-center justify-center font-bold">
                            {c.company.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold tracking-tight mb-0.5">{c.company}</div>
                            <div className="text-xs text-muted-foreground">
                              {c.type === 'claim' ? 'Ownership claim' : 'Join request'} · submitted {timeAgo(c.submittedAt)}
                            </div>
                          </div>
                          <StatusPill tone="review">Awaiting review</StatusPill>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                      Memberships · {orgs.length}
                    </p>
                    <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
                      <Plus className="h-4 w-4" />
                      Add your company
                    </Button>
                  </div>
                  <div className="space-y-3.5">
                    {orgs.map((org) => (
                      <OrgCard
                        key={org.id}
                        org={org}
                        onApprove={approveJoin}
                        onReject={rejectJoin}
                        onPromote={promote}
                        onRemove={removeMember}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="events" className="mt-6">
            {myEvents.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title="You haven't posted any events"
                body="Events you post — as yourself or on behalf of a company — show up here with their live or pending status."
                action={
                  <Button onClick={() => router.push('/events')}>
                    <Plus className="h-4 w-4" />
                    Post an event
                  </Button>
                }
              />
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                    Posted by you · {myEvents.length}
                  </p>
                  <Button size="sm" onClick={() => router.push('/events')}>
                    <Plus className="h-4 w-4" />
                    Post an event
                  </Button>
                </div>
                <div className="space-y-3">
                  {myEvents.map((ev) => (
                    <MyEventRow key={ev.id} event={ev} onEdit={() => router.push('/events')} onDelete={setDeleteTarget} />
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </>
    );
  })();

  return (
    <AppShell pageName="My account" activeTab="account" onTabChange={() => {}} hideTitle>
      <div className="max-w-3xl mx-auto">{content}</div>

      <RequestModal
        mode="add"
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) reload(); // pick up the new pending request
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{deleteTarget?.title}” will be removed permanently. This can&apos;t be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteEvent} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
