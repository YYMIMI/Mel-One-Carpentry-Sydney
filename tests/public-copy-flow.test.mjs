import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderPage } from '../src/site.mjs';

const facts = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url)));

test('homepages answer the problem before asking for an enquiry', () => {
  for (const route of ['/', '/zh/']) {
    const html = renderPage(route, facts).html;
    const serviceIndex = html.indexOf('What needs repairing?') >= 0 ? html.indexOf('What needs repairing?') : html.indexOf('哪一处木作需要处理？');
    assert.ok(serviceIndex > 0);
    assert.ok(html.indexOf('id="customer-concerns"') > serviceIndex);
    assert.ok(html.indexOf('id="inquiry"') > html.indexOf('id="customer-concerns"'));
    assert.match(html, /href="tel:0403202949"/);
    assert.match(html, /href="#inquiry"/);
  }
});

test('public pages avoid internal production terminology', () => {
  for (const route of ['/', '/zh/', '/services/', '/zh/services/', '/areas/', '/zh/areas/', '/privacy/', '/zh/privacy/']) {
    const html = renderPage(route, facts).html;
    const visible = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
    assert.doesNotMatch(visible, /Protected content preview|Preview enquiries|directory entry|service owner|internal access|受保护内容预览|预览表单|目录条目|内部访问/i, route);
  }
});
