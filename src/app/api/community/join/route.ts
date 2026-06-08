import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

const COLLECTION = 'communitySignups';
const MAX_LENGTH = 1000;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHATSAPP_RE = /^[0-9 ()+-]{6,20}$/;
const AREA_CODE_RE = /^[0-9]{1,4}$/;

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim().slice(0, MAX_LENGTH) : '';
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
  const name = asTrimmedString(data.name);
  const email = asTrimmedString(data.email).toLowerCase();
  const areaCode = asTrimmedString(data.areaCode).replace(/^\+/, '');
  const whatsapp = asTrimmedString(data.whatsapp);
  const role = asTrimmedString(data.role);
  const org = asTrimmedString(data.org);
  const working = asTrimmedString(data.working);

  if (!name || !email || !areaCode || !whatsapp || !role) {
    return NextResponse.json({ error: 'Name, email, area code, WhatsApp number, and role are required.' }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }
  if (!AREA_CODE_RE.test(areaCode)) {
    return NextResponse.json({ error: 'Please provide a valid area code.' }, { status: 400 });
  }
  if (!WHATSAPP_RE.test(whatsapp)) {
    return NextResponse.json({ error: 'Please provide a valid WhatsApp number.' }, { status: 400 });
  }

  try {
    const docRef = await adminDb.collection(COLLECTION).add({
      name,
      email,
      areaCode,
      whatsapp: `+${areaCode} ${whatsapp}`,
      org,
      role,
      working,
      status: 'pending',
      submittedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (error) {
    console.error('Failed to record community signup:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again later.' }, { status: 500 });
  }
}
