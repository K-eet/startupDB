// Run: node --test src/lib/event-submission.test.ts   (Node 22+, strips TS types)
// Only imports dependency-free modules (event-submission, events-data, membership).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateEventSubmission, decideEventStatus, EVENT_LIMITS } from './event-submission.ts';
import type { Membership } from './membership.ts';

const ok = {
  title: 'Founders Breakfast',
  date: '2026-08-01',
  time: '9:00am – 11:00am',
  location: 'WORQ, TTDI',
  category: 'Meetup',
  tags: ['Networking', 'Free'],
};

test('validateEventSubmission: accepts a well-formed submission', () => {
  const r = validateEventSubmission(ok);
  assert.equal(r.error, undefined);
  assert.equal(r.value?.title, 'Founders Breakfast');
  assert.equal(r.value?.online, false);
});

test('validateEventSubmission: required fields', () => {
  assert.equal(validateEventSubmission({ ...ok, title: '' }).error, 'Event title is required.');
  assert.equal(validateEventSubmission({ ...ok, time: '  ' }).error, 'Event time is required.');
  assert.equal(validateEventSubmission({ ...ok, location: '' }).error, 'Event location is required.');
});

test('validateEventSubmission: date must be ISO and real', () => {
  assert.equal(validateEventSubmission({ ...ok, date: '01-08-2026' }).error, 'Enter a valid date.');
  assert.equal(validateEventSubmission({ ...ok, date: '2026-13-40' }).error, 'Enter a valid date.');
});

test('validateEventSubmission: category must be known', () => {
  assert.equal(validateEventSubmission({ ...ok, category: 'Party' }).error, 'Choose a valid category.');
});

test('validateEventSubmission: tags trimmed, capped, deduped of blanks', () => {
  const many = Array.from({ length: 20 }, (_, i) => `tag${i}`);
  const r = validateEventSubmission({ ...ok, tags: [' a ', '', '  ', ...many] });
  assert.equal(r.value?.tags.length, EVENT_LIMITS.tags);
  assert.equal(r.value?.tags[0], 'a');
});

test('validateEventSubmission: online inferred from "Online" location', () => {
  assert.equal(validateEventSubmission({ ...ok, location: 'Online' }).value?.online, true);
});

test('validateEventSubmission: companySlug passes through', () => {
  assert.equal(validateEventSubmission({ ...ok, companySlug: 'ringgitplus' }).value?.companySlug, 'ringgitplus');
  assert.equal(validateEventSubmission(ok).value?.companySlug, undefined);
});

test('decideEventStatus: affiliated → live, unaffiliated → pending', () => {
  const member: Membership[] = [{ slug: 'acme', name: 'Acme', role: 'member' }];
  assert.equal(decideEventStatus(member), 'live');
  assert.equal(decideEventStatus([]), 'pending_review');
});
