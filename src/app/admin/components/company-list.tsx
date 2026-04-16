'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Company } from '@/types/company';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const lettersWithData = new Set(
    companies.map((c) => (c['Company Name']?.[0] ?? '').toUpperCase()).filter((l) => /[A-Z]/.test(l))
  );

  // Base filter: search + letter only (used for computing pane counts)
  const baseFiltered = companies.filter((c) => {
    const name = c['Company Name'] ?? '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = !letterFilter || name[0]?.toUpperCase() === letterFilter;
    return matchesSearch && matchesLetter;
  });

  // After industry selection (used for sub-industry counts)
  const afterIndustry = selectedIndustry
    ? baseFiltered.filter((c) => c['Industry'] === selectedIndustry)
    : baseFiltered;

  // After sub-industry selection (used for company type counts)
  const afterSubIndustry = selectedSubIndustry
    ? afterIndustry.filter((c) => c['Sub-Industry'] === selectedSubIndustry)
    : afterIndustry;

  // Final filtered list
  const filtered = (selectedCompanyType
    ? afterSubIndustry.filter((c) => c['Company Type'] === selectedCompanyType)
    : afterSubIndustry
  );

  const subIndustries = selectedIndustry ? (industryCategories[selectedIndustry] ?? []) : [];

  const handleIndustryClick = (industry: string) => {
    if (selectedIndustry === industry) {
      setSelectedIndustry(null);
    } else {
      setSelectedIndustry(industry);
    }
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
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      <div className="flex gap-0 border border-border rounded-md overflow-hidden">

        {/* Industry pane */}
        <div className={`flex flex-col border-r border-border ${industryOpen ? 'w-56' : 'w-10'} flex-shrink-0 transition-all`}>
          <button
            onClick={() => setIndustryOpen(!industryOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 w-full text-left"
          >
            {industryOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {industryOpen && <span>Industry</span>}
          </button>
          {industryOpen && (
            <div className="overflow-y-auto h-64">
              {Object.keys(industryCategories).map((industry) => {
                const count = baseFiltered.filter((c) => c['Industry'] === industry).length;
                const isSelected = selectedIndustry === industry;
                return (
                  <button
                    key={industry}
                    onClick={() => handleIndustryClick(industry)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors border-l-2 ${
                      isSelected
                        ? 'bg-primary/10 border-l-primary text-foreground font-medium'
                        : 'border-l-transparent hover:bg-muted text-foreground'
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
        <div className={`flex flex-col border-r border-border ${subIndustryOpen ? 'w-64' : 'w-10'} flex-shrink-0 transition-all`}>
          <button
            onClick={() => setSubIndustryOpen(!subIndustryOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 w-full text-left"
          >
            {subIndustryOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {subIndustryOpen && (
              <span>{selectedIndustry ? `${selectedIndustry}` : 'Sub-Industry'}</span>
            )}
          </button>
          {subIndustryOpen && (
            <div className="overflow-y-auto h-64">
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
                          ? 'bg-primary/10 border-l-primary text-foreground font-medium'
                          : 'border-l-transparent hover:bg-muted text-foreground'
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
        <div className={`flex flex-col ${companyTypeOpen ? 'w-64' : 'w-10'} flex-shrink-0 transition-all`}>
          <button
            onClick={() => setCompanyTypeOpen(!companyTypeOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 w-full text-left"
          >
            {companyTypeOpen ? <ChevronDown className="h-3 w-3 flex-shrink-0" /> : <ChevronRight className="h-3 w-3 flex-shrink-0" />}
            {companyTypeOpen && <span>Company Type</span>}
          </button>
          {companyTypeOpen && (
            <div className="overflow-y-auto h-64">
              {archetypes.map((type) => {
                const count = afterSubIndustry.filter((c) => c['Company Type'] === type).length;
                const isSelected = selectedCompanyType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleCompanyTypeClick(type)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-sm text-left transition-colors border-l-2 ${
                      isSelected
                        ? 'bg-primary/10 border-l-primary text-foreground font-medium'
                        : 'border-l-transparent hover:bg-muted text-foreground'
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

        {/* Spacer so the browser fills remaining width */}
        <div className="flex-1 bg-muted/20" />
      </div>

      {/* Active filter summary */}
      {(selectedIndustry || selectedSubIndustry || selectedCompanyType) && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Filtered by:</span>
          {selectedIndustry && <span className="bg-muted px-2 py-0.5 rounded">{selectedIndustry}</span>}
          {selectedSubIndustry && <span className="text-muted-foreground">›</span>}
          {selectedSubIndustry && <span className="bg-muted px-2 py-0.5 rounded">{selectedSubIndustry}</span>}
          {selectedCompanyType && <span className="text-muted-foreground">›</span>}
          {selectedCompanyType && <span className="bg-muted px-2 py-0.5 rounded">{selectedCompanyType}</span>}
          <button
            onClick={() => { setSelectedIndustry(null); setSelectedSubIndustry(null); setSelectedCompanyType(null); }}
            className="ml-1 hover:text-foreground underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Company table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead className="hidden sm:table-cell">Industry</TableHead>
              <TableHead className="hidden md:table-cell">Company Type</TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No companies match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((company) => (
                <TableRow key={company.Slug}>
                  <TableCell className="font-medium">{company['Company Name']}</TableCell>
                  <TableCell className="hidden sm:table-cell">{company['Industry']}</TableCell>
                  <TableCell className="hidden md:table-cell">{company['Company Type']}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {[company['Headquarters State'], company['Headquarters Country']]
                      .filter(Boolean)
                      .join(', ')}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/companies/${company.Slug}/edit`}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit {company['Company Name']}</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        Showing {filtered.length} of {companies.length} companies
      </p>
    </div>
  );
}
