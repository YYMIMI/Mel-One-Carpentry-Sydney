import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/site.mjs';

const facts = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url)));

test('both homepages lead with a supplied work photo and the existing inquiry flow', () => {
  for (const path of ['/', '/zh/']) {
    const html = renderPage(path, facts).html;
    const heroEnd = html.indexOf('</figure></div>');
    assert.ok(heroEnd > 0);
    assert.match(html.slice(0, heroEnd), /<img[^>]+src="\/assets\/real-work\/fence-timber-work\.jpg"/);
    assert.ok(html.indexOf('id="inquiry"') > heroEnd);
    assert.ok(html.indexOf('id="inquiry"') < html.indexOf('id="selected-work"'));
    assert.match(html, /<form id="inquiry" action="\/api\/inquiry" method="post" enctype="multipart\/form-data" novalidate>/);
    assert.equal((html.match(/id="inquiry"/g) ?? []).length, 1);
    assert.match(html, /<script src="\/form\.js" defer><\/script>/);
    assert.match(html, /href="tel:0403202949"/);
  }
});

test('real-work browsing keeps all five existing owner links and has explicit controls', () => {
  for (const path of ['/', '/zh/']) {
    const html = renderPage(path, facts).html;
    const gallery = html.slice(html.indexOf('id="selected-work"'), html.indexOf('</section>', html.indexOf('id="selected-work"')));
    assert.equal((gallery.match(/class="case-card"/g) ?? []).length, 5);
    assert.match(gallery, /class="case-scroll"/);
    assert.match(gallery, /class="case-scroll-control"[^>]+data-direction="previous"/);
    assert.match(gallery, /class="case-scroll-control"[^>]+data-direction="next"/);
    assert.match(gallery, /\/services\/timber-fence-repairs\/#case-photos/);
    assert.match(gallery, /\/services\/cabinet-door-drawer-repairs\/#case-photos/);
  }
});

test('preview delivery caveat is not shown as production homepage copy', () => {
  const html = renderPage('/', facts, { production: true }).html;
  assert.doesNotMatch(html, /Preview enquiries do not prove inbox delivery/);
});
