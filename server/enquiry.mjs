const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL=/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const PHONE=/^(?:0[23478]\d{8}|\+61[23478]\d{8})$/;
const LIMITS={name:100,phone:22,email:254,suburb:100,service:80,details:4000,website:200};
const ALLOWED=new Set(['submissionId','createdAt','locale','consent',...Object.keys(LIMITS)]);
export const RECIPIENT='handyman.kevinlee@gmail.com';
export function json(data,status=200,extra={}){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow',...extra}});}
const fail=(status,code,reference)=>json({accepted:false,code,...(reference?{reference}:{})},status);
export function mailConfig(env={}){
  const key=env.RESEND_API_KEY?.trim(),from=env.CONTACT_FROM_EMAIL?.trim();
  const address=from?.match(/<([^<>]+)>$/)?.[1]||from;
  return key&&from&&!/[\r\n\0]/.test(key+from)&&EMAIL.test(address)?{key,from}:null;
}
async function bodyOf(request){
  const limit=16384;
  if(Number(request.headers.get('Content-Length')||0)>limit)throw {status:413};
  if(!request.body)throw {status:400};
  const reader=request.body.getReader(),chunks=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){void reader.cancel().catch(()=>{});throw {status:413};}chunks.push(value);}}
  finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
  return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
}
function validate(body,serviceLabels){
  if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).some(k=>!ALLOWED.has(k)))return null;
  if(!UUID.test(body.submissionId)||!Number.isSafeInteger(body.createdAt)||body.createdAt>Date.now()+120000||body.createdAt<Date.now()-23*3600000||!['en','zh'].includes(body.locale)||body.consent!==true)return null;
  const data={submissionId:body.submissionId,createdAt:body.createdAt,locale:body.locale};
  for(const [field,max] of Object.entries(LIMITS)){
    const value=body[field]??'';
    if(typeof value!=='string'||value.length>max||/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(value)||(field!=='details'&&/[\r\n]/.test(value)))return null;
    data[field]=value.trim();
  }
  if((data.name&&data.name.length<2)||(!data.phone&&!data.email)||(data.phone&&!PHONE.test(data.phone.replace(/[\s().-]/g,'')))||(data.email&&!EMAIL.test(data.email))||data.suburb.length<2||data.details.length<15||data.website||!Object.hasOwn(serviceLabels,data.service))return null;
  return data;
}
async function send(config,payload,key,fetchImpl,timeoutMs){
  const controller=new AbortController();let timer;
  const timeout=new Promise(resolve=>{timer=setTimeout(()=>{controller.abort();resolve({accepted:false,timeout:true});},timeoutMs);});
  const operation=(async()=>{try{
    const response=await fetchImpl('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+config.key,'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(payload),redirect:'error',signal:controller.signal});
    const result=await response.json().catch(()=>null);
    return response.ok&&typeof result?.id==='string'&&UUID.test(result.id)?{accepted:true,id:result.id}:{accepted:false,conflict:response.status===409};
  }catch{return {accepted:false,unknown:true};}})();
  try{return await Promise.race([operation,timeout]);}finally{clearTimeout(timer);}
}
export function createEnquiryHandler({serviceLabels={},fetchImpl=globalThis.fetch,timeoutMs=15000}={}){
  const rates=new Map();let salt;
  return async(request,env={})=>{
    if(request.method!=='POST')return json({accepted:false,code:'method_not_allowed'},405,{Allow:'POST'});
    if(request.headers.get('Origin')!==new URL(request.url).origin||request.headers.get('Sec-Fetch-Site')==='cross-site')return fail(403,'invalid_origin');
    if(request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase()!=='application/json')return fail(415,'invalid_content_type');
    let raw;try{raw=await bodyOf(request);}catch(error){return fail(error?.status===413?413:400,'invalid_body');}
    const data=validate(raw,serviceLabels);if(!data)return fail(422,'invalid_fields');
    const config=mailConfig(env);if(!config)return fail(503,'temporarily_unavailable',data.submissionId);
    const ip=request.headers.get('CF-Connecting-IP');
    if(ip){
      salt??=crypto.randomUUID();
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+ip));
      const fingerprint=Array.from(new Uint8Array(digest)).map(n=>n.toString(16).padStart(2,'0')).join('');
      const now=Date.now(),row=rates.get(fingerprint);
      if(row&&row.until>now){if(row.count>=5)return json({accepted:false,code:'rate_limited',reference:data.submissionId},429,{'Retry-After':'600'});row.count++;}
      else rates.set(fingerprint,{count:1,until:now+600000});
      if(rates.size>10000){for(const [k,v] of rates)if(v.until<=now)rates.delete(k);if(rates.size>10000)rates.delete(rates.keys().next().value);}
    }
    const label=serviceLabels[data.service][data.locale]||serviceLabels[data.service].en;
    const reference=data.submissionId;
    const lines=[`Reference: ${reference}`,`Submitted: ${new Date(data.createdAt).toISOString()}`,'Website: https://www.thesydneycarpenter.com.au',`Name: ${data.name}`,`Phone: ${data.phone}`,`Email: ${data.email||'Not provided'}`,`Suburb: ${data.suburb}`,`Service: ${label}`,`Language: ${data.locale==='zh'?'Traditional Chinese':'English'}`,'','Project details:',data.details];
    const business={from:config.from,to:[RECIPIENT],subject:`Sydney carpentry enquiry — ${data.suburb} — ${reference}`,text:['New Sydney carpentry enquiry','For Felix','',...lines].join('\n'),...(data.email?{reply_to:data.email}:{})};
    const accepted=await send(config,business,'melone-sydney-carpentry/business/'+reference,fetchImpl,timeoutMs);
    if(!accepted.accepted)return fail(accepted.timeout?504:accepted.conflict?409:502,accepted.conflict?'retry_conflict':'delivery_unconfirmed',reference);
    let confirmation={accepted:false};
    if(data.email){
      const zh=data.locale==='zh';
      const text=zh?[`${data.name}，您好：`,'','感謝您聯絡 Mel One Sydney Carpentry。您的維修詢價已送出。',`詢價編號：${reference}`,'','您可直接回覆這封電郵，向 Felix 補充現場照片或工程資料。','這次詢價尚未確認預約、價格或到場時間。如情況緊急，請致電 0403 202 949。','',...lines]:[`Hello ${data.name},`,'','Thank you for contacting Mel One Sydney Carpentry. Your repair enquiry has been sent.',`Enquiry reference: ${reference}`,'','Reply to this email to send Felix site photos or additional project details.','An enquiry does not confirm a booking, price or attendance time. For a time-sensitive issue, call 0403 202 949.','',...lines];
      confirmation=await send(config,{from:config.from,to:[data.email],reply_to:RECIPIENT,subject:zh?`您的Mel One Sydney Carpentry詢價 — ${reference}`:`Your Sydney carpentry enquiry — ${reference}`,text:text.join('\n')},'melone-sydney-carpentry/customer/'+reference,fetchImpl,timeoutMs);
    }
    return json({accepted:true,receipt:{id:reference,emailId:accepted.id},confirmationEmailAccepted:confirmation.accepted},201);
  };
}
