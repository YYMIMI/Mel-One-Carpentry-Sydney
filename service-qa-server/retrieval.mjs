// Portable, site-local retrieval. No network, embeddings, provider or persistent query storage.
const EN_STOP = new Set('a an the and or but if of to for in on at by with from is are was were be been being do does did can could should would will may might i me my we our you your it its this that these those how what why when where which who please tell about also have has had as us into before after than then there here need want get'.split(' '));
const ZH_STOP = new Set(['什么','甚麼','怎么','怎麼','如何','可以','是否','我们','我們','你们','你們','我的','你的','请问','請問','一下','需要','以及','或者','还是','還是','有关','有關']);
const GENERIC = new Set('repair repairs repairing fix fixing service services work works job jobs help quote quotes quoting price prices pricing cost costs enquiry enquiries question questions information team call contact book booking available availability time photos photo send details problem problems maintenance'.split(' ').concat(['维修','維修','修理','服务','服務','报价','報價','价格','價格','费用','費用','咨询','諮詢','问题','問題','照片','联系','聯繫','時間','时间','安排','检查','檢查','提供','现场','現場','房屋','房子']));
const SYNONYMS = [
 ['blocked','blockage','blockages','clogged','clog','堵塞','淤塞','阻塞'],
 ['leak','leaks','leaking','leakage','漏水','渗水','滲水'],
 ['tap','taps','faucet','faucets','水龙头','水龍頭','龙头','龍頭'],
 ['toilet','toilets','cistern','马桶','馬桶','坐厕','坐廁'],
 ['sink','basin','水槽','洗手盆'],
 ['gutter','gutters','eavestrough','天沟','天溝','檐沟','簷溝','檐溝'],
 ['roof','roofing','屋顶','屋頂','屋面'],
 ['door','doors','门框','門框','木门','木門'],
 ['fence','fencing','围栏','圍欄','篱笆','籬笆'],
 ['window','windows','窗户','窗戶','木窗'],
 ['waterproof','waterproofing','防水'],
 ['blind','blinds','roller blind','卷帘','捲簾','百叶窗','百葉窗'],
 ['curtain','curtains','窗帘','窗簾'],
 ['electrical','electrician','电工','電工','电路','電路'],
 ['plumbing','plumber','水管'],
 ['deck','decking','露台','木平台'],
 ['timber','wood','wooden','木材','木料','木制','木製'],
 ['replacement','replace','replacing','更换','更換','替换','替換'],
 ['renovation','renovations','renovate','装修','裝修','翻新'],
 ['crack','cracked','cracks','裂缝','裂縫','开裂','開裂'],
 ['rust','rusted','corrosion','生锈','生鏽','锈蚀','鏽蝕'],
 ['appliance','appliances','电器','電器','家电','家電'],
];
const indexCache = new WeakMap();
const han=/[\p{Script=Han}]/u;
const TRADITIONAL = {'龍':'龙','頭':'头','門':'门','簾':'帘','圍':'围','欄':'栏','籬':'篱','頂':'顶','滲':'渗','廁':'厕','溝':'沟','簷':'檐','葉':'叶','電':'电','氣':'气','線':'线','維':'维','務':'务','報':'报','價':'价','費':'费','時':'时','間':'间','聯':'联','繫':'系','檢':'检','現':'现','場':'场','問':'问','題':'题','換':'换','裝':'装','製':'制','鏽':'锈','縫':'缝','開':'开','捲':'卷','損':'损','壞':'坏','塗':'涂','層':'层','牆':'墙','廚':'厨','櫃':'柜','樓':'楼','階':'阶','陽':'阳','臺':'台','後':'后','對':'对','處':'处','理':'理','關':'关','預':'预','約':'约','證':'证','執':'执','許':'许','過':'过','濾':'滤','淨':'净','舊':'旧','華':'华','區':'区','遠':'远','運':'运','護':'护','樹':'树','濕':'湿','乾':'干','銹':'锈','餘':'余','數':'数','據':'据','這':'这','個':'个','與':'与','應':'应','讓':'让','說':'说','請':'请','資':'资','適':'适','輕':'轻','長':'长','縮':'缩','鎖':'锁','鬆':'松','穩':'稳','強':'强','撐':'撑'};
const clean = value => String(value ?? '').normalize('NFKC').toLowerCase().replace(/[\p{Script=Han}]/gu,ch=>TRADITIONAL[ch]||ch);
const latinStem = word => word.length > 5 && word.endsWith('ing') ? word.slice(0,-3) : word.length > 4 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0,-1) : word;

