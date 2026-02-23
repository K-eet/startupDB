import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ isAdmin: false }, { status: 400 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    const email = decoded.email?.toLowerCase();

    if (!email || !decoded.email_verified) {
      return NextResponse.json({ isAdmin: false });
    }

    const adminEmails = (process.env.ADMIN_EMAILS ?? '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = adminEmails.includes(email);

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error('Admin check failed:', error);
    return NextResponse.json({ isAdmin: false }, { status: 401 });
  }
}
