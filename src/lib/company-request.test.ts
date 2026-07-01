// Run: node --test src/lib/company-request.test.ts   (Node 22+, strips TS types)
// company-request.ts is dependency-free, so it imports cleanly under node:test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isFreeEmailDomain,
  emailError,
  phoneError,
  phoneDigits,
  urlError,
  FREE_EMAIL_MESSAGE,
} from './company-request.ts';

test('isFreeEmailDomain: providers and their subdomains rejected', () => {
  assert.equal(isFreeEmailDomain('gmail.com'), true);
  assert.equal(isFreeEmailDomain('GMAIL.COM'), true); // case-insensitive
  assert.equal(isFreeEmailDomain('mail.gmail.com'), true); // subdomain
  assert.equal(isFreeEmailDomain('acme.com'), false);
  assert.equal(isFreeEmailDomain('notgmail.com'), false); // suffix, not subdomain
});

test('emailError: shape, work-email rule, empty', () => {
  assert.equal(emailError(''), null); // empty not nagged
  assert.equal(emailError('nope'), 'Enter a valid email address.');
  assert.equal(emailError('a@b'), 'Enter a valid email address.'); // no TLD
  assert.equal(emailError('me@gmail.com'), FREE_EMAIL_MESSAGE);
  assert.equal(emailError('founder@acme.com'), null);
  assert.equal(emailError('  Founder@Acme.com '), null); // trimmed + lowered
});

test('phoneDigits / phoneError: length bounds 6..14', () => {
  assert.equal(phoneDigits('+60 12-345 6789'), '60123456789');
  assert.equal(phoneError(''), null);
  assert.equal(phoneError('12345'), 'Enter a valid WhatsApp number.'); // 5 < 6
  assert.equal(phoneError('123456'), null); // 6 ok
  assert.equal(phoneError('123456789012345'), 'Enter a valid WhatsApp number.'); // 15 > 14
});

test('urlError: bare domain ok, junk rejected', () => {
  assert.equal(urlError(''), null);
  assert.equal(urlError('acme.com'), null);
  assert.equal(urlError('https://acme.com/x'), null);
  assert.equal(urlError('acme'), 'Enter a valid website, e.g. acme.com'); // no TLD
  assert.equal(urlError('http://'), 'Enter a valid website, e.g. acme.com');
});
