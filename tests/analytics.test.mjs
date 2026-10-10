import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

import { renderPage } from '../src/site.mjs';

const facts = JSON.parse(readFileSync(new URL('../site.config.json', import.meta.url), 'utf8'));

function runAnalyticsBootstrap(html, hostname) {
  const source = html.match(/<script data-ga4-bootstrap>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(source, 'rendered page should contain the GA4 bootstrap');

  const appended = [];
  const window = { location: {
    hostname,
    origin: `https://${hostname}`,
    pathname: '/contact/',
    search: '?suburb=customer-entered-value',
    hash: '#private-fragment',
  } };
  const document = {
    createElement(tagName) { return { tagName }; },
    head: { appendChild(node) { appended.push(node); } },
  };
  vm.runInNewContext(source, { window, document, Date, Set });
  return { appended, window };
}

test('GA4 loads once on each approved Sydney Carpentry hostname', () => {
  const html = renderPage('/', facts, { indexable: true }).html;
  assert.equal((html.match(/data-ga4-bootstrap/g) || []).length, 1);

  for (const hostname of ['www.thesydneycarpenter.com.au', 'thesydneycarpenter.com.au']) {
    const { appended, window } = runAnalyticsBootstrap(html, hostname);
    assert.equal(appended.length, 1);
    assert.equal(appended[0].async, true);
    assert.equal(appended[0].src, 'https://www.googletagmanager.com/gtag/js?id=G-2FKG0LZ2V1');
    assert.equal(typeof window.gtag, 'function');
    assert.equal(window.dataLayer.length, 2);
    assert.equal(window.dataLayer[1][0], 'config');
    assert.deepEqual(
      JSON.parse(JSON.stringify(window.dataLayer[1][2])),
      { page_location: `https://${hostname}/contact/`, page_path: '/contact/' },
    );
  }
});

test('GA4 does not load on Vercel previews or unrelated hosts', () => {
  const html = renderPage('/', facts, { indexable: true }).html;
  for (const hostname of ['mel-one-carpentry-sydney.vercel.app', 'localhost', 'example.com']) {
    const { appended, window } = runAnalyticsBootstrap(html, hostname);
    assert.equal(appended.length, 0);
    assert.equal(window.gtag, undefined);
    assert.equal(window.dataLayer, undefined);
  }
});

test('call and email links use the unified GA4 event names', () => {
  const html = renderPage('/contact/', facts, { indexable: true }).html;
  const contactLinks = [...html.matchAll(/<a\b[^>]*href="(?<scheme>tel:|mailto:)[^"]*"[^>]*>/g)];
  assert.ok(contactLinks.length > 0);
  for (const match of contactLinks) {
    const expected = match.groups.scheme === 'tel:' ? 'click_to_call' : 'click_to_email';
    assert.match(match[0], new RegExp(`data-event="${expected}"`));
  }

  const siteScript = readFileSync(new URL('../public/site.js', import.meta.url), 'utf8');
  assert.match(siteScript, /window\.gtag\?\.\('event',\s*link\.dataset\.event/);
  assert.match(siteScript, /page_location:\s*location\.origin\s*\+\s*location\.pathname/);
  assert.doesNotMatch(siteScript, /phone_click|email_click|dataLayer\?\.push/);
});

test('every custom event uses a page location without query or fragment data', () => {
  for (const file of ['site.js', 'rfq.js', 'form.js']) {
    const source = readFileSync(new URL(`../public/${file}`, import.meta.url), 'utf8');
    assert.match(source, /page_location:\s*location\.origin\s*\+\s*location\.pathname/);
    assert.doesNotMatch(source, /page_location:\s*location\.href/);
  }
});

test('RFQ actions remain intent events and never report a successful lead', () => {
  const source = readFileSync(new URL('../public/rfq.js', import.meta.url), 'utf8');
  assert.match(source, /rfq_draft_prepared/);
  assert.match(source, /rfq_email_open/);
  assert.doesNotMatch(source, /generate_lead|lead_submit_success/);
});

test('future backend form reports generate_lead only after accepted true', () => {
  const source = readFileSync(new URL('../public/form.js', import.meta.url), 'utf8');
  const acceptedCheck = source.indexOf("if (!response.ok || !data.accepted)");
  const generateLead = source.indexOf("'generate_lead'");
  assert.ok(acceptedCheck >= 0);
  assert.ok(generateLead > acceptedCheck);
  assert.doesNotMatch(source, /lead_submit_success/);
});

test('privacy pages explain analytics without sending enquiry personal data', () => {
  for (const path of ['/privacy/', '/zh/privacy/']) {
    const html = renderPage(path, facts, { indexable: true }).html;
    assert.match(html, /Google Analytics/);
  }
  const en = renderPage('/privacy/', facts, { indexable: true }).html;
  assert.match(en, /clicking a phone or email link/i);
  assert.match(en, /do not send names, contact details, suburb text, job descriptions, email draft contents or photos/i);
  const zh = renderPage('/zh/privacy/', facts, { indexable: true }).html;
  assert.match(zh, /点击电话或电邮链接/);
  assert.match(zh, /不会把姓名、联系方式、填写的地区、工程描述、电邮草稿内容或照片发送给 Google Analytics/);
});
