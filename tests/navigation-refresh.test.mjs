import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/site.mjs';

test('service navigation groups remain distinct and link to the nine existing owners', () => {
  for (const path of ['/', '/zh/']) {
    const html = renderPage(path, { brand: 'Mel One' }).html;
    assert.match(html, /class="service-menu-group service-menu-group--timber"/);
    assert.match(html, /class="service-menu-group service-menu-group--outdoor"/);
    assert.match(html, /class="service-menu-group service-menu-group--interior"/);
    assert.match(html, /class="all-services"/);
  }
});

test('visual navigation states and soft surfaces are declared in shared styles', () => {
  const css = readFileSync(new URL('../public/site.css', import.meta.url), 'utf8');
  assert.match(css, /\.service-menu-group--timber/);
  assert.match(css, /\.service-menu-group--outdoor/);
  assert.match(css, /\.service-menu-group--interior/);
  assert.match(css, /\.service-menu\[open\] > summary/);
  assert.match(css, /\.service-menu-group a\[aria-current="page"\]/);
});
