import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isTomorrow, isThisWeek, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
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
      groups.Upcoming.push(event);
    }
  });

  // A simple hack to make the sections appear for demo purposes regardless of current date
  if (groups.Tomorrow.length === 0 && groups['This Week'].length === 0 && groups.Upcoming.length > 0) {
      if(sortedEvents.length > 0) groups.Tomorrow.push(sortedEvents[0]);
      if(sortedEvents.length > 2) groups['This Week'].push(sortedEvents[1], sortedEvents[2]);
      if(sortedEvents.length > 3) {
        groups.Upcoming = sortedEvents.slice(3);
      } else {
        groups.Upcoming = []; // clear it as we've moved them
      }
  }


  return Object.fromEntries(Object.entries(groups).filter(([, events]) => events.length > 0));
};
