'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  categoryLeftBorderClass,
  categorySolidClass,
  type EventType,
} from '@/lib/events-data';
import { CalendarDays, Clock, MapPin, Building2, Laptop, Pencil, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

function formatEventDate(iso: string): string {
  try {
    return format(parseISO(iso), 'EEE, d MMM');
  } catch {
    return iso;
  }
}

export function EventCard({
  event,
  canEdit = false,
  onEdit,
  onDelete,
}: {
  event: EventType;
  canEdit?: boolean;
  onEdit?: (event: EventType) => void;
  onDelete?: (event: EventType) => void;
}) {
  const person = event.person ?? event.org ?? undefined;

  return (
    <div
      className={`group border border-border border-l-4 ${categoryLeftBorderClass[event.category]} bg-card p-4 hover:border-primary transition-colors`}
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
          <CalendarDays className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-semibold text-base leading-tight">{event.title}</h3>
            {canEdit && (
              <div className="flex gap-1.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  aria-label="Edit event"
                  onClick={() => onEdit?.(event)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 text-destructive"
                  aria-label="Delete event"
                  onClick={() => onDelete?.(event)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-1 mt-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span>
                <span className="text-foreground font-medium">{formatEventDate(event.date)}</span> · {event.time}
              </span>
            </p>
            <p className="flex items-center gap-1.5">
              {event.online || event.location === 'Online' ? (
                <Laptop className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span>{event.location}</span>
            </p>
            {event.org && (
              <p className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{event.org}</span>
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            <Badge className={categorySolidClass[event.category]}>{event.category}</Badge>
            {event.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>

          {person && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/60">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] font-bold">
                  {person.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                Posted by <span className="text-foreground font-semibold">{person}</span>
                {event.org && (
                  <>
                    {' '}·{' '}
                    <span className="text-foreground font-semibold">{event.org}</span>
                  </>
                )}
              </span>
              {event.mine && (
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-muted-foreground border border-border px-1.5 py-0.5">
                  You
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
