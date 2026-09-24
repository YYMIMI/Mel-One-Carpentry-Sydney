import { services } from './content.mjs';
import { suburbOptions } from './suburb-options.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr = (l,en,zh) => l === 'zh' ? zh : en;

export function rfqForm(l, facts, area = null, selected = '') {
  const id = area ? 'suburb-rfq' : 'inquiry';
  const recipient = facts.email || '';
  return '<form id="'+id+'" class="rfq-form" data-rfq-email="'+esc(recipient)+'" data-locale="'+l+'">' +
    '<h2>'+esc(tr(l, area ? 'Tell us about timber repairs in '+area.name : 'Tell us about your timber repair', area ? '说明 '+area.name+' 的木作维修需求' : '说明你的木作维修需求'))+'</h2>'+
    '<p>'+tr(l,'Build an email draft with the scope below. Review it, add photos in your email app and send it to us. Nothing is submitted when you prepare the draft.','填写下方内容整理成电邮草稿。核对后在电邮软件中添加照片，再发送给我们；生成草稿不会自动提交询价。')+'</p>'+
    '<div class="form-grid"><label>'+tr(l,'Suburb','所在地区')+'<input name="suburb" value="'+esc(area?.name || '')+'" autocomplete="address-level2" maxlength="100" required></label>'+
    '<label>'+tr(l,'Timber task','木作项目')+'<select name="service" required><option value="">'+tr(l,'Choose a task','选择项目')+'</option>'+services.map(s=>'<option value="'+s.id+'"'+(s.id===(selected || area?.service)?' selected':'')+'>'+esc(s[l].h1)+'</option>').join('')+'</select></label></div>'+
    '<label>'+tr(l,'What needs repair, and what result do you want?','哪里需要维修？希望完成什么？')+'<textarea name="scope" rows="4" maxlength="1800" required placeholder="'+esc(tr(l,area ? area.en : 'Affected component, what changed, quantity and preferred outcome',area ? area.zh : '受影响构件、发生什么变化、数量与期望结果'))+'"></textarea></label>'+
    '<div class="form-grid"><label>'+tr(l,'Dimensions or quantity (if known)','大致尺寸或数量（如已知）')+'<input name="quantity" maxlength="180"></label><label>'+tr(l,'Access and preferred timing','进入方式与希望安排的时间')+'<input name="access" maxlength="240" placeholder="'+tr(l,'Steps, shared entry, loading or gate access','台阶、共用入口、搬运或门的通道')+'"></label></div>'+
    '<label>'+tr(l,'Reply phone or email','回复电话或邮箱')+'<input name="contact" maxlength="180" required placeholder="'+tr(l,'One working contact method','留一种有效联系方式')+'"></label>'+
    '<p class="rfq-note">'+tr(l,'No full address is needed here. Attach a wide view and useful close-ups in your email; photos are optional. Keep faces, plates and private documents out of images.','这里无需填写完整地址。可在电邮中附全景与有用近照，照片不是必填；避开人脸、车牌及私人文件。')+'</p>'+
    '<button class="button button-primary" type="submit" disabled data-rfq-prepare>'+tr(l,'Prepare email draft','整理电邮草稿')+'</button>'+
    '<p>'+tr(l,'Or contact us directly: ','也可直接联系：')+'<a href="mailto:'+esc(recipient)+'">'+esc(recipient)+'</a>'+(facts.telephone?' · <a href="tel:'+esc(facts.telephone)+'">'+esc(facts.telephone)+'</a>':'')+'</p>'+
    '<noscript><p>'+tr(l,'The draft builder needs JavaScript. Use the email or phone link above.','草稿工具需要JavaScript，可使用上方电邮或电话联系。')+'</p></noscript>'+
    '<div class="rfq-result" hidden><p data-rfq-status role="status"></p><label>'+tr(l,'Your enquiry draft','你的询价草稿')+'<textarea data-rfq-output rows="10" readonly></textarea></label><div class="hero-actions"><a class="button button-primary" data-rfq-mail>'+tr(l,'Open email app to send','打开电邮软件发送')+'</a><button class="button" type="button" data-rfq-copy>'+tr(l,'Copy enquiry','复制询价')+'</button></div><p>'+tr(l,'If no email app opens, copy the draft into your email service and send it to the address above. This page cannot confirm delivery.','若电邮软件未打开，请复制草稿到你的邮箱并发送至上方地址。本页无法确认电邮送达。')+'</p></div></form><script type="module" src="/rfq.js"></script>';
}

export function suburbScope(area, l, service) {
  const content = service[l];
  return '<section class="content-section suburb-scope" id="quote-decisions"><p class="eyebrow">'+tr(l,'Planning the repair','先理清维修范围')+'</p><h2>'+esc(tr(l,area.detail.questionEn,area.detail.questionZh))+'</h2><p>'+esc(area.detail[l])+'</p>'+
    '<div class="rfq-guidance-grid"><article><h3>'+tr(l,'Photos that help define this work','有助于判断这类工作的照片')+'</h3><p>'+esc(content.photo)+'</p></article><article><h3>'+tr(l,'What changes the quote','哪些项目影响报价')+'</h3><p>'+esc(content.quote)+'</p></article><article><h3>'+tr(l,'Agree the inclusions','先确认包含哪些工作')+'</h3><p>'+esc(content.boundary)+'</p></article></div></section>';
}

export function suburbMap(area, l) {
  const query = encodeURIComponent(area.name+', NSW, Australia');
  return '<section class="content-section" id="area-map"><h2>'+esc(tr(l,area.name+' area map',area.name+' 地区地图'))+'</h2><p>'+esc(tr(l,area.region,area.regionZh))+' · '+tr(l,'Check the suburb and nearby streets when describing access for timber, tools and removal of old materials. An exact address is only needed when arranging the work.','查看所在地区及附近道路，询价时说明木材、工具和拆旧材料怎样进出。安排工作时再提供准确地址即可。')+'</p><iframe class="suburb-map" title="'+esc(tr(l,'Map of '+area.name,area.name+' 地区地图'))+'" src="https://www.google.com/maps?q='+query+'&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><p><a href="https://www.google.com/maps/search/?api=1&amp;query='+query+'" target="_blank" rel="noopener">'+tr(l,'Open '+area.name+' in Google Maps','在Google Maps查看 '+area.name)+'</a></p></section>';
}

export function suburbOptionsSection(area, l) {
  const copy = suburbOptions[area.slug];
  if (!copy) throw new Error('Missing repair comparison: '+area.slug);
  return '<section class="content-section" id="repair-options"><h2>'+tr(l,'Compare repair options for this job','这项工作怎样比较方案')+'</h2><p>'+esc(copy[l])+'</p></section>';
}
