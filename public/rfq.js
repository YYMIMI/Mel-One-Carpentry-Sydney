import {mountOnlineForm,requireReply} from './online-enquiry.mjs';
export function makeRfq({ suburb, service, scope, quantity, access, contact }, zh = false) {
  const clean = value => String(value || '').replace(/\r/g, '').trim();
  const labels = zh ? ['地区','项目','工作描述','尺寸或数量','通道与时间','联系方式'] : ['Suburb','Task','Scope','Dimensions or quantity','Access and timing','Contact'];
  const values = [suburb, service, scope, quantity, access, contact].map(clean);
  if (![values[0], values[1], values[2], values[5]].every(Boolean)) throw new Error('Required enquiry details are missing');
  return { subject: (zh ? '木作询价 — ' : 'Carpentry RFQ — ') + values[0].replace(/\n/g,' '), body: labels.map((label,i)=>label+': '+(values[i] || (zh?'待确认':'To confirm'))).join('\n\n') };
}


if(typeof document!=='undefined')for(const form of document.querySelectorAll('[data-rfq-email]')){
 const zh=form.dataset.locale==='zh';const query=new URLSearchParams(location.search);
 if(form.id==='inquiry'){
  const suburb=query.get('suburb');if(suburb&&suburb.length<=100)form.elements.suburb.value=suburb;
  const service=query.get('service');if([...form.elements.service.options].some(option=>option.value===service))form.elements.service.value=service;
 }
 mountOnlineForm(form,{locale:zh?'zh':'en',phone:'0403 202 949',payload(value){
  const reply=requireReply(value.contact,zh);
  if(String(value.scope||'').trim().length<15)throw {field:'scope',message:zh?'請用至少15個字元說明工作。':'Describe the work in at least 15 characters.'};
  return {name:'',...reply,suburb:value.suburb||'',service:value.service||'',details:[value.scope||'', '', 'Dimensions / quantity: '+(value.quantity||'Not provided'),'Access / timing: '+(value.access||'Not provided')].join('\n'),consent:value.consent==='yes',website:value.website||''};
 },onAccepted(){window.gtag?.('event','generate_lead',{method:'online_enquiry',form_id:'sydney_carpentry_enquiry',service_id:form.elements.service.value,page_location:location.origin+location.pathname,page_path:location.pathname,locale:document.documentElement.lang});}});
}
