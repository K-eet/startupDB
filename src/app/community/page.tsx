'use client';

import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { useToast } from '@/hooks/use-toast';
import {
  Check,
  Zap,
  Network,
  CalendarDays,
  Filter,
  Rocket,
  DollarSign,
  Settings,
  Sparkles,
} from 'lucide-react';
import { JoinForm, type JoinFormData } from './components/join-form';
import { SuccessCard } from './components/success-card';

const WHY_SIGN_UP = [
  'Funding rounds & launches as they happen',
  'Curated room of builders, not lurkers',
  'First dibs on meetups and closed-door dinners',
  'Strict no-spam. Manually moderated.',
];

const BENEFITS = [
  { icon: Zap, title: 'Real-time deals & news', body: 'Funding rounds, launches, and hiring as they happen.' },
  { icon: Network, title: 'Curated network', body: 'Founders, operators, and investors building Malaysian tech.' },
  { icon: CalendarDays, title: 'Event drops', body: 'First dibs on meetups, demo days, and closed-door dinners.' },
  { icon: Filter, title: 'Low noise, high signal', body: 'Strict no-spam policy. Manually moderated daily.' },
];

const AUDIENCE = [
  { icon: Rocket, title: 'Founders', body: 'Find co-founders, share lessons, get feedback on your build.' },
  { icon: DollarSign, title: 'Investors', body: 'See early deal flow before it hits LinkedIn or pitch decks.' },
  { icon: Settings, title: 'Operators', body: 'PMs, engineers, designers shipping at Malaysian startups.' },
  { icon: Sparkles, title: 'Enthusiasts', body: 'Students, journalists, and anyone curious about the ecosystem.' },
];

const HEADLINE = 'Join the Malaysian Tech Community.';
const SUBCOPY = "A curated WhatsApp group for founders, investors, and operators building Malaysia's startup ecosystem.";

function HouseRules() {
  return (
    <section className="border border-border bg-card p-5">
      <div className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">House rules</div>
      <p className="mb-4 text-sm font-medium leading-relaxed">
        No promo. No DMs without consent. No screenshots out. Just builders helping builders.
      </p>
      <div className="flex border-t border-border pt-3">
        <div className="flex-1">
          <div className="text-lg font-extrabold tracking-tight tabular-nums">428</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Members</div>
        </div>
        <div className="w-px bg-border" />
        <div className="flex-1 pl-4">
          <div className="text-lg font-extrabold tracking-tight tabular-nums">&lt;48h</div>
          <div className="mt-0.5 text-xs text-muted-foreground">Avg. review</div>
        </div>
      </div>
    </section>
  );
}

function AudienceGrid({ columns = 'grid-cols-2' }: { columns?: string }) {
  return (
    <div className={`grid ${columns} gap-3`}>
      {AUDIENCE.map((a) => (
        <div key={a.title} className="border border-border bg-card p-4">
          <div className="mb-2.5 flex h-7 w-7 items-center justify-center bg-muted">
            <a.icon className="h-3.5 w-3.5" />
          </div>
          <h3 className="mb-0.5 text-sm font-bold tracking-tight">{a.title}</h3>
          <p className="text-xs leading-relaxed text-muted-foreground">{a.body}</p>
        </div>
      ))}
    </div>
  );
}

function JoinPanel({
  submitted,
  submitting,
  data,
  onSubmit,
  onReset,
  compact,
}: {
  submitted: boolean;
  submitting: boolean;
  data: JoinFormData | null;
  onSubmit: (d: JoinFormData) => void;
  onReset: () => void;
  compact?: boolean;
}) {
  if (submitted) return <SuccessCard data={data} onReset={onReset} />;

  return (
    <div className="border border-t-[3px] border-border border-t-primary bg-card p-5">
      <div className="mb-4">
        <div className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">Request access</div>
        <h2 className="text-lg font-extrabold tracking-tight">Tell us who you are</h2>
      </div>
      <JoinForm onSubmit={onSubmit} submitting={submitting} compact={compact} />
    </div>
  );
}

export default function CommunityPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [data, setData] = React.useState<JoinFormData | null>(null);

  const handleSubmit = async (d: JoinFormData) => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/community/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(d),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Something went wrong. Please try again.');
      }

      setData(d);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast({
        title: 'Could not submit your request',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };
  const handleReset = () => {
    setSubmitted(false);
    setData(null);
  };

  return (
    <AppShell
      pageName="Community"
      description="A curated, manually-moderated WhatsApp group for Malaysia's startup ecosystem."
      activeTab="startups"
      onTabChange={() => {}}
      hideHeaderActionsOnDesktop
    >
      {/* ───────── Mobile layout ───────── */}
      <div className="lg:hidden">
        <section className="mb-6">
          <h1 className="mb-2.5 text-3xl font-extrabold leading-tight tracking-tight">{HEADLINE}</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">{SUBCOPY}</p>
        </section>

        <section className="mb-6 border border-border border-l-[3px] border-l-primary bg-card p-4">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Why sign up</div>
          <div className="flex flex-col gap-1.5">
            {WHY_SIGN_UP.map((line) => (
              <div key={line} className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center bg-primary text-primary-foreground">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </div>
                <div className="text-sm leading-snug">{line}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8">
          <JoinPanel submitted={submitted} submitting={submitting} data={data} onSubmit={handleSubmit} onReset={handleReset} compact />
        </section>

        <section className="mb-7">
          <div className="mb-3.5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">More</span>
            <div className="h-px flex-1 bg-border" />
            <h2 className="text-xs font-bold uppercase tracking-wide">Who&apos;s inside</h2>
          </div>
          <AudienceGrid columns="grid-cols-2" />
        </section>

        <HouseRules />
      </div>

      {/* ───────── Desktop layout ───────── */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_460px] lg:items-start lg:gap-10">
        <div>
          <section className="mb-10 max-w-xl">
            <h1 className="mb-4 text-5xl font-extrabold leading-[1.05] tracking-tight">{HEADLINE}</h1>
            <p className="text-base leading-relaxed text-muted-foreground">{SUBCOPY}</p>
          </section>

          <section className="mb-10">
            <div className="mb-4 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Why sign up</div>
            <div className="grid grid-cols-2 gap-3">
              {BENEFITS.map((b) => (
                <div key={b.title} className="border border-border bg-card p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center bg-muted">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <h3 className="mb-1 text-sm font-bold tracking-tight">{b.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">{b.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <div className="mb-3.5 flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">More</span>
              <div className="h-px flex-1 bg-border" />
              <h2 className="text-xs font-bold uppercase tracking-wide">Who&apos;s inside</h2>
            </div>
            <AudienceGrid columns="grid-cols-4" />
          </section>

          <HouseRules />
        </div>

        <div className="sticky top-0 flex min-h-screen flex-col justify-center py-10">
          <JoinPanel submitted={submitted} submitting={submitting} data={data} onSubmit={handleSubmit} onReset={handleReset} />
        </div>
      </div>
    </AppShell>
  );
}
