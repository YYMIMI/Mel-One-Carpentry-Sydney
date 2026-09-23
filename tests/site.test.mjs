import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pages, renderPage, productionGaps, areaDecision } from '../src/site.mjs';

const facts = {
  brand: null, domain: null, telephone: null, inquiryRecipient: null,
  approvedServices: [], approvedAreas: [], productionAuthorized: false,
};

test('each P0 owner has distinct English and Chinese routes and same-topic language links', () => {
  assert.equal(pages.filter(p=>!p.area).length, 32);
  const en = renderPage('/services/timber-window-repairs/', facts);
  const zh = renderPage('/zh/services/timber-window-repairs/', facts);
  assert.equal(en.status, 200);
  assert.match(en.html, /Timber Window Repairs in Sydney/);
  assert.match(zh.html, /悉尼木窗与木窗框维修/);
  assert.match(en.html, /href="\/zh\/services\/timber-window-repairs\/"/);
  assert.match(zh.html, /href="\/services\/timber-window-repairs\/"/);
  assert.doesNotMatch(en.html, /localhost|example\.com|rel="canonical"/);
});

test('nine core service routes have substantive distinct bilingual answers rather than renamed templates', () => {
  for (const locale of ['en', 'zh']) {
    const services = pages.filter(p => p.id.startsWith('S') && p.locale === locale);
    assert.equal(services.length, 9);
    assert.equal(new Set(services.map(p => p.content.problem)).size, 9);
    for (const page of services) {
      assert.ok(page.content.problem.length > 45, page.id);
      assert.ok(page.content.assessment.length > 45, page.id);
      assert.ok(page.content.boundary.length > 45, page.id);
      assert.ok(page.content.quote.length > 40, page.id);
      assert.ok(page.content.faq.length >= 3, page.id);
    }
  }
});

