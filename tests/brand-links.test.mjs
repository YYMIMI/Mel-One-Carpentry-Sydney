import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/site.mjs';

const facts = {
  brand: 'Mel One', telephone: '0403202949',
  legalEntity: 'Mel One Property Maintenance Pty Ltd',
  officeAddress: '9 Castlereagh Street, Sydney CBD',
};

test('both languages use the supplied Mel One logo for the browser icon and shared brand locations', () => {
  for (const path of ['/', '/zh/', '/services/timber-fence-repairs/']) {
    const html = renderPage(path, facts).html;
    assert.match(html, /<link rel="icon"[^>]+href="\/assets\/mel-one-logo\.jpg"/);
    assert.equal((html.match(/src="\/assets\/mel-one-logo\.jpg"/g) ?? []).length, 2);
    assert.doesNotMatch(html, /href="\/favicon\.svg"/);
  }
});

test('phone stands out consistently in the top contact strip and footer', () => {
  const css = readFileSync(new URL('../public/site.css', import.meta.url), 'utf8');
  assert.match(css, /\.business-contact a\s*\{[^}]*font-size:\s*1\.2rem/s);
  assert.match(css, /\.footer-group a\[href\^="tel:"\]\s*\{[^}]*font-size:\s*1\.2rem/s);
  const html = renderPage('/zh/', facts).html;
  assert.equal((html.match(/href="tel:0403202949"/g) ?? []).length >= 3, true);
});

test('about and help pages link to genuine evidence and next-step owner pages', () => {
  for (const prefix of ['', '/zh']) {
    const about = renderPage(prefix + '/about/', facts).html;
    const help = renderPage(prefix + '/faq/', facts).html;
    const home = renderPage(prefix + '/', facts).html;
    assert.match(about, /href="https:\/\/abr\.business\.gov\.au\/ABN\/View\?id=39666325408"[^>]+rel="noopener noreferrer"/);
    assert.match(about, new RegExp('href="' + prefix + '/#selected-work"'));
    assert.match(help, new RegExp('href="' + prefix + '/services/timber-fence-repairs/"'));
    assert.match(home, new RegExp('href="' + prefix + '/services/timber-window-repairs/"'));
  }
});
