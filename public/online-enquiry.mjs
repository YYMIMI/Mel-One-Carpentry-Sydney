export const validReceipt=(value,id)=>value?.accepted===true&&value?.receipt?.id===id&&typeof value.receipt.emailId==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.receipt.emailId)&&typeof value.confirmationEmailAccepted==='boolean';
export function mountOnlineForm(form,{payload,phone,locale='en',onAccepted=()=>{}}){
  const zh=locale==='zh',tr=(en,cn)=>zh?cn:en;
  const button=form.querySelector('[data-online-submit]'),status=form.querySelector('[data-online-status]');
  form.noValidate=true;
  const errorRows=new Map();
  for(const input of form.querySelectorAll('input:not([type=hidden]),textarea,select')){if(!input.name||input.name==='website')continue;const error=document.createElement('span');error.className='online-field-error';error.id=(form.id||'enquiry')+'-'+input.name+'-error';error.setAttribute('aria-live','polite');input.insertAdjacentElement('afterend',error);input.setAttribute('aria-describedby',[input.getAttribute('aria-describedby'),error.id].filter(Boolean).join(' '));errorRows.set(input,error);}
  const validate=()=>{let first;for(const [input,error] of errorRows){const bad=!input.validity.valid;input.setAttribute('aria-invalid',String(bad));error.textContent=bad?(input.validity.customError?input.validationMessage:tr('Please check this field.','請檢查此欄位。')):'';if(bad)first??=input;}if(first){first.focus();status.textContent=tr('Check the highlighted fields. Your details are still here.','請檢查標示的欄位，已填資料仍保留。');return false;}return true;};
  let pending=false,accepted=false,composing=false,retry=null;
  const countedSubmissions=new Set();
  const label=tr('Send enquiry','發送詢價');
  button.textContent=label;button.disabled=false;
  form.addEventListener('compositionstart',()=>{composing=true;});form.addEventListener('compositionend',()=>{composing=false;});
  const changed=()=>{if(pending)return;accepted=false;button.disabled=false;button.textContent=label;status.textContent='';for(const [input,error] of errorRows){input.setCustomValidity('');input.removeAttribute('aria-invalid');error.textContent='';}};
  form.addEventListener('input',changed);form.addEventListener('change',changed);
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(pending||accepted||composing)return;
    const values=Object.fromEntries(new FormData(form));
    let data;
    try{data=payload(values);}catch(error){const input=form.elements.namedItem(error.field);if(input)input.setCustomValidity(error.message);validate();status.textContent=error.message;return;}
    if(!validate())return;
    const signature=JSON.stringify(data);
    if(!retry||retry.signature!==signature||Date.now()-retry.createdAt>23*3600000)retry={signature,id:crypto.randomUUID(),createdAt:Date.now()};
    const request={...data,submissionId:retry.id,createdAt:retry.createdAt,locale};
    const controls=[...form.querySelectorAll('input,select,textarea,button')].map(el=>({el,disabled:el.disabled}));
    const lock=value=>{for(const row of controls)row.el.disabled=value||row.disabled;form.setAttribute('aria-busy',String(value));};
    pending=true;lock(true);button.textContent=tr('Sending…','發送中…');status.textContent=tr('Sending your enquiry. Please keep this page open.','正在發送詢價，請保留此頁面。');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),35000);
    try{
      const response=await fetch('/api/enquiry',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(request),signal:controller.signal});
      const result=await response.json().catch(()=>null);
      if(!response.ok||!validReceipt(result,retry.id))throw Error('Delivery not confirmed');
      accepted=true;
      status.textContent=tr('Your enquiry has been sent. Reference: ','詢價已發送。編號：')+retry.id+'. '+(result.confirmationEmailAccepted?tr('Check your email for a confirmation. You can reply with photos.','請查看電郵確認信，可直接回覆附上照片。'):tr('We will use the contact details you provided to respond.','我們會使用您提供的聯絡方式回覆。'));
      if(!countedSubmissions.has(retry.id)){countedSubmissions.add(retry.id);try{onAccepted();}catch{/* Optional analytics must not change enquiry success. */}}
      form.dispatchEvent(new CustomEvent('site:enquiry-accepted',{bubbles:true}));
    }catch{
      status.textContent=tr('We could not confirm submission. Your details are still here. Retry the same enquiry or call ','未能確認提交，已填資料仍保留。可重試同一詢價或致電 ')+phone+tr('. Keep this reference if you contact us: ','。聯絡時請保留編號：')+retry.id;
    }finally{clearTimeout(timer);pending=false;lock(false);button.disabled=accepted;button.textContent=accepted?tr('Enquiry sent','詢價已發送'):label;}
  });
}
export function requireReply(value,zh=false){
  const clean=String(value||'').trim();
  if(/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(clean))return {email:clean,phone:''};
  if(/^(?:0[23478]\d{8}|\+61[23478]\d{8})$/.test(clean.replace(/[\s().-]/g,'')))return {phone:clean,email:''};
  throw {field:'contact',message:zh?'請填寫有效的澳洲電話或電郵。':'Enter a valid Australian phone number or email.'};
}
