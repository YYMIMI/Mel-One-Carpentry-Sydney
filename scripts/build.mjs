import { readFile, mkdir, writeFile, cp } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages, renderPage, productionGaps } from '../src/site.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const defaultFacts = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));

export async function buildSite({ dest = join(root, 'dist'), production = false, facts = defaultFacts } = {}) {
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
    const result = renderPage(page.path, facts, { production });
    if (production && page.area && result.status === 404) continue;
    if (result.status !== 200) throw new Error('Route build failed: ' + page.path);
    const target = join(dest, page.path.replace(/^\//, ''), 'index.html');
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, result.html, 'utf8');
    routes.push(page.path);
  }
  await writeFile(join(dest, 'robots.txt'), production
    ? 'User-agent: *\nAllow: /\nSitemap: ' + facts.domain + '/sitemap.xml\n'
    : 'User-agent: *\nDisallow: /\n', 'utf8');
  if (production) {
    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      routes.map(path => '<url><loc>' + facts.domain + path + '</loc></url>').join('') + '</urlset>';
    await writeFile(join(dest, 'sitemap.xml'), xml, 'utf8');
  }
  return { routes, production, gaps };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const production = process.argv.includes('--production');
  buildSite({ production }).then(result => {
    console.log(JSON.stringify({ routes: result.routes.length, production, output: join(root, 'dist') }));
  }).catch(error => { console.error(error.message); process.exitCode = 1; });
}
