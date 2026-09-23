import { services, popularAreaCandidates } from './content.mjs';
import { suburbs, suburbSlug } from './suburbs.mjs';

const support = [
  ['H00', '/', 'Carpentry Repairs, Replacements & Improvements in Sydney', '悉尼住宅木工维修、更换与改造'],
  ['H01', '/services/', 'Find the right timber repair', '按木构件选择维修'],
  ['H02', '/areas/', 'Sydney service area enquiries', '悉尼服务地区查询'],
  ['H03', '/about/', 'About the carpentry service', '关于木工服务'],
  ['H06', '/faq/', 'Carpentry questions', '木工常见问题'],
  ['H07', '/contact/', 'Send photos & request a quote', '上传照片，咨询维修报价'],
  ['H08', '/privacy/', 'Privacy and enquiry data', '隐私与询价资料'],
];
const tr = (l, en, zh) => l === 'zh' ? zh : en;
function businessContact(l,facts) {
  return '<div class="business-contact">'+(facts.serviceHours?'<span>'+tr(l,'Mon–Sun','周一至周日')+' '+esc(facts.serviceHours)+' '+tr(l,'Sydney time','悉尼时间')+'</span>':'')+(facts.contactName?'<span>'+tr(l,'Contact: ','联系人：')+esc(facts.contactName)+'</span>':'')+(facts.telephone?'<a href="tel:'+esc(facts.telephone)+'" data-event="phone_click">'+esc(facts.telephone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3'))+'</a>':'')+'</div>';
}
const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
const href = (path, l) => l === 'zh' ? (path === '/' ? '/zh/' : '/zh' + path) : path;
const p = value => '<p>' + esc(value) + '</p>';
const section = (id, title, body) => '<section class="content-section" id="' + id + '"><h2>' + esc(title) + '</h2>' + body + '</section>';
const faq = items => '<div class="faq-list">' + items.map(([q, a]) => '<details><summary>' + esc(q) + '</summary>' + p(a) + '</details>').join('') + '</div>';
const servicePath = (s, l) => href('/services/' + s.slug + '/', l);
const shortName = (s, l) => s.id === 'S05' ? tr(l, 'Timber fence maintenance & repairs', '木围栏保养与维修') : s[l].h1.replace(l === 'zh' ? /^悉尼/ : / in Sydney$/, '');
const cta = (l, id = '') => '<a class="button button-primary" href="' + href('/contact/', l) +
  '?service=' + encodeURIComponent(id) + '">' + tr(l, 'Send photos & request a quote', '上传照片，咨询维修报价') + '</a>';
const serviceOrder = ['S05', 'S01', 'S02', 'S06', 'S07', 'S03', 'S04', 'S08', 'S09'];
const serviceImages = {
  S01: ['/assets/real-work/window-multipane.jpg', 'Timber window and sill', '木窗与窗台', 1280, 1707],
  S02: ['/assets/real-work/door-open-leaf.jpg', 'Interior door and frame', '室内门板与门框', 1280, 1707],
  S03: ['/assets/service-imagery/fascia.webp', 'Carpenter checking a timber fascia board', '木工检查屋檐木板', 1536, 1024],
  S04: ['/assets/service-imagery/rotten-timber.webp', 'Weathered timber under inspection', '检查老化木构件', 1536, 1024],
  S05: ['/assets/real-work/fence-timber-work.jpg', 'Timber fence with contrasting boards and lower timber strip', '带不同色泽木板与底部木条的木围栏', 1280, 1707],
  S06: ['/assets/service-imagery/timber-gate.webp', 'Carpenter adjusting a timber side gate', '木工调整庭院木门', 1536, 1024],
  S07: ['/assets/service-imagery/deck.webp', 'Replacing a weathered deck board', '更换老化的露台木板', 1536, 1024],
  S08: ['/assets/real-work/interior-panels-prep.jpg', 'Detached interior panels', '拆下的室内板件', 1280, 1707],
  S09: ['/assets/real-work/cabinet-door-side.jpg', 'Cupboard door and side panel', '柜门与侧板', 1280, 1707],
};
const cards = (l, facts, production) => '<div class="service-grid">' + services
  .filter(s => !production || facts.approvedServices?.includes(s.id))
  .sort((a, b) => serviceOrder.indexOf(a.id) - serviceOrder.indexOf(b.id))
  .map(s => '<a class="service-card" href="' + servicePath(s, l) + '">' + serviceCardPhoto(s.id, l) +
    '<div class="service-card-copy"><span class="service-card-number">' + esc(s.id.slice(1)) + '</span><strong>' +
    esc(shortName(s, l)) + '</strong><span>' + esc(s[l].lead) + '</span><em>' + tr(l, 'Explore this service', '查看这项服务') +
    ' <span aria-hidden="true">↗</span></em></div></a>').join('') +
  '<a class="service-quote-card" href="' + href('/contact/', l) + '"><span class="eyebrow">' + tr(l, 'Not sure which repair?', '不确定属于哪项维修？') +
  '</span><strong>' + tr(l, 'Show us the timber. We’ll help define the job.', '发来木构件照片，一起确定工作范围。') +
  '</strong><span>' + tr(l, 'Send a close-up, a wider view and your suburb.', '提供细节、周边全景及所在地区。') +
  '</span><em>' + tr(l, 'Start an enquiry', '开始询价') + ' <span aria-hidden="true">↗</span></em></a></div>';
function serviceCardPhoto(id, l, priority = false) {
  const photo = serviceImages[id];
  return photo ? '<img class="service-photo" src="' + photo[0] + '" width="' + photo[3] + '" height="' + photo[4] +
    '" loading="' + (priority ? 'eager' : 'lazy') + '" decoding="async" alt="' + esc(tr(l, photo[1], photo[2])) + '">' : '';
}
function serviceMenu(l,facts,production,page) {
  const groups=[['Doors, windows & timber','门窗与木材',['S01','S02','S04','S03']],['Fences, gates & decks','围栏、木闸门与露台',['S05','S06','S07']],['Interior repairs','室内木作维修',['S08','S09']]];
  return '<details class="service-menu"><summary>'+tr(l,'Services','木工服务')+'</summary><div class="service-menu-panel"><a class="all-services" href="'+href('/services/',l)+'">'+tr(l,'All carpentry services','查看全部木工服务')+'</a><div class="service-menu-groups">'+groups.map(([en,zh,ids])=>{
    const available=services.filter(s=>ids.includes(s.id)&&(!production||facts.approvedServices?.includes(s.id)));
    return available.length ? '<div><h2>'+tr(l,en,zh)+'</h2>'+available.map(s=>'<a href="'+servicePath(s,l)+'"'+(page.id===s.id?' aria-current="page"':'')+'>'+esc(shortName(s,l))+'</a>').join('')+'</div>':'';
  }).join('')+'</div></div></details>';
}
const approvedAreaNames = facts => (facts.approvedAreas ?? [])
  .filter(a => a.coverage_status === 'APPROVED' && a.public_copy_approved).map(a => a.name);
const areaCards = (l, groups) => '<div class="area-groups">' + groups.map(group =>
  '<div class="area-card"><h3>' + esc(group[l]) + '</h3><p>' + group.names.map(name => '<a href="'+href('/areas/'+suburbSlug(name)+'/',l)+'">'+esc(name)+'</a>').join(' · ') + '</p></div>'
).join('') + '</div>';

function doorWorkGallery(l) {
  const photos = [
    ['door-wide.jpg', 'Full view of a glazed door and frame during work', '施工现场的玻璃门与门框全景', 'The complete door and surrounding frame', '整扇门及周围门框'],
    ['door-work-area.jpg', 'Door threshold and nearby work area with tools', '门槛及摆放工具的工作区域', 'Threshold and work area', '门槛与工作区域'],
    ['door-jamb-detail.jpg', 'Close view of a door jamb beside a tape measure', '卷尺旁的门框侧边近照', 'Door-jamb detail', '门框侧边细节'],
    ['door-threshold-detail.jpg', 'Lower glazed door and threshold beside a tape measure', '卷尺旁的玻璃门下部与门槛', 'Lower frame and threshold', '门框下部与门槛'],
  ];
  return section('work-photos', tr(l, 'Real work photos: door and frame details', '真实施工照片：门与门框细节'),
    p(tr(l, 'These images show a real work site and measured details. They do not, on their own, establish the final repair scope or outcome.',
      '这些照片记录了真实施工现场和测量细节；仅凭照片不能确定最终维修范围或完成结果。')) +
    '<div class="work-gallery">' + photos.map(([name, enAlt, zhAlt, enCaption, zhCaption]) =>
      '<figure class="work-photo"><img src="/assets/real-work/' + name + '" width="1080" height="1920" loading="lazy" decoding="async" alt="' +
      esc(tr(l, enAlt, zhAlt)) + '"><figcaption>' + esc(tr(l, enCaption, zhCaption)) + '</figcaption></figure>').join('') + '</div>');
}

const casePhotoGroups = {
  S05: {
    title: ['Real case photos: timber fence maintenance', '真实案例照片：木围栏保养与维修'],
    intro: ['These real work photos show fence boards, fixings and the surrounding work area. For a similar enquiry, send a full fence view and close-ups of the affected boards, posts and rails so we can discuss local repairs, maintenance or replacement.', '这些真实施工照片展示围栏木板、固定细节与周边工作区域。如需类似服务，请提供围栏全景，以及受损木板、立柱和横梁近照，方便讨论局部维修、保养或更换。'],
    photos: [
      ['fence-timber-work.jpg','Timber fence with contrasting vertical boards and a lower timber strip','带不同色泽竖板与底部木条的木围栏','Fence and timber details','围栏及木材细节',1280,1707],
      ['fence-fixing-detail.jpg','Nail gun held against timber fence boards during work','施工时钉枪贴近围栏木板','Board fixing during work','木板固定施工细节',1280,1707],
      ['fence-board-detail.jpg','Weathered fence boards and visible screw fixings','风化围栏木板与可见螺丝固定点','Boards and fixings','木板与固定点',960,1280],
      ['fence-work-tools.jpg','Tools, tape measure and loose fixings on gravel at the work area','工作区域碎石地面上的工具、卷尺与零散固定件','Tools at the work area','现场工具记录',1280,1707],
    ],
  },
  S09: {
    title: ['Real case photos: cupboard doors and hardware details', '真实案例照片：柜门与五金细节'],
    intro: [
      'A closer look at cupboard-door edges, closing gaps and panel fixings from our real jobs. For a similar problem, send a full view of the cupboard plus close-ups of the affected edge and hardware. Surface damage, door alignment and loose fixings need separate checks before deciding what can be repaired or replaced.',
      '这些真实案例照片展示柜门边缘、闭合门缝与板件固定细节。如有类似问题，请提供柜体全景，以及受损边缘和五金近照。表面破损、柜门对位及固定件松动须分别检查，再确定适合局部维修还是更换。',
    ],
    photos: [
      ['cabinet-door-taped-edges.jpg', 'White cupboard doors with blue tape beside lifted lower edges', '白色柜门下边缘翘起处旁贴有蓝色胶带', 'Lower door-edge details', '柜门下边缘细节', 1280, 1707],
      ['cabinet-door-edge-close.jpg', 'Close-up of the exposed lower edge of an open cupboard door', '开启柜门下方露出边缘的近照', 'Open door: lower edge', '开启柜门的下边缘', 960, 1280],
      ['cabinet-door-inner-corner.jpg', 'Inside corner of a white cupboard door showing the edge and bumper', '白色柜门内侧角部、边缘与缓冲垫', 'Inner corner and edging', '内侧角部与封边', 1280, 1707],
      ['cabinet-door-gap.jpg', 'Closed white cupboard doors showing the centre gap and lower corners', '闭合的白色柜门、中间门缝与下方角部', 'Closed doors and meeting gap', '柜门闭合与门缝', 1280, 1707],
      ['cabinet-door-side.jpg', 'White cupboard door and side panel above a tiled splashback', '瓷砖墙面上方的白色柜门与侧板', 'Door and side-panel detail', '柜门与侧板细节', 1280, 1707],
      ['cabinet-panel-top-fixing.jpg', 'Metal fixing bracket and screws at the top of a white panel', '白色板件顶部的金属固定件与螺丝', 'Panel-top hardware fixing', '板件顶部五金固定细节', 960, 1280],
    ],
  },
  S01: {
    title: ['Real case photos: timber-window frames', '真实案例照片：木窗框'],
    intro: [
      'These photos show timber-window frames and painted surrounds from real jobs. Repainting timber window frames, local timber repair and glass work are separate decisions: the wood and existing coating need checking, and the agreed finish belongs in the written quote.',
      '这些真实案例照片展示木窗框和已刷漆的周边。窗框刷漆翻新、局部木材维修与玻璃工作应分别界定；先看木材及旧漆状况，再把同意的表面处理写进报价。',
    ],
    photos: [
      ['window-multipane.jpg', 'Multi-pane white timber window and sill', '白色多格木窗及窗台', 'Window, frame and sill', '窗扇、窗框与窗台', 1280, 1707],
      ['window-two-pane.jpg', 'Two-pane window with painted timber surround', '带有刷漆木框的双扇窗', 'Two-pane window surround', '双扇窗框', 1280, 1707],
      ['window-frame-sill.jpg', 'Close view of white window frame and sill', '白色窗框与窗台近照', 'Frame and sill detail', '窗框与窗台细节', 1280, 1707],
      ['window-sliding-frame.jpg', 'Sliding window with visible frame edges', '可见框边的推拉窗', 'Sliding-frame detail', '推拉窗框细节', 1280, 1707],
    ],
  },
  S02: {
    title: ['Real case photos: door panels, frames and latch work', '真实案例照片：门板、门框与锁舌'],
    intro: [
      'The door and frame photos show separate real job stages, not a before-and-after sequence. Door-leaf and frame repainting can be scoped with the timber work. Replacement of a compatible latch or lockset depends on the existing door, frame and hardware; emergency lockouts are not part of this carpentry scope.',
      '这些门板与门框照片记录不同真实施工阶段，并非一组前后对比。门板、门框刷漆翻新可与木作一起界定；更换相容门锁或锁舌须看现有门板、门框和五金，紧急开锁不属于本页木工范围。',
    ],
    photos: [
      ['door-trim.jpg', 'White interior doorway trim', '白色室内门套', 'Doorway trim', '室内门套', 960, 1280],
      ['door-bathroom-leaf.jpg', 'Interior door leaf with an unfilled hardware opening', '留有五金安装孔的室内门板', 'Door leaf and frame', '门板与门框', 1280, 1707],
      ['door-open-leaf.jpg', 'Open white interior door in its frame', '门框内开启的白色室内门', 'Open door and surrounding frame', '开启的门板与周围门框', 1280, 1707],
      ['door-hall-frame.jpg', 'White interior door and hallway frame', '白色室内门与走廊门框', 'Door and hallway frame', '门板与走廊门框', 960, 1280],
      ['door-panel-lock-bore.jpg', 'White door panel with lock hardware opening', '带锁具安装孔的白色门板', 'Door panel before hardware fitting', '五金安装前的门板', 1280, 1707],
      ['door-latch-work.jpg', 'Existing door edge beside latch components', '现有门边与锁舌组件', 'Latch components during work', '施工中的锁舌组件', 1280, 1707],
    ],
  },
  S08: {
    title: ['Real case photos: interior panels during finishing', '真实案例照片：室内板件表面处理'],
    intro: [
      'These detached panels were photographed during surface work. For panel repainting, material, old coating, preparation, colour and refitting should be agreed in the written scope. This is not a whole-home painting offer.',
      '这些拆下的板件记录了表面处理阶段。板件刷漆翻新须把材料、旧漆、打磨准备、颜色与重新安装写进同意的范围；这不等于整屋刷漆服务。',
    ],
    photos: [
      ['interior-panels-prep.jpg', 'Detached white panels arranged on a protective floor sheet', '铺有保护布的地面上摆放白色板件', 'Panels laid out for surface work', '摆放进行表面处理的板件', 1280, 1707],
      ['interior-panels-painted.jpg', 'White detached panels beside an interior opening', '室内开口旁拆下的白色板件', 'Detached interior panels', '拆下的室内板件', 1280, 1707],
    ],
  },
};

function caseGallery(pageId, l) {
  const group = casePhotoGroups[pageId];
  if (!group) return '';
  return section('case-photos', tr(l, ...group.title),
    p(tr(l, ...group.intro)) + '<div class="work-gallery">' + group.photos
      .filter(([name]) => !serviceImages[pageId]?.[0].endsWith('/' + name))
      .map(([name, enAlt, zhAlt, enCaption, zhCaption, width, height]) =>
      '<figure class="work-photo work-photo--three-four"><img src="/assets/real-work/' + name + '" width="' + width + '" height="' + height +
      '" loading="lazy" decoding="async" alt="' + esc(tr(l, enAlt, zhAlt)) + '"><figcaption>' +
      esc(tr(l, enCaption, zhCaption)) + '</figcaption></figure>').join('') + '</div>');
}

function selectedWork(l, facts, production) {
  const items = [
    ['S05', 'fence-timber-work.jpg', 'Timber fence maintenance & repairs', '木围栏保养与维修'],
    ['S01', 'window-multipane.jpg', 'Timber window frames & repainting', '木窗框维修与刷漆翻新'],
    ['S02', 'door-open-leaf.jpg', 'Door panels, frames & hardware', '门板、门框与五金'],
    ['S08', 'interior-panels-prep.jpg', 'Interior panels & finishing', '室内板件与表面翻新'],
    ['S09', 'cabinet-door-side.jpg', 'Cupboard doors & hardware', '柜门与五金维修'],
  ].filter(([id]) => !production || facts.approvedServices?.includes(id));
  if (!items.length) return '';
  return '<section id="selected-work" class="homepage-section selected-work"><div class="section-heading"><div><p class="eyebrow">' +
    tr(l, 'From our real jobs', '我们的真实案例') + '</p><h2>' + tr(l, 'A closer look at the work', '从细节，看实际木作') +
    '</h2></div><p>' + tr(l, 'Window frames, doors, interior panels and cupboard details. See real photos alongside the relevant repair and finishing options.',
      '窗框、门板、室内板件与柜门细节。结合真实照片，了解对应的维修、更换及刷漆翻新范围。') + '</p></div><div class="case-grid">' +
    items.map(([id, name, en, zh]) => '<a class="case-card" href="' + servicePath(services.find(s => s.id === id), l) +
      '#case-photos"><img src="/assets/real-work/' + name + '" width="1280" height="1707" loading="lazy" decoding="async" alt="' +
      esc(tr(l, en, zh)) + '"><div><h3>' + esc(tr(l, en, zh)) + '</h3><span>' + tr(l, 'View photos & service details', '查看照片与服务详情') +
      '</span></div></a>').join('') + '</div></section>';
}

export const pages = [
  ...suburbs.flatMap(area => ['en','zh'].map(locale=>({
    id:'A-'+area.slug,locale,area,path:href('/areas/'+area.slug+'/',locale),
    alternate:href('/areas/'+area.slug+'/',locale==='en'?'zh':'en'),
    title:tr(locale,'Carpentry repairs in '+area.name,area.name+' 木工维修'),
    h1:tr(locale,'Carpentry enquiries for '+area.name,area.name+' 木工维修与保养'),
    content:{lead:tr(locale,area.en,area.zh)}
  }))),
  ...support.flatMap(([id, path, en, zh]) => [
    { id, locale: 'en', path, alternate: href(path, 'zh'), title: en, h1: en },
    { id, locale: 'zh', path: href(path, 'zh'), alternate: path, title: zh, h1: zh },
  ]),
  ...services.flatMap(s => ['en', 'zh'].map(locale => ({
    id: s.id, locale, path: servicePath(s, locale),
    alternate: servicePath(s, locale === 'en' ? 'zh' : 'en'),
    title: s[locale].title, h1: s[locale].h1, content: s[locale], related: s.related,
  }))),
];

export function productionGaps(facts) {
  const gaps = [];
  if (!facts.brand) gaps.push('brand');
  if (!/^https:\/\/[^/]+$/.test(facts.domain ?? '')) gaps.push('domain');
  if (!facts.telephone && !facts.email) gaps.push('telephone-or-email');
  if (!facts.inquiryRecipient) gaps.push('inquiryRecipient');
  if (!facts.approvedServices?.length) gaps.push('approvedServices');
  const areas = facts.approvedAreas?.filter(a => a.coverage_status === 'APPROVED') ?? [];
  if (!areas.length) gaps.push('approvedAreas');
  if (areas.some(a => !a.approved_service_ids?.length || a.approved_service_ids.some(id => !facts.approvedServices?.includes(id)))) gaps.push('areaServiceMatrix');
  if (areas.some(a => !a.public_copy_approved)) gaps.push('areaCopyApproval');
  if (!facts.productionAuthorized) gaps.push('productionAuthorized');
  if (facts.privacyPolicyApproved === false) gaps.push('privacyPolicyApproved');
  return gaps;
}

export function areaDecision(suburb, serviceId, facts) {
  const key = String(suburb ?? '').trim().toLocaleLowerCase('en-AU');
  const area = facts.approvedAreas?.find(a => a.name.toLocaleLowerCase('en-AU') === key);
  if (!area) return { status: 'PENDING', reason: 'Unverified suburb' };
  if (area.coverage_status === 'OUT_OF_SCOPE') return { status: 'OUT_OF_SCOPE' };
  if (area.coverage_status !== 'APPROVED') return { status: 'PENDING' };
  if (!area.public_copy_approved) return { status: 'PENDING', reason: 'Public area copy not approved' };
  if (serviceId && !area.approved_service_ids?.includes(serviceId)) return { status: 'PENDING', reason: 'Service not approved for area' };
  return { status: 'APPROVED', area };
}

function fenceMaintenance(l, facts) {
  const brand = facts.brand || 'Mel One';
  return '<div class="fence-maintenance">' + section('maintenance', tr(l, 'Fence maintenance in Sydney', '悉尼木围栏保养'),
    p(tr(l, `${brand} timber fence maintenance enquiries cover the condition of posts, rails, palings and fixings—not just how a fence looks. Tell us whether you want routine upkeep, help with a new fault or an assessment of an older fence.`,
      `${brand} 木围栏保养询价关注立柱、横梁、木板和固定件的状况，而不只是外观。请说明是日常维护、新出现的故障，还是希望评估旧围栏。`)) +
    '<nav class="fence-task-nav" aria-label="' + tr(l, 'Fence job guide', '围栏工作指引') + '"><a href="#maintenance-checks">' + tr(l, 'What to check', '保养检查') + '</a><a href="#repair-options">' + tr(l, 'Maintain, repair or replace?', '保养、维修还是更换？') + '</a><a href="#maintenance-cost">' + tr(l, 'Plan the quote', '了解报价') + '</a></nav>' +
    '<div id="maintenance-checks" class="fence-checks">' + [
      ['Posts and ground level', 'Note leaning posts, soft-looking bases, soil build-up and persistent damp. Photograph from safe access; do not push or load an unstable fence.', '立柱与地面', '留意立柱倾斜、柱脚疑似腐烂、积土及长期潮湿。从安全位置拍照，不要推压或倚靠不稳的围栏。'],
      ['Rails, palings and fixings', 'Look for loose boards, split rails, gaps and rusty or missing fixings. Show the surrounding sound timber as well as the damaged part so the repair extent can be assessed.', '横梁、木板与固定件', '查看木板松动、横梁开裂、缝隙及固定件锈蚀或缺失。照片同时拍到附近完好的木材，方便判断维修范围。'],
      ['Surface and surrounding growth', 'Show peeling finishes, vegetation touching timber and debris near the base. Cleaning, preparation and any coating need an agreed scope; a fresh finish cannot make decayed timber structurally sound.', '表面与周边植物', '拍下表面涂层剥落、植物贴住木材及柱脚周边杂物的情况。清洁、前处理及涂层须另行明确；刷漆不能恢复腐烂木材的结构强度。']
    ].map(([h,t,zh,zt]) => '<article><h3>'+esc(tr(l,h,zh))+'</h3>'+p(tr(l,t,zt))+'</article>').join('') + '</div>') +
    section('repair-options', tr(l, 'Maintenance, repair or replacement?', '保养、维修还是更换？'),
      p(tr(l, 'Upkeep is appropriate when the underlying timber and supports remain sound. A loose paling, failed fixing or isolated damaged rail may need a local repair. Multiple decayed posts, failing rails or an unstable run need assessment for section replacement rather than repeated cosmetic work.', '木材及支撑仍稳固时，才适合以保养为主。个别木板松动、固定件失效或单根横梁损坏，可评估局部维修。多根柱腐烂、横梁失效或整段不稳，应评估分段更换，不能反复只处理外观。')) +
      p(tr(l, 'After strong winds, heavy rain or a fallen branch, report any new lean or movement. Keep people and pets away from an unstable section. A dragging manual timber gate has its own hinge, latch and post assessment.', '强风、大雨或树枝落下后，如出现新的倾斜或移动，请说明变化。让人和宠物远离不稳部分。手动木闸门刮地则需另看铰链、门闩及门柱。')) +
      '<a class="text-link" href="'+href('/services/timber-gate-repairs/',l)+'">'+tr(l,'Timber gate maintenance and repairs','查看木闸门维护与维修')+'</a>') +
    section('maintenance-cost', tr(l, 'Fence maintenance costs: what to include', '木围栏保养费用：报价需要哪些内容'),
      p(tr(l, 'There is no single maintenance price for every fence. Length and height, access to each side, the number of posts or boards needing work, existing coatings, preparation and waste removal all affect scope. Separate upkeep, timber replacement and any agreed finishing in the quote so you can compare like-for-like work.', '围栏保养不能用一个统一价格套所有现场。长度、高度、两侧通道、需处理的柱或木板数量、旧涂层、前处理及清运都会影响范围。报价应区分保养、木材更换及同意的表面处理，方便比较同等工作。')) +
      p(tr(l, 'Send your suburb, approximate fence length, a full-run photo and close-ups of the affected parts. Mention shared-boundary access and whether you also need the adjoining gate checked. Availability and the work offered at your location are confirmed before booking.', '请提供suburb、大致长度、整段照片及受影响部位近照，并说明共用边界通道、是否还需检查相连木闸门。预约前确认当地可承接范围和时间。')) + cta(l, 'S05')) + '</div>';
}

function suburbBody(page,l,facts,production) {
  const a=page.area;
  const primary=services.find(s=>s.id===a.service);
  const query='?suburb='+encodeURIComponent(a.name);
  const localCta='<a class="button button-primary" href="'+href('/contact/',l)+query+'">'+tr(l,'Ask about work in '+a.name,'咨询 '+a.name+' 的木工工作')+'</a>';
  return '<nav aria-label="'+tr(l,'Breadcrumb','当前位置')+'"><a href="'+href('/areas/',l)+'">'+tr(l,'Service areas','服务地区')+'</a> / '+esc(a.name)+'</nav>'+
    '<div class="page-lead">'+p(tr(l,'Planning timber repairs in '+a.name+'? This '+a.region+' directory entry helps you prepare the job details, find the appropriate service and send a location-specific enquiry.',
      '准备安排 '+a.name+' 的木作维修？本页属于'+a.regionZh+'地区目录，帮助你整理工作情况、找到对应服务，并提交带有所在地区的询价。'))+localCta+'</div>'+
    section('local-enquiry',tr(l,'A useful enquiry example','询价准备示例'),p(tr(l,a.en,a.zh))+
      p(tr(l,'This is a repair scenario to help describe your job, not a claim about typical damage or a completed project in this suburb. Other timber tasks are listed below.',
        '这是帮助描述工作的维修情境，并非声称本区普遍有这种损坏或展示当地已完成工程。其他木作需求也可从下方服务进入。'))+
      '<a class="text-link" href="'+servicePath(primary,l)+'">'+esc(shortName(primary,l))+'</a>')+
    section('choose-service',tr(l,'Choose by the timber that needs work','按需要处理的木构件选择'),cards(l,facts,production))+
    section('visit-details',tr(l,'Preparing access and the quote','整理通道与报价资料'),
      p(tr(l,'Include '+a.name+' in your enquiry, a wide photo, a close-up of each fault and approximate dimensions. Mention any shared access, stairs, parking or property-manager arrangements that apply to your property. You do not need to publish a full street address.',
        '询价请注明 '+a.name+'，提供全景、每类损坏的近照及大致尺寸。如涉及共用通道、楼梯、停车或物业管理安排，请一并说明；不需要公开完整街道地址。'))+
      p(tr(l,'The work, travel and availability are confirmed before booking. Timber repairs, agreed finishing, replacement materials and waste removal should be itemised; a suburb page is not a local office or an attendance-time guarantee.',
        '预约前确认工作范围、出行和时间。木材维修、同意的表面处理、更换材料及清运应分项说明；郊区页面不代表当地设有办公室，也不是到场时间保证。'))+localCta)+
    section('other-locations',tr(l,'Other entries in '+a.region,a.regionZh+'的其他地区'),
      '<div class="related-links">'+a.otherNames.filter(name=>!production || facts.approvedAreas?.some(area=>area.name===name && area.coverage_status==='APPROVED' && area.public_copy_approved && area.area_page_publish_approved)).map(name=>'<a href="'+href('/areas/'+suburbSlug(name)+'/',l)+'">'+esc(name)+'</a>').join('')+'</div>'+p(tr(l,'These entries share a directory group; this is not a claim that every location is adjacent.','以上属同一目录分组，不表示每个地点都互相相邻。')))+
    section('questions',tr(l,'Before sending your enquiry','发送询价前'),faq([
      [tr(l,'Can I ask about fence maintenance here?','这里可以咨询围栏保养吗？'),tr(l,'Yes. Describe posts, rails, boards and fixings, then use the timber fence maintenance page to prepare photos. Confirm the work at your location before booking.','可以。说明立柱、横梁、木板及固定件情况，并按木围栏保养页准备照片；预约前确认当地工作范围。')],
      [tr(l,'Do the project photographs prove a job in '+a.name+'?','网站照片是否代表 '+a.name+' 的工程？'),tr(l,'No location is assigned to a photograph without confirmation. Service-page photographs illustrate the real work supplied by the business, not evidence of a job in every suburb.','未确认的照片不会标上郊区。服务页展示公司提供的真实工作照片，不代表每个郊区都有对应案例。')]
    ]));
}

function serviceBody(page, l, facts, production) {
  const c = page.content;
  const related = services.filter(s => page.related.includes(s.id) && (!production || facts.approvedServices?.includes(s.id)));
  return '<div class="service-intro' + (Number(page.id.slice(1)) % 2 === 0 ? ' service-intro--reverse' : '') + '"><div class="service-intro-copy"><p class="eyebrow">' +
    tr(l, 'What we can look at', '可以检查与处理的项目') + '</p><div class="page-lead">' + p(c.lead) + '</div>' + cta(l, page.id) +
    '</div><figure class="service-intro-image">' + serviceCardPhoto(page.id, l, true) + '</figure></div>' +
    (page.id === 'S05' ? fenceMaintenance(l, facts) : '') + '<div class="split-content"><div>' +
    section('problems', tr(l, 'What the damage may mean', '这些损坏可能意味着什么'), p(c.problem)) +
    section('assessment', tr(l, 'Repair, replace or investigate', '维修、更换或先查原因'), p(c.assessment)) +
    section('scope', tr(l, 'Scope and boundaries', '工作范围与边界'), p(c.boundary)) +
    section('quote', tr(l, 'What shapes a quote', '哪些因素影响报价'), p(c.quote)) +
    '</div><aside class="aside-note"><h2>' + tr(l, 'Useful photos', '哪些照片有帮助') + '</h2>' +
    p(c.photo) + p(tr(l, 'Do not put yourself at risk to take a photo.', '拍照不应让自己处于危险位置。')) + '</aside></div>' +
    (page.id === 'S02' ? doorWorkGallery(l) : '') + caseGallery(page.id, l) +
    section('areas', tr(l, 'Check the location', '确认所在地区'), p(tr(l,
      'Tell us your suburb. Sydney locations, nearby access and the work offered there must be confirmed before an appointment is agreed; a suburb name alone is not a service promise.',
      '询价时请写所在suburb。悉尼不同地区、相邻地区的通道及当地可做的项目，需在安排前逐一确认；地名出现不等于已承诺上门。')) +
      '<a class="text-link" href="' + href('/areas/', l) + '">' + tr(l, 'How area checks work', '查看地区确认方式') + '</a>') +
    section('questions', tr(l, 'Questions about this job', '关于这项维修'), faq(c.faq)) +
    '<div class="related"><h2>' + tr(l, 'Related timber work', '相关木作问题') + '</h2><div class="related-links">' +
    related.map(s => '<a href="' + servicePath(s, l) + '">' + esc(shortName(s, l)) + '</a>').join('') + '</div></div>';
}

function contactForm(l, selected) {
  return '<form id="inquiry" action="/api/inquiry" method="post" enctype="multipart/form-data" novalidate>' +
    '<input type="hidden" name="locale" value="' + l + '"><input type="hidden" name="idempotencyKey" value="">' +
    '<div class="honeypot" aria-hidden="true"><label>Website <input name="website" tabindex="-1" autocomplete="off"></label></div>' +
    '<div class="form-grid"><label>' + tr(l, 'What needs attention?', '需要处理哪一处？') +
    '<select name="serviceId" required><option value="">' + tr(l, 'Choose a timber task', '选择木作项目') + '</option>' +
    services.map(s => '<option value="' + s.id + '"' + (s.id === selected ? ' selected' : '') + '>' + esc(shortName(s, l)) + '</option>').join('') +
    '</select></label><label>' + tr(l, 'Suburb (not a full address)', '所在suburb（无需完整地址）') +
    '<input name="suburb" autocomplete="address-level2" maxlength="100" required></label></div>' +
    '<label>' + tr(l, 'What happened?', '请描述损坏情况') + '<textarea name="description" rows="5" maxlength="3000" required></textarea></label>' +
    '<div class="form-grid"><label>' + tr(l, 'Phone (optional if email supplied)', '电话（如填邮箱可留空）') +
    '<input name="phone" type="tel" autocomplete="tel" maxlength="40"></label><label>' +
    tr(l, 'Email (optional if phone supplied)', '邮箱（如填电话可留空）') +
    '<input name="email" type="email" autocomplete="email" maxlength="254"></label></div>' +
    '<div class="form-grid"><label>' + tr(l, 'Preferred contact time (optional)', '方便联系的时间（可选）') +
    '<input name="contactTime" maxlength="120"></label><label>' + tr(l, 'Reply language', '回复语言') +
    '<select name="replyLanguage"><option value="' + l + '">' + tr(l, 'English', '中文') +
    '</option><option value="' + (l === 'en' ? 'zh' : 'en') + '">' + tr(l, 'Chinese', 'English') + '</option></select></label></div>' +
    '<label class="file-label">' + tr(l, 'Photos (optional)', '照片（可选）') +
    '<input name="photos" type="file" accept="image/jpeg,image/png,image/webp" multiple><small>' +
    tr(l, 'Up to 5 JPEG, PNG or WebP images; 8 MB each, 20 MB total. HEIC is not supported—send text now and ask about another way to share photos.',
      '最多5张JPEG、PNG或WebP；单张8MB、合计20MB。暂不支持HEIC，可先提交文字再询问其他传图方式。') +
    '</small></label><p id="form-error" role="alert" class="form-error" hidden></p><p id="form-result" role="status" hidden></p>' +
    '<button class="button button-primary" type="submit">' + tr(l, 'Send enquiry', '发送询价') + '</button></form>';
}

function supportBody(page, l, facts, selected, production) {
  const approved = approvedAreaNames(facts);
  if (page.id === 'H00') return '<div class="home-hero"><div class="hero-copy"><p class="eyebrow">' +
    tr(l, 'Residential timber work · Sydney', '悉尼住宅木作') + '</p><h1>' + esc(page.h1) + '</h1><p class="hero-intro">' +
    tr(l, 'From worn window frames and sticking doors to damaged fences and decks. Share a few photos and your suburb to discuss repairs, replacement or timber refinishing.',
      '从老旧窗框、开关不顺的木门，到受损围栏与Deck。发来几张照片和所在地区，一起确认维修、更换或木作刷漆翻新的范围。') +
    '</p><div class="hero-actions">' + cta(l) + '<a class="text-link" href="' + href('/services/', l) + '">' +
    tr(l, 'Explore timber work', '查看木作项目') + '</a></div></div><figure class="hero-photo"><img src="/assets/carpentry-work-scene.webp" width="1536" height="1024" alt="' +
    tr(l, 'Carpenter measuring a timber door frame', '木工测量木门框') +
    '" fetchpriority="high"></figure></div><div class="service-highlights"><p><strong>' + tr(l, 'Your photos, a clearer enquiry', '用照片，把问题说清楚') +
    '</strong><span>' + tr(l, 'Upload the affected timber and a wider view.', '上传受损细节及周边全景。') + '</span></p><p><strong>' +
    tr(l, 'English & Chinese', '中英文咨询') + '</strong><span>' + tr(l, 'Read and enquire in your preferred language.', '按习惯的语言查看服务及询价。') +
    '</span></p><p><strong>' + tr(l, 'Scope before a booking', '先确认范围，再安排') + '</strong><span>' +
    tr(l, 'Discuss the timber, finish and suburb together.', '一起确认木作、表面处理与所在地区。') + '</span></p></div><section class="homepage-section"><div class="section-heading"><p class="eyebrow">' +
    tr(l, 'Repairs, replacement & finishing', '维修、更换与表面翻新') + '</p><h2>' + tr(l, 'What needs repairing?', '哪一处木作需要处理？') +
    '</h2></div>' + cards(l, facts, production) + '</section><section class="process-strip"><h2>' + tr(l, 'From problem to scope', '从问题到工作范围') +
    '</h2><div><p>' + tr(l, 'Describe the affected timber and suburb.', '说明损坏木材与suburb。') +
    '</p><p>' + tr(l, 'Share safe photos and access details.', '从安全位置提供照片和通道信息。') +
    '</p><p>' + tr(l, 'Confirm the work, exclusions and written quote.', '再确认工作、排除项与书面报价。') +
    '</p></div></section>' + selectedWork(l, facts, production) + (!production || facts.approvedServices?.includes('S05') ? '<section class="homepage-section fence-feature"><div><p class="eyebrow">'+tr(l,'CARE FOR THE TIMBER YOU HAVE','让现有木围栏继续好用')+'</p><h2>'+tr(l,'Fence maintenance, before small faults become bigger jobs','木围栏保养，先处理小问题')+'</h2><p>'+tr(l,'Loose palings, tired fixings or a leaning post? Compare upkeep, local repair and section replacement before deciding.','木板松动、固定件老化，还是立柱倾斜？先分清保养、局部维修与分段更换，再确定工作范围。')+'</p></div><a class="button button-primary" href="'+href('/services/timber-fence-repairs/',l)+'#maintenance">'+tr(l,'Explore fence maintenance','了解木围栏保养')+'</a></section>' : '') + '<section class="homepage-section area-teaser"><h2>' +
    tr(l, 'Check your area before arranging work', '安排前确认服务地区') + '</h2>' +
    p(production ? tr(l, 'These locations have been approved for the listed work. We still confirm access and scope before a booking.',
      '以下地点已有相应服务批准；预约前仍需确认通道及工作范围。') : tr(l,
      'Well-known Sydney area names are enquiry starting points, not a blanket promise of attendance.',
      '悉尼常见地名可作为询价入口，并非所有地区都已承诺出勤。')) +
    (production ? '<ul class="area-list">' + approved.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>' :
      areaCards(l, popularAreaCandidates.filter(group => ['Sydney CBD & Inner City', 'Inner West', 'Lower North Shore', 'Parramatta & Surrounds'].includes(group.en)))) +
    '<a class="text-link" href="' + href('/areas/', l) + '">' + tr(l, 'Check a suburb', '查看地区查询方式') + '</a></section><section class="quote-band"><div><p class="eyebrow">' +
    tr(l, 'Start with what you can see', '从看得见的问题开始') + '</p><h2>' + tr(l, 'Show us what needs attention.', '把需要处理的地方发给我们。') +
    '</h2><p>' + tr(l, 'A wide photo, a close-up and your suburb help us understand the next step. Not sure which service fits? Describe the problem in your enquiry.',
      '一张全景、一张细节，再加上所在地区，有助于确认下一步。不确定属于哪项服务，也可以直接描述问题。') + '</p></div>' + cta(l) + '</section>';
  if (page.id === 'H01') return '<div class="page-lead">' + p(tr(l,
    'Choose the damaged component. Each page explains likely questions, repair boundaries and useful quote details, so a window problem does not get lost inside a general wood-rot page.',
    '按受损构件选择页面。木窗、门框、Deck等各有自己的故障判断与报价资料，明确部位的问题不必全部塞进泛腐木页面。')) +
    '</div>' + cards(l, facts, production) + section('what-next', tr(l, 'If the part is unclear', '部位还不明确？'), p(tr(l,
      'Start with the rotten-timber page for damage across several components, or send a safe wide view and description.',
      '若多处木构件受损，可先看腐木页，或提供安全拍摄的全景与文字描述，再确认应由哪个服务范围处理。')));
  if (page.id === 'H02') {
    return '<div class="page-lead">' + p(tr(l,
      'Tell us the suburb and the timber problem. We confirm travel, access and which work can be offered there before any booking. A postcode or nearby area is not enough to assume attendance.',
      '请提供suburb及木作问题。预约前需核对能否到达、现场通道以及当地可做的工作；邮编或相邻地名不能直接当作出勤承诺。')) +
      cta(l) + '</div>' + (approved.length ? section('confirmed', tr(l, 'Confirmed service locations', '已确认的服务地区'),
        '<ul class="area-list">' + approved.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>') : '') +
      (production ? '' : section('ask', tr(l, 'Sydney areas to ask us about', '可询问的悉尼地区示例'),
        p(tr(l, 'These are area enquiry examples pending actual service and access confirmation. We do not assume all suburbs in a region are adjacent or automatically available.',
          '以下是地区询问示例，实际服务与通道尚待确认。不会把同一区域所有suburb一律视为相邻或自动可到。')) +
        areaCards(l, popularAreaCandidates))) +
      section('choose-work', tr(l, 'Choose by the timber problem', '按木作问题选择服务'),
        p(tr(l, 'A suburb is only one part of the enquiry. Start with the damaged component so the correct service owner can assess the work.',
          '地区只是询价的一部分。请先按受损构件进入对应服务页，让相关项目负责人判断工作范围。')) + cards(l, facts, production)) +
      section('specific', tr(l, 'Service and suburb must both fit', '服务项目和地区要分别核对'), p(tr(l,
        'Even when a location is confirmed, not every specialist task is necessarily available there. Unknown locations can still be submitted for an answer rather than being automatically rejected.',
        '即使某地获准，也不代表每项专门工作都能在那里做。未知地区仍可询问，不会自动拒绝。')));
  }
  if (page.id === 'H03') return '<div class="page-lead">' + p(tr(l,
    'The work here is organised around residential timber components and clear hand-offs. We identify who is responsible for assessment and any regulated or specialist work before confirming a job.',
    '本网站按住宅木构件组织维修范围，并在确认工作时说清由谁评估、施工，以及哪些专门或受监管事项需要相应人员处理。')) +
    '</div>' + section('approach', tr(l, 'How a job is scoped', '如何界定工作'), p(tr(l,
      'An initial enquiry includes the component, damage, suburb and safe access. Repair, local replacement or a wider assessment then becomes a defined decision. Finishing, disposal and another trade’s work belong in the written scope.',
      '初次询价尽量说明构件、可见损坏、地区和安全通道。之后才能判断维修、局部更换或扩大检查。油漆、清运和其他工种工作应写进书面范围。'))) +
    section('proof', tr(l, 'Evidence before promises', '有依据再作承诺'), p(tr(l,
      'Team identities, licences, completed jobs, warranties and response times need current records before they appear as business claims.',
      '团队身份、资格、已完成项目、保修与响应时间，都需要现行记录支持，才能作为商家承诺展示。')));
  if (page.id === 'H06') return '<div class="page-lead">' + p(tr(l,
    'These are starting points. A photo and location can change the repair method and quote.',
    '以下是判断起点；照片和现场位置可能改变维修方法与报价。')) + '</div>' + faq([
      [tr(l, 'Do you need an exact address to start?', '一开始要提供完整地址吗？'), tr(l,
        'No. A suburb, component and safe photos are enough for an initial enquiry. Access details can be agreed later.',
        '不需要。初次询价说明suburb、构件和安全拍摄的照片即可，详细通道可在后续确认。')],
      [tr(l, 'Can a small rotten section be repaired?', '一小段腐木可以修吗？'), tr(l,
        'Sometimes. Sound surrounding timber and the moisture cause matter; a surface patch is not universal.',
        '有可能，但剩余木材必须稳固，还要了解受潮来源；表面填补并非通用方案。')],
      [tr(l, 'Do you handle glass, roof leaks or electrical work?', '玻璃、屋顶漏水或电气也做吗？'), tr(l,
        'Those are separate specialist scopes. The quote must accurately distinguish timber work and coordination.',
        '这些是不同的专门范围。报价应准确区分木构件与需要其他工种配合的工作。')],
      [tr(l, 'What should photos show?', '照片应拍什么？'), tr(l,
        'A wide view, damage and safe access. Never climb or dismantle an unsafe component for a photo.',
        '拍全景、损坏近照和可进入位置；不要为拍照登高或拆动不稳构件。')]
    ]) + '<p class="below-faq"><a class="text-link" href="' + href('/services/', l) + '">' +
    tr(l, 'Questions specific to each component', '查看各构件专属问题') + '</a></p>';
  if (page.id === 'H07') return '<div class="page-lead">' + p(tr(l,
    'Describe the timber issue and suburb. Photos are optional; do not enter a full street address. At least one working contact method is needed for a reply.',
    '请说明木作问题及suburb。照片可选，无需输入完整街道地址；至少留一种有效联系方式以便回复。')) +
    '</div><div class="contact-layout"><div>' + contactForm(l, selected) +
    '</div><aside class="aside-note"><h2>' + tr(l, 'Before you send', '发送前请留意') + '</h2>' + p(tr(l,
      'Only share images you may provide. Avoid faces, number plates and documents. This preview is for testing; do not submit real customer details until the recipient and privacy terms are approved.',
      '只提交有权提供的照片，避开人脸、车牌和文件。本预览仅供测试；收件端和隐私条款获批前不要提交真实客户资料。')) +
    businessContact(l,facts) +
    (facts.telephone ? '<p><a href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' + esc(facts.telephone) + '</a></p>' : '') +
    (facts.email ? '<p><a href="mailto:' + esc(facts.email) + '" data-event="email_click">' + esc(facts.email) + '</a></p>' : '') +
    '</aside></div><script src="/form.js" defer></script>';
  if (page.id === 'H08') return '<div class="page-lead">' + p(tr(l,
    'An enquiry can contain contact details, a suburb, a description and optional photographs. These are used to assess and respond, not placed in public content or analytics events.',
    '询价可能包含联系方式、suburb、问题描述与可选照片。这些资料用于评估和回复，不会进入公开网页正文或分析事件。')) +
    '</div>' + section('handling', tr(l, 'Handling and access', '处理与访问'), p(tr(l,
      'Photographs are stored privately and internal access must be controlled. The inbox owner, retention period, deletion process and any service providers need approval before this becomes the operating privacy policy.',
      '上传照片应存放在私有空间，内部访问须受控。收件负责人、保存期限、删除流程和任何服务商，都要在本页作为正式隐私政策发布前核实。'))) +
    section('contact-privacy', tr(l, 'Questions about your data', '资料相关问题'), p(tr(l,
      'Use the confirmed contact channel once it appears on the live site.',
      '正式网站显示经确认的联系方式后，请通过该渠道提出资料问题。')));
  return '';
}

function structuredData(page, facts, base) {
  if (!base || !facts.brand) return '';
  const provider = base + '/#organization';
  const graph = [
    { '@type': 'Organization', '@id': provider, name: facts.brand, url: base + '/' },
    { '@type': 'WebSite', '@id': base + '/#website', url: base + '/', name: facts.brand, publisher: { '@id': provider } },
  ];
  if (page.id.startsWith('S') && facts.approvedServices?.includes(page.id)) graph.push({
    '@type': 'Service', '@id': base + page.path + '#service', name: page.h1, url: base + page.path,
    provider: { '@id': provider }, areaServed: (facts.approvedAreas ?? [])
      .filter(a => a.coverage_status === 'APPROVED' && a.public_copy_approved && a.approved_service_ids?.includes(page.id))
      .map(a => ({ '@type': 'Place', name: a.name })),
  });
  if (page.id !== 'H00') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: page.locale === 'zh' ? '首页' : 'Home', item: base + href('/', page.locale) },
    { '@type': 'ListItem', position: 2, name: page.h1, item: base + page.path },
  ] });
  return '<script type="application/ld+json">' +
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') + '</script>';
}

