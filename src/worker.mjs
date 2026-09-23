import { validateInquiry, detectImage, captureAttribution, MAX_FILES, MAX_FILE_BYTES, MAX_TOTAL_BYTES } from './inquiry.mjs';

const json = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
const digest = async bytes => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))).map(x => x.toString(16).padStart(2, '0')).join('');
const error = (code, status = 400) => json({ accepted: false, code }, status);
const extension = type => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' })[type];
const auth = (request, env) => Boolean(env.INTERNAL_API_TOKEN && request.headers.get('Authorization') === 'Bearer ' + env.INTERNAL_API_TOKEN);

async function alertFailure(env, leadId, attempts) {
  if (attempts < 3 || !env.ALERT_WEBHOOK_URL || !env.ALERT_WEBHOOK_TOKEN) return;
  const record = await env.DB.prepare('SELECT alerted_at FROM outbox WHERE lead_id=?').bind(leadId).first();
  if (record?.alerted_at) return;
  try {
    if (!/^https:\/\//.test(env.ALERT_WEBHOOK_URL)) return;
    const response = await fetch(env.ALERT_WEBHOOK_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.ALERT_WEBHOOK_TOKEN,
        'Idempotency-Key': 'alert-' + leadId },
      body: JSON.stringify({ alert: 'INQUIRY_DELIVERY_RETRY', leadId, attempts }),
    });
    if (response.ok) await env.DB.prepare("UPDATE outbox SET alerted_at=datetime('now') WHERE lead_id=?").bind(leadId).run();
  } catch { /* Retried on the next scheduled delivery attempt. Never log contact details. */ }
}

async function deliver(env, leadId) {
  if (!env.NOTIFY_WEBHOOK_URL || !env.NOTIFY_WEBHOOK_TOKEN) return false;
  const now = Math.floor(Date.now() / 1000);
  const claimed = await env.DB.prepare("UPDATE outbox SET status='RETRY', lease_until=? WHERE lead_id=? AND status IN ('PENDING','RETRY') AND next_at<=? AND lease_until<=? RETURNING lead_id")
    .bind(now + 45, leadId, now, now).first();
  if (!claimed) return false;
  const lead = await env.DB.prepare('SELECT * FROM leads WHERE id=? AND state=?').bind(leadId, 'ACCEPTED').first();
  if (!lead) return false;
  try {
    if (!/^https:\/\//.test(env.NOTIFY_WEBHOOK_URL)) throw new Error('Webhook must use HTTPS');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    let response;
    try {
      response = await fetch(env.NOTIFY_WEBHOOK_URL, {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.NOTIFY_WEBHOOK_TOKEN, 'Idempotency-Key': leadId },
        body: JSON.stringify({ leadId, serviceId: lead.service_id, locale: lead.locale, suburb: lead.suburb,
          description: lead.description, phone: lead.phone, email: lead.email, contactTime: lead.contact_time,
          replyLanguage: lead.reply_language, attribution: JSON.parse(lead.attribution_json), photoCount: JSON.parse(lead.photos_json).length }),
      });
    } finally { clearTimeout(timer); }
    if (!response.ok) throw new Error('Webhook non-2xx');
    await env.DB.prepare("UPDATE outbox SET status='DELIVERED', attempts=attempts+1, lease_until=0, delivered_at=datetime('now'), last_error=NULL WHERE lead_id=?")
      .bind(leadId).run();
    return true;
  } catch {
    const record = await env.DB.prepare('SELECT attempts FROM outbox WHERE lead_id=?').bind(leadId).first();
    const attempts = (record?.attempts ?? 0) + 1;
    const delay = Math.min(3600, 30 * 2 ** Math.min(attempts, 7));
    await env.DB.prepare("UPDATE outbox SET status='RETRY', attempts=?, next_at=?, lease_until=0, last_error='DELIVERY_FAILED' WHERE lead_id=?")
      .bind(attempts, now + delay, leadId).run();
    await alertFailure(env, leadId, attempts);
    return false;
  }
}

