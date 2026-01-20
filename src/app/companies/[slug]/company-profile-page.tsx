'use client';

import Link from 'next/link';
import { CompanyProfile, formatCompanyAge } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/app/components/theme-toggle';
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Banknote,
  ArrowLeft,
  ExternalLink,
  Linkedin,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompanyProfilePageProps {
  company: CompanyProfile;
}

export function CompanyProfilePage({ company }: CompanyProfilePageProps) {
  const formattedDate = new Date(company.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold tracking-tight hover:text-primary transition-colors">
                StartupDB
              </Link>
              <span className="text-muted-foreground hidden sm:inline">|</span>
              <nav className="hidden sm:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Companies
                </Link>
                <Link
                  href="/"
                  className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  VCs
                </Link>
                <Link
                  href="/events"
                  className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  Events
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl py-6">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>

        {/* ============================================ */}
        {/* 1. HEADER - Identity & Immediate Context */}
        {/* ============================================ */}
        <section className="mb-8">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={`${company.name} logo`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
              )}
            </div>

            {/* Company Name & Short Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {company.name}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {company.shortDescription}
              </p>

              {/* Website Link */}
              {company.websiteUrl && (
                <a
                  href={company.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {company.websiteUrl.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </section>

        {/* ============================================ */}
        {/* 3. CLASSIFICATION - Taxonomy & Positioning */}
        {/* ============================================ */}
        <section className="mb-8">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Industry */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Industry</span>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  {company.tags.industry}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                >
                  {company.tags.subIndustry}
                </Badge>
              </div>
            </div>

            {/* Archetype */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Archetype</span>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {company.tags.archetype}
              </Badge>
            </div>

            {/* Technology */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Technology</span>
              <div className="flex flex-wrap gap-1">
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                >
                  {company.tags.technology}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                >
                  {company.tags.subTechnology}
                </Badge>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* ============================================ */}
            {/* 2. OVERVIEW - Expanded Understanding */}
            {/* ============================================ */}
            <section>
              <h2 className="text-lg font-semibold mb-4">About {company.name}</h2>
              <div className="prose prose-neutral dark:prose-invert max-w-none">
                {company.longDescription.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            <Separator />

            {/* ============================================ */}
            {/* 5. PEOPLE - Accountability & Credibility */}
            {/* ============================================ */}
            <section>
              <h2 className="text-lg font-semibold mb-4">Key People</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {company.keyPeople.map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border border-border bg-card"
                  >
                    {/* Avatar Placeholder */}
                    <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{person.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{person.title}</p>
                    </div>

                    {person.linkedIn && (
                      <a
                        href={person.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        aria-label={`${person.name}'s LinkedIn profile`}
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* ============================================ */}
            {/* 4. COMPANY FACTS - Objective, Comparable Data */}
            {/* ============================================ */}
            <section className="border border-border bg-card p-5">
              <div className="space-y-4">
                {/* Founded Year */}
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Founded</p>
                    <p className="text-sm text-muted-foreground">{company.foundedYear}</p>
                  </div>
                </div>

                {/* Company Age */}
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Company Age</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCompanyAge(company.foundedYear)}
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {company.location.city}
                      {company.location.state && `, ${company.location.state}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{company.location.country}</p>
                  </div>
                </div>

                {/* Funding Status */}
                <div className="flex items-start gap-3">
                  <Banknote className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Funding Status</p>
                    <Badge
                      variant={company.fundingStatus === 'Funded' ? 'default' : 'secondary'}
                      className={
                        company.fundingStatus === 'Funded'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : ''
                      }
                    >
                      {company.fundingStatus}
                    </Badge>
                  </div>
                </div>
              </div>
            </section>

            {/* Quick Actions */}
            <section className="border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                Quick Actions
              </h2>
              <div className="space-y-2">
                {company.websiteUrl && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={company.websiteUrl} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start" disabled>
                  <Banknote className="h-4 w-4 mr-2" />
                  View Funding History
                </Button>
              </div>
            </section>
          </div>
        </div>

        {/* ============================================ */}
        {/* 6. METADATA - Trust & Freshness */}
        {/* ============================================ */}
        <footer className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Last updated: {formattedDate}
          </p>
        </footer>
      </div>
    </main>
  );
}
