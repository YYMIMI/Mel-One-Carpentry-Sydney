import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../src/site.mjs';

const facts = {
  brand: 'Mel One', officeAddress: '9 Castlereagh Street, Sydney CBD',
  telephone: '0403202949', contactName: 'Felix2', serviceHours: '09:00–21:00',
};

test('homepages connect repair decisions, real work, office and enquiry in both languages', () => {
  for (const path of ['/', '/zh/']) {
    const html = renderPage(path, facts).html;
    assert.match(html, /id="repair-decisions"/);
    assert.match(html, /id="selected-work"/);
    assert.match(html, /id="office-location"/);
    assert.match(html, /google\.com\/maps\?q=9%20Castlereagh%20Street/);
    assert.match(html, /href="tel:0403202949"/);
    assert.match(html, /href="(?:\/zh)?\/contact\//);
  }
});

test('contact page provides an office map and a direct map fallback, not a suburb office claim', () => {
  const html = renderPage('/contact/', facts).html;
  assert.match(html, /<iframe[^>]+google\.com\/maps\?q=9%20Castlereagh%20Street/);
  assert.match(html, /Open the office location in Google Maps/);
  assert.match(html, /not a promise of walk-in appointments or a separate office in each service suburb/);
});

test('every page has a consistent call and photo-enquiry conversion rail', () => {
  for (const path of ['/', '/services/timber-fence-repairs/', '/areas/parramatta/', '/contact/', '/zh/']) {
    const html = renderPage(path, facts).html;
    assert.match(html, /class="site-conversion"/);
    assert.match(html, /class="mobile-contact-dock"/);
    assert.match(html, /href="tel:0403202949"/);
    assert.match(html, /href="(?:\/zh)?\/contact\//);
  }
});
