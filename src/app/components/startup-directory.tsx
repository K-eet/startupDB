'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { Separator } from '@/components/ui/separator';

type StartupDirectoryProps = {
  data: IntelligentStartupSearchOutput;
};

export default function StartupDirectory({ data }: StartupDirectoryProps) {
  const [filters, setFilters] = React.useState({
    industry: '',
    stage: '',
    location: '',
  });

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filteredData = React.useMemo(() => {
    return data.filter((startup) => {
      return (
        startup.industry.toLowerCase().includes(filters.industry.toLowerCase()) &&
        startup.stage.toLowerCase().includes(filters.stage.toLowerCase()) &&
        startup.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    });
  }, [data, filters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Startup Directory</CardTitle>
        <div className="grid sm:grid-cols-3 gap-2 pt-4">
          <Input
            placeholder="Filter by industry..."
            name="industry"
            value={filters.industry}
            onChange={handleFilterChange}
          />
          <Input
            placeholder="Filter by stage..."
            name="stage"
            value={filters.stage}
            onChange={handleFilterChange}
          />
          <Input
            placeholder="Filter by location..."
            name="location"
            value={filters.location}
            onChange={handleFilterChange}
          />
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
