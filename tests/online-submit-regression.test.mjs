import test from 'node:test';
import assert from 'node:assert/strict';
import { mountOnlineForm } from '../public/online-enquiry.mjs';

// Exercise the deployed form controller. DOM, provider and analytics are local mocks.
async function withForm(run) {
  const names = ['document', 'FormData', 'fetch', 'CustomEvent'];
  const saved = Object.fromEntries(names.map(name => [name, globalThis[name]]));
  const values = { contact: 'local@example.invalid', suburb: 'Burwood', service: 'S09', scope: 'A swollen panel below the sink', consent: 'yes' };
  const listeners = {}, button = { textContent: '', disabled: false }, status = { textContent: '' };
  const controls = Object.keys(values).map(name => ({ name, disabled: false, validity: { valid: true },
    setAttribute() {}, removeAttribute() {}, getAttribute() { return ''; }, insertAdjacentElement() {},
    setCustomValidity() {}, focus() {} }));
  const form = { id: 'inquiry', noValidate: false,
    elements: { namedItem: name => controls.find(input => input.name === name) },
    querySelector: selector => selector === '[data-online-submit]' ? button : status,
    querySelectorAll: () => controls,
    setAttribute() {}, dispatchEvent() {},
    addEventListener: (name, listener) => { listeners[name] = listener; } };
  const requests = [];
  globalThis.document = { createElement: () => ({ textContent: '', setAttribute() {} }) };
  globalThis.FormData = class { constructor() { return new Map(Object.entries(values)); } };
  globalThis.CustomEvent = class {};
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/enquiry');
    const request = JSON.parse(options.body); requests.push(request);
    return { ok: true, json: async () => ({ accepted: true, receipt: { id: request.submissionId,
      emailId: '17eec210-8a20-4e81-bd34-15b51a376278' }, confirmationEmailAccepted: false }) };
  };
  try { await run({ form, values, button, status, requests, listeners,
    submit: () => listeners.submit({ preventDefault() {} }), input: () => listeners.input() }); }
  finally { for (const name of names) { if (saved[name] === undefined) delete globalThis[name]; else globalThis[name] = saved[name]; } }
}

test('accepted retry counts a lead once and edits receive a new submission key', async () => {
  await withForm(async h => {
    let counted = 0;
    mountOnlineForm(h.form, { payload: values => values, phone: '0403 202 949', onAccepted: () => { counted++; } });
    await h.submit(); await h.submit();
    assert.equal(h.requests.length, 1);
    assert.equal(counted, 1);
    const firstId = h.requests[0].submissionId;
    h.input(); await h.submit();
    assert.equal(h.requests[1].submissionId, firstId, 'unchanged retry retains the provider idempotency key');
    assert.equal(counted, 1, 'a repeated accepted receipt never adds another lead event');
    h.values.scope = 'Replace the damaged base panel after the pipe is repaired';
    h.input(); await h.submit();
    assert.notEqual(h.requests[2].submissionId, firstId);
    assert.equal(counted, 2);
  });
});

test('optional analytics failure cannot change a valid provider receipt into failure', async () => {
  await withForm(async h => {
    mountOnlineForm(h.form, { payload: values => values, phone: '0403 202 949',
      onAccepted: () => { throw Error('LOCAL OPTIONAL ANALYTICS FAILURE'); } });
    await h.submit();
    assert.equal(h.button.disabled, true);
    assert.equal(h.button.textContent, 'Enquiry sent');
    assert.match(h.status.textContent, /Your enquiry has been sent/);
    assert.doesNotMatch(h.status.textContent, /could not confirm/i);
    assert.equal(h.values.scope, 'A swollen panel below the sink');
  });
});
