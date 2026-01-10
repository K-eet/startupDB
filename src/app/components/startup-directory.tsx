'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import React from 'react';

type StartupDirectoryProps = {
  data: IntelligentStartupSearchOutput;
};

type FilterSection = {
  title: string;
  field: 'industry' | 'stage' | 'location';
  isOpen: boolean;
};

export default function StartupDirectory({ data }: StartupDirectoryProps) {
  const [selectedFilters, setSelectedFilters] = React.useState<{
    industry: string[];
    stage: string[];
    location: string[];
  }>({
    industry: [],
    stage: [],
    location: [],
  });

  const [filterSections, setFilterSections] = React.useState<FilterSection[]>([
    { title: 'Industry', field: 'industry', isOpen: true },
    { title: 'Stage', field: 'stage', isOpen: true },
    { title: 'Location', field: 'location', isOpen: true },
  ]);

  const toggleSection = (field: string) => {
    setFilterSections((prev) =>
      prev.map((section) =>
        section.field === field ? { ...section, isOpen: !section.isOpen } : section
      )
    );
  };

  const handleFilterToggle = (field: 'industry' | 'stage' | 'location', value: string) => {
    setSelectedFilters((prev) => {
      const current = prev[field];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({ industry: [], stage: [], location: [] });
  };

  const getUniqueValues = (field: 'industry' | 'stage' | 'location') => {
    return Array.from(new Set(data.map((s) => s[field]))).sort();
  };

  const getCounts = (field: 'industry' | 'stage' | 'location') => {
    return data.reduce((acc, item) => {
      acc[item[field]] = (acc[item[field]] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const industries = React.useMemo(() => getUniqueValues('industry'), [data]);
  const stages = React.useMemo(() => getUniqueValues('stage'), [data]);
  const locations = React.useMemo(() => getUniqueValues('location'), [data]);

  const industryCounts = React.useMemo(() => getCounts('industry'), [data]);
  const stageCounts = React.useMemo(() => getCounts('stage'), [data]);
  const locationCounts = React.useMemo(() => getCounts('location'), [data]);

  const filteredData = React.useMemo(() => {
    return data.filter((startup) => {
      const industryMatch =
        selectedFilters.industry.length === 0 ||
        selectedFilters.industry.includes(startup.industry);
      const stageMatch =
        selectedFilters.stage.length === 0 || selectedFilters.stage.includes(startup.stage);
      const locationMatch =
        selectedFilters.location.length === 0 ||
        selectedFilters.location.includes(startup.location);
      return industryMatch && stageMatch && locationMatch;
    });
  }, [data, selectedFilters]);

  const hasActiveFilters =
    selectedFilters.industry.length > 0 ||
    selectedFilters.stage.length > 0 ||
    selectedFilters.location.length > 0;

  const filterData: Record<'industry' | 'stage' | 'location', { values: string[]; counts: Record<string, number> }> = {
    industry: { values: industries, counts: industryCounts },
    stage: { values: stages, counts: stageCounts },
    location: { values: locations, counts: locationCounts },
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-64 flex-shrink-0">
        <div className="border border-border bg-card p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Clear all
              </button>
            )}
          </div>

          {filterSections.map((section, idx) => (
            <div key={section.field}>
              {idx > 0 && <Separator className="my-3" />}
              <button
                onClick={() => toggleSection(section.field)}
                className="flex items-center justify-between w-full py-2 text-left"
              >
                <span className="font-medium text-sm">{section.title}</span>
                {section.isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {section.isOpen && (
                <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                  {filterData[section.field].values.map((value) => (
                    <div key={value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`${section.field}-${value}`}
                        checked={selectedFilters[section.field].includes(value)}
                        onCheckedChange={() => handleFilterToggle(section.field, value)}
                      />
                      <Label
                        htmlFor={`${section.field}-${value}`}
                        className="text-sm font-normal cursor-pointer flex-1 flex justify-between"
                      >
                        <span className="truncate">{value}</span>
                        <span className="text-muted-foreground ml-2">
                          {filterData[section.field].counts[value]}
                        </span>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content - Company Grid */}
      <main className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredData.length}</span> of{' '}
            <span className="font-semibold text-foreground">{data.length}</span> startups
          </p>
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredData.map((startup) => (
              <div
                key={startup.name}
                className="border border-border bg-card p-4 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  {/* Company Logo Placeholder */}
                  <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors truncate">
                      {startup.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {startup.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-3">
                  <Badge variant="secondary" className="text-xs">
                    {startup.industry}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {startup.stage}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {startup.location}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No startups found matching your filters.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-2 text-sm text-primary hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
