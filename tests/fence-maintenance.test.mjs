import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, pages } from '../src/site.mjs';
test('fence maintenance has bilingual answers, brand context and one existing Owner', () => {
  for (const prefix of ['', '/zh']) {
    const html = renderPage(prefix + '/services/timber-fence-repairs/', {brand:'Mel One'}).html;
    for (const id of ['maintenance','repair-options','maintenance-cost','quote']) assert.ok(html.includes('id="'+id+'"'), id);
    assert.match(html, /Mel One/);
    assert.match(html, /contact\/\?service=S05/);
    assert.match(html, prefix ? /木围栏保养/ : /Fence maintenance/i);
    assert.ok(renderPage(prefix+'/', {}).html.includes('/services/timber-fence-repairs/#maintenance'));
  }
  assert.equal(pages.filter(p=>p.id==='S05').length, 2);
});
