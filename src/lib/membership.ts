// Pure membership types + decision helpers. NO firebase imports — kept
// dependency-free so it imports cleanly under `node --test` (see membership.test.ts).
// Firestore reads/writes live in membership-db.ts.

export type MemberRole = 'owner' | 'member';

export interface Membership {
  slug: string;
  name: string; // company name snapshot, for display
  role: MemberRole;
}

/** A user is "affiliated" (can post events instantly) if they hold any membership. */
export function isAffiliated(memberships: Membership[]): boolean {
  return memberships.length > 0;
}

/** The caller's membership on a given company slug, if any. */
export function membershipFor(memberships: Membership[], slug: string): Membership | undefined {
  return memberships.find((m) => m.slug === slug);
}

/**
 * Whether the caller may post an event *as* the given company. Requires an
 * approved membership (owner or member) on that slug — enforced server-side so
 * a client can't spoof `companySlug`.
 */
export function canPostAsCompany(memberships: Membership[], slug: string): boolean {
  return membershipFor(memberships, slug) !== undefined;
}

/** Whether the caller is an owner of the given company (can approve joins, manage members). */
export function isOwnerOf(memberships: Membership[], slug: string): boolean {
  return membershipFor(memberships, slug)?.role === 'owner';
}

/**
 * True if `uid` is the only owner in `ownerUids` — used inside the membership
 * transaction to block demoting/removing the last owner (a company must always
 * keep at least one).
 */
export function isSoleOwner(ownerUids: string[], uid: string): boolean {
  return ownerUids.length === 1 && ownerUids[0] === uid;
}
