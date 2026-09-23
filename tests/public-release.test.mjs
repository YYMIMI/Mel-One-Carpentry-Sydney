import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from '../scripts/build.mjs';
import { pages, renderPage } from '../src/site.mjs';
import { makeRfq } from '../public/rfq.js';

const facts = { brand: 'Mel One', domain: 'https://mel-one-carpentry-sydney.vercel.app', indexingAuthorized: true, email: 'handyman.kevinlee@gmail.com' };
test('public release makes every page indexable with reciprocal language URLs and complete sitemap', async () => {
  const dest = await mkdtemp(join(tmpdir(), 'public-release-'));
  try {
    const result = await buildSite({ dest, facts, indexable: true });
    assert.equal(result.routes.length, 144);
    const sitemap = await readFile(join(dest, 'sitemap.xml'), 'utf8');
    assert.equal((sitemap.match(/<loc>/g) || []).length, 144);
    const llms = await readFile(join(dest, 'llms.txt'), 'utf8');
    assert.ok(llms.includes(facts.domain + '/zh/privacy/'));
    assert.ok(llms.includes(facts.domain + '/areas/sydney-cbd/'));
    assert.match(await readFile(join(dest, 'robots.txt'), 'utf8'), /Allow: \/\nSitemap:/);
    for (const page of pages) {
      const html = await readFile(join(dest, page.path, 'index.html'), 'utf8');
      assert.doesNotMatch(html, /noindex|nofollow/);
      assert.ok(html.includes('rel="canonical" href="' + facts.domain + page.path + '"'), page.path);
      assert.ok(html.includes('href="' + facts.domain + page.alternate + '"'), page.path);
    }
    await buildSite({ dest, facts, indexable: false });
    await assert.rejects(readFile(join(dest, 'sitemap.xml')), { code: 'ENOENT' });
  } finally { await rm(dest, { recursive: true, force: true }); }
});
test('RFQ preserves bilingual and multiline enquiry data without claiming delivery', () => {
  const draft = makeRfq({ suburb: 'Chatswood', service: '木窗维修', scope: '窗框损坏\n需对比修补与更换', contact: 'Synthetic QA contact' }, true);
  assert.match(draft.subject, /Chatswood/);
  assert.match(draft.body, /窗框损坏\n需对比修补与更换/);
  assert.match(draft.body, /待确认/);
  assert.doesNotMatch(draft.body, /已发送|已收到/);
  assert.throws(() => makeRfq({ suburb: 'Chatswood' }), /Required/);
  for (const path of ['/', '/contact/', '/zh/', '/zh/contact/']) {
    const html = renderPage(path, facts, { indexable: true }).html;
    assert.match(html, /data-rfq-email=/);
    assert.doesNotMatch(html, /action="\/api\/inquiry"/);
  }
});
test('public indexing requires an explicit authorization and HTTPS origin', async () => {
  await assert.rejects(buildSite({ indexable: true, facts: {} }), /indexing/);
  await assert.rejects(buildSite({ indexable: true, facts: { ...facts, domain: 'javascript:alert(1)' } }), /origin/);
});
test('every suburb has a specific scope, FAQ, map and editable email RFQ without claiming receipt', () => {
  for (const page of pages.filter(p => p.area)) {
    const html = renderPage(page.path, facts, { indexable: true }).html;
    assert.match(html, /id="quote-decisions"/);
    assert.match(html, /id="area-map"/);
    assert.match(html, /id="suburb-rfq"/);
    assert.ok(html.includes('value="' + page.area.name + '"'));
    assert.match(html, /data-rfq-email="handyman.kevinlee@gmail.com"/);
    assert.ok(page.area.detail.en.length > 150, page.path);
    assert.ok(page.area.detail.zh.length > 70, page.path);
  }
  assert.equal(new Set(pages.filter(p => p.area && p.locale === 'en').map(p => p.area.detail.en)).size, 56);
});
