'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StartupDirectoryProps = {
  data: IntelligentStartupSearchOutput;
};

export default function StartupDirectory({ data }: StartupDirectoryProps) {
  const [filters, setFilters] = React.useState({
    industry: 'all',
    stage: 'all',
    location: 'all',
  });

  const handleFilterChange = (filterName: string) => (value: string) => {
    setFilters((prev) => ({ ...prev, [filterName]: value }));
  };

  const industries = React.useMemo(() => ['all', ...Array.from(new Set(data.map((s) => s.industry)))], [data]);
  const stages = React.useMemo(() => ['all', ...Array.from(new Set(data.map((s) => s.stage)))], [data]);
  const locations = React.useMemo(() => ['all', ...Array.from(new Set(data.map((s) => s.location)))], [data]);

  const filteredData = React.useMemo(() => {
    return data.filter((startup) => {
      return (
        (filters.industry === 'all' || startup.industry === filters.industry) &&
        (filters.stage === 'all' || startup.stage === filters.stage) &&
        (filters.location === 'all' || startup.location === filters.location)
      );
    });
  }, [data, filters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Startup Directory</CardTitle>
        <div className="grid sm:grid-cols-3 gap-2 pt-4">
          <Select onValueChange={handleFilterChange('industry')} value={filters.industry}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by industry..." />
            </SelectTrigger>
            <SelectContent>
              {industries.map(industry => (
                <SelectItem key={industry} value={industry}>
                  {industry === 'all' ? 'All Industries' : industry}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleFilterChange('stage')} value={filters.stage}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by stage..." />
            </SelectTrigger>
            <SelectContent>
              {stages.map(stage => (
                <SelectItem key={stage} value={stage}>
                  {stage === 'all' ? 'All Stages' : stage}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select onValueChange={handleFilterChange('location')} value={filters.location}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by location..." />
            </SelectTrigger>
            <SelectContent>
              {locations.map(location => (
                <SelectItem key={location} value={location}>
                  {location === 'all' ? 'All Locations' : location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredData.length > 0 ? (
            filteredData.map((startup, index) => (
              <React.Fragment key={startup.name}>
                <div className="flex flex-col gap-2">
                  <h3 className="text-xl font-semibold leading-none tracking-tight">{startup.name}</h3>
                  <p className="text-sm text-muted-foreground">{startup.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Badge variant="secondary">{startup.industry}</Badge>
                    <Badge variant="outline">{startup.stage}</Badge>
                    <Badge variant="outline">{startup.location}</Badge>
                  </div>
                </div>
                {index < filteredData.length - 1 && <Separator />}
              </React.Fragment>
            ))
          ) : (
            <div className="h-24 text-center content-center">
              <p>No results found.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
