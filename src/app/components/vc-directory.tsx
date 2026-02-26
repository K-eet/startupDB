'use client';

export interface VCFirm {
  name: string;
  investmentFocus: string;
  contactDetails: string;
}

export type VCFirmList = VCFirm[];

import { Building2, Mail, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import React from 'react';

type VCDirectoryProps = {
  data: VCFirmList;
  searchBar?: React.ReactNode;
};

export default function VCDirectory({ data, searchBar }: VCDirectoryProps) {
  const [expandedVC, setExpandedVC] = React.useState<string | null>(null);

  const toggleVC = (name: string) => {
    setExpandedVC((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 flex-shrink-0">
        <div className="border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal className="h-4 w-4" />
            <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
            <span className="text-xs text-muted-foreground ml-auto">Coming Soon</span>
          </div>

          <div>
            <button
              disabled
              className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 dark:bg-red-500"></span>
                Investment Stage
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <Separator className="my-3" />

          <div>
            <button
              disabled
              className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500"></span>
                Sector Focus
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <Separator className="my-3" />

          <div>
            <button
              disabled
              className="flex items-center justify-between w-full py-2 text-left opacity-50 cursor-not-allowed"
            >
              <span className="font-medium text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 border border-gray-500 dark:border-gray-400"></span>
                Location
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {searchBar && <div className="mb-6">{searchBar}</div>}

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{data.length}</span> VC firms
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {data.length > 0 ? (
            data.map((vc) => (
              <div key={vc.name} className="border border-border bg-card">
                <button
                  onClick={() => toggleVC(vc.name)}
                  className="w-full p-4 hover:border-primary transition-colors text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-7 w-7 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors">
                          {vc.name}
                        </h3>
                        {expandedVC === vc.name ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {vc.investmentFocus}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {vc.contactDetails}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
                {expandedVC === vc.name && (
                  <div className="px-4 pb-4 border-t border-border pt-3 ml-18">
                    <h4 className="font-semibold text-sm mb-2">Investment Focus</h4>
                    <p className="text-sm text-muted-foreground">{vc.investmentFocus}</p>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="border border-border bg-card p-12 text-center">
              <p className="text-muted-foreground">No VC firms found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
