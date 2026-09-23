import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8787';
const results = [];
const png = Uint8Array.from(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==', 'base64'));
const sample = (overrides = {}, photo = false) => {
  const form = new FormData();
  const fields = { serviceId: 'S01', locale: 'en', suburb: 'Chatswood', description: 'Fixture: a timber window sill looks soft at one corner.',
    phone: '0400000000', email: '', contactTime: '', replyLanguage: 'en', landingUrl: origin + '/services/timber-window-repairs/?utm_source=localtest',
    idempotencyKey: crypto.randomUUID(), ...overrides };
  for (const [key, value] of Object.entries(fields)) form.set(key, value);
  if (photo) form.append('photos', new Blob([png], { type: 'image/png' }), 'fixture.png');
  return form;
};
const send = (form, headers = {}) => fetch(origin + '/api/inquiry', { method: 'POST', body: form,
  headers: { 'CF-Connecting-IP':'203.0.113.11', ...headers } }).then(async response => ({ status: response.status, body: await response.json() }));
async function check(name, run, pass) {
  try {
    const actual = await run();
    results.push({ name, pass: pass(actual), status: actual.status, code: actual.body?.code, accepted: actual.body?.accepted,
      notificationPending: actual.body?.notificationPending, leadId: actual.body?.leadId });
  } catch (e) { results.push({ name, pass: false, error: e.message }); }
}

const first = sample();
let firstReceipt;
await check('phone-only durable acceptance, no photo', async () => firstReceipt = await send(first), r => r.status === 201 && r.body.accepted && r.body.notificationPending);
await check('same idempotency key returns one lead ID', () => send(first), r => r.status === 200 && r.body.duplicate && r.body.leadId === firstReceipt?.body?.leadId);
await check('email-only with private photo', () => send(sample({ phone: '', email: 'fixture@example.invalid' }, true)), r => r.status === 201 && r.body.accepted);
await check('neither phone nor email rejected', () => send(sample({ phone: '', email: '' })), r => r.status === 400 && r.body.code === 'CONTACT_REQUIRED');
await check('malicious suburb rejected', () => send(sample({ suburb: '<script>alert(1)</script>' })), r => r.status === 400 && r.body.code === 'SUBURB_INVALID');
await check('cross-origin POST rejected', () => send(sample(), { Origin: 'https://attacker.invalid' }), r => r.status === 403 && r.body.code === 'ORIGIN_INVALID');
const fake = sample(); fake.append('photos', new Blob([new TextEncoder().encode('MZ executable')], { type: 'image/jpeg' }), 'disguised.jpg');
await check('disguised executable rejected', () => send(fake), r => r.status === 415 && r.body.code === 'UPLOAD_TYPE_INVALID');
const heic = sample(); heic.append('photos', new Blob([new TextEncoder().encode('fake')], { type: 'image/heic' }), 'phone.heic');
await check('unsupported HEIC rejected', () => send(heic), r => r.status === 415 && r.body.code === 'UPLOAD_TYPE_INVALID');
const large = sample(); large.append('photos', new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: 'image/png' }), 'large.png');
await check('photo over 8MB rejected', () => send(large), r => r.status === 413 && r.body.code === 'UPLOAD_TOO_LARGE');
await check('internal lead requires authorization', async () => {
  const response = await fetch(origin + '/api/internal/leads/' + firstReceipt.body.leadId);
  return { status: response.status, body: await response.json() };
}, r => r.status === 401 && r.body.code === 'UNAUTHORIZED');
await check('unknown route is 404', async () => {
  const response = await fetch(origin + '/services/not-a-real-service/'); return { status: response.status, body: {} };
}, r => r.status === 404);

await mkdir(resolve('reports'), { recursive: true });
await writeFile(resolve('reports/live-tests.json'), JSON.stringify({ runAt: new Date().toISOString(), origin, results }, null, 2) + '\n');
console.log(results.map(r => `${r.pass ? 'PASS' : 'FAIL'} ${r.name}: ${r.status || r.error}`).join('\n'));
console.log(`${results.filter(r => r.pass).length}/${results.length} passed`);
if (results.some(r => !r.pass)) process.exitCode = 1;
