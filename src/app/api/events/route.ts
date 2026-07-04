import { NextRequest, NextResponse } from 'next/server';
import { FieldValue } from 'firebase-admin/firestore';
import { requireUser, displayName } from '@/lib/verify-request';
import { getMemberships } from '@/lib/membership-db';
import { canPostAsCompany, membershipFor } from '@/lib/membership';
import { validateEventSubmission, decideEventStatus } from '@/lib/event-submission';
import { listLiveEvents, createEvent, countEventsByOwnerSince } from '@/lib/events-db';

// Admin SDK needs runtime credentials — never prerender.
export const dynamic = 'force-dynamic';

// Per-uid spam cap: max events one account may create per rolling day.
const DAILY_EVENT_CAP = 10;

/** Public: list live events (soonest first). */
export async function GET() {
  try {
    const events = await listLiveEvents();
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Failed to list events:', error);
    return NextResponse.json({ error: 'Failed to load events.' }, { status: 500 });
  }
}

/** Create an event. Affiliated users post instantly; others enter moderation. */
export async function POST(request: NextRequest) {
  const decoded = await requireUser(request);
  if (!decoded) {
    return NextResponse.json({ error: 'Please sign in to post an event.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const result = validateEventSubmission(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  const submission = result.value;

  try {
    // Rate cap (ponytail: in-memory count of the uid's docs since start of day,
    // avoids a (ownerUid, createdAt) composite index).
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const todays = await countEventsByOwnerSince(decoded.uid, since.getTime());
    if (todays >= DAILY_EVENT_CAP) {
      return NextResponse.json(
        { error: 'Daily event limit reached. Try again tomorrow.' },
        { status: 429 }
      );
    }

    const memberships = await getMemberships(decoded.uid);

    // "Post as" a company requires an approved membership on it (never trusted
    // from the client body).
    let companySlug: string | undefined;
    let companyName: string | undefined;
    if (submission.companySlug) {
      if (!canPostAsCompany(memberships, submission.companySlug)) {
        return NextResponse.json(
          { error: 'You are not a member of that company.' },
          { status: 403 }
        );
      }
      companySlug = submission.companySlug;
      companyName = membershipFor(memberships, submission.companySlug)?.name;
    }

    const status = decideEventStatus(memberships);

    const id = await createEvent({
      title: submission.title,
      date: submission.date,
      time: submission.time,
      location: submission.location,
      online: submission.online,
      category: submission.category,
      tags: submission.tags,
      status,
      ownerUid: decoded.uid,
      postedByName: displayName(decoded),
      ...(companySlug ? { companySlug, companyName } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id, status }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
