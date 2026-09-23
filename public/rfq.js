export function makeRfq({ suburb, service, scope, quantity, access, contact }, zh = false) {
  const clean = value => String(value || '').replace(/\r/g, '').trim();
  const labels = zh ? ['地区','项目','工作描述','尺寸或数量','通道与时间','联系方式'] : ['Suburb','Task','Scope','Dimensions or quantity','Access and timing','Contact'];
  const values = [suburb, service, scope, quantity, access, contact].map(clean);
  if (![values[0], values[1], values[2], values[5]].every(Boolean)) throw new Error('Required enquiry details are missing');
  return { subject: (zh ? '木作询价 — ' : 'Carpentry RFQ — ') + values[0].replace(/\n/g,' '), body: labels.map((label,i)=>label+': '+(values[i] || (zh?'待确认':'To confirm'))).join('\n\n') };
}

if (typeof document !== 'undefined') for (const form of document.querySelectorAll('[data-rfq-email]')) {
  const zh = form.dataset.locale === 'zh';
  const query = new URLSearchParams(location.search);
  if (form.id === 'inquiry') {
    const suburb = query.get('suburb');
    if (suburb && suburb.length <= 100) form.elements.suburb.value = suburb;
    const service = query.get('service');
    if ([...form.elements.service.options].some(option => option.value === service)) form.elements.service.value = service;
  }
  const result = form.querySelector('.rfq-result');
  const status = form.querySelector('[data-rfq-status]');
  const output = form.querySelector('[data-rfq-output]');
  form.querySelector('[data-rfq-prepare]').disabled = false;
  form.addEventListener('input', () => { result.hidden = true; });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    data.service = form.elements.service.selectedOptions[0].textContent;
    const draft = makeRfq(data, zh);
    output.value = draft.body;
    form.querySelector('[data-rfq-mail]').href = 'mailto:'+form.dataset.rfqEmail+'?subject='+encodeURIComponent(draft.subject)+'&body='+encodeURIComponent(draft.body);
    status.textContent = zh ? '草稿已整理，尚未发送。请打开电邮软件核对、添加照片并发送。' : 'Draft prepared, not sent. Open your email app to review, attach photos and send.';
    result.hidden = false;
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
  });
  form.querySelector('[data-rfq-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
      status.textContent = zh ? '已复制。请粘贴到电邮并发送；本页尚未发送询价。' : 'Copied. Paste into your email and send; this page has not sent the enquiry.';
    } catch {
      output.focus(); output.select();
      status.textContent = zh ? '请复制已选中的草稿，再粘贴到电邮。' : 'Copy the selected draft and paste it into your email.';
    }
  });
}
