'use client';

import * as React from 'react';
import { AppShell } from '@/app/components/app-shell';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, SlidersHorizontal, ChevronDown } from 'lucide-react';

const placeholderJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'StashAway',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    industry: 'FinTech',
    salary: 'RM 8,000 – 12,000 / month',
  },
  {
    id: 2,
    title: 'Product Manager',
    company: 'Grab',
    location: 'Petaling Jaya',
    type: 'Full-time',
    industry: 'SuperApp',
    salary: 'RM 10,000 – 15,000 / month',
  },
  {
    id: 3,
    title: 'Growth Marketing Manager',
    company: 'Carsome',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    industry: 'Marketplace',
    salary: 'RM 7,000 – 10,000 / month',
  },
  {
    id: 4,
    title: 'Data Analyst',
    company: 'PolicyStreet',
    location: 'Remote',
    type: 'Contract',
    industry: 'InsurTech',
    salary: 'RM 5,000 – 7,000 / month',
  },
  {
    id: 5,
    title: 'UX Designer',
    company: 'Funding Societies',
    location: 'Kuala Lumpur',
    type: 'Full-time',
    industry: 'FinTech',
    salary: 'RM 6,000 – 9,000 / month',
  },
];

export default function JobsPage() {
  return (
    <AppShell
      pageName="Jobs"
      description="Startup job listings across Malaysia's tech ecosystem."
      activeTab="jobs"
      onTabChange={() => {}}
    >
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
                  Industry
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
                  Job Type
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
                  <span className="w-2 h-2 rounded-full bg-yellow-400 dark:bg-yellow-500"></span>
                  Function
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
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{placeholderJobs.length}</span> jobs
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {placeholderJobs.map((job) => (
              <div
                key={job.id}
                className="border border-border bg-card p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base leading-tight">{job.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{job.company}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="text-muted-foreground">|</span>
                      <Badge variant="secondary" className="text-xs">
                        {job.industry}
                      </Badge>
                      <span className="text-muted-foreground">|</span>
                      <Badge variant="outline" className="text-xs">
                        {job.type}
                      </Badge>
                      <span className="text-muted-foreground">|</span>
                      <span className="text-xs text-muted-foreground">{job.salary}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border border-dashed border-border bg-card p-8 text-center mt-4">
            <p className="text-sm text-muted-foreground">More job listings coming soon.</p>
          </div>
        </main>
      </div>
    </AppShell>
  );
}
