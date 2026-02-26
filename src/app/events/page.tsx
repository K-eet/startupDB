'use client';
import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { EventCard } from '@/app/events/components/event-card';
import { initialEvents, type EventType } from '@/lib/events-data';
import { groupEventsByDate } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function EventsPage() {
  const [groupedEvents, setGroupedEvents] = React.useState<Record<string, EventType[]>>({});

  React.useEffect(() => {
    // By generating future dates and grouping on the client, we avoid hydration mismatch.
    const getFutureDate = (days: number) => {
      const date = new Date();
      date.setDate(date.getDate() + days);
      return date.toISOString().split('T')[0];
    };

    const dynamicEvents: EventType[] = initialEvents.map((event, index) => ({
      ...event,
      date: getFutureDate(index * 2 + 1),
    }));

    setGroupedEvents(groupEventsByDate(dynamicEvents));
  }, []);

  const totalEvents = Object.values(groupedEvents).flat().length;

  return (
    <AppShell
      pageName="Events"
      description="Find and filter startup-related events in Malaysia."
      activeTab="events"
      onTabChange={() => {}}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="w-full lg:w-80 flex-shrink-0">
          <div className="border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
              <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
            </div>

            <div>
              <button
                disabled
                className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
              >
                <span className="font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500"></span>
                  Event Type
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <Separator className="my-3" />

            <div>
              <button
                disabled
                className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
              >
                <span className="font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                  Date Range
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <Separator className="my-3" />

            <div>
              <button
                disabled
                className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
              >
                <span className="font-medium text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 border border-gray-500 dark:border-gray-400"></span>
                  Location
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{totalEvents}</span> events
            </p>
          </div>

          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([groupTitle, events]) => (
              <section key={groupTitle}>
                <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
                  {groupTitle}{' '}
                  <span className="text-foreground">({events.length})</span>
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </main>
      </div>
    </AppShell>
  );
}
