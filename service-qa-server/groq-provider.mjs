// Free-plan eligibility must be verified in the provider account before enabling.
// This flag is a deployment gate, not a substitute for the provider's billing controls.
const MODEL='openai/gpt-oss-20b';
export function groqConfiguration(env={}){
 const model=env.SERVICE_QA_MODEL===MODEL?MODEL:null;
 return{providerConfigured:Boolean(env.SERVICE_QA_PROVIDER==='groq'&&env.SERVICE_QA_GROQ_FREE_VERIFIED==='true'&&model&&typeof env.GROQ_API_KEY==='string'&&env.GROQ_API_KEY.trim()),model,freeOnly:true};
}
export function groqRequest(env,system,question,context){
 if(!groqConfiguration(env).providerConfigured)throw Error('Groq disabled');
 return{url:'https://api.groq.com/openai/v1/chat/completions',options:{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+env.GROQ_API_KEY},body:JSON.stringify({
  model:MODEL,temperature:0.1,max_completion_tokens:600,reasoning_effort:'low',stream:false,
  messages:[{role:'system',content:system},{role:'user',content:JSON.stringify({question,sources:context})}],
  response_format:{type:'json_schema',json_schema:{name:'service_answer',strict:true,schema:{type:'object',additionalProperties:false,required:['sourceIds'],properties:{sourceIds:{type:'array',minItems:0,maxItems:3,items:{type:'string',enum:context.map(s=>s.id)}}}}}}
 })}};
}
export function groqAnswer(payload){
 const choice=payload?.choices?.[0];
 if(!Array.isArray(payload?.choices)||payload.choices.length!==1||choice.finish_reason!=='stop'||choice.message?.refusal||choice.message?.tool_calls?.length||typeof choice.message?.content!=='string')throw Error('Unsupported provider output');
 return JSON.parse(choice.message.content);
}
