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
import { Pencil, Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyListProps {
  companies: Company[];
  loading: boolean;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function CompanyList({ companies, loading }: CompanyListProps) {
  const [search, setSearch] = useState('');
  const [letterFilter, setLetterFilter] = useState<string | null>(null);

  const lettersWithData = new Set(
    companies.map((c) => (c['Company Name']?.[0] ?? '').toUpperCase()).filter((l) => /[A-Z]/.test(l))
  );

  const filtered = companies.filter((c) => {
    const name = c['Company Name'] ?? '';
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    const matchesLetter = !letterFilter || name[0]?.toUpperCase() === letterFilter;
    return matchesSearch && matchesLetter;
  });

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* A-Z letter index */}
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
                  {search || letterFilter ? 'No companies match your search.' : 'No companies found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((company) => (
                <TableRow key={company.Slug}>
                  <TableCell className="font-medium">{company['Company Name']}</TableCell>
                  <TableCell className="hidden sm:table-cell">{company.Industry}</TableCell>
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

      {(search || letterFilter) && (
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {companies.length} companies
        </p>
      )}
    </div>
  );
}
