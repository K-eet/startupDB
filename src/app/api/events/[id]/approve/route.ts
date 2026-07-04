import { NextRequest, NextResponse } from 'next/server';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { getEvent, updateEvent } from '@/lib/events-db';

export const dynamic = 'force-dynamic';

/** Approve a pending event → status 'live'. Admin only. (Reject = DELETE /api/events/[id].) */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = await requireUser(request);
  if (!decoded || !isAdmin(decoded)) {
    return NextResponse.json({ error: 'Admin only.' }, { status: 403 });
  }

  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });

  try {
    await updateEvent(id, { status: 'live' });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to approve event:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
