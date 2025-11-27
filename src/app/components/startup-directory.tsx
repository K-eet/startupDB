'use client';

import type { IntelligentStartupSearchOutput } from '@/ai/flows/intelligent-startup-search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
        <div className="border rounded-md">
          <Accordion type="single" collapsible className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-2/5">Name</TableHead>
                  <TableHead className="w-1/5">Industry</TableHead>
                  <TableHead className="w-1/5">Stage</TableHead>
                  <TableHead className="w-1/5">Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length > 0 ? (
                  filteredData.map((startup) => (
                    <AccordionItem value={startup.name} key={startup.name} asChild>
                      <TableRow>
                        <TableCell colSpan={4} className="p-0">
                          <AccordionTrigger className="w-full p-4 grid grid-cols-5 text-left hover:no-underline">
                            <div className="col-span-2">{startup.name}</div>
                            <div className="col-span-1">
                              <Badge variant="secondary">{startup.industry}</Badge>
                            </div>
                            <div className="col-span-1">
                              <Badge variant="outline">{startup.stage}</Badge>
                            </div>
                            <div className="col-span-1 truncate">{startup.location}</div>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 pt-0">
                            <p className="text-muted-foreground">{startup.description}</p>
                          </AccordionContent>
                        </TableCell>
                      </TableRow>
                    </AccordionItem>
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
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
