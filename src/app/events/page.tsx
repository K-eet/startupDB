'use client';
import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { EventCard } from '@/app/events/components/event-card';
import { initialEvents } from '@/lib/events-data';
import { groupEventsByDate } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function EventsPage() {
  const groupedEvents = groupEventsByDate(initialEvents);

  return (
    <AppShell
      title="Startup Events"
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
