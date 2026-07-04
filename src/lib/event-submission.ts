// Shared types + validators for user-submitted events. Dependency-free (only
// imports the pure events-data + membership modules) so it runs under
// `node --test` and can be reused by the client form and the API route.

import type { EventCategory } from './events-data';
import type { Membership } from './membership';

// Runtime-self-contained on purpose: only type-only local imports (erased at
// runtime) so this module loads under `node --test`'s type-stripping loader,
// which can't resolve extensionless relative imports. Keep CATEGORY_NAMES in
// sync with the keys of `eventCategories` in events-data.ts.
const CATEGORY_NAMES: readonly string[] = [
  'Meetup',
  'Conference/Summit',
  'Talk/Panel',
  'Demo Day/Pitch',
  'Others',
];

export type EventStatus = 'live' | 'pending_review';

/** An event as stored in Firestore / returned by the API (id = doc id). */
export interface StoredEvent {
  id: string;
  title: string;
  date: string; // ISO 'YYYY-MM-DD'
  time: string; // free text, e.g. '10:00am – 1:00pm'
  location: string;
  online: boolean;
  category: EventCategory;
  tags: string[];
  status: EventStatus;
  ownerUid: string;
  postedByName: string; // the "who" — always set
  companySlug?: string; // the "which org", when posted as a company
  companyName?: string;
  createdAt: number; // epoch ms
}

export const EVENT_LIMITS = {
  title: 120,
  location: 120,
  time: 60,
  tag: 24,
  tags: 6,
} as const;

/** Fields a client is allowed to submit. Attribution/status/uid are server-set. */
export interface EventSubmission {
  title: string;
  date: string;
  time: string;
  location: string;
  online: boolean;
  category: EventCategory;
  tags: string[];
  companySlug?: string; // "post as" this company (validated against memberships server-side)
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function str(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

/**
 * Validate a raw event-submission body. Returns `{ value }` on success or
 * `{ error }` with a user-facing message. Does NOT decide status or attribution
 * — those depend on the caller's memberships (see decideEventStatus).
 */
export type ValidationResult =
  | { ok: false; error: string }
  | { ok: true; value: EventSubmission };

export function validateEventSubmission(data: unknown): ValidationResult {
  if (!data || typeof data !== 'object') return { ok: false, error: 'Invalid request body.' };
  const d = data as Record<string, unknown>;

  const title = str(d.title, EVENT_LIMITS.title);
  if (!title) return { ok: false, error: 'Event title is required.' };

  const date = str(d.date, 10);
  if (!ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    return { ok: false, error: 'Enter a valid date.' };
  }

  const time = str(d.time, EVENT_LIMITS.time);
  if (!time) return { ok: false, error: 'Event time is required.' };

  const location = str(d.location, EVENT_LIMITS.location);
  if (!location) return { ok: false, error: 'Event location is required.' };

  const category = d.category as EventCategory;
  if (!category || !CATEGORY_NAMES.includes(category)) {
    return { ok: false, error: 'Choose a valid category.' };
  }

  const rawTags = Array.isArray(d.tags) ? d.tags : [];
  const tags = rawTags
    .map((t) => str(t, EVENT_LIMITS.tag))
    .filter(Boolean)
    .slice(0, EVENT_LIMITS.tags);

  const online = d.online === true || location.toLowerCase() === 'online';

  const companySlug = str(d.companySlug, 200) || undefined;

  return { ok: true, value: { title, date, time, location, online, category, tags, companySlug } };
}

/**
 * Hybrid gating: affiliated users (any membership) post instantly (`live`);
 * everyone else goes into the moderation queue (`pending_review`).
 * The client-supplied status is never trusted — this is the only source.
 */
export function decideEventStatus(memberships: Membership[]): EventStatus {
  return memberships.length > 0 ? 'live' : 'pending_review';
}
