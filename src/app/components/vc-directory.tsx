'use client';

import type { IntelligentVCSearchOutput } from '@/ai/flows/intelligent-vc-search';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Mail } from 'lucide-react';
import React from 'react';

type VCDirectoryProps = {
  data: IntelligentVCSearchOutput;
};

export default function VCDirectory({ data }: VCDirectoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Venture Capital Directory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md">
          <Accordion type="single" collapsible className="w-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Firm Name</TableHead>
                  <TableHead>Contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.length > 0 ? (
                  data.map((vc) => (
                    <AccordionItem value={vc.name} key={vc.name} asChild>
                      <TableRow>
                        <TableCell colSpan={2} className="p-0">
                          <AccordionTrigger className="w-full p-4 grid grid-cols-2 text-left hover:no-underline">
                              <span className="font-medium">{vc.name}</span>
                              <span className="flex items-center">
                                <Mail className="mr-2 h-4 w-4" />
                                {vc.contactDetails}
                              </span>
                          </AccordionTrigger>
                          <AccordionContent className="p-4 pt-0">
                            <h4 className="font-semibold mb-2">Investment Focus:</h4>
                            <p className="text-muted-foreground">{vc.investmentFocus}</p>
                          </AccordionContent>
                        </TableCell>
                      </TableRow>
                    </AccordionItem>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
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
