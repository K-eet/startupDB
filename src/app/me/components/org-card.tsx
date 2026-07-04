'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RoleBadge } from '@/app/components/status-badges';
import { timeAgo, type Org, type OrgMember, type PendingMember } from '@/lib/account-data';
import { Building2, Users, ChevronDown, ChevronUp, Crown, Check, X, MoreVertical, LogOut } from 'lucide-react';

function LogoBox({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <div
      className="flex-shrink-0 border border-border bg-muted flex items-center justify-center font-bold text-foreground"
      style={{ width: size, height: size }}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function MemberRow({
  member,
  onPromote,
  onRemove,
}: {
  member: OrgMember;
  onPromote: (m: OrgMember) => void;
  onRemove: (m: OrgMember) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="text-xs font-bold">{member.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold flex items-center gap-2">
          {member.name}
          {member.you && (
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground border border-border px-1.5 py-px">
              You
            </span>
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">{member.email}</div>
      </div>
      <RoleBadge role={member.role} />
      {!member.you && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Manage member">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {member.role === 'member' && (
              <DropdownMenuItem onClick={() => onPromote(member)}>
                <Crown />
                Promote to owner
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onRemove(member)} className="text-destructive focus:text-destructive">
              <LogOut />
              Remove from company
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

export function OrgCard({
  org,
  onApprove,
  onReject,
  onPromote,
  onRemove,
}: {
  org: Org;
  onApprove: (org: Org, p: PendingMember) => void;
  onReject: (org: Org, p: PendingMember) => void;
  onPromote: (org: Org, m: OrgMember) => void;
  onRemove: (org: Org, m: OrgMember) => void;
}) {
  const isOwner = org.role === 'owner';
  const [expanded, setExpanded] = React.useState(isOwner);
  const pendingCount = org.pending.length;

  return (
    <div className="border border-border bg-card">
      <div className="flex items-center gap-3.5 p-4">
        <LogoBox name={org.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-base font-bold tracking-tight">{org.name}</span>
            <RoleBadge role={org.role} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30">
              {org.industry}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-semibold border bg-muted text-muted-foreground border-border">
              {org.city}
            </span>
          </div>
        </div>
        {isOwner && (
          <Button variant="outline" size="sm" onClick={() => setExpanded((v) => !v)}>
            <Users className="h-4 w-4" />
            {org.members.length} member{org.members.length !== 1 ? 's' : ''}
            {pendingCount > 0 && (
              <span className="bg-primary text-primary-foreground text-[11px] font-bold px-1.5">{pendingCount}</span>
            )}
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {isOwner && expanded && (
        <div className="border-t border-border p-4 bg-secondary/40">
          {pendingCount > 0 && (
            <div className="mb-5">
              <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Pending join requests · {pendingCount}
              </p>
              <div className="space-y-2">
                {org.pending.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 border border-border bg-card">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-bold">{p.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{p.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {p.email} · asked {timeAgo(p.requestedAt)}
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button variant="outline" size="sm" className="text-emerald-600" onClick={() => onApprove(org, p)}>
                        <Check className="h-4 w-4" />
                        Approve
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive" onClick={() => onReject(org, p)}>
                        <X className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Members · {org.members.length}
          </p>
          <div className="divide-y divide-border">
            {org.members.map((m) => (
              <MemberRow
                key={m.id}
                member={m}
                onPromote={(mm) => onPromote(org, mm)}
                onRemove={(mm) => onRemove(org, mm)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
