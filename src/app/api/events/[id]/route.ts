import { NextRequest, NextResponse } from 'next/server';
import { requireUser, isAdmin } from '@/lib/verify-request';
import { validateEventSubmission } from '@/lib/event-submission';
import { getEvent, updateEvent, deleteEvent } from '@/lib/events-db';

export const dynamic = 'force-dynamic';

/** Edit an event's content. Owner-of-event or admin only. Attribution/status unchanged. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = await requireUser(request);
  if (!decoded) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  if (event.ownerUid !== decoded.uid && !isAdmin(decoded)) {
    return NextResponse.json({ error: 'You cannot edit this event.' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = validateEventSubmission(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  const s = result.value;

  try {
    // Only content fields are editable — status, ownerUid and company attribution
    // stay as originally set so an edit can't change gating or ownership.
    await updateEvent(id, {
      title: s.title,
      date: s.date,
      time: s.time,
      location: s.location,
      online: s.online,
      category: s.category,
      tags: s.tags,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update event:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

/** Delete an event (doubles as "reject" for pending). Owner-of-event or admin only. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = await requireUser(request);
  if (!decoded) return NextResponse.json({ error: 'Please sign in.' }, { status: 401 });

  const event = await getEvent(id);
  if (!event) return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  if (event.ownerUid !== decoded.uid && !isAdmin(decoded)) {
    return NextResponse.json({ error: 'You cannot delete this event.' }, { status: 403 });
  }

  try {
    await deleteEvent(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete event:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
