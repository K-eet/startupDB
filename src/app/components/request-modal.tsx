'use client';

import * as React from 'react';
import { Check, Mail, Link2, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authedFetch } from '@/lib/api-client';
import {
  COUNTRIES,
  LIMITS,
  CONTACT_NAME_MAX,
  emailError,
  phoneDigits,
  phoneError,
  urlError,
  type ClaimTarget,
  type CompanyRequestMode,
  type CountryDialCode,
} from '@/lib/company-request';

type Props = {
  mode: CompanyRequestMode;
  claimTarget?: ClaimTarget;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Done = { type: CompanyRequestMode; companyName: string; email: string; e164: string };

const labelCls = 'text-[11px] font-bold uppercase tracking-[0.06em] text-foreground';

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-1.5 flex items-center gap-1">
      <span className={labelCls}>{children}</span>
      {required && <span className="text-sm leading-none text-destructive">*</span>}
    </div>
  );
}

function FieldError({ error }: { error?: string | null }) {
  if (!error) return null;
  return (
    <div className="mt-1.5 flex items-center gap-1.5 text-xs text-destructive">
      <AlertTriangle className="h-3 w-3" strokeWidth={2} />
      {error}
    </div>
  );
}

function Counter({ value, max }: { value: string; max: number }) {
  const warn = max - value.length <= Math.ceil(max * 0.15);
  return (
    <span className={cn('text-[11px] font-semibold tabular-nums', warn ? 'text-destructive' : 'text-muted-foreground')}>
      {value.length}/{max}
    </span>
  );
}

const squareInput = 'rounded-none border-border focus-visible:ring-0 focus-visible:border-foreground';

