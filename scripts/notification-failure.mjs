import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = 'http://127.0.0.1:8787';
const fixture = JSON.parse(await readFile(resolve('reports/live-tests.json'), 'utf8'));
const photoId = fixture.results.find(r => r.name === 'email-only with private photo').leadId;
const auth = { Authorization: 'Bearer local-test-token' };
const privateLead = await fetch(base + '/api/internal/leads/' + photoId, { headers: auth });
const lead = await privateLead.json();
const privatePhoto = await fetch(base + '/api/internal/photos/' + photoId + '/0', { headers: auth });
const publicPhoto = await fetch(base + '/api/internal/photos/' + photoId + '/0');
const form = new FormData();
const key = crypto.randomUUID();
for (const [k,v] of Object.entries({ serviceId:'S02', locale:'zh', suburb:'Parramatta', description:'Fixture: timber door frame is soft at the base.', phone:'0400000000', idempotencyKey:key })) form.set(k,v);
const post = () => fetch(base + '/api/inquiry', { method:'POST', body:form }).then(async r => ({status:r.status, body:await r.json()}));
const first = await post();
const repeat = await post();
const retryLead = await fetch(base + '/api/internal/leads/' + first.body.leadId, { headers: auth }).then(r => r.json());
const results = [
  ['authorized private lead contains one photo', privateLead.status === 200 && lead.photos?.length === 1],
  ['authorized photo read returns private bytes', privatePhoto.status === 200 && privatePhoto.headers.get('Cache-Control')?.includes('no-store') && (await privatePhoto.arrayBuffer()).byteLength > 0],
  ['public photo read blocked', publicPhoto.status === 401],
  ['webhook failure leaves durable lead accepted and pending', first.status === 201 && first.body.accepted && first.body.notificationPending && retryLead.state === 'ACCEPTED'],
  ['retry returns same lead, not another accepted lead', repeat.status === 200 && repeat.body.leadId === first.body.leadId],
];
await writeFile(resolve('reports/notification-failure.json'), JSON.stringify({ runAt:new Date().toISOString(), results:results.map(([name,pass])=>({name,pass})), first:{status:first.status,leadId:first.body.leadId}, repeat:{status:repeat.status,leadId:repeat.body.leadId} },null,2)+'\n');
console.log(results.map(([n,p])=>`${p?'PASS':'FAIL'} ${n}`).join('\n'));
if (results.some(([,p])=>!p)) process.exitCode=1;
