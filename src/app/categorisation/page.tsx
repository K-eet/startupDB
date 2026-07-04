'use client';

import * as React from 'react';
import Link from 'next/link';
import { Building2, Target, Plus, Equal } from 'lucide-react';
import { AppShell } from '@/app/components/app-shell';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { industryCategories } from '@/lib/filter-categories';
import { RequestModal } from '@/app/components/request-modal';

// Sector counts/percentages are sourced from the design figures (they sum to the
// 2,462-company total). Sub-sector lists are pulled live from the real taxonomy in
// filter-categories.ts so the page stays in sync with the directory's filters.
type Sector = {
  name: keyof typeof industryCategories;
  emoji: string;
  tile: string;
  count: number;
  pct: number;
};

const SECTORS: Sector[] = [
  { name: 'B2B', emoji: '💼', tile: 'bg-amber-100 dark:bg-amber-900/30', count: 795, pct: 32 },
  { name: 'Consumer', emoji: '🛍️', tile: 'bg-emerald-100 dark:bg-emerald-900/30', count: 517, pct: 21 },
  { name: 'Industrials', emoji: '🏭', tile: 'bg-indigo-100 dark:bg-indigo-900/30', count: 388, pct: 16 },
  { name: 'FinTech', emoji: '💳', tile: 'bg-blue-100 dark:bg-blue-900/30', count: 188, pct: 8 },
  { name: 'Healthcare', emoji: '🏥', tile: 'bg-red-100 dark:bg-red-900/30', count: 182, pct: 7 },
  { name: 'Education', emoji: '🎓', tile: 'bg-violet-100 dark:bg-violet-900/30', count: 159, pct: 6 },
  { name: 'Real Estate & Construction', emoji: '🏗️', tile: 'bg-orange-100 dark:bg-orange-900/30', count: 132, pct: 5 },
  { name: 'General Technology', emoji: '💻', tile: 'bg-sky-100 dark:bg-sky-900/30', count: 90, pct: 4 },
  { name: 'GovTech', emoji: '🏛️', tile: 'bg-muted', count: 11, pct: 0 },
];

// Company types use the real archetype names from filter-categories.ts.
const TYPES: { name: string; count: number; desc: string; tells: string[] }[] = [
  {
    name: 'Product-Led Startup/Scaleup',
    count: 1702,
    desc: 'Builds and owns a proprietary technology product or platform. Typically venture-backed and scaling a single repeatable product to many customers.',
    tells: ['Owns its core IP and roadmap', 'Sells the same product at scale', 'Revenue from subscriptions or usage'],
  },
  {
    name: 'Solution Provider / Systems Integrator',
    count: 645,
    desc: "Designs, integrates and implements technology solutions — often combining third-party platforms with their own work — to solve a client's problem end to end.",
    tells: ['Delivers tailored implementations', 'Mixes own and partner technology', 'Project- and retainer-based revenue'],
  },
  {
    name: 'Custom Software Developer',
    count: 94,
    desc: 'Builds bespoke software to order, on a project or contract basis, for individual clients rather than productising a single offering.',
    tells: ['Work is built per-client', 'Client owns the deliverable', 'Billed by project or engagement'],
  },
  {
    name: 'ICT Partner & Reseller',
    count: 21,
    desc: 'Distributes, resells, or provides channel and partner services for established technology vendors, handling supply, licensing, and local support.',
    tells: ['Represents external vendors', 'Revenue from resale & margin', 'Provides local supply & support'],
  },
];

const TOC = [
  { id: 'dimensions', label: 'Two dimensions' },
  { id: 'sectors', label: 'Industry sectors' },
  { id: 'types', label: 'Company types' },
  { id: 'method', label: "How it's assigned" },
  { id: 'faq', label: 'Questions' },
];

