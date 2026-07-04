// Account (/me) domain types shared by the page, org-card, and the useAccount
// hook that maps GET /api/me into these shapes. (Mock seed data removed once the
// screens were wired to the backend.)

export type MemberRole = 'owner' | 'member';

export type OrgMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  you?: boolean;
};

export type PendingMember = {
  id: string;
  name: string;
  email: string;
  requestedAt: string; // ISO
};

export type Org = {
  id: string;
  name: string;
  industry: string;
  city: string;
  role: MemberRole;
  members: OrgMember[];
  pending: PendingMember[];
};

export type Claim = {
  id: string;
  company: string;
  type: 'claim' | 'join';
  status: 'pending';
  submittedAt: string; // ISO
};

// Relative-time helper used across account + admin screens.
export function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
