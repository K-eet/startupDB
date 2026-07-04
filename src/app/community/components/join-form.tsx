'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowRight, MessageCircle } from 'lucide-react';

export type JoinFormData = {
  name: string;
  email: string;
  areaCode: string;
  whatsapp: string;
  org: string;
  role: string;
  working: string;
};

const ROLES = [
  'Founder',
  'Investor / VC',
  'Operator',
  'Engineer / Designer',
  'Student',
  'Journalist / Writer',
  'Other',
];

const emptyData: JoinFormData = { name: '', email: '', areaCode: '60', whatsapp: '', org: '', role: '', working: '' };

export function JoinForm({
  onSubmit,
  submitting = false,
  compact = false,
}: {
  onSubmit: (data: JoinFormData) => void;
  submitting?: boolean;
  compact?: boolean;
}) {
  const [data, setData] = React.useState<JoinFormData>(emptyData);
  const set = (key: keyof JoinFormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [key]: e.target.value }));

  const valid = Boolean(data.name && data.email && data.areaCode && data.whatsapp && data.role) && !submitting;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(data);
      }}
      className="flex flex-col gap-4"
    >
      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-name" className="text-xs uppercase tracking-wide">Name</Label>
          <Input id="join-name" value={data.name} onChange={set('name')} placeholder="Your full name" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-email" className="text-xs uppercase tracking-wide">Email</Label>
          <Input id="join-email" type="email" value={data.email} onChange={set('email')} placeholder="you@company.com" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="join-whatsapp" className="text-xs uppercase tracking-wide">WhatsApp number</Label>
        <div className="flex">
          <span className="inline-flex items-center gap-1.5 rounded-l-md border border-r-0 border-input bg-background pl-3 text-sm font-medium text-muted-foreground">
            <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />
            +
            <Input
              id="join-area-code"
              value={data.areaCode}
              onChange={set('areaCode')}
              placeholder="60"
              aria-label="Area code"
              className="h-auto w-10 border-0 bg-background px-0 text-sm font-medium text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </span>
          <Input
            id="join-whatsapp"
            value={data.whatsapp}
            onChange={set('whatsapp')}
            placeholder="12 345 6789"
            className="rounded-l-none"
          />
        </div>
        <p className="text-xs text-muted-foreground">We&apos;ll send the group invite here.</p>
      </div>

      <div className={`grid gap-4 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between">
            <Label htmlFor="join-org" className="text-xs uppercase tracking-wide">Organisation</Label>
            <span className="text-xs text-muted-foreground">Optional</span>
          </div>
          <Input id="join-org" value={data.org} onChange={set('org')} placeholder="Company or institution" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="join-role" className="text-xs uppercase tracking-wide">Role</Label>
          <Select value={data.role} onValueChange={(v) => setData((d) => ({ ...d, role: v }))}>
            <SelectTrigger id="join-role">
              <SelectValue placeholder="Select your role…" />
            </SelectTrigger>
            <SelectContent>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline justify-between">
          <Label htmlFor="join-working" className="text-xs uppercase tracking-wide">What are you working on?</Label>
          <span className="text-xs text-muted-foreground">Optional</span>
        </div>
        <Textarea
          id="join-working"
          value={data.working}
          onChange={set('working')}
          placeholder="e.g. Building a fintech for SME invoice factoring."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">One line is fine. Helps us know who&apos;s in the room.</p>
      </div>

      <Button type="submit" disabled={!valid} className="mt-1 gap-2">
        {submitting ? 'Submitting…' : 'Request to Join'}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        We review every request manually. Expect an invite within 48 hours.
      </p>
    </form>
  );
}
