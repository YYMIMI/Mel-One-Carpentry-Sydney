import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../src/site.mjs';

test('homepage makes practical booking concerns visible in both languages', () => {
  const en = renderPage('/', { brand: 'Mel One' }).html;
  const zh = renderPage('/zh/', { brand: 'Mel One' }).html;
  for (const html of [en, zh]) {
    assert.match(html, /id="customer-concerns"/);
    assert.match(html, /href="(?:\/zh)?\/faq\/"/);
    assert.match(html, /href="(?:\/zh)?\/contact\/"/);
  }
  assert.match(en, /What will the quote include\?/);
  assert.match(en, /What if hidden damage appears\?/);
  assert.match(zh, /报价包含哪些工作？/);
  assert.match(zh, /拆开后发现更多损坏怎么办？/);
});

test('FAQ answers cost, changed scope, access, timing and evidence without invented guarantees', () => {
  const en = renderPage('/faq/', { brand: 'Mel One' }).html;
  const zh = renderPage('/zh/faq/', { brand: 'Mel One' }).html;
  assert.match(en, /What affects the cost of a timber repair\?/);
  assert.match(en, /Who supplies materials and handles disposal\?/);
  assert.match(en, /When can work be scheduled\?/);
  assert.match(en, /How can I check the company and insurance\?/);
  assert.match(zh, /木作维修费用由什么决定？/);
  assert.match(zh, /材料与清运由谁负责？/);
  assert.doesNotMatch(en + zh, /guaranteed same-day|保证当天到场|fixed price for every job/);
});
