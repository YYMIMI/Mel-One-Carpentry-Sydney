import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pages } from '../src/site.mjs';

function csv(text) {
  const rows=[]; let row=[],field='',quoted=false;
  for (let i=0;i<text.length;i++) {
    const c=text[i];
    if (quoted && c==='"' && text[i+1]==='"') {field+='"'; i++;}
    else if (c==='"') quoted=!quoted;
    else if (!quoted && c===',') {row.push(field);field='';}
    else if (!quoted && c==='\n') {row.push(field.replace(/\r$/,'')); rows.push(row);row=[];field='';}
    else field+=c;
  }
  if (field || row.length) {row.push(field);rows.push(row);}
  const [header,...data]=rows;
  header[0]=header[0].replace(/^\uFEFF/, '');
  return data.filter(r=>r.length===header.length).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]])));
}
const source = resolve('source-package/data');
const clusters = csv(await readFile(resolve(source,'cluster_coverage.csv'),'utf8'));
const expressions = csv(await readFile(resolve(source,'search_coverage.csv'),'utf8'));
const byCluster = new Map();
for (const item of expressions) {
  const key=item.cluster_id+'|'+item.language;
  const list=byCluster.get(key)||[];list.push(item);byCluster.set(key,list);
}
const knownPaths = new Set(pages.map(p=>p.path));
const rows = clusters.map(cluster=>{
  const items=byCluster.get(cluster.cluster_id+'|'+cluster.language)||[];
  const route=cluster.primary_url;
  const draft=cluster.phase==='P0' && knownPaths.has(route);
  return {
    cluster_id:cluster.cluster_id, language:cluster.language, owner_id:cluster.owner_id, phase:cluster.phase,
    expressions:items.length, search_entries:[...new Set(items.map(x=>x.search_entry))].join(';'),
    planned_owner_url:route, actual_route:draft?route:'',
    content_coverage:draft?'DRAFT_ANSWER_PRESENT':'DEFERRED_PAGE',
    location_coverage:draft?'PENDING_APPROVED_AREA_AND_SERVICE_SCOPE':'NOT_ASSESSED_P1',
    visible_evidence:draft?(cluster.owner_id==='H00'?route+'#main':route+'#problems;'+route+'#assessment;'+route+'#quote;'+route+'#areas;'+route+'#questions'):'',
    remaining_gap:draft?'Substantive draft must be reviewed against actual scope, area, brand and proof before publication':'P1 page intentionally unpublished; no placeholder URL',
  };
});
const out=resolve('reports');await mkdir(out,{recursive:true});
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await writeFile(resolve(out,'cluster-coverage.csv'), [Object.keys(rows[0]).join(','),...rows.map(r=>Object.values(r).map(quote).join(','))].join('\n')+'\n');
const aggregates={runAt:new Date().toISOString(),originalExpressions:expressions.length,clusterLanguageRows:clusters.length,
  p0ExpressionMappings:expressions.filter(r=>r.phase==='P0').length,p1DeferredExpressionMappings:expressions.filter(r=>r.phase==='P1').length,
  p0DraftClusterRows:rows.filter(r=>r.content_coverage==='DRAFT_ANSWER_PRESENT').length,
  p1DeferredClusterRows:rows.filter(r=>r.content_coverage==='DEFERRED_PAGE').length,
  searchEntryCounts:Object.fromEntries([...new Set(expressions.map(r=>r.search_entry))].map(k=>[k,expressions.filter(r=>r.search_entry===k).length])),
  interpretation:'Owner mappings and visible draft sections, not exact-match keyword counts, approved area promises, indexing, ranking or AI recommendations.'};
await writeFile(resolve(out,'coverage-summary.json'),JSON.stringify(aggregates,null,2)+'\n');
console.log(JSON.stringify(aggregates,null,2));
if (expressions.length!==1028||clusters.length!==122||rows.some(r=>!r.cluster_id||r.phase==='P0'&&!r.actual_route)||
  rows.reduce((n,r)=>n+r.expressions,0)!==expressions.length) process.exitCode=1;
