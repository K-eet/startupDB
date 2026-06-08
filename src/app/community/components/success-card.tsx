'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import type { JoinFormData } from './join-form';

export function SuccessCard({ data, onReset }: { data: JoinFormData | null; onReset: () => void }) {
  const router = useRouter();
  const firstName = data?.name?.split(' ')[0] || 'friend';

  return (
    <div className="border border-border bg-card border-l-[3px] border-l-primary p-7">
      <div className="mb-4 flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground">
        <Check className="h-5 w-5" strokeWidth={2.5} />
      </div>
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        Request received
      </div>
      <h3 className="mb-2.5 text-2xl font-extrabold tracking-tight leading-tight">
        Thanks, {firstName}.<br />You&apos;re on the list.
      </h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        We&apos;ll review your request and send the WhatsApp invite to{' '}
        <strong className="text-foreground">+{data?.areaCode || '60'} {data?.whatsapp || '—'}</strong> within 48 hours.
        Keep an eye on your messages.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={onReset}>
          Submit another
        </Button>
        <Button size="sm" className="gap-1.5" onClick={() => router.push('/')}>
          Browse companies
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