export function tokenize(text) {
 const value=clean(text); const result=[];
 for(const word of value.match(/[a-z0-9]+(?:['’-][a-z0-9]+)*/g)||[])if(word.length>1&&!EN_STOP.has(word)&&!/^\d+$/.test(word))result.push(latinStem(word));
 for(const run of value.match(/[\p{Script=Han}]+/gu)||[]){const chars=[...run];if(chars.length===1)continue;for(let i=0;i<chars.length-1;i++){const gram=chars.slice(i,i+2).join('');if(!ZH_STOP.has(gram))result.push(gram);}}
 // A recognized service synonym is the same original topic, not evidence from an unrelated expansion.
 for(const group of SYNONYMS)if(group.some(term=>phraseMatches(value,clean(term))))result.push(`~${group[0]}`);
 return [...new Set(result)];
}
function phraseMatches(text,phrase){return han.test(phrase)?text.includes(phrase):new RegExp(`(?:^|[^a-z])${phrase.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}(?:$|[^a-z])`,'i').test(text);}

export function expandQuery(question, maxExpansions=3) {
 const original=Array.from(String(question??'').trim()).slice(0,600).join('');if(!original)return[];
 const lower=clean(original);const expansions=[];
 for(const group of SYNONYMS){if(!group.some(term=>phraseMatches(lower,term)))continue;
  const extra=group.filter(term=>!phraseMatches(lower,term));if(extra.length)expansions.push(`${original} ${extra.join(' ')}`);
  if(expansions.length>=Math.max(0,Math.min(3,Number(maxExpansions)||0)))break;
 }
 return [original,...(Number(maxExpansions)>0?expansions:[])];
}
function isGeneric(token){return token==='~replacement'||['mel','one','melone','ellis'].includes(token)||GENERIC.has(token)||GENERIC.has(token+'s');}
function buildIndex(corpus,language){
 let cache=indexCache.get(corpus);if(!cache){cache=new Map();indexCache.set(corpus,cache);}if(cache.has(language))return cache.get(language);
 let origin;try{origin=new URL(corpus.origin).origin;}catch{return null;}
 const prefix=`${corpus.siteId}:`;const docs=[];const df=new Map();
 for(const doc of Array.isArray(corpus.documents)?corpus.documents:[]){
  if(doc.language!==language||typeof doc.id!=='string'||!doc.id.startsWith(prefix)||typeof doc.text!=='string'||!doc.text.trim()||typeof doc.title!=='string')continue;
  let url;try{url=new URL(doc.url);if(url.origin!==origin||url.protocol!=='https:'||url.username||url.password)continue;}catch{continue;}
  const body=tokenize(doc.text),title=tokenize(doc.title);const tokens=new Set([...body,...title]);
  for(const token of tokens)df.set(token,(df.get(token)||0)+1);
  docs.push({doc,url:url.href,pageKey:url.origin+url.pathname,body:new Set(body),title:new Set(title),tokens});
 }
 const index={docs,df,size:docs.length};cache.set(language,index);return index;
}
function exactExcerpt(text,terms,maxChars){
 const cap=Math.max(120,Math.min(900,Number(maxChars)||650));if(text.length<=cap)return text;
 const lower=clean(text);let hit=Infinity;
 for(const term of terms){const i=lower.indexOf(term);if(i>=0)hit=Math.min(hit,i);}if(!Number.isFinite(hit))hit=0;
 let start=Math.max(0,hit-100);if(start){const boundary=text.indexOf('\n',start);if(boundary>=0&&boundary<hit)start=boundary+1;else{const space=text.indexOf(' ',start);if(space>=0&&space<hit)start=space+1;}}
 let end=Math.min(text.length,start+cap);if(end<text.length){const boundary=Math.max(text.lastIndexOf('\n',end),text.lastIndexOf('. ',end),text.lastIndexOf('。',end),text.lastIndexOf(' ',end));if(boundary>start+Math.floor(cap*.6))end=boundary+(text[boundary]==='。'?1:0);}
 return text.slice(start,end).trim();
}

export function retrieve(corpus, question, language='en', options={}) {
 if(!corpus||!['en','zh'].includes(language)||typeof question!=='string'||Array.from(question.trim()).length<2||Array.from(question).length>600)return[];
 const queries=expandQuery(question,options.maxExpansions??3);const original=tokenize(queries[0]);if(!original.length)return[];
 const anchors=original.filter(token=>!isGeneric(token));if(!anchors.length)return[];
 const index=buildIndex(corpus,language);if(!index?.size)return[];
 const expansion=new Set(queries.slice(1).flatMap(tokenize).filter(token=>!original.includes(token)));
 const idf=token=>Math.log(1+(index.size+1)/((index.df.get(token)||0)+1));
 const candidates=[];
 for(const item of index.docs){
  const matched=original.filter(t=>item.tokens.has(t));const anchored=anchors.filter(t=>item.tokens.has(t));
  // An expansion alone never qualifies a source; broad utility words never qualify it either.
  if(!anchored.length||(!matched.length)|| (anchors.length>=5&&anchored.length<2))continue;
  const originalScore=matched.reduce((sum,t)=>sum+idf(t)*(item.title.has(t)?1.7:1),0);
  const expansionScore=[...expansion].filter(t=>item.tokens.has(t)).reduce((sum,t)=>sum+idf(t)*.16,0);
  const coverage=anchored.length/anchors.length;
  const score=originalScore+expansionScore+coverage*1.5;
  if(score<1.8)continue;
  candidates.push({...item,score,anchored});
 }
 candidates.sort((a,b)=>b.score-a.score||a.doc.url.localeCompare(b.doc.url)||a.doc.id.localeCompare(b.doc.id));
 const selected=[],pages=new Set(),covered=new Set();const limit=Math.max(0,Math.min(3,Number(options.limit??3)||0));
 while(selected.length<limit){
  let chosen=null,best=-Infinity;
  for(const item of candidates){if(pages.has(item.pageKey))continue;const novel=item.anchored.filter(t=>!covered.has(t)).length;const rank=item.score+novel*.4;if(rank>best){best=rank;chosen=item;}}
  if(!chosen)break;pages.add(chosen.pageKey);chosen.anchored.forEach(t=>covered.add(t));
  const excerpt=exactExcerpt(chosen.doc.text,original,options.maxExcerptChars??650);
  if(excerpt&&chosen.doc.text.includes(excerpt))selected.push({id:chosen.doc.id,title:chosen.doc.title,url:chosen.url,excerpt});
 }
 return selected;
}
