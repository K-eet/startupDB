// Pure aggregate maths for the directory dashboard. Kept free of firebase-admin
// (unlike directory-data.ts, which re-exports it) so it runs under node:test.
// .ts extension so `node --test` can resolve this at runtime (moduleResolution
// is "bundler", so TS and webpack both accept it) — same trick the test files use.
import { industryCategories } from './filter-categories.ts';
import type { Company } from '../types/company';

export interface DirectoryStats {
  total: number;
  cities: number;
  sectors: number;
  subSectors: number;
  medianYear: number;
  pctAfterMedian: number;
  /** Per-industry counts, biggest first. */
  bySector: { name: string; count: number; pct: number }[];
}

/**
 * Headline numbers for the dashboard. Pure, so the server can compute them once
 * over the whole corpus and the client can render them without refetching —
 * that's what puts real counts in the crawlable HTML.
 */
export function directoryStats(companies: Company[]): DirectoryStats {
  const cities = new Set(companies.map((c) => c['Headquarters City']).filter(Boolean));

  const years = companies
    .map((c) => Number(c['Founded Year']))
    .filter((y) => y > 1950 && y <= new Date().getFullYear())
    .sort((a, b) => a - b);
  const mid = Math.floor(years.length / 2);
  const medianYear =
    years.length === 0
      ? 0
      : years.length % 2 !== 0
        ? years[mid]
        : Math.round((years[mid - 1] + years[mid]) / 2);
  const pctAfterMedian =
    years.length > 0
      ? Math.round((years.filter((y) => y > medianYear).length / years.length) * 100)
      : 0;

  const bySector = Object.keys(industryCategories)
    .map((name) => {
      const count = companies.filter((c) => c['Industry'] === name).length;
      return {
        name,
        count,
        pct: companies.length > 0 ? Math.round((count / companies.length) * 100) : 0,
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    total: companies.length,
    cities: cities.size,
    sectors: Object.keys(industryCategories).length,
    subSectors: Object.values(industryCategories).flat().length,
    medianYear,
    pctAfterMedian,
    bySector,
  };
}
