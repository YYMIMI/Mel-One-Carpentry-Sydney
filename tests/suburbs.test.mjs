import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pages,renderPage} from '../src/site.mjs';
import {popularAreaCandidates} from '../src/content.mjs';
import {suburbOptions} from '../src/suburb-options.mjs';
test('every displayed suburb has an independent bilingual route, directory link and enquiry',()=>{
 for(const group of popularAreaCandidates) for(const name of group.names) for(const prefix of ['', '/zh']) {
  const path=prefix+'/areas/'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/';
  const result=renderPage(path,{});
  assert.equal(result.status,200,path);
  assert.ok(renderPage(prefix+'/areas/',{}).html.includes('href="'+path+'"'));
  assert.ok(result.html.includes('suburb='+encodeURIComponent(name)));
  assert.ok(result.html.includes('id="local-enquiry"'));
 }
 assert.equal(pages.filter(p=>p.id.startsWith('A-')).length,152);
});
test('unknown suburb remains a real 404, unapproved suburbs cannot be published',()=>{
 assert.equal(renderPage('/areas/imaginary-place/',{}).status,404);
 assert.equal(renderPage('/areas/chatswood/',{},{production:true}).status,404);
});

test('area pages retain the original nine illustrated service choices and add useful local decisions',()=>{
 for (const prefix of ['', '/zh']) for (const name of ['Chatswood','Bankstown','Surry Hills','Caringbah']) {
  const path=prefix+'/areas/'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/';
  const html=renderPage(path,{},{}).html;
  assert.equal((html.match(/class="service-card"/g)||[]).length,11,path);
  assert.ok(html.includes('id="local-enquiry"'),path);
  assert.ok(html.includes('id="choose-service"'),path);
  assert.ok(html.includes('id="visit-details"'),path);
  assert.ok(html.includes('id="other-locations"'),path);
  assert.ok(html.includes('id="questions"'),path);
  assert.ok(html.includes('id="quote-decisions"'),path);
  assert.ok(html.includes('id="repair-options"'),path);
  assert.ok(html.includes('id="suburb-rfq"'),path);
 }
});

test('area directory avoids internal approval language in customer copy',()=>{
 for (const path of ['/areas/','/zh/areas/']) {
  const html=renderPage(path,{}).html;
  assert.doesNotMatch(html,/Service and suburb must both fit|服务项目和地区要分别核对|未知地点仍可以提交|不会自动拒绝|automatically rejected/);
 }
});

test('every area page includes eleven illustrated services and a distinct bilingual comparison',()=>{
 const names=popularAreaCandidates.flatMap(group=>group.names);
 assert.equal(names.length,76);
 assert.equal(Object.keys(suburbOptions).length,76);
 assert.equal(new Set(Object.values(suburbOptions).map(item=>item.en)).size,76);
 assert.equal(new Set(Object.values(suburbOptions).map(item=>item.zh)).size,76);
 for(const name of names) for(const prefix of ['', '/zh']) {
  const path=prefix+'/areas/'+name.toLowerCase().replace(/[^a-z0-9]+/g,'-')+'/';
  const html=renderPage(path,{}).html;
  assert.equal((html.match(/class="service-card"/g)||[]).length,11,path);
  assert.ok(html.indexOf('id="local-enquiry"')<html.indexOf('id="choose-service"'),path);
  assert.ok(html.indexOf('id="choose-service"')<html.indexOf('id="visit-details"'),path);
  assert.ok(html.indexOf('id="visit-details"')<html.indexOf('id="other-locations"'),path);
  assert.ok(html.indexOf('id="other-locations"')<html.indexOf('id="questions"'),path);
  const option=suburbOptions[name.toLowerCase().replace(/[^a-z0-9]+/g,'-')];
  assert.ok(html.includes(option[prefix?'zh':'en']),path);
  assert.doesNotMatch(html,/并非声称本区普遍|不代表当地设有办公室|not a claim about typical damage|not a local office or an attendance-time guarantee/,path);
 }
});

test('mixed area imagery gives visitors a route to supplied work photos without claiming the service scenes are completed jobs',()=>{
 for(const page of pages.filter(item=>item.area)) {
  const html=renderPage(page.path,{}).html;
  const questions=html.match(/<section\b[^>]*id="questions"[\s\S]*?<\/section>/)?.[0];
  assert.ok(questions,page.path);
  const gallery=page.locale==='zh'?'/zh/#selected-work':'/#selected-work';
  assert.ok(questions.includes('href="'+gallery+'"'),page.path+' should offer the real-work gallery');
  assert.doesNotMatch(questions,/They show Mel One timber work|这些照片展示 Mel One 的木工工作/,page.path+' should not assign all mixed imagery to Mel One jobs');
  const work=renderPage(page.locale==='zh'?'/zh/':'/',{}).html.match(/<section\b[^>]*id="selected-work"[\s\S]*?<\/section>/)?.[0];
  assert.ok(work?.includes('/assets/real-work/'),page.path+' should point to supplied field photographs');
  assert.doesNotMatch(work,/\/assets\/service-imagery\//,page.path+' real-work gallery should not contain service scenes');
 }
});
