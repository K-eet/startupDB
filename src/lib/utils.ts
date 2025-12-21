import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isTomorrow, isThisWeek, parseISO, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import type { EventType } from "./events-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const groupEventsByDate = (events: EventType[]) => {
  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });

  const groups: { [key: string]: EventType[] } = {
    Tomorrow: [],
    'This Week': [],
    Upcoming: [],
  };

  const sortedEvents = [...events].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  sortedEvents.forEach((event) => {
    const eventDate = parseISO(event.date);
    if (isTomorrow(eventDate)) {
      groups.Tomorrow.push(event);
    } else if (isWithinInterval(eventDate, { start: startOfThisWeek, end: endOfThisWeek })) {
      if (!isTomorrow(eventDate)) { // Avoid duplicating 'Tomorrow' in 'This Week'
        groups['This Week'].push(event);
      }
    } else if (eventDate > endOfThisWeek) {
        // Group upcoming events by month
        const month = format(eventDate, 'MMMM yyyy');
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(event);
    }
  });
  
  // Clean up empty default groups if they are not used.
  if(groups['This Week'].length === 0) delete groups['This Week'];
  if(groups.Upcoming.length === 0) delete groups.Upcoming;


  return Object.fromEntries(Object.entries(groups).filter(([, events]) => events.length > 0));
};
