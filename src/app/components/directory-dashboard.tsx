'use client';

import type { DirectoryStats } from '@/lib/directory-stats';

const SECTOR_META: Record<string, { icon: string; bg: string }> = {
  'B2B':                      { icon: '💼', bg: 'bg-[#E6F1FB] dark:bg-blue-950/60' },
  'Consumer':                 { icon: '🛍️', bg: 'bg-[#EAF3DE] dark:bg-green-950/60' },
  'Industrials':              { icon: '🏭', bg: 'bg-[#F1EFE8] dark:bg-stone-800/60' },
  'FinTech':                  { icon: '💳', bg: 'bg-[#FAEEDA] dark:bg-yellow-950/60' },
  'Healthcare':               { icon: '🏥', bg: 'bg-[#FAECE7] dark:bg-red-950/60' },
  'Education':                { icon: '🎓', bg: 'bg-[#EEEDFE] dark:bg-violet-950/60' },
  'Real Estate & Construction': { icon: '🏗️', bg: 'bg-[#FBEAF0] dark:bg-pink-950/60' },
  'GovTech':                  { icon: '🏛️', bg: 'bg-[#E1F5EE] dark:bg-emerald-950/60' },
  'General Technology':       { icon: '💻', bg: 'bg-[#E8F4F8] dark:bg-cyan-950/60' },
};

interface DirectoryDashboardProps {
  /** Computed server-side over the whole corpus (see lib/directory-data.ts), so
      these numbers are in the crawlable HTML rather than filled in after hydration. */
  stats: DirectoryStats;
  onSectorClick: (industry: string) => void;
}

export function DirectoryDashboard({ stats, onSectorClick }: DirectoryDashboardProps) {
  const sectors = stats.bySector;

  return (
    <div className="mb-6 space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-muted/50 rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Companies listed</p>
          <p className="text-3xl font-medium">{stats.total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">tech companies across Malaysia</p>
        </div>
        <div className="bg-muted/50 rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Geographic reach</p>
          <p className="text-3xl font-medium">{stats.cities.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">cities &amp; towns across <span className="font-medium text-foreground">13 states</span> + KL, Putrajaya &amp; Labuan</p>
        </div>
        <div className="bg-muted/50 rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Sectors covered</p>
          <p className="text-3xl font-medium">{stats.sectors}</p>
          <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">{stats.subSectors} sub-sectors</span> across all industries</p>
        </div>
        <div className="bg-muted/50 rounded-md p-4">
          <p className="text-xs text-muted-foreground mb-1">Median founding year</p>
          <p className="text-3xl font-medium">{stats.medianYear}</p>
          <p className="text-xs text-muted-foreground mt-1"><span className="font-medium text-foreground">{stats.pctAfterMedian}% of companies</span> founded after {stats.medianYear}</p>
        </div>
      </div>

      {/* Sector grid */}
      <div>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-sm font-medium">Browse by sector</span>
          <span className="text-xs text-muted-foreground">Click any sector to filter</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
          {sectors.map(({ name, count, pct }) => {
            const meta = SECTOR_META[name] ?? { icon: '🏢', bg: 'bg-muted' };
            return (
              <button
                key={name}
                onClick={() => onSectorClick(name)}
                className="text-left border border-border rounded-md p-3 hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`w-8 h-8 rounded-md ${meta.bg} flex items-center justify-center text-base`}>
                    {meta.icon}
                  </div>
                  <span className="text-lg font-medium text-muted-foreground">{pct}%</span>
                </div>
                <p className="text-sm font-medium leading-tight group-hover:text-primary transition-colors">{name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{count.toLocaleString()} companies</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
