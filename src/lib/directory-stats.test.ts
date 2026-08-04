// Run: node --test src/lib/directory-stats.test.ts   (Node 22+, strips TS types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { directoryStats } from './directory-stats.ts';
import { directoryJsonLd } from './company-jsonld.ts';
import type { Company } from '../types/company.ts';

// Only the fields directoryStats reads; the rest of Company is irrelevant here.
const sample = [
  { 'Company Name': 'A', Slug: 'a', Industry: 'B2B', 'Headquarters City': 'KL', 'Founded Year': 2010 },
  { 'Company Name': 'B', Slug: 'b', Industry: 'B2B', 'Headquarters City': 'KL', 'Founded Year': 2020 },
  { 'Company Name': 'C', Slug: 'c', Industry: 'FinTech', 'Headquarters City': 'Penang', 'Founded Year': 2022 },
] as unknown as Company[];

test('directoryStats aggregates the corpus', () => {
  const stats = directoryStats(sample);
  assert.equal(stats.total, 3);
  assert.equal(stats.cities, 2, 'KL counted once, Penang once');
  assert.equal(stats.medianYear, 2020, 'odd count -> middle year');
  // One of three companies (2022) was founded after the median.
  assert.equal(stats.pctAfterMedian, 33);

  const b2b = stats.bySector.find((s) => s.name === 'B2B');
  assert.deepEqual(b2b, { name: 'B2B', count: 2, pct: 67 });
  assert.equal(stats.bySector[0].name, 'B2B', 'sorted biggest first');
  // Sectors with no companies still appear, so the grid never gains/loses cards.
  assert.ok(stats.bySector.some((s) => s.count === 0));
});

test('directoryStats survives an empty corpus without dividing by zero', () => {
  const stats = directoryStats([]);
  assert.equal(stats.total, 0);
  assert.equal(stats.medianYear, 0);
  assert.equal(stats.pctAfterMedian, 0);
  assert.ok(stats.bySector.every((s) => s.pct === 0));
});

test('directoryStats ignores implausible founding years', () => {
  const stats = directoryStats([
    { ...sample[0], 'Founded Year': 0 },
    { ...sample[1], 'Founded Year': 1800 },
    { ...sample[2], 'Founded Year': 2015 },
  ] as Company[]);
  assert.equal(stats.medianYear, 2015, 'only the valid year feeds the median');
});

test('directoryJsonLd reports the true total, not the rendered slice', () => {
  const ld = directoryJsonLd(sample.slice(0, 2), 'https://startupdb.my', {
    path: '/',
    name: 'Directory',
    description: 'desc',
    total: 2462,
  });
  const collection = ld['@graph'][1] as any;
  assert.equal(collection.mainEntity.numberOfItems, 2462);
  assert.equal(collection.mainEntity.itemListElement.length, 2);
  assert.equal(
    collection.mainEntity.itemListElement[0].url,
    'https://startupdb.my/companies/a'
  );
  assert.equal(collection['@id'], 'https://startupdb.my/');
});

test('directoryJsonLd drops companies without a slug', () => {
  const ld = directoryJsonLd(
    [{ 'Company Name': 'No Slug', Slug: '' } as Company],
    'https://startupdb.my',
    { path: '/companies', name: 'A–Z', description: 'd', total: 1 }
  );
  assert.equal((ld['@graph'][1] as any).mainEntity.itemListElement.length, 0);
});
