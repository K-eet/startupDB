import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';
import {
  CONTACT_NAME_MAX,
  LIMITS,
  emailError,
  phoneDigits,
  phoneError,
  urlError,
} from '@/lib/company-request';

const COLLECTION = 'companyRequests';

function asTrimmedString(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const type = data.type === 'claim' ? 'claim' : data.type === 'add' ? 'add' : null;
  if (!type) {
    return NextResponse.json({ error: 'Invalid request type.' }, { status: 400 });
  }

  // ---- Shared contact fields ----
  const name = asTrimmedString(data.name, CONTACT_NAME_MAX);
  const email = asTrimmedString(data.email, 200).toLowerCase();
  const dialCode = asTrimmedString(data.dialCode, 6);
  const countryCode = asTrimmedString(data.countryCode, 4);
  const number = phoneDigits(asTrimmedString(data.number, 32));

  if (!name) {
    return NextResponse.json({ error: 'Please tell us your name.' }, { status: 400 });
  }
  if (!email) {
    return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
  }
  const eErr = emailError(email);
  if (eErr) {
    return NextResponse.json({ error: eErr }, { status: 400 });
  }
  if (!number) {
    return NextResponse.json({ error: 'WhatsApp number is required.' }, { status: 400 });
  }
  const pErr = phoneError(number);
  if (pErr) {
    return NextResponse.json({ error: pErr }, { status: 400 });
  }
  if (!dialCode || !countryCode) {
    return NextResponse.json({ error: 'Select a country dial code.' }, { status: 400 });
  }

  // ---- Per-mode company payload ----
  let company: Record<string, unknown>;
  if (type === 'claim') {
    const slug = asTrimmedString(data.companySlug, 200);
    const companyName = asTrimmedString(data.companyName, 200);
    if (!slug || !companyName) {
      return NextResponse.json({ error: 'Missing company reference for claim.' }, { status: 400 });
    }
    company = { slug, name: companyName, indexed: true };
  } else {
    const companyName = asTrimmedString(data.companyName, LIMITS.name);
    const url = asTrimmedString(data.url, LIMITS.url);
    const descriptor = asTrimmedString(data.descriptor, LIMITS.descriptor);
    if (!companyName || !url || !descriptor) {
      return NextResponse.json({ error: 'Company name, website, and descriptor are required.' }, { status: 400 });
    }
    const uErr = urlError(url);
    if (uErr) {
      return NextResponse.json({ error: uErr }, { status: 400 });
    }
    company = { name: companyName, url, descriptor };
  }

  try {
    const docRef = await adminDb.collection(COLLECTION).add({
      type,
      // true (1) = submitted via "Add a company"; false (0) = via "Claim a company".
      newCompany: type === 'add',
      contact: {
        name,
        email,
        whatsapp: {
          countryCode,
          dialCode,
          number,
          e164: dialCode + number,
        },
      },
      company,
      status: 'pending_review',
      submittedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to record company request:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
