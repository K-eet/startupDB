'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { RequestModal } from '@/app/components/request-modal';
import type { Company } from '@/types/company';
import { calculateCompanyAge, parseFounders, toArray } from '@/types/company';
import { normalizeCompanyName } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/app/components/theme-toggle';
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  User,
  LogOut,
  Menu,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

interface CompanyProfilePageProps {
  company: Company;
}

export function CompanyProfilePage({ company }: CompanyProfilePageProps) {
  const founders = parseFounders(company['Founder Names'], company['Founder Titles']);
  const companyAge = calculateCompanyAge(company['Founded Year']);
  const [claimOpen, setClaimOpen] = useState(false);
  const router = useRouter();
  const { user, isAdmin, signInWithGoogle, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      toast({
        title: 'Sign-in failed',
        description: 'Could not sign in with Google. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch {
      toast({
        title: 'Sign-out failed',
        description: 'Could not sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Header — matches AppShell */}
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-2xl font-bold tracking-tight">
                StartupDB
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <span className="text-muted-foreground mx-2">|</span>
                <Link href="/" className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Companies</Link>
                <Link href="/" className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">VCs</Link>
                <span className="px-3 py-1 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                  Events<span className="ml-1 text-[10px] font-normal text-muted-foreground/60">soon</span>
                </span>
                <span className="px-3 py-1 text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                  Jobs<span className="ml-1 text-[10px] font-normal text-muted-foreground/60">soon</span>
                </span>
                {isAdmin && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="px-3 py-1 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                  >
                    Admin
                  </button>
                )}
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                        <AvatarFallback>
                          {user.displayName?.charAt(0)?.toUpperCase() ?? 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel className="font-normal">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {isAdmin && (
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" size="icon" onClick={handleSignIn}>
                  <User className="h-5 w-5" />
                  <span className="sr-only">Sign in</span>
                </Button>
              )}
              {/* Mobile hamburger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push('/')}>Companies</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/')}>VCs</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                    Events<span className="ml-auto text-[10px] text-muted-foreground">soon</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled className="opacity-40 cursor-not-allowed">
                    Jobs<span className="ml-auto text-[10px] text-muted-foreground">soon</span>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => router.push('/admin')}>
                        <Shield />
                        Admin
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Back Link and Claim Button */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to directory
          </Link>
          <Button variant="default" size="sm" onClick={() => setClaimOpen(true)}>
            Claim this Company
          </Button>
        </div>

        <RequestModal
          mode="claim"
          open={claimOpen}
          onOpenChange={setClaimOpen}
          claimTarget={{
            slug: company['Slug'],
            name: company['Company Name'],
            industry: company['Industry'],
            city: company['Headquarters City'],
          }}
        />

        {/* ============================================ */}
        {/* 1. HEADER - Identity & Immediate Context */}
        {/* ============================================ */}
        <section className="mb-8">
          <div className="flex items-start gap-6">
            {/* Company Logo */}
            <div className="w-20 h-20 md:w-24 md:h-24 bg-secondary border border-border flex items-center justify-center flex-shrink-0">
              <Building2 className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground" />
            </div>

            {/* Company Name & Short Description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
                {normalizeCompanyName(company['Company Name'] || 'Unnamed Company')}
              </h1>
              <p className="text-lg text-muted-foreground mb-4">
                {company['One-line company description'] || ''}
              </p>

              {/* Website Link */}
              {company['Website URL'] && (
                <a
                  href={company['Website URL']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {company['Website URL'].replace(/^https?:\/\//, '')}
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
            {company['Industry'] && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Industry</span>
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                >
                  {company['Industry']}{company['Sub-Industry'] ? ` > ${company['Sub-Industry']}` : ''}
                </Badge>
              </div>
            )}

            {/* Company Type */}
            {company['Company Type'] && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Company Type</span>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                >
                  {company['Company Type']}
                </Badge>
              </div>
            )}

            {/* Technology */}
            {company['Technology'] && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Technology</span>
                <div className="flex flex-wrap gap-1">
                  {company['Technology'].split(';').map((tech, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                    >
                      {tech.trim()}
                    </Badge>
                  ))}
                  {toArray(company['Sub-Technology']).map((subTech, index) => (
                    <Badge
                      key={`sub-${index}`}
                      variant="secondary"
                      className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                    >
                      {subTech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* ============================================ */}
            {/* 2. OVERVIEW - Expanded Understanding */}
            {/* ============================================ */}
            {company['Description'] && (
              <section>
                <h2 className="text-lg font-semibold mb-4">About {company['Company Name']}</h2>
                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  {company['Description'].split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground mb-4 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </section>
            )}

            {founders.length > 0 && (
              <>
                <Separator />

                {/* ============================================ */}
                {/* 5. PEOPLE - Accountability & Credibility */}
                {/* ============================================ */}
                <section>
                  <h2 className="text-lg font-semibold mb-4">Key People</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {founders.map((person, index) => (
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
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* ============================================ */}
            {/* 4. COMPANY FACTS - Objective, Comparable Data */}
            {/* ============================================ */}
            <section className="border border-border bg-card p-5">
              <div className="space-y-4">
                {/* Founded Year */}
                {company['Founded Year'] && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Founded</p>
                      <p className="text-sm text-muted-foreground">{company['Founded Year']}</p>
                    </div>
                  </div>
                )}

                {/* Company Age */}
                {company['Founded Year'] && (
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Company Age</p>
                      <p className="text-sm text-muted-foreground">{companyAge}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                {(company['Headquarters City'] || company['Headquarters Country']) && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        {company['Headquarters City']}
                        {company['Headquarters State'] && `, ${company['Headquarters State']}`}
                      </p>
                      {company['Headquarters Country'] && (
                        <p className="text-xs text-muted-foreground">{company['Headquarters Country']}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Company Size */}
                {company['Company Size'] && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Company Size</p>
                      <p className="text-sm text-muted-foreground">{company['Company Size']} employees</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Links */}
            {company['Website URL'] && (
              <section className="border border-border bg-card p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-4">
                  Links
                </h2>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <a href={company['Website URL']} target="_blank" rel="noopener noreferrer">
                      <Globe className="h-4 w-4 mr-2" />
                      Visit Website
                    </a>
                  </Button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
