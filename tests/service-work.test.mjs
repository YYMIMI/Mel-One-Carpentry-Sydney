import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pages, renderPage } from '../src/site.mjs';
import { serviceWork } from '../src/service-work.mjs';

test('each existing service renders its own three repair options in both languages', () => {
  for (const page of pages.filter(p => /^S\d+/.test(p.id))) {
    const options = serviceWork[page.id];
    assert.equal(options.length, 3);
    const html = renderPage(page.path).html;
    const offset = page.locale === 'zh' ? 2 : 0;
    assert.match(html, /id="repair-work"/);
    for (const row of options) {
      assert.ok(html.includes(row[offset]), page.path + ': ' + row[offset]);
      assert.ok(html.includes(row[offset + 1]), page.path);
    }
  }
});

test('homepage outdoor decisions link to fence, gate and deck owners in the current language', () => {
  for (const locale of ['en', 'zh']) {
    const prefix = locale === 'zh' ? '/zh' : '';
    const html = renderPage(prefix + '/').html;
    const section = html.split('id="repair-decisions"')[1].split('</section>')[0];
    for (const slug of ['timber-fence-repairs', 'timber-gate-repairs', 'deck-repairs']) {
      assert.ok(section.includes('href="' + prefix + '/services/' + slug + '/"'));
    }
  }
});
