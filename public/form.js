(() => {
  const form = document.getElementById('inquiry');
  if (!form || form.hasAttribute('data-rfq-email')) return;
  // Static pages are built without query strings; restore the service chosen in a CTA.
  const requestedService = new URLSearchParams(location.search).get('service');
  if (requestedService && [...form.elements.serviceId.options].some(option => option.value === requestedService)) {
    form.elements.serviceId.value = requestedService;
  }
  const locale = form.elements.locale.value;
  const requestedSuburb = new URLSearchParams(location.search).get('suburb');
  if (requestedSuburb && requestedSuburb.length <= 100 && /^[a-zA-Z0-9 .'-]+$/.test(requestedSuburb)) form.elements.suburb.value = requestedSuburb;
  const zh = locale === 'zh';
  const error = document.getElementById('form-error');
  const result = document.getElementById('form-result');
  const button = form.querySelector('button[type="submit"]');
  const messages = {
    CONTACT_REQUIRED: [ 'Enter a phone number or email address.', '请填写电话或邮箱，至少一项。' ],
    CONTACT_INVALID: [ 'Check the phone number or email address.', '请核对电话或邮箱格式。' ],
    UPLOAD_TOO_LARGE: [ 'Use up to 5 photos, 8 MB each and 20 MB altogether.', '最多5张照片，单张8MB、合计20MB。' ],
    UPLOAD_TYPE_INVALID: [ 'Use real JPEG, PNG or WebP files. HEIC cannot be uploaded here.', '请使用真正的JPEG、PNG或WebP文件；这里不支持HEIC。' ],
    RATE_LIMITED: [ 'Too many attempts. Please try later.', '提交次数过多，请稍后再试。' ],
    KEY_CONFLICT: [ 'The enquiry changed during a retry. Please submit again.', '重试期间内容已变化，请重新提交。' ],
  };
  const msg = key => (messages[key] || [
    'We could not confirm receipt. Your details remain on this page; retry with the same enquiry key.',
    '无法确认收件。表单内容已保留，请使用同一询价标识重试。',
  ])[zh ? 1 : 0];
  const showError = value => { error.textContent = value; error.hidden = false; result.hidden = true; };
  const clearError = () => { error.textContent = ''; error.hidden = true; };
  form.addEventListener('input', event => {
    if (event.target.name !== 'idempotencyKey' && !button.disabled) form.elements.idempotencyKey.value = '';
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'photos' && !button.disabled) form.elements.idempotencyKey.value = '';
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    clearError();
    const phone = form.elements.phone.value.trim();
    const email = form.elements.email.value.trim();
    if (!phone && !email) { showError(msg('CONTACT_REQUIRED')); form.elements.phone.focus(); return; }
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const files = [...form.elements.photos.files];
    if (files.length > 5 || files.some(f => f.size > 8 * 1024 * 1024) || files.reduce((n, f) => n + f.size, 0) > 20 * 1024 * 1024) {
      showError(msg('UPLOAD_TOO_LARGE')); form.elements.photos.focus(); return;
    }
    if (files.some(f => !['image/jpeg','image/png','image/webp'].includes(f.type))) {
      showError(msg('UPLOAD_TYPE_INVALID')); form.elements.photos.focus(); return;
    }
    form.elements.idempotencyKey.value ||= crypto.randomUUID();
    const payload = new FormData(form);
    payload.set('landingUrl', location.href);
    payload.set('referrer', document.referrer);
    button.disabled = true;
    try {
      const response = await fetch('/api/inquiry', { method: 'POST', body: payload });
      const data = await response.json();
      if (!response.ok || !data.accepted) throw new Error(data.code || 'BACKEND_UNAVAILABLE');
      result.textContent = (zh ? '询价已由服务器受理。编号：' : 'Enquiry accepted by the server. Reference: ') + data.leadId +
        (data.notificationPending ? (zh ? '。内部通知仍待交付；预览不代表真实收件箱已收到。' : '. Internal notification is pending; the preview does not prove inbox delivery.') :
          (zh ? '。内部通知已交付。' : '. Internal notification delivered.'));
      result.hidden = false;
      const safeUtm = key => {
        const value = new URLSearchParams(location.search).get(key) || '';
        return /^[a-zA-Z0-9 _.-]{1,100}$/.test(value) ? value : '';
      };
      let referrerHost = '';
      try { referrerHost = new URL(document.referrer).hostname.slice(0, 100); } catch { /* direct visit */ }
      window.dataLayer?.push({ event: 'lead_submit_success', service_owner: form.elements.serviceId.value,
        locale, page_path: location.pathname, delivery_pending: Boolean(data.notificationPending),
        utm_source: safeUtm('utm_source'), utm_medium: safeUtm('utm_medium'), utm_campaign: safeUtm('utm_campaign'),
        referrer_host: referrerHost });
    } catch (caught) {
      showError(msg(caught.message));
      button.disabled = false;
    }
  });
})();