async function limitNewLead(request, env) {
  const ip = request.headers.get('CF-Connecting-IP') || 'local-preview';
  const fingerprint = await digest(new TextEncoder().encode((env.RATE_LIMIT_SALT || 'preview-only') + ':' + ip));
  const hour = Math.floor(Date.now() / 3600000);
  const row = await env.DB.prepare('INSERT INTO rate_bucket(fingerprint,window_start,hits) VALUES(?,?,1) ON CONFLICT(fingerprint,window_start) DO UPDATE SET hits=hits+1 WHERE hits<5 RETURNING hits')
    .bind(fingerprint, hour).first();
  return Boolean(row);
}

async function accept(request, env) {
  if (!env.DB || !env.UPLOADS) return error('BACKEND_UNAVAILABLE', 503);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return error('ORIGIN_INVALID', 403);
  const type = request.headers.get('Content-Type') || '';
  if (!type.startsWith('multipart/form-data;')) return error('FORM_INVALID');
  if (Number(request.headers.get('Content-Length') || 0) > MAX_TOTAL_BYTES + 2 * 1024 * 1024) return error('UPLOAD_TOO_LARGE', 413);
  let form;
  try { form = await request.formData(); } catch { return error('FORM_INVALID'); }
  if (form.get('website')) return error('FORM_INVALID');
  const fields = Object.fromEntries(['serviceId','locale','suburb','description','phone','email','contactTime','replyLanguage','idempotencyKey'].map(k => [k, form.get(k)]));
  const validation = validateInquiry(fields);
  if (!validation.ok) return error(validation.code);
  const files = form.getAll('photos').filter(f => f instanceof File && f.size);
  if (files.length > MAX_FILES || files.some(f => f.size > MAX_FILE_BYTES) || files.reduce((n,f) => n + f.size, 0) > MAX_TOTAL_BYTES) return error('UPLOAD_TOO_LARGE', 413);
  const uploads = [];
  for (const file of files) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const actual = detectImage(bytes, file.type);
    if (!actual) return error('UPLOAD_TYPE_INVALID', 415);
    uploads.push({ bytes, type: actual });
  }
  const value = validation.value;
  const contentHashes = await Promise.all(uploads.map(u => digest(u.bytes)));
  const payloadDigest = await digest(new TextEncoder().encode(JSON.stringify({ value, contentHashes })));
  let existing = await env.DB.prepare('SELECT id,payload_digest,state FROM leads WHERE idem_key=?').bind(value.idempotencyKey).first();
  if (existing && existing.payload_digest !== payloadDigest) return error('KEY_CONFLICT', 409);
  if (existing?.state === 'ACCEPTED') {
    const notice = await env.DB.prepare('SELECT status FROM outbox WHERE lead_id=?').bind(existing.id).first();
    return json({ accepted: true, leadId: existing.id, duplicate: true, notificationPending: notice?.status !== 'DELIVERED' });
  }
  if (!existing && !(await limitNewLead(request, env))) return error('RATE_LIMITED', 429);
  const leadId = existing?.id ?? crypto.randomUUID();
  if (!existing) {
    const attrib = captureAttribution(form.get('landingUrl'), form.get('referrer'), new URL(request.url).pathname);
    await env.DB.prepare("INSERT OR IGNORE INTO leads(id,idem_key,payload_digest,state,service_id,locale,suburb,description,phone,email,contact_time,reply_language,attribution_json) VALUES(?,?,?,'UPLOADING',?,?,?,?,?,?,?,?,?)")
      .bind(leadId, value.idempotencyKey, payloadDigest, value.serviceId, value.locale, value.suburb,
        value.description, value.phone, value.email, value.contactTime, value.replyLanguage || value.locale, JSON.stringify(attrib)).run();
    existing = await env.DB.prepare('SELECT id,payload_digest,state FROM leads WHERE idem_key=?').bind(value.idempotencyKey).first();
    if (!existing || existing.payload_digest !== payloadDigest) return error('KEY_CONFLICT', 409);
    if (existing.state === 'ACCEPTED') {
      const notice = await env.DB.prepare('SELECT status FROM outbox WHERE lead_id=?').bind(existing.id).first();
      return json({ accepted: true, leadId: existing.id, duplicate: true, notificationPending: notice?.status !== 'DELIVERED' });
    }
  }
  const keys = uploads.map((u,i) => ({ key: `inquiries/${existing.id}/${i}.${extension(u.type)}`, type: u.type }));
  try {
    for (let i = 0; i < uploads.length; i++) await env.UPLOADS.put(keys[i].key, uploads[i].bytes, { httpMetadata: { contentType: uploads[i].type } });
    await env.DB.batch([
      env.DB.prepare("UPDATE leads SET state='ACCEPTED', photos_json=? WHERE id=? AND state='UPLOADING'").bind(JSON.stringify(keys), existing.id),
      env.DB.prepare("INSERT OR IGNORE INTO outbox(lead_id,status) VALUES(?,'PENDING')").bind(existing.id),
    ]);
  } catch {
    await Promise.allSettled(keys.map(k => env.UPLOADS.delete(k.key)));
    return error('STORAGE_FAILED', 503);
  }
  // Reliable acceptance precedes notification. Delivery failure leaves a retryable outbox record.
  let delivered = false;
  try { delivered = await deliver(env, existing.id); } catch { /* cron retries */ }
  return json({ accepted: true, leadId: existing.id, duplicate: false, notificationPending: !delivered }, 201);
}