const FAQ = [
  {
    q: "Why does my company profile not have a profile picture?",
    a: "Only claimed profiles can upload a profile picture. If you own this company, claim the profile to add one and keep your listing up to date.",
  },
  {
    q: 'What if a company fits more than one sector?',
    a: "It happens often. We assign the single sector that best reflects the company's primary product and where most of its revenue comes from. This keeps every company counted exactly once and the totals meaningful.",
  },
  {
    q: 'Is "General Technology" a catch-all?',
    a: 'Not quite. It is reserved for companies whose core offering is technology itself — AI, hardware, cloud, telecoms — rather than technology applied to a specific industry like health or finance. If a company clearly serves one vertical, it goes there instead.',
  },
  {
    q: 'How is "company type" different from sector?',
    a: 'Sector is about the market served; type is about the business model. A product-led FinTech and a FinTech systems integrator share a sector but are very different companies — the type dimension makes that distinction visible.',
  },
  {
    q: "The numbers don't quite add to 100%. Why?",
    a: 'Sector shares are rounded to whole percentages for readability, so they may total 99% or 101%. The underlying company counts are exact.',
  },
  {
    q: 'I think a company is in the wrong category.',
    a: "We only entertain claim requests from verified company insiders. If you are one, claim the profile and you can request a recategorisation with evidence to support the change.",
  },
];

const fmt = (n: number) => n.toLocaleString('en-US');

const kicker = 'text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground/70';
const card = 'border border-border bg-card';

