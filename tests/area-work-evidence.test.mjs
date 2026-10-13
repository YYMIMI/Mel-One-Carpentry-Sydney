import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage } from '../src/site.mjs';

// The break this catches: global service ordering sends a focused enquiry to
// another trade task's gallery despite an existing gallery for its own task.
const matching = [
  ['sydney-cbd', 'interior-carpentry'],
  ['haymarket', 'interior-carpentry'],
  ['ultimo', 'interior-carpentry'],
  ['zetland', 'interior-carpentry'],
  ['burwood', 'cabinet-door-drawer-repairs'],
  ['rhodes', 'cabinet-door-drawer-repairs'],
  ['campsie', 'cabinet-door-drawer-repairs'],
  ['appin', 'timber-sleeper-installation'],
  ['marsfield', 'under-house-timber-screening'],
  ['mount-ousley', 'under-house-timber-screening'],
];
function proof(path, facts = {}, options = {}) {
  const result = renderPage(path, facts, options);
  assert.equal(result.status, 200, path);
  const section = result.html.match(/<section[^>]*id="area-job-planning"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(section, path + ' has planning support');
  const link = section.match(/<a[^>]*href="([^"]+#case-photos)"[^>]*>([\s\S]*?)<\/a>/);
  assert.ok(link, path + ' has a work-evidence link');
  return { href: link[1], label: link[2] };
}
for (const prefix of ['', '/zh']) {
  test('area proof opens the existing gallery for its focused repair in ' + (prefix || 'English'), () => {
    for (const [area, service] of matching) {
      const link = proof(prefix + '/areas/' + area + '/');
      assert.equal(link.href, prefix + '/services/' + service + '/#case-photos', area);
    }
  });
  test('gate and deck enquiries name the actual related gallery instead of implying matching case evidence in ' + (prefix || 'English'), () => {
    for (const [area, service, topic] of [
      ['killarney-vale', 'timber-door-frame-repairs', prefix ? '门' : 'Door'],
      ['the-entrance', 'timber-door-frame-repairs', prefix ? '门' : 'Door'],
      ['fairy-meadow', 'timber-sleeper-installation', 'Sleeper'],
      ['shellharbour', 'timber-sleeper-installation', 'Sleeper'],
    ]) {
      const link = proof(prefix + '/areas/' + area + '/');
      assert.equal(link.href, prefix + '/services/' + service + '/#case-photos', area);
      assert.ok(link.label.includes(topic), area + ' identifies the gallery topic');
      assert.doesNotMatch(link.label, /this type of job|这类木作/);
      assert.match(link.label, prefix ? /相关/ : /related/);
    }
  });
  test('production proof cannot link an unapproved focused service in ' + (prefix || 'English'), () => {
    const facts = {
      approvedServices: ['S02'],
      approvedAreas: [{name:'Haymarket', coverage_status:'APPROVED', public_copy_approved:true, area_page_publish_approved:true, approved_service_ids:['S02']}],
    };
    const link = proof(prefix + '/areas/haymarket/', facts, {production:true});
    assert.equal(link.href, prefix + '/services/timber-door-frame-repairs/#case-photos');
    assert.match(link.label, prefix ? /相关.*门/ : /related.*Door/);
  });
}
