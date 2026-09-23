import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { pages } from '../src/site.mjs';
const facts = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url)));
const origin = process.env.CHECK_ORIGIN || facts.domain;
const cache = new Map();
const get = path => {
  if (!cache.has(path)) cache.set(path, (async () => {
    const response = await fetch(origin + path, { signal: AbortSignal.timeout(25000) });
    return { status: response.status, text: await response.text(), robots: response.headers.get('x-robots-tag') || '' };
  })());
  return cache.get(path);
};
const rows = [];
const graph = new Map();
for (let start = 0; start < pages.length; start += 8) await Promise.all(pages.slice(start, start + 8).map(async page => {
  const response = await get(page.path);
  const html = response.text;
  const issues = [];
  if (response.status !== 200) issues.push('HTTP_' + response.status);
  if (/noindex|none/i.test(response.robots) || /<meta[^>]+(?:name="(?:robots|googlebot)")[^>]+content="[^"]*(?:noindex|none)/i.test(html)) issues.push('INDEX_BLOCKED');
  if (!html.includes('rel="canonical" href="' + facts.domain + page.path + '"')) issues.push('CANONICAL');
  for (const [lang,path] of [['en-AU',page.locale==='en'?page.path:page.alternate],['zh-Hans',page.locale==='zh'?page.path:page.alternate]]) {
    if (!html.includes('hreflang="'+lang+'" href="'+facts.domain+path+'"')) issues.push('HREFLANG_'+lang);
  }
  if ((html.match(/<h1[ >]/g)||[]).length !== 1) issues.push('H1');
  if (html.includes('\uFFFD')) issues.push('ENCODING');
  try {
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] || 'null');
    if (!data?.['@graph']?.some(n=>n['@type']==='WebPage')) issues.push('WEBPAGE_SCHEMA');
    if (page.area && !data['@graph'].some(n=>n['@type']==='Service' && n.areaServed?.name===page.area.name+', NSW, Australia')) issues.push('AREA_SERVICE_SCHEMA');
  } catch { issues.push('JSON_LD'); }
  const links = new Set();
  for (const [,raw] of html.matchAll(/(?:href|src)="(\/[^"]+)"/g)) {
    const url = new URL(raw.replaceAll('&amp;','&'), origin);
    links.add(url.pathname);
    const target = await get(url.pathname);
    if (target.status !== 200) issues.push('BROKEN:'+url.pathname);
    if (url.hash && url.pathname !== '/rfq.js') {
      const anchor = decodeURIComponent(url.hash.slice(1));
      if (!target.text.includes('id="'+anchor+'"')) issues.push('ANCHOR:'+url.pathname+url.hash);
    }
  }
  graph.set(page.path,links);
  if (page.area && !['quote-decisions','suburb-rfq','area-map'].every(id=>html.includes('id="'+id+'"'))) issues.push('SUBURB_CONTENT');
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/name="description" content="([^"]*)"/)?.[1];
  if (!title || !description) issues.push('METADATA');
  const main = html.match(/<main[^>]*>(.*?)<\/main>/s)?.[1] || html;
  const text = main.replace(/<script.*?<\/script>/sg,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
  rows.push({ path: page.path, status: response.status, locale: page.locale, title, description, visibleChars: text.length, issues: [...new Set(issues)] });
}));
const reached = new Set(['/']);
for (const path of reached) for (const dest of graph.get(path)||[]) if (graph.has(dest)) reached.add(dest);
const [robots, sitemap, llms, missing] = await Promise.all(['/robots.txt','/sitemap.xml','/llms.txt','/areas/nonexistent-qa-area/'].map(get));
const sitemapUrls = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);
const duplicate = key => [...new Set(rows.map(r=>r[key]).filter((v,i,all)=>all.indexOf(v)!==i))];
const summary = { runAt: new Date().toISOString(), origin, canonicalOrigin: facts.domain, routes: rows.length, suburbPages: pages.filter(p=>p.area).length,
  failedRoutes: rows.filter(r=>r.issues.length), orphanPages: pages.map(p=>p.path).filter(p=>!reached.has(p)),
  duplicateTitles: duplicate('title'), duplicateDescriptions: duplicate('description'),
  robotsAllowsAll: robots.status===200 && robots.text.includes('Allow: /') && !/^Disallow:\s*\/\s*$/m.test(robots.text),
  sitemapComplete: sitemap.status===200 && sitemapUrls.length===pages.length && pages.every(p=>sitemapUrls.includes(facts.domain+p.path)),
  llmsComplete: llms.status===200 && pages.every(p=>llms.text.includes(facts.domain+p.path)),
  unknownRoute404: missing.status===404,
};
await mkdir('reports',{recursive:true});
await writeFile('reports/public-check-summary.json',JSON.stringify(summary,null,2));
await writeFile('reports/public-url-checks.json',JSON.stringify(rows.sort((a,b)=>a.path.localeCompare(b.path)),null,2));
console.log(JSON.stringify(summary,null,2));
if (summary.failedRoutes.length || summary.orphanPages.length || summary.duplicateTitles.length || summary.duplicateDescriptions.length || !summary.robotsAllowsAll || !summary.sitemapComplete || !summary.llmsComplete || !summary.unknownRoute404) process.exitCode=1;
