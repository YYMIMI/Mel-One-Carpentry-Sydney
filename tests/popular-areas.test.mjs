import test from 'node:test';
import assert from 'node:assert/strict';
import { pages, renderPage } from '../src/site.mjs';
import { createHash } from 'node:crypto';
import { coreAreaGroups } from '../src/content.mjs';
import { suburbs } from '../src/suburbs.mjs';

const wanted = ['appin','ashfield','auburn','bankstown','berkeley-vale','blacktown','bondi-junction','burwood','campsie','castle-hill','chatswood','coogee','eastwood','epping','fairy-meadow','gwynneville','haymarket','hornsby','hurstville','killarney-vale','kingsford','liverpool','manly','marrickville','marsfield','mosman','mount-ousley','newtown','north-sydney','north-wollongong','parramatta','randwick','rhodes','ryde','shellharbour','strathfield','surry-hills','sydney-cbd','the-entrance','ultimo','waterloo','wollongong','zetland'];
test('all supplied popular locations resolve through the directory to bilingual enquiry pages', () => {
  for (const prefix of ['', '/zh']) {
    const directory = renderPage(prefix + '/areas/', {}).html;
    const prominent = directory.match(/<section\b[^>]*id="popular-locations"[\s\S]*?<\/section>/)?.[0];
    assert.ok(prominent, 'the prominent directory is present');
    for (const slug of wanted) {
      const path = prefix + '/areas/' + slug + '/';
      const result = renderPage(path, {});
      assert.equal(result.status, 200, path);
      assert.ok(directory.includes('href="'+path+'"'),path);
      assert.ok(prominent.includes('href="'+path+'"'),path+' appears in the prominent directory');
      assert.match(result.html, /id="area-job-planning"/);
      assert.match(result.html, /id="suburb-rfq"/);
      assert.ok(result.html.includes('href="'+prefix+'/services/timber-sleeper-installation/"'));
    }
    assert.ok(directory.includes('Sydney City'));
    assert.equal(renderPage(prefix+'/areas/sydney-city/',{}).status,404);
  }
});

test('regional locations keep their geographic identity and all original area routes remain', () => {
  for (const [slug,region] of [['berkeley-vale','Central Coast'],['wollongong','Illawarra'],['appin','Wollondilly']]) {
    const area = pages.find(p=>p.path==='/areas/'+slug+'/')?.area;
    assert.ok(area,slug);
    assert.ok(area.region.includes(region));
  }
  for (const slug of ['newtown','bondi','manly','hornsby','liverpool','cronulla']) assert.equal(renderPage('/areas/'+slug+'/',{}).status,200);
  assert.equal(pages.filter(p=>p.area).length,154);
});

test('Bondi Junction offers cabinet repair decisions, matching evidence and an accurate area map in both languages', () => {
  for (const prefix of ['', '/zh']) {
    const path = prefix + '/areas/bondi-junction/';
    const result = renderPage(path, {});
    assert.equal(result.status, 200, path);
    assert.ok(result.html.includes('NSW 2022'), path + ' shows its delivery postcode');
    assert.ok(result.html.includes('href="'+prefix+'/services/cabinet-door-drawer-repairs/#case-photos"'), path + ' links to matching work evidence');
    for (const id of ['quote-decisions', 'repair-options', 'suburb-rfq', 'area-map']) {
      assert.ok(result.html.includes('id="'+id+'"'), path + ' supplies ' + id);
    }
    assert.ok(result.html.includes('Bondi%20Junction%2C%20NSW%2C%20Australia'), path + ' maps the actual suburb');
    assert.ok(result.html.includes('href="'+prefix+'/areas/bondi/"'), path + ' offers its regional neighbour');
    const neighbour = renderPage(prefix+'/areas/bondi/', {}).html;
    assert.ok(neighbour.includes('href="'+path+'"'), path + ' is discoverable from its regional neighbour');
  }
});

test('published area links remain discoverable from the home and area directory', () => {
  const facts = {
    brand: 'Mel One',
    approvedServices: ['S05'],
    approvedAreas: [{
      name: 'Berkeley Vale', coverage_status: 'APPROVED',
      public_copy_approved: true, area_page_publish_approved: true,
      approved_service_ids: ['S05']
    }]
  };
  for (const prefix of ['', '/zh']) {
    const target = prefix + '/areas/berkeley-vale/';
    for (const route of [prefix + '/', prefix + '/areas/']) {
      const html = renderPage(route, facts, { production: true }).html;
      assert.ok(html.includes('href="' + target + '"'), route + ' must link to the published area');
    }
  }
});

test('expanding groups cannot reassign the original 56 enquiry briefs or primary services', () => {
  const original = coreAreaGroups.flatMap(group=>group.names).map(name=>suburbs.find(a=>a.name===name));
  assert.equal(original.length,56);
  const fingerprint=createHash('sha256').update(JSON.stringify(original.map(a=>[a.name,a.service,a.en,a.zh]))).digest('hex');
  // Same 56 names, primary services and English briefs. Chinese now also retains
  // the original safe-opening instruction and the larger-fixing distinction.
  assert.equal(fingerprint,'47d026a5b4fbd673296d96077cfc741c1e4f50c2d16ea4f26f8b9113a122c1c8');
  for(const area of original) {
    const page=pages.find(p=>p.path==='/areas/'+area.slug+'/');
    assert.equal(page.title,'Carpentry repairs in '+area.name);
    assert.equal(page.h1,'Carpentry enquiries for '+area.name);
  }
});
