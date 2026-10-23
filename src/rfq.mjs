import { services } from './content.mjs';
import { suburbOptions } from './suburb-options.mjs';
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const tr = (l,en,zh) => l === 'zh' ? zh : en;

export function rfqForm(l, facts, area = null, selected = '') {
  const id = area ? 'suburb-rfq' : 'inquiry';
  const recipient = facts.email || '';
  return '<form data-clarity-mask="true" id="'+id+'" class="rfq-form" data-rfq-email="'+esc(recipient)+'" data-locale="'+l+'">' +
    '<h2>'+esc(tr(l, area ? 'Tell us about timber repairs in '+area.name : 'Tell us about your timber repair', area ? '说明 '+area.name+' 的木作维修需求' : '说明你的木作维修需求'))+'</h2>'+
    '<p>'+tr(l,'Send the scope below directly to our Sydney carpentry team. Provide an email or Australian phone number so we can reply.','填写下方内容，直接发送给悉尼木作维修团队。请留有效电邮或澳洲电话，方便我们回复。')+'</p>'+
    '<div class="form-grid"><label>'+tr(l,'Suburb','所在地区')+'<input name="suburb" data-clarity-public-default="'+esc(area?.name || '')+'" value="'+esc(area?.name || '')+'" autocomplete="address-level2" maxlength="100" minlength="2" required></label>'+
    '<label>'+tr(l,'Timber task','木作项目')+'<select name="service" required><option value="">'+tr(l,'Choose a task','选择项目')+'</option>'+services.map(s=>'<option value="'+s.id+'"'+(s.id===(selected || area?.service)?' selected':'')+'>'+esc(s[l].h1)+'</option>').join('')+'</select></label></div>'+
    '<label>'+tr(l,'What needs repair, and what result do you want?','哪里需要维修？希望完成什么？')+'<textarea name="scope" rows="4" maxlength="1800" minlength="15" required placeholder="'+esc(tr(l,area ? area.en : 'Affected component, what changed, quantity and preferred outcome',area ? area.zh : '受影响构件、发生什么变化、数量与期望结果'))+'"></textarea></label>'+
    '<div class="form-grid"><label>'+tr(l,'Dimensions or quantity (if known)','大致尺寸或数量（如已知）')+'<input name="quantity" maxlength="180"></label><label>'+tr(l,'Access and preferred timing','进入方式与希望安排的时间')+'<input name="access" maxlength="240" placeholder="'+tr(l,'Steps, shared entry, loading or gate access','台阶、共用入口、搬运或门的通道')+'"></label></div>'+
    '<label>'+tr(l,'Reply phone or email','回复电话或邮箱')+'<input name="contact" maxlength="180" required placeholder="'+tr(l,'One working contact method','留一种有效联系方式')+'"></label>'+
    '<p class="rfq-note">'+tr(l,'No full address is needed here. If you provide an email, you can reply to the confirmation with optional photos. Keep faces, plates and private documents out of images.','这里无需填写完整地址。如提供电邮，可回复确认信附上选填照片；避开人脸、车牌及私人文件。')+'</p>'+
    '<label class="online-consent"><input name="consent" type="checkbox" value="yes" required><span>'+tr(l,'I agree to using these details to respond to my enquiry. ','我同意使用以上资料回复我的询价。')+'<a href="'+(l==='zh'?'/zh':'')+'/privacy/">'+tr(l,'Privacy information','隐私说明')+'</a></span></label>'+
    '<div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off" maxlength="200"></label></div>'+
    '<button class="button button-primary" type="submit" disabled data-online-submit data-rfq-prepare>'+tr(l,'Send enquiry','发送询价')+'</button>'+
    '<p>'+tr(l,'Or contact us directly: ','也可直接联系：')+'<a href="mailto:'+esc(recipient)+'" data-event="click_to_email">'+esc(recipient)+'</a>'+(facts.telephone?' · <a href="tel:'+esc(facts.telephone)+'" data-event="click_to_call">'+esc(facts.telephone)+'</a>':'')+'</p>'+
    '<noscript><p>'+tr(l,'Online submission needs JavaScript. Use the email or phone link above.','在线提交需要JavaScript，可使用上方电邮或电话联系。')+'</p></noscript>'+
    '<p class="rfq-result" data-online-status role="status" aria-live="polite" aria-atomic="true"></p>'+
    '<p class="rfq-note">'+tr(l,'An enquiry does not confirm a booking, price or attendance time.','提交询价不代表已确认预约、价格或到场时间。')+'</p></form><script type="module" src="/rfq.js"></script>';
}

export function suburbScope(area, l, service) {
  const target=(l==='zh'?'/zh':'')+'/services/'+service.slug+'/';
  return '<section class="content-section suburb-scope" id="quote-decisions"><p class="eyebrow">'+tr(l,'Planning the repair','先理清维修范围')+'</p><h2>'+esc(tr(l,area.detail.questionEn,area.detail.questionZh))+'</h2><p>'+esc(area.detail[l])+'</p>'+
    '<div class="rfq-guidance-grid"><article><h3>'+tr(l,'Check the service scope','核对服务范围')+'</h3><p>'+tr(l,'Compare the repair options above with the service checklist before you enquire. It explains which component photos help, what affects the quote and which tasks need a separate allowance.','询价前，把上方维修方案与服务清单一起核对，了解需要拍哪些构件、哪些因素影响报价，以及哪些工作需另列费用。')+'</p><a href="'+target+'">'+tr(l,'Photo checklist, quote inclusions and repair limits','照片清单、报价项目与维修边界')+' →</a></article></div></section>';
}

export function suburbMap(area, l) {
  const query = encodeURIComponent(area.name+', NSW, Australia');
  return '<section class="content-section" id="area-map"><h2>'+esc(tr(l,area.name+' area map',area.name+' 地区地图'))+'</h2><p>'+esc(tr(l,area.region,area.regionZh))+' · '+tr(l,'Check the suburb and nearby streets when describing access for timber, tools and removal of old materials. An exact address is only needed when arranging the work.','查看所在地区及附近道路，询价时说明木材、工具和拆旧材料怎样进出。安排工作时再提供准确地址即可。')+'</p><figure><img src="/images/editorial/sydney-area-map.png" alt="'+tr(l,'Sydney and surrounding service regions','悉尼及周边服务地区')+'" width="1200" height="780" style="display:block;width:100%;height:auto" loading="lazy"><figcaption>'+tr(l,'Sydney regional overview. ','悉尼地区概览。')+'© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a></figcaption></figure><iframe class="suburb-map" title="'+esc(tr(l,'Map of '+area.name,area.name+' 地区地图'))+'" src="https://www.google.com/maps?q='+query+'&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe><p><a href="https://www.google.com/maps/search/?api=1&amp;query='+query+'" target="_blank" rel="noopener">'+tr(l,'Open '+area.name+' in Google Maps','在Google Maps查看 '+area.name)+'</a></p></section>';
}

export function suburbOptionsSection(area, l) {
  const copy = suburbOptions[area.slug];
  if (!copy) throw new Error('Missing repair comparison: '+area.slug);
  return '<section class="content-section" id="repair-options"><h2>'+tr(l,'Compare repair options for this job','这项工作怎样比较方案')+'</h2><p>'+esc(copy[l])+'</p></section>';
}
