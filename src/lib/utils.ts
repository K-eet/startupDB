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

/** Maximum length accepted from any free-text search box. */
export const MAX_SEARCH_LENGTH = 100;

/**
 * Normalize free-text search input before it reaches any filtering — or, per
 * IMPLEMENTATION_PLAN Phase 7.2, an external search service (Algolia/Typesense).
 * Today's directory search is purely client-side substring matching with no
 * query/regex/HTML sink, so this is defense-in-depth and input hygiene rather
 * than a fix for an existing injection hole:
 *   - coerces any value to a string (runtime guard against non-string callers)
 *   - strips ASCII/Unicode control characters (C0/C1, including NUL)
 *   - caps length to bound work and any future outbound query payload
 */
export function sanitizeSearchInput(raw: unknown): string {
  const str = typeof raw === 'string' ? raw : String(raw ?? '');
  let out = '';
  for (const ch of str) {
    const code = ch.codePointAt(0) ?? 0;
    // Skip C0 (0x00–0x1F) and C1 (0x7F–0x9F) control characters.
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) continue;
    out += ch;
    if (out.length >= MAX_SEARCH_LENGTH) break;
  }
  return out;
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
