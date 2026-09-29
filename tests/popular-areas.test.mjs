import test from 'node:test';
import assert from 'node:assert/strict';
import { pages, renderPage } from '../src/site.mjs';
import { createHash } from 'node:crypto';
import { coreAreaGroups } from '../src/content.mjs';
import { suburbs } from '../src/suburbs.mjs';

const wanted = ['appin','ashfield','auburn','berkeley-vale','burwood','campsie','chatswood','eastwood','epping','fairy-meadow','gwynneville','haymarket','hurstville','killarney-vale','kingsford','marsfield','mount-ousley','north-wollongong','parramatta','rhodes','ryde','shellharbour','strathfield','sydney-cbd','the-entrance','ultimo','waterloo','wollongong','zetland'];
test('all supplied popular locations resolve through the directory to bilingual enquiry pages', () => {
  for (const prefix of ['', '/zh']) {
    const directory = renderPage(prefix + '/areas/', {}).html;
    for (const slug of wanted) {
      const path = prefix + '/areas/' + slug + '/';
      const result = renderPage(path, {});
      assert.equal(result.status, 200, path);
      assert.ok(directory.includes('href="'+path+'"'),path);
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
  assert.equal(pages.filter(p=>p.area).length,152);
});

test('expanding groups cannot reassign the original 56 enquiry briefs or primary services', () => {
  const original = coreAreaGroups.flatMap(group=>group.names).map(name=>suburbs.find(a=>a.name===name));
  assert.equal(original.length,56);
  const fingerprint=createHash('sha256').update(JSON.stringify(original.map(a=>[a.name,a.service,a.en,a.zh]))).digest('hex');
  // Verified against the deployed 4beeef0 baseline, before directory expansion.
  assert.equal(fingerprint,'066c52074b8db673e5c6ee90125e60929bb2f0e62c82b35a6e3b3e8177b71ec8');
  for(const area of original) {
    const page=pages.find(p=>p.path==='/areas/'+area.slug+'/');
    assert.equal(page.title,'Carpentry repairs in '+area.name);
    assert.equal(page.h1,'Carpentry enquiries for '+area.name);
  }
});
