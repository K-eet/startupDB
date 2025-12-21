import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { EventType, eventCategories } from '@/lib/events-data';
import { cn } from '@/lib/utils';
import { Clock, MapPin, Building2, Laptop } from 'lucide-react';

export function EventCard({ event }: { event: EventType }) {
  const category = eventCategories[event.category];
  const categoryBgClass = `bg-${category.colorName}`;

  return (
    <Card 
      className={cn('overflow-hidden')} 
      style={{ borderLeftWidth: '4px', borderLeftColor: category.colorHex }}
    >
      <CardContent className="p-4 space-y-3">
        <h3 className="text-xl font-semibold">{event.title}</h3>
        <div className="space-y-2 text-muted-foreground">
          <p className="flex items-center gap-2">
            <Clock />
            <span>{event.time}</span>
          </p>
          <p className="flex items-center gap-2">
            {event.location === 'Online' ? <Laptop /> : <MapPin />}
            <span>{event.location}</span>
          </p>
          <p className="flex items-center gap-2">
            <Building2 />
            <span>{event.organizer}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pt-2">
          <Badge
            className={cn('text-white', categoryBgClass)}
            style={{ backgroundColor: category.colorHex }}
          >
            {event.category}
          </Badge>
          {event.tags.map((tag) => (
            <Badge
              key={tag}
              variant='outline'
            >
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
