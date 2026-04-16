'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Company } from '@/types/company';
import { Input } from '@/components/ui/input';
import { Pencil, Search, ChevronDown, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { industryCategories, archetypes } from '@/lib/filter-categories';

interface CompanyListProps {
  companies: Company[];
  loading: boolean;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CompanyList({ companies, loading }: CompanyListProps) {
  const [search, setSearch] = useState('');
  const [letterFilter, setLetterFilter] = useState<string | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState<string | null>(null);

  const [industryOpen, setIndustryOpen] = useState(true);
  const [subIndustryOpen, setSubIndustryOpen] = useState(true);
  const [companyTypeOpen, setCompanyTypeOpen] = useState(true);

  // All filters except letter — used for A-Z bar counts
  const withoutLetter = companies.filter((c) => {
    const name = c['Company Name'] ?? '';
    if (!name.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedIndustry && c['Industry'] !== selectedIndustry) return false;
    if (selectedSubIndustry && c['Sub-Industry'] !== selectedSubIndustry) return false;
    if (selectedCompanyType && c['Company Type'] !== selectedCompanyType) return false;
    return true;
  });

  const lettersWithData = new Set(
    withoutLetter.map((c) => (c['Company Name']?.[0] ?? '').toUpperCase()).filter((l) => /[A-Z]/.test(l))
  );

  // Base filter: search + letter (used for pane counts)
  const baseFiltered = withoutLetter.filter((c) =>
    !letterFilter || (c['Company Name']?.[0] ?? '').toUpperCase() === letterFilter
  );

  const afterIndustry = selectedIndustry
    ? baseFiltered.filter((c) => c['Industry'] === selectedIndustry)
    : baseFiltered;

  const afterSubIndustry = selectedSubIndustry
    ? afterIndustry.filter((c) => c['Sub-Industry'] === selectedSubIndustry)
    : afterIndustry;

  const filtered = selectedCompanyType
    ? afterSubIndustry.filter((c) => c['Company Type'] === selectedCompanyType)
    : afterSubIndustry;

  const subIndustries = selectedIndustry ? (industryCategories[selectedIndustry] ?? []) : [];

  const handleIndustryClick = (industry: string) => {
    setSelectedIndustry(selectedIndustry === industry ? null : industry);
    setSelectedSubIndustry(null);
    setSelectedCompanyType(null);
  };

  const handleSubIndustryClick = (sub: string) => {
    setSelectedSubIndustry(selectedSubIndustry === sub ? null : sub);
    setSelectedCompanyType(null);
  };

  const handleCompanyTypeClick = (type: string) => {
    setSelectedCompanyType(selectedCompanyType === type ? null : type);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  const paneHeader = (
    label: string,
    isOpen: boolean,
    onToggle: () => void
  ) => (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors w-full text-left flex-shrink-0"
    >
      {isOpen
        ? <ChevronDown className="h-3 w-3 flex-shrink-0" />
        : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
      {isOpen && <span className="truncate">{label}</span>}
    </button>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* A-Z index */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setLetterFilter(null)}
          className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
            letterFilter === null
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {LETTERS.map((letter) => {
          const hasData = lettersWithData.has(letter);
          return (
            <button
              key={letter}
              onClick={() => setLetterFilter(letterFilter === letter ? null : letter)}
              disabled={!hasData}
              className={`px-2 py-0.5 text-xs font-medium rounded transition-colors ${
                letterFilter === letter
                  ? 'bg-primary text-primary-foreground'
                  : hasData
                  ? 'text-foreground hover:bg-muted'
                  : 'text-muted-foreground/40 cursor-default'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Column browser */}
      <div className="flex border border-border rounded-md overflow-hidden h-[calc(100vh-280px)] min-h-[400px]">

        {/* Industry pane */}
        <div className={`flex flex-col border-r border-border flex-shrink-0 ${industryOpen ? 'w-48' : 'w-9'}`}>
          {paneHeader('Industry', industryOpen, () => setIndustryOpen(!industryOpen))}
          {industryOpen && (
            <div className="overflow-y-auto flex-1">
              {Object.keys(industryCategories).map((industry) => {
                const count = baseFiltered.filter((c) => c['Industry'] === industry).length;
                const isSelected = selectedIndustry === industry;
                return (
                  <button
                    key={industry}
                    onClick={() => handleIndustryClick(industry)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors border-l-2 ${
                      isSelected
                        ? 'bg-primary/10 border-l-primary font-medium'
                        : 'border-l-transparent hover:bg-muted'
                    } ${count === 0 ? 'opacity-40' : ''}`}
                  >
                    <span className="truncate">{industry}</span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sub-Industry pane */}
        <div className={`flex flex-col border-r border-border flex-shrink-0 ${subIndustryOpen ? 'w-56' : 'w-9'}`}>
          {paneHeader(
            selectedIndustry ?? 'Sub-Industry',
            subIndustryOpen,
            () => setSubIndustryOpen(!subIndustryOpen)
          )}
          {subIndustryOpen && (
            <div className="overflow-y-auto flex-1">
              {!selectedIndustry ? (
                <p className="px-3 py-3 text-xs text-muted-foreground italic">Select an industry</p>
              ) : subIndustries.length === 0 ? (
                <p className="px-3 py-3 text-xs text-muted-foreground italic">No sub-industries</p>
              ) : (
                subIndustries.map((sub) => {
                  const count = afterIndustry.filter((c) => c['Sub-Industry'] === sub).length;
                  const isSelected = selectedSubIndustry === sub;
                  return (
                    <button
                      key={sub}
                      onClick={() => handleSubIndustryClick(sub)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors border-l-2 ${
                        isSelected
                          ? 'bg-primary/10 border-l-primary font-medium'
                          : 'border-l-transparent hover:bg-muted'
                      } ${count === 0 ? 'opacity-40' : ''}`}
                    >
                      <span className="truncate">{sub}</span>
                      <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{count}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Company Type pane */}
        <div className={`flex flex-col border-r border-border flex-shrink-0 ${companyTypeOpen ? 'w-56' : 'w-9'}`}>
          {paneHeader('Company Type', companyTypeOpen, () => setCompanyTypeOpen(!companyTypeOpen))}
          {companyTypeOpen && (
            <div className="overflow-y-auto flex-1">
              {archetypes.map((type) => {
                const count = afterSubIndustry.filter((c) => c['Company Type'] === type).length;
                const isSelected = selectedCompanyType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleCompanyTypeClick(type)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors border-l-2 ${
                      isSelected
                        ? 'bg-primary/10 border-l-primary font-medium'
                        : 'border-l-transparent hover:bg-muted'
                    } ${count === 0 ? 'opacity-40' : ''}`}
                  >
                    <span className="truncate">{type}</span>
                    <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">{count}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Companies pane — fills remaining space */}
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b border-border flex-shrink-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Companies
            </span>
            <span className="text-xs text-muted-foreground">{filtered.length}</span>
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-3 text-xs text-muted-foreground italic">No companies match.</p>
            ) : (
              filtered
                .slice()
                .sort((a, b) => (a['Company Name'] ?? '').localeCompare(b['Company Name'] ?? ''))
                .map((company) => (
                  <Link
                    key={company.Slug}
                    href={`/admin/companies/${company.Slug}/edit`}
                    className="flex items-center justify-between px-3 py-1.5 text-sm hover:bg-muted transition-colors group"
                  >
                    <span className="truncate">{company['Company Name']}</span>
                    <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 flex-shrink-0 ml-2" />
                  </Link>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
