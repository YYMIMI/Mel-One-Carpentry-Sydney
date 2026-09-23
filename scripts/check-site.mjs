import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pages } from '../src/site.mjs';

const origin = process.env.PREVIEW_ORIGIN || 'http://127.0.0.1:8787';
const rows = [];
const bodyCache = new Map();
const get = async path => {
  if (!bodyCache.has(path)) {
    const response = await fetch(origin + path);
    bodyCache.set(path, { status: response.status, body: await response.text() });
  }
  return bodyCache.get(path);
};
const attr = (html, pattern) => html.match(pattern)?.[1] || '';
const plain = html => html.replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const linkIssues = new Set();
const graph = new Map();
for (const page of pages) {
  const { status, body } = await get(page.path);
  const title = attr(body, /<title>([^<]+)<\/title>/);
  const description = attr(body, /<meta name="description" content="([^"]+)"/);
  const h1 = attr(body, /<h1>([^<]+)<\/h1>/);
  const lang = attr(body, /<html lang="([^"]+)"/);
  const alternate = body.includes(`href="${page.alternate}"`);
  const noindex = body.includes('name="robots" content="noindex,nofollow"');
  const issues = [];
  if (status !== 200) issues.push('HTTP_'+status);
  if (!title || !description || !h1) issues.push('META_OR_H1_MISSING');
  if (lang !== (page.locale === 'zh' ? 'zh-Hans' : 'en-AU')) issues.push('LANG_MISMATCH');
  if (!alternate) issues.push('LANGUAGE_LINK_MISSING');
  if (!noindex) issues.push('PREVIEW_NOINDEX_MISSING');
  if (/rel="canonical"|application\/ld\+json|aggregateRating|reviewCount|mapsUrl/.test(body)) issues.push('UNAPPROVED_PRODUCTION_FACT');
  // Character-count parity is not word-count parity across scripts; this is only a gross empty-page guard.
  if (plain(body).length < (page.locale === 'zh' ? 250 : 440)) issues.push('BODY_TOO_SHORT_FOR_REVIEW');
  const destinations=new Set();
  for (const [,url] of body.matchAll(/href="(\/[^"]*)"/g)) {
    const pathname = new URL(url, origin).pathname;
    destinations.add(pathname);
    const target = await get(pathname);
    if (target.status !== 200) { issues.push('BROKEN_LINK:'+pathname); linkIssues.add(page.path+' -> '+pathname); }
  }
  graph.set(page.path,destinations);
  rows.push({ id:page.id, locale:page.locale, path:page.path, status, title, h1, lang, noindex, alternate, visibleChars:plain(body).length, issues:[...new Set(issues)].join(';') });
}
const robots = await get('/robots.txt');
const sitemap = await get('/sitemap.xml');
const p1Examples = await Promise.all(['/guides/repair-or-replace-rotten-timber/','/zh/guides/repair-or-replace-rotten-timber/'].map(get));
const reached=new Set(['/']);
for (const path of reached) for (const next of graph.get(path)||[]) if (graph.has(next)) reached.add(next);
const summary = { runAt:new Date().toISOString(), origin, routes:rows.length, routeFailures:rows.filter(r=>r.issues).length,
  brokenLinks:[...linkIssues], robotsDisallowsAll:robots.body.includes('Disallow: /'), previewSitemapAbsent:sitemap.status===404,
  unpublishedP1Returns404:p1Examples.every(r=>r.status===404), orphanPages:pages.map(p=>p.path).filter(p=>!reached.has(p)),
  titleDuplicates:[...new Set(rows.map(r=>r.title).filter((v,i,a)=>a.indexOf(v)!==i))] };
const quote = v => '"'+String(v ?? '').replaceAll('"','""')+'"';
await mkdir(resolve('reports'), {recursive:true});
await writeFile(resolve('reports/url-checks.csv'), [Object.keys(rows[0]).join(','), ...rows.map(r=>Object.values(r).map(quote).join(','))].join('\n')+'\n');
await writeFile(resolve('reports/url-check-summary.json'), JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if (summary.routeFailures || summary.brokenLinks.length || !summary.robotsDisallowsAll || !summary.previewSitemapAbsent ||
  !summary.unpublishedP1Returns404 || summary.orphanPages.length || summary.titleDuplicates.length) process.exitCode=1;
