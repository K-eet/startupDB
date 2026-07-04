'use client';

import * as React from 'react';
import { authedFetch } from '@/lib/api-client';
import type { StoredEvent } from '@/lib/event-submission';
import type { Affiliation, EventType } from '@/lib/events-data';

/** Map a server StoredEvent to the UI's EventType, resolving "mine" for the viewer. */
export function toEventType(e: StoredEvent, uid?: string): EventType {
  return {
    id: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    location: e.location,
    online: e.online,
    category: e.category,
    tags: e.tags,
    person: e.postedByName,
    org: e.companyName ?? null,
    companySlug: e.companySlug,
    ownerUid: e.ownerUid,
    status: e.status === 'live' ? 'live' : 'pending',
    mine: !!uid && e.ownerUid === uid,
  };
}

/**
 * Fetch the public live events (GET /api/events). `events` is null while loading.
 * Re-fetches when `uid` changes (sign in/out) so "mine" flags stay correct.
 */
export function useEvents(uid?: string) {
  const [events, setEvents] = React.useState<EventType[] | null>(null);
  const [error, setError] = React.useState(false);

  const reload = React.useCallback(async () => {
    setError(false);
    try {
      const res = await fetch('/api/events');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { events: StoredEvent[] };
      setEvents(data.events.map((e) => toEventType(e, uid)));
    } catch {
      setError(true);
      setEvents([]);
    }
  }, [uid]);

  React.useEffect(() => {
    setEvents(null);
    reload();
  }, [reload]);

  return { events, error, reload };
}

/**
 * Fetch the signed-in user's org memberships as "Post as" affiliations
 * (GET /api/me → memberships). Empty when signed out.
 */
export function useAffiliations(uid?: string) {
  const [affiliations, setAffiliations] = React.useState<Affiliation[]>([]);

  React.useEffect(() => {
    if (!uid) {
      setAffiliations([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await authedFetch('/api/me');
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { memberships: { slug: string; name: string }[] };
        if (!cancelled) setAffiliations(data.memberships.map((m) => ({ id: m.slug, name: m.name })));
      } catch {
        if (!cancelled) setAffiliations([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  return affiliations;
}
