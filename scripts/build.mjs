import { readFile, mkdir, writeFile, cp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage, productionGaps } from '../src/site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultFacts = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));

export async function buildSite({ dest = join(root, 'dist'), production = false, indexable = false, facts = defaultFacts } = {}) {
  if (indexable && !facts.indexingAuthorized) throw new Error('Public indexing is not authorized');
  if (indexable && (!facts.domain || !/^https:\/\/[^/]+$/.test(facts.domain) || new URL(facts.domain).origin !== facts.domain)) throw new Error('Public indexing requires an HTTPS origin');
  const gaps = productionGaps(facts);
  const missingServices = production ? pages
    .filter(page => page.id.startsWith('S') && !facts.approvedServices?.includes(page.id))
    .map(page => page.id) : [];
  if (production && (gaps.length || missingServices.length))
    throw new Error('Missing production facts: ' + [...new Set([...gaps, ...missingServices])].join(', '));
  await mkdir(dest, { recursive: true });
  await cp(join(root, 'public'), dest, { recursive: true });
  const routes = [];
  for (const page of pages) {
    const result = renderPage(page.path, facts, { production, indexable });
    if (production && page.area && result.status === 404) continue;
    if (result.status !== 200) throw new Error('Route build failed: ' + page.path);
    const target = join(dest, page.path.replace(/^\//, ''), 'index.html');
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, result.html, 'utf8');
    routes.push(page.path);
  }
  await writeFile(join(dest, 'robots.txt'), production || indexable
    ? 'User-agent: *\nAllow: /\nSitemap: ' + facts.domain + '/sitemap.xml\n'
    : 'User-agent: *\nDisallow: /\n', 'utf8');
  if (production || indexable) {
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      routes.map(path => '<url><loc>' + facts.domain + path + '</loc></url>').join('') + '</urlset>';
    await writeFile(join(dest, 'sitemap.xml'), xml, 'utf8');
    const text = '# Mel One Sydney Carpentry\n\n> Bilingual residential timber repair enquiries across the Sydney areas listed below.\n\n' +
      'Business: ' + facts.brand + '\nLegal entity: ' + (facts.legalEntity || facts.brand) + '\n' +
      (facts.officeAddress ? 'Office: ' + facts.officeAddress + '. Suburb pages describe service enquiries, not branch offices.\n' : '') +
      (facts.telephone ? 'Phone: ' + facts.telephone + '\n' : '') + (facts.email ? 'Email: ' + facts.email + '\n' : '') +
      '\nScope, access, materials and availability are confirmed before booking. Photos are not evidence of work in an unconfirmed location. RFQ drafts require the visitor to send the email; generating a draft is not a received enquiry.\n\n' +
      '## Authoritative pages\n\n' + pages.filter(p => routes.includes(p.path)).map(p => '- [' + p.h1 + ' (' + p.locale + ')](' + facts.domain + p.path + ')').join('\n') +
      '\n\n## Crawl discovery\n\n- [XML sitemap](' + facts.domain + '/sitemap.xml)\n- [Crawler rules](' + facts.domain + '/robots.txt)\n';
    await writeFile(join(dest, 'llms.txt'), text, 'utf8');
  } else {
    await rm(join(dest, 'sitemap.xml'), { force: true });
    await rm(join(dest, 'llms.txt'), { force: true });
  }
  return { routes, production, indexable, gaps };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const production = process.argv.includes('--production');
  const indexable = process.argv.includes('--indexable');
  buildSite({ production, indexable }).then(result => {
    console.log(JSON.stringify({ routes: result.routes.length, production, indexable, output: join(root, 'dist') }));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
