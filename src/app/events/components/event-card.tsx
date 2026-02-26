import { Badge } from '@/components/ui/badge';
import { EventType } from '@/lib/events-data';
import { CalendarDays, Clock, MapPin, Building2, Laptop } from 'lucide-react';

const categoryBorderClass: Record<string, string> = {
  'Meetup': 'border-l-4 border-l-red-500',
  'Conference/Summit': 'border-l-4 border-l-orange-500',
  'Talk/Panel': 'border-l-4 border-l-violet-500',
  'Demo Day/Pitch': 'border-l-4 border-l-blue-500',
  'Others': 'border-l-4 border-l-teal-500',
};

const categoryBadgeClass: Record<string, string> = {
  'Meetup': 'bg-red-500 text-white hover:bg-red-600',
  'Conference/Summit': 'bg-orange-500 text-white hover:bg-orange-600',
  'Talk/Panel': 'bg-violet-500 text-white hover:bg-violet-600',
  'Demo Day/Pitch': 'bg-blue-500 text-white hover:bg-blue-600',
  'Others': 'bg-teal-500 text-white hover:bg-teal-600',
};

export function EventCard({ event }: { event: EventType }) {
  const borderClass = categoryBorderClass[event.category] ?? '';
  const badgeClass = categoryBadgeClass[event.category] ?? '';

  return (
    <div className={`border border-border bg-card p-4 hover:border-primary transition-colors ${borderClass}`}>
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
          <CalendarDays className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight">{event.title}</h3>
          <div className="space-y-1 mt-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{event.time}</span>
            </p>
            <p className="flex items-center gap-1.5">
              {event.location === 'Online' ? (
                <Laptop className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{event.location}</span>
            </p>
            <p className="flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{event.organizer}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={badgeClass}>{event.category}</Badge>
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
