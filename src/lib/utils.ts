import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { isTomorrow, isThisWeek, parseISO, startOfWeek, endOfWeek, isWithinInterval, format } from 'date-fns';
import type { EventType } from "./events-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeCompanyName(name: string): string {
  return name.replace(/\bFormerly\b/g, 'formerly');
}

export const groupEventsByDate = (events: EventType[]) => {
  const now = new Date();
  const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 });
  const endOfThisWeek = endOfWeek(now, { weekStartsOn: 1 });

  const groups: { [key: string]: EventType[] } = {};

  const sortedEvents = [...events].sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  sortedEvents.forEach((event) => {
    const eventDate = parseISO(event.date);
    if (isTomorrow(eventDate)) {
      if (!groups['Tomorrow']) groups['Tomorrow'] = [];
      groups.Tomorrow.push(event);
    } else if (isWithinInterval(eventDate, { start: startOfThisWeek, end: endOfThisWeek })) {
        if (!groups['This Week']) groups['This Week'] = [];
        groups['This Week'].push(event);
    } else if (eventDate > endOfThisWeek) {
        // Group upcoming events by month
        const month = format(eventDate, 'MMMM yyyy');
        if (!groups[month]) {
            groups[month] = [];
        }
        groups[month].push(event);
    } else {
        // For any other case, like today but not tomorrow, or past events
        const month = format(eventDate, 'MMMM yyyy');
        if (!groups[month]) {
          groups[month] = [];
        }
        if (!groups[month].find(e => e.id === event.id)) {
            groups[month].push(event);
        }
    }
  });

  return Object.fromEntries(Object.entries(groups).filter(([, events]) => events.length > 0));
};
