'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ChevronDown, ChevronUp, Building2, X, SlidersHorizontal } from 'lucide-react';
import React from 'react';
import Link from 'next/link';
import { createSlug } from '@/lib/types';
import {
  industryCategories,
  technologyCategories,
  archetypes,
  locationCategories,
} from '@/lib/filter-categories';

type StartupDirectoryProps = {
  data: IntelligentStartupSearchOutput;
  searchBar?: React.ReactNode;
};

type HierarchicalFilter = {
  [parent: string]: {
    selected: boolean;
    children: string[];
  };
};

export default function StartupDirectory({ data, searchBar }: StartupDirectoryProps) {
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

  // Mobile filter panel visibility (collapsed by default on mobile)
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false);

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

  // Helper function to apply filters to data
  const applyFilters = React.useCallback(
    (
      sourceData: IntelligentStartupSearchOutput,
      options: {
        skipIndustry?: boolean;
        skipTechnology?: boolean;
        skipArchetype?: boolean;
        skipLocation?: boolean;
      } = {}
    ) => {
      return sourceData.filter((startup) => {
        // Industry filter
        if (!options.skipIndustry && Object.keys(industryFilters).length > 0) {
          const parentMatch = industryFilters[startup.industry]?.selected;
          const childMatch = industryFilters[startup.industry]?.children.includes(startup.subIndustry);
          if (!parentMatch && !childMatch) return false;
        }

        // Technology filter
        if (!options.skipTechnology && Object.keys(technologyFilters).length > 0) {
          const parentMatch = technologyFilters[startup.technology]?.selected;
          const childMatch = technologyFilters[startup.technology]?.children.includes(startup.subTechnology);
          if (!parentMatch && !childMatch) return false;
        }

        // Archetype filter
        if (!options.skipArchetype && archetypeFilters.length > 0) {
          if (!archetypeFilters.includes(startup.archetype)) return false;
        }

        // Location filter
        if (!options.skipLocation && Object.keys(locationFilters).length > 0) {
          const parentMatch = locationFilters[startup.country]?.selected;
          const childMatch = locationFilters[startup.country]?.children.includes(startup.city);
          if (!parentMatch && !childMatch) return false;
        }

        return true;
      });
    },
    [industryFilters, technologyFilters, archetypeFilters, locationFilters]
  );

  // Filter logic - full filtered data for display
  const filteredData = React.useMemo(() => {
    return applyFilters(data);
  }, [data, applyFilters]);

  // Filtered datasets for dynamic counts (excluding one filter category each)
  const dataForIndustryCounts = React.useMemo(() => {
    return applyFilters(data, { skipIndustry: true });
  }, [data, applyFilters]);

  const dataForTechnologyCounts = React.useMemo(() => {
    return applyFilters(data, { skipTechnology: true });
  }, [data, applyFilters]);

  const dataForArchetypeCounts = React.useMemo(() => {
    return applyFilters(data, { skipArchetype: true });
  }, [data, applyFilters]);

  const dataForLocationCounts = React.useMemo(() => {
    return applyFilters(data, { skipLocation: true });
  }, [data, applyFilters]);

  // Count helpers - now using filtered data for dynamic counts
  const getParentCount = (field: 'industry' | 'technology' | 'country', parent: string) => {
    const countData =
      field === 'industry'
        ? dataForIndustryCounts
        : field === 'technology'
          ? dataForTechnologyCounts
          : dataForLocationCounts;
    return countData.filter((s) => s[field] === parent).length;
  };

  const getChildCount = (
    parentField: 'industry' | 'technology' | 'country',
    childField: 'subIndustry' | 'subTechnology' | 'city',
    parent: string,
    child: string
  ) => {
    const countData =
      parentField === 'industry'
        ? dataForIndustryCounts
        : parentField === 'technology'
          ? dataForTechnologyCounts
          : dataForLocationCounts;
    return countData.filter((s) => s[parentField] === parent && s[childField] === child).length;
  };

  const getArchetypeCount = (archetype: string) => {
    return dataForArchetypeCounts.filter((s) => s.archetype === archetype).length;
  };

  const renderHierarchicalFilter = (
    title: string,
    sectionKey: string,
    categories: Record<string, string[]>,
    filters: HierarchicalFilter,
    setFilters: React.Dispatch<React.SetStateAction<HierarchicalFilter>>,
    parentField: 'industry' | 'technology' | 'country',
    childField: 'subIndustry' | 'subTechnology' | 'city',
    colorClass: string
  ) => (
    <div>
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-2 text-left"
      >
        <span className="font-medium text-sm flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${colorClass}`}></span>
          {title}
        </span>
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
                      className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                    >
                      {parent}
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">{parentCount}</span>
                    </Label>
                    {isExpanded ? (
                      <ChevronUp className="h-3 w-3 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    )}
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
                            className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                          >
                            {child}
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">{childCount}</span>
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
          {/* Mobile: Collapsible header, Desktop: Always show filters */}
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center justify-between w-full lg:hidden"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
              {hasActiveFilters && (
                <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-lg">
                  Active
                </span>
              )}
            </div>
            {mobileFiltersOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {/* Desktop header (always visible) */}
          <div className="hidden lg:flex items-center justify-between mb-4">
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

          {/* Filter content - hidden on mobile unless expanded, always visible on desktop */}
          <div className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block mt-4 lg:mt-0`}>
            {/* Mobile clear all button */}
            {hasActiveFilters && (
              <div className="flex justify-end mb-4 lg:hidden">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Clear all
                </button>
              </div>
            )}

          {/* Industry Filter - YC Classification */}
          <div>
            <button
              onClick={() => toggleSection('industry')}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500"></span>
                Industry
              </span>
              {openSections.industry ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {openSections.industry && (
              <div className="space-y-1 mt-2">
                {/* All Industries Option */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="industry-all"
                    checked={Object.keys(industryFilters).length === 0}
                    onCheckedChange={() => setIndustryFilters({})}
                  />
                  <Label
                    htmlFor="industry-all"
                    className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                  >
                    All industries
                    <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">{dataForIndustryCounts.length}</span>
                  </Label>
                </div>

                {/* Industry Categories */}
                {Object.entries(industryCategories).map(([parent, subcategories]) => {
                  const isExpanded = expandedParents[`industry-${parent}`];
                  const isParentSelected = industryFilters[parent]?.selected || false;
                  const selectedChildren = industryFilters[parent]?.children || [];
                  const hasSubcategories = subcategories.length > 0;
                  const parentCount = getParentCount('industry', parent);

                  return (
                    <div key={parent} className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`industry-${parent}`}
                          checked={isParentSelected}
                          onCheckedChange={() =>
                            handleHierarchicalFilterToggle(industryFilters, setIndustryFilters, parent)
                          }
                        />
                        {hasSubcategories ? (
                          <button
                            onClick={() => toggleParentExpand(`industry-${parent}`)}
                            className="flex-1 flex items-center justify-between text-left"
                          >
                            <Label
                              htmlFor={`industry-${parent}`}
                              className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                            >
                              {parent}
                              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">
                                {parentCount}
                              </span>
                            </Label>
                            {isExpanded ? (
                              <ChevronUp className="h-3 w-3 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        ) : (
                          <Label
                            htmlFor={`industry-${parent}`}
                            className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                          >
                            {parent}
                            <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">
                              {parentCount}
                            </span>
                          </Label>
                        )}
                      </div>
                      {isExpanded && hasSubcategories && (
                        <div className="ml-6 space-y-1">
                          {subcategories.map((subName) => {
                            const subCount = getChildCount('industry', 'subIndustry', parent, subName);
                            return (
                              <div key={subName} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`industry-${parent}-${subName}`}
                                  checked={selectedChildren.includes(subName)}
                                  onCheckedChange={() =>
                                    handleHierarchicalFilterToggle(
                                      industryFilters,
                                      setIndustryFilters,
                                      parent,
                                      subName
                                    )
                                  }
                                />
                                <Label
                                  htmlFor={`industry-${parent}-${subName}`}
                                  className="text-sm font-normal cursor-pointer flex items-center gap-1.5"
                                >
                                  {subName}
                                  <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg">{subCount}</span>
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

          <Separator className="my-3" />

          {/* Archetype Filter */}
          <div>
            <button
              onClick={() => toggleSection('archetype')}
              className="flex items-center justify-between w-full py-2 text-left"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                Archetype
              </span>
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
                        className="text-sm font-normal cursor-pointer flex items-center gap-1.5 min-w-0"
                      >
                        <span className="truncate" title={archetype}>{archetype}</span>
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-lg flex-shrink-0">{count}</span>
                      </Label>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-3" />

          {/* Technology Filter */}
          {renderHierarchicalFilter(
            'Technology',
            'technology',
            technologyCategories,
            technologyFilters,
            setTechnologyFilters,
            'technology',
            'subTechnology',
            'bg-yellow-400 dark:bg-yellow-500'
          )}

          <Separator className="my-3" />

          {/* Location Filter */}
          {renderHierarchicalFilter(
            'Location',
            'location',
            locationCategories,
            locationFilters,
            setLocationFilters,
            'country',
            'city',
            'bg-gray-400 dark:bg-gray-500 border border-gray-500 dark:border-gray-400'
          )}
          </div>
        </div>
      </aside>

      {/* Main Content - Company Grid */}
      <main className="flex-1">
        {searchBar && <div className="mb-6">{searchBar}</div>}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            {/* Industry chips - Red */}
            {Object.entries(industryFilters).map(([parent, { selected, children }]) => (
              <React.Fragment key={`industry-${parent}`}>
                {selected && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    onClick={() => handleHierarchicalFilterToggle(industryFilters, setIndustryFilters, parent)}
                  >
                    <span className="text-red-600 dark:text-red-400 text-xs">Industry:</span> {parent}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {children.map((child) => (
                  <Badge
                    key={`industry-${parent}-${child}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
                    onClick={() => handleHierarchicalFilterToggle(industryFilters, setIndustryFilters, parent, child)}
                  >
                    <span className="text-red-600 dark:text-red-400 text-xs">Industry:</span> {child}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </React.Fragment>
            ))}

            {/* Archetype chips - Blue */}
            {archetypeFilters.map((archetype) => (
              <Badge
                key={`archetype-${archetype}`}
                variant="secondary"
                className="flex items-center gap-1 cursor-pointer bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                onClick={() => handleArchetypeToggle(archetype)}
              >
                <span className="text-blue-600 dark:text-blue-400 text-xs">Archetype:</span> {archetype}
                <X className="h-3 w-3" />
              </Badge>
            ))}

            {/* Technology chips - Yellow */}
            {Object.entries(technologyFilters).map(([parent, { selected, children }]) => (
              <React.Fragment key={`technology-${parent}`}>
                {selected && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
                    onClick={() => handleHierarchicalFilterToggle(technologyFilters, setTechnologyFilters, parent)}
                  >
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">Technology:</span> {parent}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {children.map((child) => (
                  <Badge
                    key={`technology-${parent}-${child}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:hover:bg-yellow-900/50"
                    onClick={() => handleHierarchicalFilterToggle(technologyFilters, setTechnologyFilters, parent, child)}
                  >
                    <span className="text-yellow-600 dark:text-yellow-400 text-xs">Technology:</span> {child}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </React.Fragment>
            ))}

            {/* Location chips - White/Gray */}
            {Object.entries(locationFilters).map(([parent, { selected, children }]) => (
              <React.Fragment key={`location-${parent}`}>
                {selected && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-600"
                    onClick={() => handleHierarchicalFilterToggle(locationFilters, setLocationFilters, parent)}
                  >
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Location:</span> {parent}
                    <X className="h-3 w-3" />
                  </Badge>
                )}
                {children.map((child) => (
                  <Badge
                    key={`location-${parent}-${child}`}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700/50 dark:text-gray-200 dark:hover:bg-gray-700/70 border border-gray-300 dark:border-gray-600"
                    onClick={() => handleHierarchicalFilterToggle(locationFilters, setLocationFilters, parent, child)}
                  >
                    <span className="text-gray-500 dark:text-gray-400 text-xs">Location:</span> {child}
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </React.Fragment>
            ))}

            {/* Clear all button */}
            <button
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredData.length}</span> of{' '}
            <span className="font-semibold text-foreground">{data.length}</span> startups
          </p>
        </div>

        {filteredData.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredData.map((startup) => (
              <Link
                key={startup.name}
                href={`/companies/${createSlug(startup.name)}`}
                className="block border border-border bg-card p-4 hover:border-primary transition-colors cursor-pointer group"
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
              </Link>
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
