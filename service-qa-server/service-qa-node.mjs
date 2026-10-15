import {Readable} from 'node:stream';
import {createServiceQaHandler,ownPreviewOrigins} from './service-qa-server.mjs';

// The actual Host header is checked against fixed deployment identities.
// Client-provided forwarded-host/proto headers never select the site or scheme.
export function toServiceQaWebRequest(req,{canonicalOrigin,previewOrigins=[],localOrigins=[]}){
 const canonical=new URL(canonicalOrigin).origin;
 const allowed=new Map([canonical,...previewOrigins,...localOrigins].map(origin=>{const u=new URL(origin);return[u.host,{origin:u.origin,protocol:u.protocol}];}));
 const rawHost=req.headers?.host;
 if(typeof rawHost!=='string'||!rawHost||/[\s/@\\?#]/u.test(rawHost))throw Object.assign(Error('Unrecognized request host'),{status:403});
 const host=rawHost.toLowerCase(),known=allowed.get(host);
 if(!known)throw Object.assign(Error('Unrecognized request host'),{status:403});
 if(known.protocol!=='https:'&&!localOrigins.includes(known.origin))throw Object.assign(Error('Invalid request scheme'),{status:403});
 const url=new URL(req.url||'/api/service-qa',known.origin);
 if(url.origin!==known.origin)throw Object.assign(Error('Unrecognized request URL'),{status:403});
 const headers=new Headers();
 for(const[name,value]of Object.entries(req.headers||{}))if(value!==undefined){if(Array.isArray(value))headers.set(name,value.join(', '));else headers.set(name,String(value));}
 const method=(req.method||'GET').toUpperCase(),options={method,headers};
 if(!['GET','HEAD'].includes(method)){
  if(req.body!==undefined){
   const body=typeof req.body==='string'||Buffer.isBuffer(req.body)||req.body instanceof Uint8Array?req.body:JSON.stringify(req.body);
   if(Buffer.byteLength(body)>4096)throw Object.assign(Error('Request body too large'),{status:413});options.body=body;
  }else if(req instanceof Readable){options.body=Readable.toWeb(req);options.duplex='half';}
  else if(req.body===undefined)options.body='';
 }
 return new Request(url,options);
}

export function createServiceQaNodeHandler(corpus,options={}){
 const env=options.env??process.env,previewOrigins=ownPreviewOrigins(env),localOrigins=options.localOrigins||[];
 const handler=createServiceQaHandler(corpus,{...options,env,allowedPreviewOrigins:[...previewOrigins,...localOrigins]});
 return async function serviceQaNode(req,res){
  let response;
  try{response=await handler(toServiceQaWebRequest(req,{canonicalOrigin:corpus.origin,previewOrigins,localOrigins}));}
  catch(error){const status=error.status===413?413:403;response=new Response(JSON.stringify({mode:'unavailable',answer:status===413?'Please shorten the service question.':'Open service questions on this website.',sources:[],contactUrl:new URL(corpus.contact.en,corpus.origin).href,code:status===413?'BODY_TOO_LARGE':'ORIGIN'}),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','x-robots-tag':'noindex, nofollow'}});}
  res.statusCode=response.status;for(const[name,value]of response.headers)res.setHeader(name,value);res.end(await response.text());
 };
}
