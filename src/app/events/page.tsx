'use client';
import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { EventCard } from '@/app/events/components/event-card';
import { initialEvents, type EventType } from '@/lib/events-data';
import { groupEventsByDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
      // Assign future dates dynamically.
      // The number of days is just to spread them out.
      date: getFutureDate(index * 2 + 1), 
    }));
    
    setGroupedEvents(groupEventsByDate(dynamicEvents));
  }, []);

  return (
    <AppShell
      pageName=""
      description="Find and filter startup-related events."
      activeTab="events"
      onTabChange={() => {}}
    >
      <Card>
        <CardHeader>
          <CardTitle>Startup Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {Object.entries(groupedEvents).map(([groupTitle, events]) => (
              <section key={groupTitle}>
                <h2 className="font-bold mb-4">
                  {groupTitle} ({events.length})
                </h2>
                <div className="space-y-4">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}
