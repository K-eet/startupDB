'use client';

import * as React from 'react';
import { authedFetch } from '@/lib/api-client';
import { toEventType } from '@/hooks/useEvents';
import type { StoredEvent } from '@/lib/event-submission';
import type { EventType } from '@/lib/events-data';
import type { Claim, Org } from '@/lib/account-data';

// Shape of GET /api/me.
type MeResponse = {
  memberships: { slug: string; name: string; role: 'owner' | 'member' }[];
  events: StoredEvent[];
  pendingRequests: { id: string; type: 'claim' | 'add'; company: { name?: string; slug?: string } | null }[];
  managed: {
    slug: string;
    name: string;
    industry: string;
    city: string;
    members: { uid: string; name: string; email?: string; role: 'owner' | 'member' }[];
    pending: { id: string; name: string; email: string; requestedAt: string | null }[];
  }[];
};

export type AccountData = { orgs: Org[]; claims: Claim[]; events: EventType[] };

function mapAccount(raw: MeResponse, uid: string): AccountData {
  const orgs: Org[] = raw.memberships.map((m) => {
    const managed = raw.managed.find((x) => x.slug === m.slug);
    return {
      id: m.slug,
      name: m.name,
      role: m.role,
      industry: managed?.industry ?? '',
      city: managed?.city ?? '',
      members: (managed?.members ?? []).map((mm) => ({
        id: mm.uid,
        name: mm.name,
        email: mm.email ?? '',
        role: mm.role,
        you: mm.uid === uid,
      })),
      pending: (managed?.pending ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        requestedAt: p.requestedAt ?? new Date().toISOString(),
      })),
    };
  });

  const claims: Claim[] = raw.pendingRequests.map((r) => ({
    id: r.id,
    company: r.company?.name ?? r.company?.slug ?? 'Company',
    type: r.type === 'claim' ? 'claim' : 'join',
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }));

  const events = raw.events.map((e) => toEventType(e, uid));

  return { orgs, claims, events };
}

/** Fetch the signed-in user's account (GET /api/me). `data` is null while loading. */
export function useAccount(uid?: string) {
  const [data, setData] = React.useState<AccountData | null>(null);
  const [error, setError] = React.useState(false);

  const reload = React.useCallback(async () => {
    if (!uid) {
      setData(null);
      return;
    }
    setError(false);
    try {
      const res = await authedFetch('/api/me');
      if (!res.ok) throw new Error();
      const raw = (await res.json()) as MeResponse;
      setData(mapAccount(raw, uid));
    } catch {
      setError(true);
      setData({ orgs: [], claims: [], events: [] });
    }
  }, [uid]);

  React.useEffect(() => {
    setData(null);
    reload();
  }, [reload]);

  return { data, error, reload };
}
