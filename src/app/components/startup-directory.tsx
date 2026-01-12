'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import React from 'react';
import {
  industryCategories,
  technologyCategories,
  archetypes,
  locationCategories,
} from '@/lib/filter-categories';

type StartupDirectoryProps = {
  data: IntelligentStartupSearchOutput;
};

type HierarchicalFilter = {
  [parent: string]: {
    selected: boolean;
    children: string[];
  };
};

export default function StartupDirectory({ data }: StartupDirectoryProps) {
  // Filter section open/close state
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({
    industry: true,
    technology: true,
    archetype: true,
    location: true,
  });

  // Expanded parent items within each filter
  const [expandedParents, setExpandedParents] = React.useState<Record<string, boolean>>({});

  // Selected filters
  const [industryFilters, setIndustryFilters] = React.useState<HierarchicalFilter>({});
  const [technologyFilters, setTechnologyFilters] = React.useState<HierarchicalFilter>({});
  const [archetypeFilters, setArchetypeFilters] = React.useState<string[]>([]);
  const [locationFilters, setLocationFilters] = React.useState<HierarchicalFilter>({});

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleParentExpand = (key: string) => {
    setExpandedParents((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleHierarchicalFilterToggle = (
    filters: HierarchicalFilter,
    setFilters: React.Dispatch<React.SetStateAction<HierarchicalFilter>>,
    parent: string,
    child?: string
  ) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (!child) {
        // Toggle parent - if selecting parent, select all children
        if (newFilters[parent]?.selected) {
          delete newFilters[parent];
        } else {
          newFilters[parent] = {
            selected: true,
            children: [],
          };
        }
      } else {
        // Toggle child
        if (!newFilters[parent]) {
          newFilters[parent] = { selected: false, children: [child] };
        } else {
          const children = newFilters[parent].children;
          if (children.includes(child)) {
            newFilters[parent] = {
              ...newFilters[parent],
              children: children.filter((c) => c !== child),
            };
            // Remove parent if no children selected and parent not selected
            if (newFilters[parent].children.length === 0 && !newFilters[parent].selected) {
              delete newFilters[parent];
            }
          } else {
            newFilters[parent] = {
              ...newFilters[parent],
              children: [...children, child],
            };
          }
        }
      }

      return newFilters;
    });
  };

  const handleArchetypeToggle = (archetype: string) => {
    setArchetypeFilters((prev) =>
      prev.includes(archetype) ? prev.filter((a) => a !== archetype) : [...prev, archetype]
    );
  };

  const clearAllFilters = () => {
    setIndustryFilters({});
    setTechnologyFilters({});
    setArchetypeFilters([]);
    setLocationFilters({});
  };

  const hasActiveFilters =
    Object.keys(industryFilters).length > 0 ||
    Object.keys(technologyFilters).length > 0 ||
    archetypeFilters.length > 0 ||
    Object.keys(locationFilters).length > 0;

  // Filter logic
  const filteredData = React.useMemo(() => {
    return data.filter((startup) => {
      // Industry filter
      if (Object.keys(industryFilters).length > 0) {
        const parentMatch = industryFilters[startup.industry]?.selected;
        const childMatch = industryFilters[startup.industry]?.children.includes(startup.subIndustry);
        if (!parentMatch && !childMatch) return false;
      }

      // Technology filter
      if (Object.keys(technologyFilters).length > 0) {
        const parentMatch = technologyFilters[startup.technology]?.selected;
        const childMatch = technologyFilters[startup.technology]?.children.includes(startup.subTechnology);
        if (!parentMatch && !childMatch) return false;
      }

      // Archetype filter
      if (archetypeFilters.length > 0) {
        if (!archetypeFilters.includes(startup.archetype)) return false;
      }

      // Location filter
      if (Object.keys(locationFilters).length > 0) {
        const parentMatch = locationFilters[startup.country]?.selected;
        const childMatch = locationFilters[startup.country]?.children.includes(startup.city);
        if (!parentMatch && !childMatch) return false;
      }

      return true;
    });
  }, [data, industryFilters, technologyFilters, archetypeFilters, locationFilters]);

  // Count helpers
  const getParentCount = (field: 'industry' | 'technology' | 'country', parent: string) => {
    return data.filter((s) => s[field] === parent).length;
  };

  const getChildCount = (
    parentField: 'industry' | 'technology' | 'country',
    childField: 'subIndustry' | 'subTechnology' | 'city',
    parent: string,
    child: string
  ) => {
    return data.filter((s) => s[parentField] === parent && s[childField] === child).length;
  };

  const getArchetypeCount = (archetype: string) => {
    return data.filter((s) => s.archetype === archetype).length;
  };

  const renderHierarchicalFilter = (
    title: string,
    sectionKey: string,
    categories: Record<string, string[]>,
    filters: HierarchicalFilter,
    setFilters: React.Dispatch<React.SetStateAction<HierarchicalFilter>>,
    parentField: 'industry' | 'technology' | 'country',
    childField: 'subIndustry' | 'subTechnology' | 'city'
  ) => (
    <div>
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        {openSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {openSections[sectionKey] && (
        <div className="space-y-1 mt-2">
          {Object.entries(categories).map(([parent, children]) => {
            const parentCount = getParentCount(parentField, parent);
            if (parentCount === 0) return null;

            const isExpanded = expandedParents[`${sectionKey}-${parent}`];
            const isParentSelected = filters[parent]?.selected || false;
            const selectedChildren = filters[parent]?.children || [];

            return (
              <div key={parent} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`${sectionKey}-${parent}`}
                    checked={isParentSelected}
                    onCheckedChange={() =>
                      handleHierarchicalFilterToggle(filters, setFilters, parent)
                    }
                  />
                  <button
                    onClick={() => toggleParentExpand(`${sectionKey}-${parent}`)}
                    className="flex-1 flex items-center justify-between text-left"
                  >
                    <Label
                      htmlFor={`${sectionKey}-${parent}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {parent}
                    </Label>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">{parentCount}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-3 w-3 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  </button>
                </div>
                {isExpanded && (
                  <div className="ml-6 space-y-1">
                    {children.map((child) => {
                      const childCount = getChildCount(parentField, childField, parent, child);
                      if (childCount === 0) return null;

                      return (
                        <div key={child} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${sectionKey}-${parent}-${child}`}
                            checked={selectedChildren.includes(child)}
                            onCheckedChange={() =>
                              handleHierarchicalFilterToggle(filters, setFilters, parent, child)
                            }
                          />
                          <Label
                            htmlFor={`${sectionKey}-${parent}-${child}`}
                            className="text-sm font-normal cursor-pointer flex-1 flex justify-between"
                          >
                            <span>{child}</span>
                            <span className="text-muted-foreground">{childCount}</span>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Filters */}
      <aside className="w-full lg:w-80 flex-shrink-0">
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

          {/* Industry Filter */}
          {renderHierarchicalFilter(
            'Industry',
            'industry',
            industryCategories,
            industryFilters,
            setIndustryFilters,
            'industry',
            'subIndustry'
          )}

          <Separator className="my-3" />

          {/* Technology Filter */}
          {renderHierarchicalFilter(
            'Technology',
            'technology',
            technologyCategories,
            technologyFilters,
            setTechnologyFilters,
            'technology',
            'subTechnology'
          )}

          <Separator className="my-3" />

          {/* Archetype Filter */}
          <div>
            <button
              onClick={() => toggleSection('archetype')}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <span className="font-medium text-sm">Archetype</span>
              {openSections.archetype ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {openSections.archetype && (
              <div className="space-y-2 mt-2">
                {archetypes.map((archetype) => {
                  const count = getArchetypeCount(archetype);
                  if (count === 0) return null;

                  return (
                    <div key={archetype} className="flex items-center space-x-2">
                      <Checkbox
                        id={`archetype-${archetype}`}
                        checked={archetypeFilters.includes(archetype)}
                        onCheckedChange={() => handleArchetypeToggle(archetype)}
                      />
                      <Label
                        htmlFor={`archetype-${archetype}`}
                        className="text-sm font-normal cursor-pointer flex-1 flex justify-between min-w-0"
                      >
                        <span className="truncate flex-1" title={archetype}>{archetype}</span>
                        <span className="text-muted-foreground ml-2 flex-shrink-0">{count}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Location Filter */}
          {renderHierarchicalFilter(
            'Location',
            'location',
            locationCategories,
            locationFilters,
            setLocationFilters,
            'country',
            'city'
          )}
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
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((startup) => (
              <div
                key={startup.name}
                className="border border-border bg-card p-4 hover:border-primary transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Company Logo Placeholder */}
                  <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                      {startup.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {startup.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {startup.industry} &gt; {startup.subIndustry}
                      </Badge>
                      <span className="text-muted-foreground">|</span>
                      <Badge variant="outline" className="text-xs">
                        {startup.archetype}
                      </Badge>
                    </div>
                  </div>
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
