// Firestore I/O for org membership. All writes go through the admin SDK (users
// and companies are not client-writable), keeping firestore.rules untouched.
// Pure decision helpers live in membership.ts.
//
// The two ownership mirrors — companies/{doc}.ownerUids and users/{uid}.memberships
// — are always written inside one transaction so they can't drift on a partial
// failure. Firestore admin transactions allow reads-by-query, so we resolve the
// company (keyed by its Slug FIELD, since the doc id may differ) inside the tx.

import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from './firebase-admin';
import type { Membership, MemberRole } from './membership';
import { isSoleOwner } from './membership';

/** Thrown when a role change / removal would leave a company with no owner. */
export class LastOwnerError extends Error {
  constructor() {
    super('Cannot remove the last owner.');
    this.name = 'LastOwnerError';
  }
}

/** Read a user's memberships (empty if the user doc doesn't exist yet). */
export async function getMemberships(uid: string): Promise<Membership[]> {
  const snap = await adminDb.collection('users').doc(uid).get();
  return snap.exists ? ((snap.data()?.memberships as Membership[]) ?? []) : [];
}

/**
 * Insert or update a membership on users/{uid} (single-doc, no ownerUids mirror
 * — used for 'member' grants where the company owner set is unchanged).
 * `memberSlugs` mirrors memberships[].slug for the array-contains roster query.
 */
export async function upsertMembership(uid: string, member: Membership): Promise<void> {
  const ref = adminDb.collection('users').doc(uid);
  await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const existing: Membership[] = snap.exists ? (snap.data()?.memberships ?? []) : [];
    const next = existing.filter((m) => m.slug !== member.slug);
    next.push(member);
    tx.set(ref, { memberships: next, memberSlugs: next.map((m) => m.slug) }, { merge: true });
  });
}

/** All members of a company, via the memberSlugs flat mirror (single-field index). */
export async function membersOf(
  slug: string
): Promise<{ uid: string; memberships: Membership[] }[]> {
  const snap = await adminDb
    .collection('users')
    .where('memberSlugs', 'array-contains', slug)
    .get();
  return snap.docs.map((d) => ({ uid: d.id, memberships: (d.data()?.memberships as Membership[]) ?? [] }));
}

/** Current ownerUids for a company (empty array if none / not found). */
export async function getOwnerUids(slug: string): Promise<string[]> {
  const snap = await adminDb.collection('companies').where('Slug', '==', slug).limit(1).get();
  return snap.empty ? [] : ((snap.docs[0].data().ownerUids as string[]) ?? []);
}

// --- Transactional mirror updates (companies.ownerUids ↔ users.memberships) ---

// Resolve the single company doc for a slug inside a transaction. All reads in a
// Firestore transaction must precede all writes, so callers read this first.
async function companyDocInTx(
  tx: FirebaseFirestore.Transaction,
  slug: string
): Promise<FirebaseFirestore.QueryDocumentSnapshot | null> {
  const q = adminDb.collection('companies').where('Slug', '==', slug).limit(1);
  const snap = await tx.get(q);
  return snap.empty ? null : snap.docs[0];
}

function writeMemberships(
  tx: FirebaseFirestore.Transaction,
  userRef: FirebaseFirestore.DocumentReference,
  next: Membership[]
): void {
  tx.set(userRef, { memberships: next, memberSlugs: next.map((m) => m.slug) }, { merge: true });
}

/**
 * Grant ownership: atomically add uid to companies.ownerUids AND upsert an
 * 'owner' membership on the user. Throws if the company is missing.
 */
export async function grantOwner(slug: string, uid: string, companyName: string): Promise<void> {
  const userRef = adminDb.collection('users').doc(uid);
  await adminDb.runTransaction(async (tx) => {
    const companyDoc = await companyDocInTx(tx, slug); // read
    if (!companyDoc) throw new Error(`Company not found: ${slug}`);
    const userSnap = await tx.get(userRef); // read

    tx.update(companyDoc.ref, { ownerUids: FieldValue.arrayUnion(uid) }); // writes
    const existing: Membership[] = userSnap.exists ? (userSnap.data()?.memberships ?? []) : [];
    const next = existing.filter((m) => m.slug !== slug);
    next.push({ slug, name: companyName, role: 'owner' });
    writeMemberships(tx, userRef, next);
  });
}

/**
 * Change a member's role, atomically syncing ownerUids: promoting to 'owner'
 * adds to ownerUids, demoting to 'member' removes. No-op on the membership if
 * the user has none for this slug (the ownerUids change still applies).
 */
export async function setMemberRole(slug: string, uid: string, role: MemberRole): Promise<void> {
  const userRef = adminDb.collection('users').doc(uid);
  await adminDb.runTransaction(async (tx) => {
    const companyDoc = await companyDocInTx(tx, slug); // read
    if (!companyDoc) throw new Error(`Company not found: ${slug}`);
    const userSnap = await tx.get(userRef); // read

    // Guard inside the tx: demoting the sole owner would leave the company ownerless.
    const ownerUids: string[] = companyDoc.data().ownerUids ?? [];
    if (role === 'member' && isSoleOwner(ownerUids, uid)) throw new LastOwnerError();

    tx.update(companyDoc.ref, {
      ownerUids: role === 'owner' ? FieldValue.arrayUnion(uid) : FieldValue.arrayRemove(uid),
    });
    if (userSnap.exists) {
      const memberships: Membership[] = userSnap.data()?.memberships ?? [];
      const next = memberships.map((m) => (m.slug === slug ? { ...m, role } : m));
      writeMemberships(tx, userRef, next);
    }
  });
}

/** Remove a member: atomically drop the membership AND remove from ownerUids. */
export async function removeMember(slug: string, uid: string): Promise<void> {
  const userRef = adminDb.collection('users').doc(uid);
  await adminDb.runTransaction(async (tx) => {
    const companyDoc = await companyDocInTx(tx, slug); // read
    const userSnap = await tx.get(userRef); // read

    // Guard inside the tx: removing the sole owner would leave the company ownerless.
    const ownerUids: string[] = companyDoc?.data().ownerUids ?? [];
    if (isSoleOwner(ownerUids, uid)) throw new LastOwnerError();

    if (companyDoc) tx.update(companyDoc.ref, { ownerUids: FieldValue.arrayRemove(uid) });
    if (userSnap.exists) {
      const memberships: Membership[] = userSnap.data()?.memberships ?? [];
      const next = memberships.filter((m) => m.slug !== slug);
      writeMemberships(tx, userRef, next);
    }
  });
}
