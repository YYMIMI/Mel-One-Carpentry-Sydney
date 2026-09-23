import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pages,renderPage} from '../src/site.mjs';
import {popularAreaCandidates} from '../src/content.mjs';
test('every displayed suburb has an independent bilingual route, directory link and enquiry',()=>{
 for(const group of popularAreaCandidates) for(const name of group.names) for(const prefix of ['', '/zh']) {
  const path=prefix+'/areas/'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/';
  const result=renderPage(path,{});
  assert.equal(result.status,200,path);
  assert.ok(renderPage(prefix+'/areas/',{}).html.includes('href="'+path+'"'));
  assert.ok(result.html.includes('suburb='+encodeURIComponent(name)));
  assert.ok(result.html.includes('id="local-enquiry"'));
 }
 assert.equal(pages.filter(p=>p.id.startsWith('A-')).length,112);
});
test('unknown suburb remains a real 404, unapproved suburbs cannot be published',()=>{
 assert.equal(renderPage('/areas/imaginary-place/',{}).status,404);
 assert.equal(renderPage('/areas/chatswood/',{},{production:true}).status,404);
});
