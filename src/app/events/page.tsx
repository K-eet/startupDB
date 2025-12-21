import { EventCard } from '@/app/events/components/event-card';
import { initialEvents } from '@/lib/events-data';
import { groupEventsByDate } from '@/lib/utils';
import { List, Calendar, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsPage() {
  const groupedEvents = groupEventsByDate(initialEvents);

  return (
    <main className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Startup Events</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <List />
            <span className="sr-only">List View</span>
          </Button>
          <Button variant="ghost" size="icon">
            <Calendar />
            <span className="sr-only">Calendar View</span>
          </Button>
          <Button variant="ghost" size="icon">
            <SlidersHorizontal />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
      </header>

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
    </main>
  );
}