test('all nine service entrances have imagery while generated scenes stay out of real-job galleries', () => {
  const generated = {
    S03: 'fascia.webp', S04: 'rotten-timber.webp', S06: 'timber-gate.webp', S07: 'deck.webp',
  };
  for (const locale of ['en', 'zh']) {
    const prefix = locale === 'zh' ? '/zh' : '';
    const home = renderPage(prefix + '/', facts).html;
    assert.equal((home.match(/class="service-card"/g) || []).length, 9);
    assert.equal((home.match(/class="case-card"/g) || []).length, 5);
    assert.match(home, /<figure class="hero-photo"><img src="\/assets\/real-work\/fence-timber-work\.jpg"/);
    assert.doesNotMatch(home, /AI-generated|AI场景示意|示意图/);
    for (const [id, image] of Object.entries(generated)) {
      const page = pages.find(p => p.id === id && p.locale === locale);
      const html = renderPage(page.path, facts).html;
      assert.match(home, new RegExp('/assets/service-imagery/' + image.replace('.', '\\.') ));
      assert.match(html, new RegExp('class="service-intro[^" ]*[^>]*>'));
      assert.match(html, new RegExp('/assets/service-imagery/' + image.replace('.', '\\.') ));
      assert.doesNotMatch(html, /class="work-photo[^>]*>[\s\S]*?\/assets\/service-imagery\//);
    }
  }
});

test('interior shelving task has an actual bilingual answer, not only a keyword mapping', () => {
  for (const path of ['/services/interior-carpentry/','/zh/services/interior-carpentry/']) {
    const html=renderPage(path,facts).html;
    assert.match(html,path.startsWith('/zh') ? /层板松动或更换时/ : /For a loose or replacement shelf/);
    assert.match(html,path.startsWith('/zh') ? /承重/ : /expected load/);
  }
});

test('production gate lists missing identity, contacts, scope, recipient and authorization without inventing them', () => {
  const gaps = productionGaps(facts);
  assert.deepEqual(gaps, ['brand', 'domain', 'telephone-or-email', 'inquiryRecipient', 'approvedServices', 'approvedAreas', 'areaBatchIncomplete', 'productionAuthorized']);
});

test('an unapproved suburb has a preview page but is not a production service promise', () => {
  assert.equal(areaDecision('Chatswood', 'S01', facts).status, 'PENDING');
  assert.equal(renderPage('/areas/chatswood/', facts).status, 200);
  assert.equal(renderPage('/areas/chatswood/', facts, {production:true}).status, 404);
  const area = renderPage('/areas/', facts).html;
  assert.match(area, /Chatswood/);
  assert.match(area, /confirm the work and access details individually before booking/i);
  assert.doesNotMatch(area, /We serve Chatswood/);
});

test('Sydney area enquiries cover the package districts in both languages without asserting service coverage', () => {
  const en = renderPage('/areas/', facts).html;
  const zh = renderPage('/zh/areas/', facts).html;
  for (const [english, chinese, suburb] of [
    ['Sydney CBD & Inner City', '悉尼市区与内城', 'Surry Hills'],
    ['Inner West', '内西区', 'Marrickville'],
    ['Eastern Suburbs', '东区', 'Bondi'],
    ['Lower North Shore', '下北岸', 'North Sydney'],
    ['Upper North Shore', '上北岸', 'Hornsby'],
    ['Ryde & North West', 'Ryde与西北', 'Eastwood'],
    ['Northern Beaches', '北部海滩', 'Manly'],
    ['Hills District', 'Hills地区', 'Castle Hill'],
    ['Parramatta & Surrounds', 'Parramatta及周边', 'Parramatta'],
    ['Western Sydney', '西悉尼', 'Blacktown'],
    ['South Western Sydney', '西南悉尼', 'Liverpool'],
    ['Macarthur & Surrounds', 'Macarthur及周边', 'Campbelltown'],
    ['St George', 'St George地区', 'Hurstville'],
    ['Sutherland Shire', 'Sutherland地区', 'Miranda'],
  ]) {
    assert.ok(en.includes(english.replaceAll('&', '&amp;')), english);
    assert.match(zh, new RegExp(chinese));
    assert.match(en, new RegExp(suburb));
    assert.match(zh, new RegExp(suburb));
  }
  assert.match(en, /href="\/services\/timber-window-repairs\/"/);
  assert.match(zh, /href="\/zh\/services\/timber-window-repairs\/"/);
  assert.match(en, /href="\/contact\/\?service=/);
  assert.doesNotMatch(en, /"areaServed"|We serve all Sydney|We serve Chatswood/);
  assert.equal(renderPage('/areas/campbelltown/', facts).status, 200);
});

test('the home page surfaces Sydney suburb examples with a route to verify them', () => {
  const en = renderPage('/', facts).html;
  const zh = renderPage('/zh/', facts).html;
  assert.match(en, /Surry Hills/);
  assert.match(en, /Parramatta/);
  assert.match(zh, /悉尼市区与内城/);
  assert.match(zh, /Parramatta/);
  assert.match(en, /href="\/areas\/"/);
  assert.match(zh, /href="\/zh\/areas\/"/);
});

test('production pages name only approved service locations, not pending research examples', () => {
  const approved = { ...facts, brand: 'Approved Brand', domain: 'https://carpentry.example.test', telephone: '+61290000000',
    inquiryRecipient: 'team@example.test', approvedServices: ['S01'], productionAuthorized: true,
    approvedAreas: [{ name: 'Chatswood', coverage_status: 'APPROVED', approved_service_ids: ['S01'], public_copy_approved: true }] };
  for (const path of ['/', '/areas/', '/zh/', '/zh/areas/']) {
    const html = renderPage(path, approved, { production: true }).html;
    assert.match(html, /Chatswood/);
    assert.doesNotMatch(html, /Surry Hills|Campbelltown|Bondi/);
    assert.doesNotMatch(html, /href="(?:\/zh)?\/services\/deck-repairs\/"/);
  }
});

test('approved, pending and out-of-scope areas remain distinct per service', () => {
  const local={...facts,approvedAreas:[
    {name:'Chatswood',coverage_status:'APPROVED',approved_service_ids:['S01'],public_copy_approved:true},
    {name:'Mosman',coverage_status:'PENDING',approved_service_ids:[]},
    {name:'Penrith',coverage_status:'OUT_OF_SCOPE',approved_service_ids:[]},
  ]};
  assert.equal(areaDecision('Chatswood','S01',local).status,'APPROVED');
  assert.equal(areaDecision('Chatswood','S02',local).status,'PENDING');
  assert.equal(areaDecision('Mosman','S01',local).status,'PENDING');
  assert.equal(areaDecision('Penrith','S01',local).status,'OUT_OF_SCOPE');
  const html=renderPage('/areas/',local).html;
  assert.match(html,/Places we can discuss work/);
  assert.doesNotMatch(html,/<ul class="area-list">[^<]*Mosman/);
});

test('service quote CTA retains its Owner in both language forms', () => {
  for (const path of ['/services/timber-window-repairs/','/zh/services/timber-window-repairs/']) {
    const html=renderPage(path,facts).html;
    assert.match(html,/\/contact\/\?service=S01/);
  }
  assert.match(renderPage('/contact/?service=S01',facts).html,/<option value="S01" selected>/);
  assert.match(renderPage('/zh/contact/?service=S01',facts).html,/<option value="S01" selected>/);
});

test('door-frame evidence appears once per unique photo on both Owner pages, not unrelated services', () => {
  const photos = ['door-wide.jpg', 'door-work-area.jpg', 'door-jamb-detail.jpg', 'door-threshold-detail.jpg'];
  for (const path of ['/services/timber-door-frame-repairs/', '/zh/services/timber-door-frame-repairs/']) {
    const html = renderPage(path, facts).html;
    for (const photo of photos) {
      assert.equal(html.split('/assets/real-work/' + photo).length - 1, 1, `${path}: ${photo}`);
    }
    assert.match(html, /<figure class="work-photo"/);
    assert.doesNotMatch(html, /finished door replacement|已完工门框更换/i);
  }
  assert.doesNotMatch(renderPage('/services/interior-carpentry/', facts).html, /door-wide\.jpg|towel-rail/);
});

test('window refinishing case photos and scope are visible on both window Owner pages', () => {
  const photos = ['window-multipane.jpg', 'window-two-pane.jpg', 'window-frame-sill.jpg', 'window-sliding-frame.jpg'];
  for (const path of ['/services/timber-window-repairs/', '/zh/services/timber-window-repairs/']) {
    const html = renderPage(path, facts).html;
    for (const photo of photos) assert.equal(html.split('/assets/real-work/' + photo).length - 1, photo === 'window-multipane.jpg' ? 2 : 1, `${path}: ${photo}`);
    assert.match(html, path.startsWith('/zh') ? /窗框.*刷漆|刷漆.*窗框/ : /timber.window.frames.*repaint|repaint.*timber.window.frames/i);
  }
  assert.doesNotMatch(renderPage('/services/timber-door-frame-repairs/', facts).html, /window-multipane\.jpg/);
});

test('door refinishing and compatible lock hardware case photos stay on both door Owner pages', () => {
  const photos = ['door-trim.jpg', 'door-bathroom-leaf.jpg', 'door-open-leaf.jpg', 'door-hall-frame.jpg', 'door-panel-lock-bore.jpg', 'door-latch-work.jpg'];
  for (const path of ['/services/timber-door-frame-repairs/', '/zh/services/timber-door-frame-repairs/']) {
    const html = renderPage(path, facts).html;
    for (const photo of photos) assert.equal(html.split('/assets/real-work/' + photo).length - 1, photo === 'door-open-leaf.jpg' ? 2 : 1, `${path}: ${photo}`);
    assert.match(html, path.startsWith('/zh') ? /相容.*锁舌|相容.*门锁/ : /compatible.*latch|compatible.*lockset/i);
    assert.match(html, path.startsWith('/zh') ? /紧急开锁/ : /emergency lockout/i);
  }
  assert.doesNotMatch(renderPage('/services/timber-window-repairs/', facts).html, /door-latch-work\.jpg/);
});

test('detached interior panels appear on the interior Owner without implying whole-home painting', () => {
  for (const path of ['/services/interior-carpentry/', '/zh/services/interior-carpentry/']) {
    const html = renderPage(path, facts).html;
    for (const photo of ['interior-panels-prep.jpg', 'interior-panels-painted.jpg']) {
      assert.equal(html.split('/assets/real-work/' + photo).length - 1, photo === 'interior-panels-prep.jpg' ? 2 : 1, `${path}: ${photo}`);
    }
    assert.match(html, path.startsWith('/zh') ? /不等于整屋刷漆/ : /not a whole-home painting offer/i);
  }
  assert.doesNotMatch(renderPage('/services/timber-door-frame-repairs/', facts).html, /interior-panels-prep\.jpg/);
});

test('an approved region alone cannot imply every service or public area copy', () => {
  const unverified = { ...facts, approvedAreas: [{ name:'Chatswood', coverage_status:'APPROVED', approved_service_ids:[], public_copy_approved:false }] };
  assert.equal(areaDecision('Chatswood','S01',unverified).status,'PENDING');
  assert.ok(productionGaps(unverified).includes('areaServiceMatrix'));
  assert.ok(productionGaps(unverified).includes('areaCopyApproval'));
  assert.equal(areaDecision('Chatswood','S01', { ...unverified, approvedAreas: [
    { name: 'Chatswood', coverage_status: 'APPROVED', approved_service_ids: ['S01'], public_copy_approved: false }
  ] }).status, 'PENDING');
});

test('production metadata uses the clean same-language URL only when facts and approval are complete', () => {
  const approved = { ...facts, brand: 'Approved Brand', domain: 'https://carpentry.example.test', telephone: '+61290000000', inquiryRecipient: 'team@example.test', approvedServices: ['S01'], approvedAreas: pages.filter(page => page.area && page.locale === 'en').map(page => ({ name: page.area.name, coverage_status: 'APPROVED', approved_service_ids: ['S01'], public_copy_approved: true })), productionAuthorized: true };
  const page = renderPage('/zh/services/timber-window-repairs/?utm_source=test', approved, { production: true });
  assert.match(page.html, /rel="canonical" href="https:\/\/carpentry\.example\.test\/zh\/services\/timber-window-repairs\/"/);
  assert.match(page.html, /hreflang="en-AU" href="https:\/\/carpentry\.example\.test\/services\/timber-window-repairs\/"/);
  assert.match(page.html, /hreflang="zh-Hans" href="https:\/\/carpentry\.example\.test\/zh\/services\/timber-window-repairs\/"/);
  assert.doesNotMatch(page.html, /utm_source/);
});
