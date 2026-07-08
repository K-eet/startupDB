// Shared types, constants, and validators for the Claim / Add company-request
// CTAs. Imported by both the client modal (src/app/components/request-modal.tsx)
// for instant feedback and the API route (/api/company-requests) for server-side
// re-validation — keep the two in sync by sharing this module.

export type CompanyRequestMode = 'claim' | 'add';

// A claim/join request resolves to one of two outcomes, decided at APPROVAL
// time (not submit time) to avoid a TOCTOU where the company gains an owner
// between submission and approval:
//   'claim' — company has no owner yet → approver grants the requester 'owner'.
//   'join'  — company already owned     → approver grants 'member'.
export type RequestKind = 'claim' | 'join';

/** Classify a pending request from the target company's current ownerUids. */
export function classifyRequestKind(ownerUids?: string[]): RequestKind {
  return ownerUids && ownerUids.length > 0 ? 'join' : 'claim';
}

export type ClaimTarget = {
  slug: string;
  name: string;
  industry?: string;
  city?: string;
};

export type CountryDialCode = {
  code: string;
  dial: string;
  name: string;
};

/** Country dial codes offered in the WhatsApp input. Malaysia is the default. */
export const COUNTRIES: CountryDialCode[] = [
  { code: 'MY', dial: '+60', name: 'Malaysia' },
  { code: 'SG', dial: '+65', name: 'Singapore' },
  { code: 'ID', dial: '+62', name: 'Indonesia' },
  { code: 'TH', dial: '+66', name: 'Thailand' },
  { code: 'PH', dial: '+63', name: 'Philippines' },
  { code: 'VN', dial: '+84', name: 'Vietnam' },
  { code: 'IN', dial: '+91', name: 'India' },
  { code: 'HK', dial: '+852', name: 'Hong Kong' },
  { code: 'AU', dial: '+61', name: 'Australia' },
  { code: 'GB', dial: '+44', name: 'United Kingdom' },
  { code: 'US', dial: '+1', name: 'United States' },
  { code: 'AE', dial: '+971', name: 'UAE' },
];

/** Character limits for the "Add a company" fields. */
export const LIMITS = { name: 60, entityName: 120, url: 100, descriptor: 120 } as const;

/** Max length for the free-text contact name. */
export const CONTACT_NAME_MAX = 80;

// Free / personal email domains we reject — we want founders and team members,
// not personal inboxes. Subdomains of these are rejected too (see isFreeEmailDomain).
export const FREE_EMAIL_DOMAINS = new Set<string>([
  'gmail.com', 'googlemail.com', 'google.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.co.in', 'ymail.com', 'rocketmail.com',
  'hotmail.com', 'hotmail.co.uk', 'outlook.com', 'outlook.my', 'live.com', 'live.co.uk', 'msn.com',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com', 'pm.me',
  'aol.com', 'gmx.com', 'gmx.net', 'mail.com', 'zoho.com', 'yandex.com', 'yandex.ru',
  'qq.com', '163.com', '126.com', 'sina.com', 'foxmail.com',
]);

/** True if the domain is a known free provider or a subdomain of one. */
export function isFreeEmailDomain(domain: string): boolean {
  const d = domain.toLowerCase();
  if (FREE_EMAIL_DOMAINS.has(d)) return true;
  for (const free of FREE_EMAIL_DOMAINS) {
    if (d.endsWith('.' + free)) return true;
  }
  return false;
}

export const FREE_EMAIL_MESSAGE = 'Please use your work email — personal inboxes are not accepted.';

/** Returns an error message for the email, or null if valid/empty. */
export function emailError(raw: string): string | null {
  const e = (raw || '').trim().toLowerCase();
  if (!e) return null; // empty handled separately so we don't nag before typing
  const m = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/.exec(e);
  if (!m) return 'Enter a valid email address.';
  if (isFreeEmailDomain(m[1])) return FREE_EMAIL_MESSAGE;
  return null;
}

/** Strip a phone string down to digits only. */
export function phoneDigits(raw: string): string {
  return (raw || '').replace(/\D/g, '');
}

/** Returns an error message for the WhatsApp number, or null if valid/empty. */
export function phoneError(raw: string): string | null {
  const d = phoneDigits(raw);
  if (!d) return null;
  if (d.length < 6 || d.length > 14) return 'Enter a valid WhatsApp number.';
  return null;
}

/** Returns an error message for the website URL, or null if valid/empty. */
export function urlError(raw: string): string | null {
  const u = (raw || '').trim();
  if (!u) return null;
  const ok = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(\/[^\s]*)?$/i.test(u);
  if (!ok) return 'Enter a valid website, e.g. acme.com';
  return null;
}
