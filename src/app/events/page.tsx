'use client';
import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { EventCard } from '@/app/events/components/event-card';
import { EventsCalendar } from '@/app/events/components/events-calendar';
import { EventsFilters } from '@/app/events/components/events-filters';
import { PostEventDialog } from '@/app/events/components/post-event-dialog';
import { EmptyState } from '@/app/components/empty-state';
import { type EventCategory, type EventType } from '@/lib/events-data';
import { useEvents, useAffiliations } from '@/hooks/useEvents';
import { authedFetch, errorMessage } from '@/lib/api-client';
import { groupEventsByDate } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
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
import { Plus, CalendarDays, Search } from 'lucide-react';
import { parseISO, isSameDay, format } from 'date-fns';

export default function EventsPage() {
  const { user, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const signedIn = !!user;

  const { events, error, reload } = useEvents(user?.uid);
  const affiliations = useAffiliations(user?.uid);
  const loading = events === null;

  const [activeCategories, setActiveCategories] = React.useState<Set<EventCategory>>(new Set());
  const [onlyMine, setOnlyMine] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<EventType | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<EventType | null>(null);

  // Category + "mine" filtering. Drives the calendar dots — NOT narrowed by the selected
  // day, so picking a day doesn't make the other days' dots disappear.
  const categoryMineFiltered = React.useMemo(() => {
    return (events ?? [])
      .filter((e) => activeCategories.size === 0 || activeCategories.has(e.category))
      .filter((e) => !onlyMine || e.mine);
  }, [events, activeCategories, onlyMine]);

  const eventDates = React.useMemo(
    () => categoryMineFiltered.map((e) => parseISO(e.date)),
    [categoryMineFiltered],
  );

  // The visible list additionally narrows to the clicked calendar day.
  const filtered = React.useMemo(() => {
    if (!selectedDate) return categoryMineFiltered;
    return categoryMineFiltered.filter((e) => isSameDay(parseISO(e.date), selectedDate));
  }, [categoryMineFiltered, selectedDate]);

  const groupedEvents = React.useMemo(() => groupEventsByDate(filtered), [filtered]);
  const hasFilters = activeCategories.size > 0 || onlyMine || selectedDate !== null;

  function toggleCategory(category: EventCategory) {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(category) ? next.delete(category) : next.add(category);
      return next;
    });
  }
  function clearFilters() {
    setActiveCategories(new Set());
    setOnlyMine(false);
    setSelectedDate(null);
  }

  function openNew() {
    if (!signedIn) {
      toast({ title: 'Sign in to post an event', description: 'Continue with Google to add an event.' });
      signInWithGoogle().catch(() => {});
      return;
    }
    setEditing(null);
    setDialogOpen(true);
  }
  function openEdit(event: EventType) {
    setEditing(event);
    setDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    const res = await authedFetch(`/api/events/${target.id}`, { method: 'DELETE' });
    if (res.ok) {
      toast({ title: 'Event deleted', description: target.title, variant: 'destructive' });
      reload();
    } else {
      toast({ title: 'Could not delete event', description: await errorMessage(res), variant: 'destructive' });
    }
  }

  const sidebar = (
    <div className="space-y-4">
      <EventsCalendar eventDates={eventDates} selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <EventsFilters
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
        onlyMine={onlyMine}
        onOnlyMineChange={setOnlyMine}
        mineAvailable={signedIn}
      />
    </div>
  );

  return (
    <AppShell
      pageName="Events"
      description="Find and filter startup-related events in Malaysia."
      activeTab="events"
      onTabChange={() => {}}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="w-full lg:w-80 flex-shrink-0">{sidebar}</aside>

        <main className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <p className="text-sm text-muted-foreground">
              {loading ? (
                'Loading events…'
              ) : (
                <>
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span> event
                  {filtered.length !== 1 ? 's' : ''}
                  {selectedDate && (
                    <> on <span className="font-semibold text-foreground">{format(selectedDate, 'EEE, MMM d')}</span></>
                  )}
                  {hasFilters && (
                    <button
                      onClick={clearFilters}
                      className="ml-2.5 text-primary font-semibold hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </>
              )}
            </p>
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Post an event
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="border border-border border-l-4 border-l-muted bg-card p-4 flex gap-4">
                  <Skeleton className="h-14 w-14 flex-shrink-0" />
                  <div className="flex-1 space-y-2.5">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-2/5" />
                    <Skeleton className="h-3 w-1/3" />
                    <div className="flex gap-2 pt-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-14" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <EmptyState
              icon={Search}
              title="Couldn't load events"
              body="Something went wrong fetching events. Please try again."
              action={
                <Button variant="outline" onClick={reload}>
                  Retry
                </Button>
              }
            />
          ) : filtered.length === 0 ? (
            hasFilters ? (
              <EmptyState
                icon={Search}
                title="No events match"
                body="Nothing lines up with your current filters. Try clearing the category filters."
                action={
                  <Button variant="outline" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : (
              <EmptyState
                icon={CalendarDays}
                title="No events yet"
                body="StartupDB just launched — no events have been posted. Be the first to put one on the map for the Malaysian startup community."
                action={
                  <Button onClick={openNew}>
                    <Plus className="h-4 w-4" />
                    Post the first event
                  </Button>
                }
              />
            )
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedEvents).map(([groupTitle, groupEvents]) => (
                <section key={groupTitle}>
                  <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                    {groupTitle} <span className="text-foreground">({groupEvents.length})</span>
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {groupEvents.map((event) => (
                      <EventCard
                        key={event.id}
                        event={event}
                        canEdit={signedIn && !!event.mine}
                        onEdit={openEdit}
                        onDelete={setDeleteTarget}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>

      <PostEventDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editing}
        affiliations={affiliations}
        onSaved={reload}
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
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
