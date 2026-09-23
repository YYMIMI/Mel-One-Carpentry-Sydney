import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/site.mjs';

const facts = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url)));

test('soft redesign exposes four useful footer groups and confirmed identity', () => {
  const html = renderPage('/', facts).html;
  assert.equal((html.match(/class="footer-group(?: footer-identity)?"/g) ?? []).length, 4);
  assert.match(html, /39 666 325 408/);
  assert.match(html, /href="\/services\/timber-fence-repairs\/"/);
});

test('real-work intro images remain in their service galleries', () => {
  for (const [path, image] of [
    ['/services/cabinet-door-drawer-repairs/', 'cabinet-door-side.jpg'],
    ['/services/timber-fence-repairs/', 'fence-timber-work.jpg'],
  ]) {
    const html = renderPage(path, facts).html;
    assert.equal((html.match(new RegExp(image, 'g')) ?? []).length, 2);
  }
});
