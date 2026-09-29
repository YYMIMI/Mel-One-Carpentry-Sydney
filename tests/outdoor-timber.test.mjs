import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { pages, renderPage } from '../src/site.mjs';

test('new outdoor enquiries have bilingual service owners, photos and selected contact handoff', () => {
  for (const prefix of ['', '/zh']) {
    for (const [slug, id] of [['timber-sleeper-installation', 'S16'], ['under-house-timber-screening', 'S17']]) {
      const path = `${prefix}/services/${slug}/`;
      const result = renderPage(path, {});
      assert.equal(result.status, 200, path);
      assert.ok(pages.some(p => p.path === path && p.id === id));
      assert.ok(result.html.includes(`href="${prefix}/contact/?service=${id}"`));
      assert.match(result.html, /id="case-photos"/);
      const gallery = result.html.split('id="case-photos"')[1].split('</section>')[0];
      for (const [, src] of gallery.matchAll(/src="([^"]+)"/g)) {
        assert.ok(existsSync(new URL('../public' + src, import.meta.url)), src);
      }
      assert.ok(renderPage(`${prefix}/contact/`, {}).html.includes(`value="${id}"`));
      const home = renderPage(prefix + '/', {}).html;
      assert.ok(home.includes(`href="${path}#case-photos"`));
      assert.ok(home.split('service-menu-panel')[1].split('</details>')[0].includes(path));
    }
  }
});

test('fence and deck body content connects new outdoor work without removing original owners', () => {
  for (const prefix of ['', '/zh']) {
    for (const slug of ['timber-fence-repairs', 'deck-repairs']) {
      const main = renderPage(`${prefix}/services/${slug}/`, {}).html.split('<main')[1].split('</main>')[0];
      for (const related of ['timber-sleeper-installation', 'under-house-timber-screening']) {
        assert.ok(main.includes(`href="${prefix}/services/${related}/"`), `${slug} → ${related}`);
      }
    }
    for (let i = 1; i <= 9; i++) assert.ok(pages.some(p => p.id === `S0${i}` && p.locale === (prefix ? 'zh' : 'en')));
  }
});
