import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const source=JSON.parse(await readFile(resolve('source-package/qa/acceptance.json'),'utf8'));
const now=new Date().toISOString();
const pass=new Map([
  ['Q03',['Missing public facts refuse production build while preview builds; no fabricated values.',['reports/unit-tests.txt']]],
  ['Q06',['Approved, pending and out-of-scope areas remain separate per service in tested fixture.',['reports/unit-tests.txt']]],
  ['Q09',['Unapproved suburb route is 404; no renamed suburb pages generated.',['reports/unit-tests.txt','reports/url-check-summary.json']]],
  ['Q20',['Unknown and unpublished P1 example URLs return 404 on loopback preview.',['reports/url-check-summary.json']]],
  ['Q22',['All 32 routes reachable from home graph; no broken internal links or orphans.',['reports/url-checks.csv','reports/url-check-summary.json']]],
  ['Q36',['GBP is disabled/null; sampled HTML and API remain functional with no map/review/rating artifacts.',['site.config.json','reports/url-checks.csv','reports/live-tests.json']]],
  ['Q40',['Synthetic EN email-only and ZH phone-only browser/API enquiries received unique durable local receipts.',['reports/live-tests.json','reports/lead-delivery-tests.md']]],
  ['Q58',['Only substantive Home/Services/Areas/About/FAQ/Contact/Privacy routes appear; no empty Guides navigation.',['reports/url-checks.csv','reports/url-check-summary.json']]],
  ['Q59',['Nine homepage Owner paths and service CTA preselection tested in both languages.',['reports/unit-tests.txt','reports/url-checks.csv']]],
  ['Q61',['Generated public directory contains only static assets and route HTML; package research is not copied.',['reports/unit-tests.txt']]],
  ['Q62',['Single AI illustrative image caption, alt and source/rights boundary inspected; no invented project image.',['reports/media-manifest.md','reports/url-checks.csv']]],
  ['Q64',['EN email-only and ZH phone-only accepted; empty/invalid contact rejected in tests.',['reports/live-tests.json','reports/lead-delivery-tests.md','reports/unit-tests.txt']]],
  ['Q49',['Code, failures, unrun cases, evidence and rollback delivered without claiming production or ranking.',['reports/acceptance-report.md','reports/test-results.json']]],
  ['Q50',['Release verdict withheld for missing target, facts, privacy and real recipient; GBP/rank not treated as engineering defects.',['reports/acceptance-report.md','site.config.json']]],
  ['Q71',['Only v3 source package is bundled beside runnable code; no active v1/v2 dependency.',['source-package/00_START_HERE.md','README.md']]],
  ['Q73',['Preview/route/API work proceeded with null business facts; production build remains gated.',['reports/unit-tests.txt','site.config.json']]],
]);
const blocked=new Map([
  ['Q02','Exact target repository and its AGENTS.md were not available; isolation was local only.'],
  ['Q05','Actual S01–S15 service permissions remain PENDING in the supplied facts.'],
  ['Q14','Actual jobs, qualifications and permitted business evidence not supplied.'],
  ['Q16','Real phone/email not supplied, so no production direct-HTML phone CTA can be checked.'],
  ['Q18','Full production URL/canonical responses require approved domain and deployment; only fixture test ran.'],
  ['Q19','Full production reciprocal hreflang and indexability require actual domain; only fixture test ran.'],
  ['Q23','No authorized production deployment exists.'],
  ['Q24','Loopback preview is noindex but not an authenticated hosted staging deployment.'],
  ['Q29','No production performance budget or live deployment performance run.'],
  ['Q30','Public legal/business identity and eligible entity claims remain unverified.'],
  ['Q40_PROD','Local durable receipt is not an authorized inbox delivery.'],
  ['Q42','Approved phone/email facts and configured analytics stream are missing; click event debug unrun.'],
  ['Q43','Coarse attribution unit-tested, but actual production analytics event destination/payload audit unrun.'],
  ['Q47','Research entry types mapped, but all 192 per-service-language entry checks not manually closed.'],
  ['Q51','Six entry classes were not individually verified for every core service/language.'],
  ['Q52','50 P1 cluster-language rows are intentionally deferred; scope approval needed before pages.'],
  ['Q53','No approved real area/service registry to prove region/suburb claims.'],
  ['Q54','No verified adjacency data; no automatic neighbouring-area promises made.'],
  ['Q55','Area/service matrix and actual regional navigation await approved coverage.'],
  ['Q57','Draft visible sections exist, but each research task still needs final human content/evidence review.'],
  ['Q63','Public brand/search-site name not approved.'],
  ['Q65','Server upload tested with fixture PNG and negative types; physical phone chooser/HEIC and timeout UX not fully run.'],
  ['Q66','Durable/failed-notification retry tested locally, but alert route and real authorized inbox receipt absent.'],
  ['Q67','Bilingual business scope promises require approved facts before parity signoff.'],
  ['Q68','Only fixture domain metadata tested; actual production origin absent.'],
  ['Q72','Runnable local site exists, but it has not been built in the unidentified target repository.'],
  ['Q74','No exact production target/authorization, pre-change rollback point or live post-release receipt.'],
]);
const external=new Set(['Q44','Q45','Q46','Q48','Q69']);
const cases=source.cases.map(item=>{
  const result={...item};
  if (pass.has(item.id)) {
    const [actual,evidence]=pass.get(item.id);Object.assign(result,{status:'PASS',executed_at:now,actual_result:actual,evidence_files:evidence});
  } else if (item.id==='Q39') Object.assign(result,{status:'DEFERRED_GBP',actual_result:'Owner-led GBP stage after launch; no external business profile touched.'});
  else if (external.has(item.id)) Object.assign(result,{status:'EXTERNAL_ACTION_PENDING',actual_result:'Postlaunch external verification needs an authorized live property.'});
  else if (blocked.has(item.id)) Object.assign(result,{status:'BLOCKED',actual_result:blocked.get(item.id)});
  else Object.assign(result,{status:'NOT_RUN',actual_result:'Not fully executed against the required actual environment; partial code or draft is not a PASS.'});
  return result;
});
const counts=Object.fromEntries([...new Set(cases.map(c=>c.status))].map(s=>[s,cases.filter(c=>c.status===s).length]));
await writeFile(resolve('reports/test-results.json'),JSON.stringify({source:'v3 qa/acceptance.json',generated_at:now,counts,cases},null,2)+'\n');
console.log(JSON.stringify(counts));
