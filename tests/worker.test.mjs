import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

const form = () => {
  const body = new FormData();
  Object.entries({ serviceId:'S01', locale:'en', suburb:'Chatswood', description:'Fixture: timber window sill is soft.',
    phone:'0400000000', idempotencyKey:crypto.randomUUID() }).forEach(([k,v])=>body.set(k,v));
  return body;
};
test('database insert failure cannot produce a success receipt', async () => {
  const env = { UPLOADS:{}, DB:{ prepare(sql) { return { bind() { return this; },
    async first() { return sql.includes('rate_bucket') ? { hits:1 } : null; },
    async run() { throw new Error('fixture D1 failure'); },
  }; } } };
  const response = await worker.fetch(new Request('http://127.0.0.1:8787/api/inquiry', {method:'POST',body:form()}),env);
  assert.equal(response.status,503);
  assert.deepEqual(await response.json(),{accepted:false,code:'BACKEND_UNAVAILABLE'});
});
test('internal access denied when token is not configured', async () => {
  const response = await worker.fetch(new Request('http://127.0.0.1:8787/api/internal/leads/00000000-0000-0000-0000-000000000000'),
    { INTERNAL_API_TOKEN:'', DB:{} });
  assert.equal(response.status,401);
});
