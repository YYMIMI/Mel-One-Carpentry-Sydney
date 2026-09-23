export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 8 * 1024 * 1024;
export const MAX_TOTAL_BYTES = 20 * 1024 * 1024;

const clean = value => String(value ?? '').trim();
const hasControls = value => /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f<>]/.test(value);

export function validateInquiry(fields) {
  const value = Object.fromEntries(['serviceId', 'locale', 'suburb', 'description', 'phone', 'email', 'contactTime', 'replyLanguage', 'idempotencyKey'].map(k => [k, clean(fields[k])]));
  if (!/^S0[1-9]$/.test(value.serviceId)) return { ok: false, code: 'SERVICE_INVALID' };
  if (!['en', 'zh'].includes(value.locale)) return { ok: false, code: 'LOCALE_INVALID' };
  if (!/^[a-zA-Z0-9 \-'.,()]{2,100}$/.test(value.suburb)) return { ok: false, code: 'SUBURB_INVALID' };
  if (value.description.length < 10 || value.description.length > 3000 || hasControls(value.description)) return { ok: false, code: 'DESCRIPTION_INVALID' };
  if (!value.phone && !value.email) return { ok: false, code: 'CONTACT_REQUIRED' };
  if (value.phone && (!/^[+0-9 ()-]{8,40}$/.test(value.phone) || value.phone.replace(/\D/g, '').length < 8)) return { ok: false, code: 'CONTACT_INVALID' };
  if (value.email && (value.email.length > 254 || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value.email))) return { ok: false, code: 'CONTACT_INVALID' };
  if (value.contactTime.length > 120 || hasControls(value.contactTime)) return { ok: false, code: 'TIME_INVALID' };
  if (value.replyLanguage && !['en', 'zh'].includes(value.replyLanguage)) return { ok: false, code: 'LANGUAGE_INVALID' };
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value.idempotencyKey)) return { ok: false, code: 'KEY_INVALID' };
  return { ok: true, value };
}

export function detectImage(bytes, declaredType) {
  if (declaredType === 'image/jpeg' && bytes.length >= 64 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff &&
    bytes[bytes.length-2] === 0xff && bytes[bytes.length-1] === 0xd9) return declaredType;
  if (declaredType === 'image/png' && bytes.length >= 45 &&
    [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((v,i) => bytes[i] === v) &&
    new TextDecoder().decode(bytes.slice(12,16)) === 'IHDR' &&
    new TextDecoder().decode(bytes.slice(-8,-4)) === 'IEND') return declaredType;
  if (declaredType === 'image/webp' && bytes.length >= 20 &&
    new TextDecoder().decode(bytes.slice(0,4)) === 'RIFF' &&
    new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(4, true) === bytes.length - 8 &&
    new TextDecoder().decode(bytes.slice(8,12)) === 'WEBP' &&
    ['VP8 ','VP8L','VP8X'].includes(new TextDecoder().decode(bytes.slice(12,16)))) return declaredType;
  return null;
}

export function captureAttribution(source, referrer, fallbackPath = '/') {
  let url, host = '';
  try { url = new URL(source); } catch { url = new URL('https://local.invalid' + fallbackPath); }
  try { host = new URL(referrer).hostname.slice(0,100); } catch { /* no referrer */ }
  const safe = key => {
    const raw = url.searchParams.get(key) ?? '';
    return /^[a-zA-Z0-9 _.-]{1,100}$/.test(raw) ? raw : '';
  };
  return {
    landingPath: /^\/[a-zA-Z0-9/_-]{0,180}$/.test(url.pathname) ? url.pathname : '/',
    referrerHost: host,
    utmSource: safe('utm_source'),
    utmMedium: safe('utm_medium'),
    utmCampaign: safe('utm_campaign'),
  };
}
