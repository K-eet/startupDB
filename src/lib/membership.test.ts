// Run: node --test src/lib/membership.test.ts   (Node 22+, strips TS types)
// Pure gating/authorization decisions — no Firestore.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAffiliated, membershipFor, canPostAsCompany, isOwnerOf, isSoleOwner } from './membership.ts';
import type { Membership } from './membership.ts';
import { classifyRequestKind } from './company-request.ts';

const owner: Membership = { slug: 'ringgitplus', name: 'RinggitPlus', role: 'owner' };
const member: Membership = { slug: 'cradle', name: 'Cradle Fund', role: 'member' };
const ms = [owner, member];

test('isAffiliated: any membership counts', () => {
  assert.equal(isAffiliated(ms), true);
  assert.equal(isAffiliated([]), false);
});

test('membershipFor / canPostAsCompany: only for held slugs', () => {
  assert.equal(membershipFor(ms, 'cradle')?.role, 'member');
  assert.equal(membershipFor(ms, 'unknown'), undefined);
  assert.equal(canPostAsCompany(ms, 'ringgitplus'), true);
  assert.equal(canPostAsCompany(ms, 'unknown'), false);
});

test('isOwnerOf: owner vs member vs absent', () => {
  assert.equal(isOwnerOf(ms, 'ringgitplus'), true);
  assert.equal(isOwnerOf(ms, 'cradle'), false); // member, not owner
  assert.equal(isOwnerOf(ms, 'unknown'), false);
});

test('isSoleOwner: only when the uid is the single owner', () => {
  assert.equal(isSoleOwner(['u1'], 'u1'), true);
  assert.equal(isSoleOwner(['u1', 'u2'], 'u1'), false); // co-owner exists
  assert.equal(isSoleOwner(['u2'], 'u1'), false); // uid isn't the owner
  assert.equal(isSoleOwner([], 'u1'), false); // no owners
});

test('classifyRequestKind: claim when unowned, join when owned', () => {
  assert.equal(classifyRequestKind(undefined), 'claim');
  assert.equal(classifyRequestKind([]), 'claim');
  assert.equal(classifyRequestKind(['someuid']), 'join');
});
