'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React from 'react';

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
        <div className="border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Name</TableHead>
                <TableHead className="w-1/4">Industry</TableHead>
                <TableHead className="w-1/4">Stage</TableHead>
                <TableHead className="w-1/4">Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((startup) => (
                  <React.Fragment key={startup.name}>
                    <TableRow>
                      <TableCell className="font-medium">{startup.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{startup.industry}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{startup.stage}</Badge>
                      </TableCell>
                      <TableCell className="truncate">{startup.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="py-2 px-4 border-t">
                        <p className="text-muted-foreground text-sm">{startup.description}</p>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