export default function CategorisationPage() {
  const [addOpen, setAddOpen] = React.useState(false);
  return (
    <AppShell pageName="" activeTab="startups" onTabChange={() => {}} hideTitle>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Directory
        </Link>
        <span className="text-border">/</span>
        <span>How we categorise companies</span>
      </nav>

      <div className="grid grid-cols-1 gap-12 pb-20 pt-7 lg:grid-cols-[220px_1fr]">
        {/* TOC */}
        <aside className="hidden self-start lg:sticky lg:top-24 lg:block">
          <div className="mb-3.5 text-[11px] font-bold uppercase tracking-[0.09em] text-muted-foreground/60">
            On this page
          </div>
          <ol className="m-0 list-none p-0">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="-ml-px flex gap-2.5 border-l-2 border-border py-1.5 pl-3.5 text-[13px] text-muted-foreground transition-colors hover:border-border/80 hover:text-foreground"
                >
                  <span className="font-semibold tabular-nums text-muted-foreground/60">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        {/* Content */}
        <main>
          {/* Hero */}
          <div className={`${kicker} mb-3.5 flex items-center gap-2.5`}>
            <span className="inline-block h-[7px] w-[7px] bg-primary" />
            Methodology
          </div>
          <h1 className="m-0 mb-4 max-w-[16em] text-3xl font-extrabold leading-[1.08] tracking-tight md:text-[38px]">
            How we categorise technology companies
          </h1>
          <p className="m-0 max-w-[60ch] text-[17px] leading-[1.65] text-muted-foreground">
            Every company in the directory is filed along{' '}
            <strong className="font-semibold text-foreground">two independent dimensions</strong> — the
            market it serves and the way it builds and delivers technology. Together they make 2,462
            companies comparable, filterable, and easy to navigate. Here&apos;s exactly how the system
            works.
          </p>

          {/* Dimensions */}
          <section id="dimensions" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <div className={`${kicker} mb-1.5`}>The framework</div>
              <h2 className="m-0 mb-2 text-2xl font-extrabold tracking-tight">Two dimensions, not one</h2>
              <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.6] text-muted-foreground">
                A payments startup and a payments consultancy both work in FinTech — but they are very
                different businesses. Splitting <em>what</em> a company does from <em>how</em> it operates
                keeps the directory honest.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2">
              <div className={`${card} relative p-6`}>
                <span className={`${kicker} absolute right-5 top-5`}>Dimension 1</span>
                <h3 className="m-0 mb-1.5 text-[17px] font-bold tracking-tight">Industry sector</h3>
                <div className="mb-3 text-xs font-semibold text-primary">The market — what they do</div>
                <p className="m-0 mb-4 text-[13.5px] leading-[1.6] text-muted-foreground">
                  The primary industry and customer base a company serves. Each company sits in exactly
                  one of 9 sectors, then one of 66 finer sub-sectors.
                </p>
                <div className={`${kicker} mb-2 text-muted-foreground/60`}>Example</div>
                <span className="inline-flex items-center gap-1.5 border border-border bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  B2B <span className="text-red-400">›</span> Infrastructure
                </span>
              </div>

              <div className={`${card} relative p-6`}>
                <span className={`${kicker} absolute right-5 top-5`}>Dimension 2</span>
                <h3 className="m-0 mb-1.5 text-[17px] font-bold tracking-tight">Company type</h3>
                <div className="mb-3 text-xs font-semibold text-primary">The model — how they build</div>
                <p className="m-0 mb-4 text-[13.5px] leading-[1.6] text-muted-foreground">
                  How the company creates and delivers its technology — whether it owns a product,
                  integrates others&apos;, or works to order. One of 4 types.
                </p>
                <div className={`${kicker} mb-2 text-muted-foreground/60`}>Example</div>
                <span className="inline-flex items-center border border-border bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  Solution Provider / Systems Integrator
                </span>
              </div>
            </div>

            {/* Intersect */}
            <div className={`${card} mt-3.5 flex flex-wrap items-center gap-5 border-t-[3px] border-t-primary px-6 py-5`}>
              <div className="flex items-center gap-3">
                <div className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center border border-border bg-muted text-muted-foreground">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="text-sm font-bold tracking-tight">10 Infinity</div>
              </div>
              <Equal className="h-4 w-4 text-border" />
              <span className="inline-flex items-center gap-1.5 border border-border bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-300">
                B2B <span className="text-red-400">›</span> Infrastructure
              </span>
              <Plus className="h-3.5 w-3.5 text-border" />
              <span className="inline-flex items-center border border-border bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                Solution Provider / Systems Integrator
              </span>
              <span className="ml-auto text-[13px] text-muted-foreground">
                <b className="font-bold text-foreground">One sector</b> &times;{' '}
                <b className="font-bold text-foreground">one type</b> = a precise, filterable position
              </span>
            </div>
          </section>

          {/* Sectors */}
          <section id="sectors" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <div className={`${kicker} mb-1.5`}>Dimension 1 · 9 sectors, 66 sub-sectors</div>
              <h2 className="m-0 mb-2 text-2xl font-extrabold tracking-tight">Industry sectors</h2>
              <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.6] text-muted-foreground">
                Sectors are ordered by share of the directory. A company is placed by its{' '}
                <strong className="font-semibold text-foreground">primary</strong> market — where most of
                its revenue and product focus sits — then narrowed to a single sub-sector.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {SECTORS.map((s) => {
                const subs = industryCategories[s.name];
                return (
                  <div key={s.name} className={`${card} px-5 py-[18px]`}>
                    <div className="mb-3.5 flex items-center gap-3">
                      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center text-xl ${s.tile}`}>
                        {s.emoji}
                      </div>
                      <div>
                        <div className="text-[15px] font-bold tracking-tight">{s.name}</div>
                        <div className="mt-px text-xs text-muted-foreground">
                          <b className="font-semibold text-foreground">{fmt(s.count)}</b> companies ·{' '}
                          {subs.length} sub-sectors
                        </div>
                      </div>
                      <div className="ml-auto text-[22px] font-extrabold tabular-nums tracking-tight">
                        {s.pct}
                        <span className="text-[13px] font-semibold text-muted-foreground/60">%</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {subs.map((sub) => (
                        <span
                          key={sub}
                          className="border border-border bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={`${card} mt-3.5 flex items-start gap-3.5 px-5 py-4`}>
              <Target className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
              <p className="m-0 text-[13px] leading-[1.6] text-muted-foreground">
                <b className="font-semibold text-foreground">Why one sector each?</b> Many companies could
                plausibly sit in two or three sectors. We assign the single dominant one so that counts add
                up, filters stay clean, and no company is double-counted across the ecosystem.
              </p>
            </div>
          </section>

          {/* Types */}
          <section id="types" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <div className={`${kicker} mb-1.5`}>Dimension 2 · 4 types</div>
              <h2 className="m-0 mb-2 text-2xl font-extrabold tracking-tight">Company types</h2>
              <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.6] text-muted-foreground">
                The second axis captures the business model — how a company actually builds and ships
                technology. This is what separates a product company from a services one, regardless of
                sector.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {TYPES.map((t) => (
                <div key={t.name} className={`${card} flex flex-col p-[22px]`}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <h3 className="m-0 text-base font-bold tracking-tight">{t.name}</h3>
                    <div className="flex-shrink-0 text-[13px] font-bold tabular-nums">
                      {fmt(t.count)} <span className="text-[11px] font-medium text-muted-foreground/60">cos</span>
                    </div>
                  </div>
                  <p className="m-0 mb-4 mt-1.5 text-[13.5px] leading-[1.6] text-muted-foreground">{t.desc}</p>
                  <div className="mt-auto border-t border-border pt-3">
                    <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground/60">
                      How to spot one
                    </div>
                    {t.tells.map((tell) => (
                      <div key={tell} className="flex gap-2 py-0.5 text-[12.5px] text-foreground/80">
                        <span className="mt-[7px] h-[5px] w-[5px] flex-shrink-0 bg-primary" />
                        {tell}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Method */}
          <section id="method" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <div className={`${kicker} mb-1.5`}>The process</div>
              <h2 className="m-0 mb-2 text-2xl font-extrabold tracking-tight">How a company gets classified</h2>
              <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.6] text-muted-foreground">
                Each listing is reviewed against three questions, in order. The result is one sector, one
                sub-sector, and one type per company.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {[
                { n: 1, h: 'Find the sector', p: 'What market and customers does the company primarily serve? This answers the what and sets one of the 9 sectors.' },
                { n: 2, h: 'Pin the sub-sector', p: 'Within that sector, which of the finer categories best describes the core product or service? One of 66.' },
                { n: 3, h: 'Set the type', p: 'How does the company build and deliver — owned product, integration, custom build, or reseller? This answers the how.' },
              ].map((step) => (
                <div key={step.n} className={`${card} p-[22px]`}>
                  <div className="mb-3.5 flex h-[26px] w-[26px] items-center justify-center bg-primary text-[13px] font-extrabold tabular-nums text-primary-foreground">
                    {step.n}
                  </div>
                  <h3 className="m-0 mb-1.5 text-[14.5px] font-bold tracking-tight">{step.h}</h3>
                  <p className="m-0 text-[13px] leading-[1.6] text-muted-foreground">{step.p}</p>
                </div>
              ))}
            </div>

            <div className={`${card} mt-3 px-[22px] py-1`}>
              {[
                { k: 'Multi-market', p: 'Companies operating across several markets are filed under their dominant revenue line — not split into multiple listings.' },
                { k: 'Tech-first only', p: 'A company must build, deliver, or fundamentally run on technology to be listed. Pure offline businesses are excluded.' },
                { k: 'Continuously reviewed', p: 'Categories and counts update as companies are added, claim their profiles, or change focus. The numbers here are live.' },
              ].map((rule, i, arr) => (
                <div
                  key={rule.k}
                  className={`flex gap-3.5 py-3.5 ${i < arr.length - 1 ? 'border-b border-border' : ''}`}
                >
                  <div className="w-[150px] flex-shrink-0 pt-px text-xs font-bold uppercase tracking-[0.04em] text-primary">
                    {rule.k}
                  </div>
                  <p className="m-0 text-[13.5px] leading-[1.6] text-foreground/80">{rule.p}</p>
                </div>
              ))}
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 pt-14">
            <div className="mb-5">
              <div className={`${kicker} mb-1.5`}>Good to know</div>
              <h2 className="m-0 text-2xl font-extrabold tracking-tight">Common questions</h2>
            </div>
            <Accordion type="single" collapsible defaultValue="faq-0" className={`${card}`}>
              {FAQ.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="border-border px-5 last:border-b-0">
                  <AccordionTrigger className="text-left text-[14.5px] font-semibold hover:no-underline">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted-foreground">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>

          {/* CTA */}
          <div className="mt-14 flex flex-wrap items-center justify-between gap-6 bg-foreground px-8 py-9 text-background">
            <div>
              <h3 className="m-0 mb-1.5 text-xl font-bold tracking-tight">Missing from the directory?</h3>
              <p className="m-0 max-w-[46ch] text-sm text-background/70">
                Help keep the directory complete — add a company we&apos;ve missed.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2.5">
              <Button className="rounded-none" onClick={() => setAddOpen(true)}>
                Add a company
              </Button>
            </div>
          </div>
        </main>
      </div>

      <RequestModal mode="add" open={addOpen} onOpenChange={setAddOpen} />
    </AppShell>
  );
}