export function RequestModal({ mode, claimTarget, open, onOpenChange }: Props) {
  const isClaim = mode === 'claim';

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [country, setCountry] = React.useState<CountryDialCode>(COUNTRIES[0]);
  const [number, setNumber] = React.useState('');
  const [coName, setCoName] = React.useState('');
  const [coEntity, setCoEntity] = React.useState('');
  const [coUrl, setCoUrl] = React.useState('');
  const [coDesc, setCoDesc] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<Done | null>(null);

  // Fresh state every time the modal opens.
  React.useEffect(() => {
    if (open) {
      setName('');
      setEmail('');
      setCountry(COUNTRIES[0]);
      setNumber('');
      setCoName('');
      setCoEntity('');
      setCoUrl('');
      setCoDesc('');
      setTouched(false);
      setSubmitting(false);
      setServerError(null);
      setDone(null);
    }
  }, [open]);

  const eErr = emailError(email);
  const pErr = phoneError(number);
  const uErr = urlError(coUrl);

  const emailOk = Boolean(email.trim()) && !eErr;
  const phoneOk = phoneDigits(number).length >= 6 && !pErr;
  const nameOk = name.trim().length > 0;
  const addOk = isClaim ? true : Boolean(coName.trim() && coUrl.trim() && !uErr && coDesc.trim());
  const valid = emailOk && phoneOk && nameOk && addOk;

  async function handleSubmit() {
    setTouched(true);
    setServerError(null);
    if (!valid || submitting) return;
    setSubmitting(true);

    const payload = {
      type: mode,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      countryCode: country.code,
      dialCode: country.dial,
      number: phoneDigits(number),
      ...(isClaim
        ? { companySlug: claimTarget?.slug ?? '', companyName: claimTarget?.name ?? '' }
        : { companyName: coName.trim(), entityName: coEntity.trim(), url: coUrl.trim(), descriptor: coDesc.trim() }),
    };

    try {
      // authedFetch attaches the user's ID token when signed in, so the request
      // is linked to their account (uid) and approval can grant ownership.
      // Anonymous (signed-out) submissions still work — the header is omitted.
      const res = await authedFetch('/api/company-requests', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        setServerError(result?.error ?? 'Something went wrong. Please try again.');
        setSubmitting(false);
        return;
      }
      setDone({
        type: mode,
        companyName: isClaim ? claimTarget?.name ?? '' : coName.trim(),
        email: payload.email,
        e164: country.dial + phoneDigits(number),
      });
    } catch {
      setServerError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const eyebrow = isClaim ? 'Claim a company' : 'Add a company';
  const title = isClaim ? `Claim ${claimTarget?.name ?? 'this company'}` : 'Add a company to StartupDB';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[468px] gap-0 overflow-hidden rounded-none border-border p-0">
        <div className="h-1 bg-primary" />

        {done ? (
          <SuccessBody done={done} onClose={() => onOpenChange(false)} />
        ) : (
          <div className="px-6 pb-6 pt-5">
            <DialogHeader className="space-y-0 text-left">
              <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                {eyebrow}
              </p>
              <DialogTitle className="text-xl font-extrabold leading-tight tracking-tight">
                {title}
              </DialogTitle>
            </DialogHeader>

            {isClaim && claimTarget && (
              <div className="mt-3.5 flex items-center gap-2.5 border border-border bg-muted p-2.5">
                <div className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center bg-blue-100 text-[15px] font-extrabold text-blue-900 dark:bg-blue-900/40 dark:text-blue-200">
                  {claimTarget.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold tracking-tight">{claimTarget.name}</div>
                  <div className="truncate text-[11px] text-muted-foreground">
                    {[claimTarget.industry, claimTarget.city].filter(Boolean).join(' · ')}
                    {(claimTarget.industry || claimTarget.city) && ' · '}
                    this request will be linked to this listing
                  </div>
                </div>
              </div>
            )}

            <DialogDescription className="mb-[18px] mt-4 text-[13px] leading-relaxed">
              {isClaim
                ? 'Tell us how to reach you and we’ll verify you’re part of the team before handing over the listing.'
                : 'We review every submission. Give us a corporate email and a WhatsApp number so we can confirm details with a founder or team member directly.'}
            </DialogDescription>

            {/* Add-only company fields */}
            {!isClaim && (
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel required>Company name</FieldLabel>
                    <Counter value={coName} max={LIMITS.name} />
                  </div>
                  <Input
                    value={coName}
                    maxLength={LIMITS.name}
                    onChange={(e) => setCoName(e.target.value)}
                    placeholder="e.g. Acme Robotics"
                    className={cn(squareInput, touched && !coName.trim() && 'border-destructive')}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <FieldLabel>Entity name</FieldLabel>
                      <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Optional</span>
                    </div>
                    <Counter value={coEntity} max={LIMITS.entityName} />
                  </div>
                  <Input
                    value={coEntity}
                    maxLength={LIMITS.entityName}
                    onChange={(e) => setCoEntity(e.target.value)}
                    placeholder="e.g. Acme Robotics Sdn. Bhd."
                    className={squareInput}
                  />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel required>Website</FieldLabel>
                    <Counter value={coUrl} max={LIMITS.url} />
                  </div>
                  <div className="relative">
                    <Link2 className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={coUrl}
                      maxLength={LIMITS.url}
                      onChange={(e) => setCoUrl(e.target.value)}
                      placeholder="acme.com"
                      className={cn(squareInput, 'pl-9', ((touched && !coUrl.trim()) || uErr) && 'border-destructive')}
                    />
                  </div>
                  <FieldError error={uErr} />
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <FieldLabel required>One-sentence descriptor</FieldLabel>
                    <Counter value={coDesc} max={LIMITS.descriptor} />
                  </div>
                  <Textarea
                    value={coDesc}
                    maxLength={LIMITS.descriptor}
                    onChange={(e) => setCoDesc(e.target.value)}
                    rows={2}
                    placeholder="What does the company do, in one line?"
                    className={cn(
                      'resize-none rounded-none border-border focus-visible:ring-0 focus-visible:border-foreground',
                      touched && !coDesc.trim() && 'border-destructive'
                    )}
                  />
                </div>

                <div className="mb-[18px] mt-1 h-px bg-border" />
              </>
            )}

            {/* Shared contact fields */}
            <div className="mb-4">
              <FieldLabel required>How should we address you?</FieldLabel>
              <Input
                autoFocus
                value={name}
                maxLength={CONTACT_NAME_MAX}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aisha, or Aisha Rahman"
                className={cn(squareInput, touched && !nameOk && 'border-destructive')}
              />
              <FieldError error={touched && !nameOk ? 'Please tell us your name.' : null} />
            </div>

            <div className="mb-4">
              <FieldLabel required>Corporate email</FieldLabel>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-[15px] w-[15px] -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className={cn(squareInput, 'pl-9', ((touched && !email.trim()) || eErr) && 'border-destructive')}
                />
              </div>
              <FieldError error={touched && !email.trim() ? 'Email is required.' : eErr} />
              {!(touched && !email.trim()) && !eErr && (
                <div className="mt-1.5 text-xs text-muted-foreground">
                  Use your work email — Gmail, Yahoo, Outlook and the like are rejected.
                </div>
              )}
            </div>

            <div className="mb-1">
              <FieldLabel required>WhatsApp number</FieldLabel>
              <div
                className={cn(
                  'flex border border-border focus-within:border-foreground',
                  ((touched && !phoneDigits(number)) || pErr) && 'border-destructive'
                )}
              >
                <Select
                  value={country.code}
                  onValueChange={(code) => setCountry(COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0])}
                >
                  <SelectTrigger className="h-auto w-auto gap-1 whitespace-nowrap rounded-none border-0 border-r border-border bg-muted px-3 py-2.5 text-[13px] font-semibold focus:ring-0">
                    <SelectValue>{country.dial}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code} {c.dial} · {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  value={number}
                  onChange={(e) => setNumber(e.target.value.replace(/[^\d\s-]/g, ''))}
                  inputMode="tel"
                  placeholder="12 345 6789"
                  className="rounded-none border-0 focus-visible:ring-0"
                />
              </div>
              <FieldError error={touched && !phoneDigits(number) ? 'WhatsApp number is required.' : pErr} />
            </div>

            {serverError && (
              <div className="mt-3 flex items-center gap-1.5 border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={2} />
                {serverError}
              </div>
            )}

            <div className="mt-[22px] flex gap-2">
              <Button variant="outline" className="rounded-none border-border" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-none disabled:opacity-100"
                disabled={!valid || submitting}
                onClick={handleSubmit}
              >
                {submitting ? 'Sending…' : isClaim ? 'Submit claim' : 'Submit company'}
              </Button>
            </div>

            <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3 w-3" />
              Both fields are mandatory. We only use these to verify and contact you.
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SuccessBody({ done, onClose }: { done: Done; onClose: () => void }) {
  const isClaim = done.type === 'claim';
  return (
    <div className="px-6 pb-[26px] pt-[30px]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center bg-primary">
        <Check className="h-6 w-6 text-primary-foreground" strokeWidth={2.4} />
      </div>
      <DialogTitle className="mb-2 text-xl font-extrabold tracking-tight">
        {isClaim ? 'Claim submitted' : 'Company submitted'}
      </DialogTitle>
      <DialogDescription className="mb-[18px] text-[13px] leading-relaxed">
        {isClaim ? (
          <>
            Your request to claim <strong className="text-foreground">{done.companyName}</strong> is in. We’ll verify
            your work email and reach out on WhatsApp shortly.
          </>
        ) : (
          <>
            Thanks — <strong className="text-foreground">{done.companyName}</strong> is queued for review. We’ll
            confirm the details with you on WhatsApp before it goes live.
          </>
        )}
      </DialogDescription>
      <div className="mb-[18px] border border-border bg-muted px-3.5 py-3">
        {[
          ['Email', done.email],
          ['WhatsApp', done.e164],
          ['Status', 'pending_review'],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3 py-0.5 text-xs">
            <span className="text-muted-foreground">{k}</span>
            <span className="break-words text-right font-semibold tabular-nums">{v}</span>
          </div>
        ))}
      </div>
      <Button className="w-full rounded-none" onClick={onClose}>
        Done
      </Button>
    </div>
  );
}
