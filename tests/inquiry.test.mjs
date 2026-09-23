import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry, detectImage, captureAttribution } from '../src/inquiry.mjs';

const valid = { serviceId: 'S01', locale: 'en', suburb: 'Chatswood', description: 'Timber sill is soft near the corner.', phone: '0400 000 000', email: '', idempotencyKey: 'e382522e-0986-4924-9333-73f03a6c214b' };
test('contact by either phone or email, and no assumed area approval', () => {
  assert.equal(validateInquiry(valid).ok, true);
  assert.equal(validateInquiry({ ...valid, phone: '', email: 'a@example.com' }).ok, true);
  assert.equal(validateInquiry({ ...valid, description: 'Window sill is soft.\nIt happened after rain.' }).ok, true);
  assert.equal(validateInquiry({ ...valid, phone: '', email: '' }).code, 'CONTACT_REQUIRED');
  assert.equal(validateInquiry({ ...valid, phone: 'x', email: '' }).code, 'CONTACT_INVALID');
  assert.equal(validateInquiry({ ...valid, serviceId: 'S99' }).code, 'SERVICE_INVALID');
});
test('malicious and malformed fields rejected without echoing private input', () => {
  assert.equal(validateInquiry({ ...valid, suburb: '<script>' }).code, 'SUBURB_INVALID');
  assert.equal(validateInquiry({ ...valid, description: 'x'.repeat(3001) }).code, 'DESCRIPTION_INVALID');
  assert.equal(validateInquiry({ ...valid, idempotencyKey: 'bad' }).code, 'KEY_INVALID');
});
test('image magic bytes must match declared type, limits and unsupported HEIC are explicit', () => {
  const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64'));
  assert.equal(detectImage(png, 'image/png'), 'image/png');
  assert.equal(detectImage(new Uint8Array([0xff,0xd8,0xff,0xe0]), 'image/jpeg'), null);
  assert.equal(detectImage(new Uint8Array([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]), 'image/png'), null);
  assert.equal(detectImage(new TextEncoder().encode('RIFF\0\0\0\0WEBPVP8 '), 'image/webp'), null);
  assert.equal(detectImage(new Uint8Array([0x4d,0x5a,0x90]), 'image/jpeg'), null);
  assert.equal(detectImage(new Uint8Array([0xff,0xd8,0xff]), 'image/heic'), null);
});
test('attribution strips private query values and retains only permitted fields', () => {
  const result = captureAttribution('https://example.test/services/?utm_source=google&phone=0400000000&utm_campaign=%3Cbad%3E', 'https://search.example/path?q=private', '/services/');
  assert.deepEqual(result, { landingPath: '/services/', referrerHost: 'search.example', utmSource: 'google', utmMedium: '', utmCampaign: '' });
});
