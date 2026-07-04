// Firestore I/O for the events collection (admin SDK). Shapes documents into
// the StoredEvent contract used by the API and the events page.

import { Timestamp } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import type { StoredEvent } from './event-submission';

const COLLECTION = 'events';

function toStoredEvent(id: string, data: FirebaseFirestore.DocumentData): StoredEvent {
  const createdAt = data.createdAt as Timestamp | undefined;
  return {
    id,
    title: data.title,
    date: data.date,
    time: data.time,
    location: data.location,
    online: data.online ?? false,
    category: data.category,
    tags: data.tags ?? [],
    status: data.status,
    ownerUid: data.ownerUid,
    postedByName: data.postedByName,
    companySlug: data.companySlug ?? undefined,
    companyName: data.companyName ?? undefined,
    createdAt: createdAt ? createdAt.toMillis() : 0,
  };
}

/** Public list: only live events, soonest date first. */
export async function listLiveEvents(): Promise<StoredEvent[]> {
  // Single-field filter (auto-indexed); sort by date in memory to avoid a
  // composite index. ponytail: fine at demo scale — add a (status,date) index
  // if the events collection ever grows large enough to need server-side sort.
  const snap = await adminDb.collection(COLLECTION).where('status', '==', 'live').get();
  return snap.docs
    .map((d) => toStoredEvent(d.id, d.data()))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Moderation queue: pending events, oldest submission first. */
export async function listPendingEvents(): Promise<StoredEvent[]> {
  const snap = await adminDb.collection(COLLECTION).where('status', '==', 'pending_review').get();
  return snap.docs
    .map((d) => toStoredEvent(d.id, d.data()))
    .sort((a, b) => a.createdAt - b.createdAt);
}

/** Events posted by one user (for the /me dashboard), newest first. */
export async function listEventsByOwner(uid: string): Promise<StoredEvent[]> {
  const snap = await adminDb.collection(COLLECTION).where('ownerUid', '==', uid).get();
  return snap.docs
    .map((d) => toStoredEvent(d.id, d.data()))
    .sort((a, b) => b.createdAt - a.createdAt);
}

/** Count of events a user created since `sinceMs` — for the per-uid daily rate cap. */
export async function countEventsByOwnerSince(uid: string, sinceMs: number): Promise<number> {
  const snap = await adminDb.collection(COLLECTION).where('ownerUid', '==', uid).get();
  return snap.docs.filter((d) => {
    const ts = d.data().createdAt as Timestamp | undefined;
    return ts ? ts.toMillis() >= sinceMs : false;
  }).length;
}

export async function getEvent(id: string): Promise<StoredEvent | null> {
  const snap = await adminDb.collection(COLLECTION).doc(id).get();
  return snap.exists ? toStoredEvent(snap.id, snap.data()!) : null;
}

export async function createEvent(data: Record<string, unknown>): Promise<string> {
  const ref = await adminDb.collection(COLLECTION).add(data);
  return ref.id;
}

export async function updateEvent(id: string, data: Record<string, unknown>): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).update(data);
}

export async function deleteEvent(id: string): Promise<void> {
  await adminDb.collection(COLLECTION).doc(id).delete();
}