export function renderPage(inputPath, facts, { production = false } = {}) {
  const url = new URL(inputPath, 'https://local.invalid');
  const page = pages.find(item => item.path === url.pathname);
  if (!page || (production && page.area && !facts.approvedAreas?.some(a=>a.name===page.area.name && a.coverage_status==='APPROVED' && a.public_copy_approved && a.area_page_publish_approved)) || (production && page.id.startsWith('S') && !facts.approvedServices?.includes(page.id)))
    return { status: 404, html: '<!doctype html><title>Not found</title><h1>Page not found</h1>' };
  const l = page.locale;
  const base = production && facts.domain && productionGaps(facts).length === 0 ? facts.domain : null;
  const canonical = base ? '<link rel="canonical" href="' + esc(base + page.path) + '">' +
    '<link rel="alternate" hreflang="en-AU" href="' + esc(base + (l === 'en' ? page.path : page.alternate)) + '">' +
    '<link rel="alternate" hreflang="zh-Hans" href="' + esc(base + (l === 'zh' ? page.path : page.alternate)) + '">' : '';
  const description = page.content?.lead ?? tr(l,
    'Find the right residential timber repair, understand the scope and send a clear Sydney carpentry enquiry.',
    '了解住宅木作的损坏与工作范围，并按构件和地区发起悉尼木工询价。');
  const selected = url.searchParams.get('service') ?? '';
  const body = page.area ? suburbBody(page,l,facts,production) : page.id.startsWith('S') ? serviceBody(page, l, facts, production) : supportBody(page, l, facts, selected, production);
  const main = page.id === 'H00' ? body : '<div class="page-header"><p class="eyebrow">' +
    tr(l, 'Residential timber work', '住宅木作') + '</p><h1>' + esc(page.h1) + '</h1></div>' + body;
  const nav = [
    ['/', 'Home', '首页'], ['/services/', 'Services', '木工服务'], ['/#selected-work', 'Our work', '真实案例'], ['/areas/', 'Service areas', '服务地区'],
    ['/about/', 'About', '关于我们'], ['/faq/', 'FAQ', '常见问题'], ['/contact/', 'Photo quote', '传照片询价'],
  ];
  const links = nav.map(([path, en, zh]) => path === '/services/' ? serviceMenu(l,facts,production,page) : '<a' + (path === '/contact/' ? ' class="nav-contact"' : '') + ' href="' + href(path, l) + '"' +
    (href(path, l) === page.path ? ' aria-current="page"' : '') + '>' + tr(l, en, zh) + '</a>').join('');
  const brand = esc(facts.brand || 'Mel One');
  const html = '<!doctype html><html lang="' + (l === 'zh' ? 'zh-Hans' : 'en-AU') +
    '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<title>' + esc(page.title) + ' | ' + brand + '</title><meta name="description" content="' +
    esc(description) + '">' + (base ? '' : '<meta name="robots" content="noindex,nofollow">') + canonical +
    '<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/site.css">' +
    structuredData(page, facts, base) + '</head><body><a class="skip-link" href="#main">' +
    tr(l, 'Skip to content', '跳至正文') + '</a>' +
    (base ? '' : '<div class="preview-bar">' + tr(l,
      'Protected content preview · business facts and area coverage awaiting confirmation',
      '受保护内容预览 · 业务资料与服务地区尚待核实') + '</div>') +
    '<header class="site-header">' + businessContact(l,facts) + '<div class="header-inner"><a class="brand" href="' + href('/', l) +
    '" aria-label="' + brand + ' ' + tr(l, 'home', '首页') + '"><img class="brand-logo" src="/assets/mel-one-logo.jpg" width="940" height="940" alt="Mel One"><span>' +
    brand + '<small>' + tr(l, 'Residential carpentry', '住宅木工') + '</small></span></a>' +
    '<button id="menu-toggle" class="menu-toggle" aria-controls="primary-nav" aria-expanded="false" type="button">' +
    tr(l, 'Menu', '菜单') + '</button><nav id="primary-nav" aria-label="' + tr(l, 'Primary', '主导航') + '">' +
    links + '</nav><a class="language" lang="' + (l === 'en' ? 'zh-Hans' : 'en-AU') +
    '" hreflang="' + (l === 'en' ? 'zh-Hans' : 'en-AU') + '" href="' + page.alternate + '">' +
    (l === 'en' ? '中文' : 'English') + '</a></div></header>' +
    '<main id="main" class="' + (page.id === 'H00' ? 'home-main' : 'page-main') + '">' + main + '</main>' +
    '<footer class="site-footer"><div><img class="footer-logo" src="/assets/mel-one-logo.jpg" width="940" height="940" alt="Mel One"><p class="footer-brand">' + brand + '</p>' + businessContact(l,facts) + '<p>' +
    tr(l, 'Timber work enquiries for Sydney homes. Confirm scope and suburb before booking.',
      '悉尼住宅木作询价；预约前确认工作范围与地区。') +
    '</p></div><div><a href="' + href('/privacy/', l) + '">' + tr(l, 'Privacy', '隐私政策') +
    '</a><a href="' + href('/contact/', l) + '">' + tr(l, 'Contact', '联系') + '</a>' +
    (facts.telephone ? '<a href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' + esc(facts.telephone) + '</a>' : '') +
    (facts.email ? '<a href="mailto:' + esc(facts.email) + '" data-event="email_click">' + esc(facts.email) + '</a>' : '') +
    '</div></footer><script src="/site.js" defer></script></body></html>';
  return { status: 200, html, page };
}
