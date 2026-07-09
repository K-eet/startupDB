// Run: node --test src/lib/company-jsonld.test.ts   (Node 22+, strips TS types)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Company } from '../types/company.ts';
import { companyJsonLd } from './company-jsonld.ts';

const full = {
  'Company Name': 'Acme Robotics',
  Slug: 'acme-robotics',
  Industry: 'Manufacturing',
  'One-line company description': 'Warehouse robots for SEA.',
  Description: 'Longer description.',
  'Founded Year': 2019,
  'Website URL': 'https://acme.example',
  'Headquarters City': 'Kuala Lumpur',
  'Headquarters State': 'Selangor',
  'Headquarters Country': 'Malaysia',
  'Founder Names': 'Alice Tan; Bob Lee',
  'Founder Titles': 'CEO; CTO',
} as unknown as Company;

test('full company: Organization + BreadcrumbList with mapped fields', () => {
  const ld = companyJsonLd(full, 'https://startupdb.my');
  assert.equal(ld['@context'], 'https://schema.org');
  const [org, crumbs] = ld['@graph'];

  assert.equal(org['@type'], 'Organization');
  assert.equal(org.name, 'Acme Robotics');
  assert.equal(org.url, 'https://acme.example');
  assert.equal(org.foundingDate, '2019'); // number → string
  assert.equal(org.description, 'Warehouse robots for SEA.'); // one-liner wins
  assert.equal(org.address.addressCountry, 'Malaysia');
  assert.equal(org.founder.length, 2);
  assert.equal(org.founder[0].name, 'Alice Tan');

  assert.equal(crumbs['@type'], 'BreadcrumbList');
  assert.equal(crumbs.itemListElement[2].item, 'https://startupdb.my/companies/acme-robotics');
});

test('sparse company: blank fields are omitted, not emitted empty', () => {
  const sparse = { 'Company Name': 'Bare Co', Slug: 'bare-co' } as unknown as Company;
  const [org] = companyJsonLd(sparse, 'https://startupdb.my')['@graph'];
  assert.equal(org.name, 'Bare Co');
  assert.equal('url' in org, false);
  assert.equal('address' in org, false);
  assert.equal('founder' in org, false);
  assert.equal('foundingDate' in org, false);
  assert.equal('description' in org, false); // falls back to Description, also blank
});
