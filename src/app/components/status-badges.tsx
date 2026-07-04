import { Crown } from 'lucide-react';
import type { MemberRole } from '@/lib/account-data';

export function RoleBadge({ role }: { role: MemberRole }) {
  const owner = role === 'owner';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide border ${
        owner
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-muted text-muted-foreground border-border'
      }`}
    >
      {owner && <Crown className="h-3 w-3" />}
      {role}
    </span>
  );
}

type PillTone = 'live' | 'pending' | 'review' | 'neutral';

const toneClass: Record<PillTone, { wrap: string; dot: string }> = {
  live: { wrap: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-500' },
  pending: { wrap: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30', dot: 'bg-amber-500' },
  review: { wrap: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30', dot: 'bg-violet-500' },
  neutral: { wrap: 'bg-muted text-muted-foreground border-border', dot: 'bg-muted-foreground' },
};

export function StatusPill({ tone = 'neutral', children }: { tone?: PillTone; children: React.ReactNode }) {
  const t = toneClass[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold border ${t.wrap}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {children}
    </span>
  );
}