async function internal(request, env, path) {
  if (!auth(request, env)) return error('UNAUTHORIZED', 401);
  const leadMatch = path.match(/^\/api\/internal\/leads\/([a-f0-9-]{36})$/);
  const photoMatch = path.match(/^\/api\/internal\/photos\/([a-f0-9-]{36})\/([0-4])$/);
  if (leadMatch) {
    const lead = await env.DB.prepare('SELECT * FROM leads WHERE id=?').bind(leadMatch[1]).first();
    if (!lead) return error('NOT_FOUND', 404);
    if (request.method === 'GET') return json({ ...lead, photos: JSON.parse(lead.photos_json), photos_json: undefined });
    if (request.method === 'DELETE') {
      const keys = JSON.parse(lead.photos_json);
      await Promise.all(keys.map(k => env.UPLOADS.delete(k.key)));
      await env.DB.prepare('DELETE FROM leads WHERE id=?').bind(lead.id).run();
      return json({ deleted: true, leadId: lead.id });
    }
  }
  if (photoMatch && request.method === 'GET') {
    const lead = await env.DB.prepare('SELECT photos_json FROM leads WHERE id=?').bind(photoMatch[1]).first();
    const item = lead && JSON.parse(lead.photos_json)[Number(photoMatch[2])];
    if (!item) return error('NOT_FOUND', 404);
    const object = await env.UPLOADS.get(item.key);
    if (!object) return error('NOT_FOUND', 404);
    return new Response(object.body, { headers: { 'Content-Type': item.type, 'Content-Disposition': 'attachment', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
  }
  return error('NOT_FOUND', 404);
}

export default {
  async fetch(request, env) {
    const path = new URL(request.url).pathname;
    try {
      if (path === '/api/inquiry') return request.method === 'POST' ? await accept(request, env) : error('METHOD_NOT_ALLOWED', 405);
      if (path.startsWith('/api/internal/')) return await internal(request, env, path);
      if (path.startsWith('/api/')) return error('NOT_FOUND', 404);
      return env.ASSETS.fetch(request);
    } catch { return error('BACKEND_UNAVAILABLE', 503); }
  },
  async scheduled(_event, env) {
    if (!env.NOTIFY_WEBHOOK_URL || !env.NOTIFY_WEBHOOK_TOKEN) return;
    const now = Math.floor(Date.now() / 1000);
    const pending = await env.DB.prepare("SELECT lead_id FROM outbox WHERE status IN ('PENDING','RETRY') AND next_at<=? AND lease_until<=? LIMIT 20")
      .bind(now, now).all();
    for (const row of pending.results) await deliver(env, row.lead_id);
  },
};
