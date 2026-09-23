import { services, popularAreaCandidates } from './content.mjs';
import { suburbs, suburbSlug } from './suburbs.mjs';
import { rfqForm, suburbScope, suburbMap, suburbOptionsSection } from './rfq.mjs';

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
const customerConcerns = l => [
  [tr(l, 'What will the quote include?', '报价包含哪些工作？'), tr(l,
    'Ask for the timber work, materials, access, finishing and any removal to be identified separately. A photograph helps start the conversation, but concealed damage or site access can change the scope.',
    '请分别确认木作、材料、通道、表面收尾及拆旧清运。照片可帮助初步沟通，但隐蔽损坏与现场通道可能改变工作范围。')],
  [tr(l, 'Can we repair only the damaged part?', '能只修坏掉的部分吗？'), tr(l,
    'Sometimes. The adjoining timber, fixings and cause of moisture or movement need checking first. A local repair should not hide an unstable support or an unresolved leak.',
    '有时可以，但先要看相邻木材、固定处，以及受潮或移动的原因。局部维修不应掩盖不稳的支撑或仍在漏水的位置。')],
  [tr(l, 'What if hidden damage appears?', '拆开后发现更多损坏怎么办？'), tr(l,
    'Stop and explain the newly visible condition before extra work. Agree the changed method, materials and cost in writing rather than treating an initial photo estimate as an unlimited approval.',
    '增加工作前应先说明新发现的情况，再以书面确认变更后的方法、材料与费用；初步照片估算不等于无限追加工作的同意。')],
  [tr(l, 'How will the work affect the home?', '施工会怎样影响家里？'), tr(l,
    'Ask which areas need access, whether a door or window will be temporarily out of use, and what preparation, making good and waste removal are included. The answer depends on the agreed job.',
    '可先确认需要进入哪些位置、门窗会否暂时不能使用，以及保护、收尾和清运包含什么；具体安排取决于同意的工作范围。')],
];
function concernsSection(l) {
  return '<section class="homepage-section concern-section" id="customer-concerns"><div class="section-heading"><div><p class="eyebrow">' +
    tr(l, 'Before you book', '预约前先说清楚') + '</p><h2>' + tr(l, 'The questions behind a repair enquiry', '客户真正担心的，不只是木头坏了') +
    '</h2></div><p>' + tr(l, 'No single photo can settle every repair. These are the decisions worth making clear before work begins.', '一张照片不能决定所有维修；开始前，值得把这些判断说明白。') +
    '</p></div><div class="concern-grid">' + customerConcerns(l).map(([question, answer], index) =>
    '<article><span class="concern-number">0' + (index + 1) + '</span><h3>' + esc(question) + '</h3>' + p(answer) + '</article>').join('') +
    '</div><div class="concern-actions"><a class="text-link" href="' + href('/faq/',l) + '">' + tr(l, 'Read more practical answers', '查看更多实际问题') +
    '</a><a class="button button-primary" href="' + href('/contact/',l) + '">' + tr(l, 'Describe your job', '说明你的维修情况') + '</a></div></section>';
}
function homeInquirySection(l, facts) {
  return '<section class="homepage-section home-inquiry"><div class="home-inquiry-copy"><p class="eyebrow">' + tr(l, 'Ready to take the next step?', '想好下一步怎么处理了吗？') + '</p><h2>' + tr(l, 'Tell us what is wrong with the timber.', '告诉我们木作哪里出了问题。') + '</h2><p>' + tr(l, 'Choose the closest service, describe what has changed and tell us your suburb. A close-up and a wider photo help us understand the job; photos are optional.', '选择最接近的服务，说明哪里出了问题及所在地区。局部和全景照片有助于了解情况；照片不是必填。') + '</p><p class="home-inquiry-note">' + tr(l, 'We will discuss the work and what a quote needs to cover before arranging a visit.', '安排上门前，先沟通需要处理的工作及报价应包含的项目。') + '</p></div>' + contactForm(l, '', facts) + '</section><script src="/form.js" defer></script>';
}
const servicePath = (s, l) => href('/services/' + s.slug + '/', l);
const officeAddress = (l, facts) => facts.officeAddress ? '<p class="office-address"><strong>' + tr(l, 'Sydney office', '悉尼办公室') + '</strong><br><span>' + esc(facts.officeAddress) + '</span></p>' : '';
const shortName = (s, l) => s.id === 'S05' ? tr(l, 'Timber fence maintenance & repairs', '木围栏保养与维修') : s[l].h1.replace(l === 'zh' ? /^悉尼/ : / in Sydney$/, '');
const cta = (l, id = '') => '<a class="button button-primary" href="' + href('/contact/', l) +
  '?service=' + encodeURIComponent(id) + '">' + tr(l, 'Send photos & request a quote', '上传照片，咨询维修报价') + '</a>';
const mapsUrl = facts => 'https://www.google.com/maps?q=' + encodeURIComponent(facts.officeAddress) + '&output=embed';
const mapsLink = facts => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(facts.officeAddress);
function officeMap(l, facts) {
  if (!facts.officeAddress) return '';
  return '<section class="office-map" id="office-location"><div class="office-map-copy"><p class="eyebrow">' +
    tr(l, 'Sydney CBD office', '悉尼 CBD 办公地址') + '</p><h2>' + tr(l, 'Find the office address', '查看悉尼办公室位置') +
    '</h2>' + officeAddress(l, facts) + p(tr(l,
      'This is our office address, not a promise of walk-in appointments or a separate office in each service suburb. Timber work is arranged after the location and scope are confirmed.',
      '这里是办公室地址，不代表无需预约可到访，也不代表每个服务地区都有办公室。木作安排须先确认地点与工作范围。')) +
    '<a class="text-link" href="' + esc(mapsLink(facts)) + '" target="_blank" rel="noopener noreferrer">' +
    tr(l, 'Open the office location in Google Maps', '在谷歌地图打开办公室位置') + '</a></div><div class="office-map-frame">' +
    '<iframe title="' + tr(l, 'Map of the Sydney CBD office', '悉尼 CBD 办公室地图') + '" src="' +
    esc(mapsUrl(facts)) + '" width="600" height="400" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div></section>';
}
function repairDecisions(l) {
  const choices = [
    ['A door or window no longer closes well', 'Check the frame, hinges and signs of moisture before assuming the whole unit needs replacing.', '门窗关不顺', '先看门窗框、铰链及受潮迹象，不要直接假定要整套更换。', '/services/timber-door-frame-repairs/'],
    ['Outdoor timber feels loose or soft', 'A fence, gate or deck needs its fixings and supporting timber checked before a cosmetic finish is discussed.', '户外木构件松动或发软', '围栏、木闸门或 Deck 应先看固定件和支撑木材，再讨论外观收尾。', '/services/timber-fence-repairs/'],
    ['You are unsure whether to repair or replace', 'Show the whole component and the damaged area. The sound timber around it determines whether a local repair is sensible.', '不确定该修还是换', '拍下整个构件及损坏局部；周围木材是否稳固，才影响局部维修是否合适。', '/services/rotten-timber-repairs/'],
  ];
  return '<section class="homepage-section repair-decisions" id="repair-decisions"><div class="section-heading"><div><p class="eyebrow">' +
    tr(l, 'Start with the symptom', '先从眼前的问题开始') + '</p><h2>' + tr(l, 'What does the damage mean for your next step?', '不同损坏，下一步也不同') +
    '</h2></div><p>' + tr(l, 'These are starting points, not a diagnosis from a photograph. Choose the closest situation to see what should be checked.',
      '以下是判断起点，不是凭照片作诊断。选择最接近的情况，看看应先确认什么。') + '</p></div><div class="decision-grid">' +
    choices.map(([en, detail, zh, zhDetail, path], index) => '<article><h3>' + tr(l, en, zh) + '</h3>' + p(tr(l, detail, zhDetail)) +
      '<a class="text-link" href="' + href(path, l) + '">' + tr(l, 'See the relevant service', '查看对应服务') + '</a>' +
      (index === 0 ? '<a class="text-link" href="' + href('/services/timber-window-repairs/', l) + '">' +
        tr(l, 'For timber windows', '木窗相关维修') + '</a>' : '') + '</article>').join('') +
    '</div></section>';
}
function conversionRail(l, facts) {
  const call = facts.telephone ? '<a class="button button-call" href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' +
    tr(l, 'Call ', '致电 ') + esc(facts.telephone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3')) + '</a>' : '';
  return '<aside class="site-conversion" aria-label="' + tr(l, 'Get a repair quote', '咨询木作维修') + '"><div><p class="eyebrow">' +
    tr(l, 'Ready to explain the job?', '准备说明维修问题？') + '</p><h2>' + tr(l, 'Tell us what needs attention.', '告诉我们哪一处需要处理。') +
    '</h2><p>' + tr(l, 'Share the timber problem and suburb. Photos help, but are optional.', '说明木构件问题和所在地区；照片有帮助，但不是必填。') +
    '</p></div><div class="site-conversion-actions">' + call + cta(l) + '</div></aside>' +
    '<div class="mobile-contact-dock" aria-label="' + tr(l, 'Quick contact', '快捷联系') + '">' + call +
    '<a class="button button-primary" href="' + href('/contact/', l) + '">' + tr(l, 'Photo quote', '照片询价') + '</a></div>';
}
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
  return '<details class="service-menu"><summary>'+tr(l,'Services','木工服务')+'</summary><div class="service-menu-panel"><a class="all-services" href="'+href('/services/',l)+'">'+tr(l,'All carpentry services','查看全部木工服务')+'</a><div class="service-menu-groups">'+groups.map(([en,zh,ids],index)=>{
    const available=services.filter(s=>ids.includes(s.id)&&(!production||facts.approvedServices?.includes(s.id)));
    return available.length ? '<div class="service-menu-group service-menu-group--'+['timber','outdoor','interior'][index]+'"><h2>'+tr(l,en,zh)+'</h2>'+available.map(s=>'<a href="'+servicePath(s,l)+'"'+(page.id===s.id?' aria-current="page"':'')+'>'+esc(shortName(s,l))+'</a>').join('')+'</div>':'';
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
      '窗框、门板、室内板件与柜门细节。结合真实照片，了解对应的维修、更换及刷漆翻新范围。') + '</p></div><div class="case-scroll"><button class="case-scroll-control" type="button" data-direction="previous" aria-label="' + tr(l, 'Previous work photos', '向前查看案例照片') + '">←</button><button class="case-scroll-control" type="button" data-direction="next" aria-label="' + tr(l, 'Next work photos', '向后查看案例照片') + '">→</button></div><div class="case-grid" tabindex="0" aria-label="' + tr(l, 'Real work photo gallery', '真实施工照片列表') + '">' +
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
  if (areas.length !== suburbs.length || suburbs.some(suburb => !areas.some(area => area.name === suburb.name && area.public_copy_approved))) gaps.push('areaBatchIncomplete');
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
    '<div class="page-lead">'+p(tr(l,'Need timber repairs in '+a.name+'? Start with the affected part, see which service fits and tell us what is happening at your property.',
      '在 '+a.name+' 需要木作维修？先看受损部位和对应服务，再告诉我们现场遇到的问题。'))+localCta+'</div>'+
    section('local-enquiry',tr(l,'A useful enquiry example','询价准备示例'),p(tr(l,a.en,a.zh))+
      p(primary[l].assessment)+
      '<a class="text-link" href="'+servicePath(primary,l)+'">'+esc(shortName(primary,l))+'</a>')+
    section('choose-service',tr(l,'Choose by the timber that needs work','按需要处理的木构件选择'),cards(l,facts,production))+
    section('visit-details',tr(l,'Preparing access and the quote','整理通道与报价资料'),
      p(tr(l,'Include '+a.name+' in your enquiry, a wide photo, a close-up of each fault and approximate dimensions. Mention any shared access, stairs, parking or property-manager arrangements that apply to your property. You do not need to publish a full street address.',
        '询价请注明 '+a.name+'，提供全景、每类损坏的近照及大致尺寸。如涉及共用通道、楼梯、停车或物业管理安排，请一并说明；不需要公开完整街道地址。'))+
      p(tr(l,'Mark which timber you want to keep and which parts may need replacement. Ask the quote to separate timber, hardware, finishing and removal of old materials so you can compare the same scope of work.',
        '标出希望保留及可能需要更换的木材。让报价分开写木材、五金、表面收尾和旧料清运，方便按相同工作范围比较方案。'))+localCta)+
    section('other-locations',tr(l,'Other Sydney areas','其他悉尼服务地区'),
      '<div class="related-links">'+a.otherNames.filter(name=>!production || facts.approvedAreas?.some(area=>area.name===name && area.coverage_status==='APPROVED' && area.public_copy_approved && area.area_page_publish_approved)).map(name=>'<a href="'+href('/areas/'+suburbSlug(name)+'/',l)+'">'+esc(name)+'</a>').join('')+'</div>')+
    section('questions',tr(l,'Before sending your enquiry','发送询价前'),faq([
      [tr(l,'Can I ask about fence maintenance here?','这里可以咨询围栏保养吗？'),tr(l,'Yes. Describe posts, rails, boards and fixings, then use the timber fence maintenance page to prepare photos. Confirm the work at your location before booking.','可以。说明立柱、横梁、木板及固定件情况，并按木围栏保养页准备照片；预约前确认当地工作范围。')],
      [tr(l,'Do the project photographs prove a job in '+a.name+'?','网站照片是否代表 '+a.name+' 的工程？'),tr(l,'No location is assigned to a photograph without confirmation. Service-page photographs illustrate the real work supplied by the business, not evidence of a job in every suburb.','未确认的照片不会标上郊区。服务页展示公司提供的真实工作照片，不代表每个郊区都有对应案例。')]
    ])) +
    suburbScope(a,l,primary)+suburbOptionsSection(a,l)+rfqForm(l,facts,a)+suburbMap(a,l);
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

function contactForm(l, selected, facts = {}) {
  if (facts.publicEmailDrafts) return rfqForm(l, facts, null, selected);
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
    '</p><div class="hero-actions"><a class="button button-primary" href="#inquiry">' + tr(l, 'Send a repair enquiry', '发送木作询价') + '</a>' + (facts.telephone ? '<a class="button button-call" href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' + tr(l, 'Call ', '致电 ') + esc(facts.telephone.replace(/(\d{4})(\d{3})(\d{3})/,'$1 $2 $3')) + '</a>' : '') + '<a class="text-link" href="' + href('/services/', l) + '">' +
    tr(l, 'Explore timber work', '查看木作项目') + '</a></div></div><figure class="hero-photo"><img src="/assets/real-work/fence-timber-work.jpg" width="1280" height="1707" alt="' +
    tr(l, 'Timber fence boards and support timber from a supplied work photo', '提供的现场照片：木围栏板与支撑木条') +
    '" fetchpriority="high"></figure></div><div class="service-highlights"><p><strong>' + tr(l, 'See real timber work', '看得见的真实木作') +
    '</strong><span>' + tr(l, 'Explore supplied photos beside the service they relate to.', '施工照片放在对应服务旁，方便了解实际工作细节。') + '</span></p><p><strong>' +
    tr(l, 'English & Chinese', '中英文咨询') + '</strong><span>' + tr(l, 'Read and enquire in your preferred language.', '按习惯的语言查看服务及询价。') +
    '</span></p><p><strong>' + tr(l, 'Scope before a booking', '先确认范围，再安排') + '</strong><span>' +
    tr(l, 'Discuss repair, materials, finishing and quote inclusions.', '把维修、材料、表面收尾及报价内容逐项说清。') + '</span></p></div><section class="homepage-section"><div class="section-heading"><p class="eyebrow">' +
    tr(l, 'Repairs, replacement & finishing', '维修、更换与表面翻新') + '</p><h2>' + tr(l, 'What needs repairing?', '哪一处木作需要处理？') +
    '</h2></div>' + cards(l, facts, production) + '</section><section class="process-strip"><h2>' + tr(l, 'From problem to scope', '从问题到工作范围') +
    '</h2><div><p>' + tr(l, 'Describe the affected timber and suburb.', '说明损坏木材与suburb。') +
    '</p><p>' + tr(l, 'Share safe photos and access details.', '从安全位置提供照片和通道信息。') +
    '</p><p>' + tr(l, 'Confirm the work, exclusions and written quote.', '再确认工作、排除项与书面报价。') +
    '</p></div></section>' + repairDecisions(l) + concernsSection(l) + homeInquirySection(l, facts) + selectedWork(l, facts, production) + (!production || facts.approvedServices?.includes('S05') ? '<section class="homepage-section fence-feature"><div><p class="eyebrow">'+tr(l,'CARE FOR THE TIMBER YOU HAVE','让现有木围栏继续好用')+'</p><h2>'+tr(l,'Fence maintenance, before small faults become bigger jobs','木围栏保养，先处理小问题')+'</h2><p>'+tr(l,'Loose palings, tired fixings or a leaning post? Compare upkeep, local repair and section replacement before deciding.','木板松动、固定件老化，还是立柱倾斜？先分清保养、局部维修与分段更换，再确定工作范围。')+'</p></div><a class="button button-primary" href="'+href('/services/timber-fence-repairs/',l)+'#maintenance">'+tr(l,'Explore fence maintenance','了解木围栏保养')+'</a></section>' : '') + '<section class="homepage-section area-teaser"><h2>' +
    tr(l, 'Check your area before arranging work', '安排前确认服务地区') + '</h2>' +
    p(tr(l, 'Tell us your suburb and what needs repair. We will confirm the work, access and timing with you before booking.',
      '告诉我们所在地区和需要维修的部位；预约前会一起确认工作内容、通道与时间。')) +
    (production ? '<ul class="area-list">' + approved.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>' :
      areaCards(l, popularAreaCandidates.filter(group => ['Sydney CBD & Inner City', 'Inner West', 'Lower North Shore', 'Parramatta & Surrounds'].includes(group.en)))) +
    '<a class="text-link" href="' + href('/areas/', l) + '">' + tr(l, 'Check a suburb', '查看地区查询方式') + '</a></section>' + officeMap(l, facts) + '<section class="quote-band"><div><p class="eyebrow">' +
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
      'Choose your Sydney suburb to see carpentry repair questions, service guides and what helps with a useful quote. Describe the affected timber, photos and access for materials.',
      '选择所在的悉尼地区，查看木作维修问题、相关服务及报价资料。说明受损木材、照片和材料进出的通道，有助于更清楚地讨论工作范围。')) +
      cta(l) + '</div>' + (approved.length ? section('confirmed', tr(l, 'Places we can discuss work', '可咨询木工服务的地区'),
        '<ul class="area-list">' + approved.map(name => '<li>' + esc(name) + '</li>').join('') + '</ul>') : '') +
      (production ? '' : section('ask', tr(l, 'Sydney areas we hear from', '悉尼服务地区'),
        p(tr(l, 'Find your suburb below, then tell us about the timber issue. We confirm the work and access details individually before booking.',
          '在下方找到所在地区，再说明木作问题。预约前会逐项确认工作内容和现场通道。')) +
        areaCards(l, popularAreaCandidates))) +
      section('choose-work', tr(l, 'Choose by the timber problem', '按木作问题选择服务'),
        p(tr(l, 'Your suburb helps us plan the job; the damaged timber tells us which repair to discuss. Choose the affected part below, or send us a photo if you are unsure.',
          '所在地区有助于安排工作；受损木构件决定要讨论哪种维修。可按部位选择下方服务，不确定时也可发照片说明。')) + cards(l, facts, production));
  }
  if (page.id === 'H03') return '<div class="page-lead">' + p(tr(l,
    'The work here is organised around residential timber components and clear hand-offs. We identify who is responsible for assessment and any regulated or specialist work before confirming a job.',
    '本网站按住宅木构件组织维修范围，并在确认工作时说清由谁评估、施工，以及哪些专门或受监管事项需要相应人员处理。')) +
    '</div>' + section('approach', tr(l, 'How a job is scoped', '如何界定工作'), p(tr(l,
      'An initial enquiry includes the component, damage, suburb and safe access. Repair, local replacement or a wider assessment then becomes a defined decision. Finishing, disposal and another trade’s work belong in the written scope.',
      '初次询价尽量说明构件、可见损坏、地区和安全通道。之后才能判断维修、局部更换或扩大检查。油漆、清运和其他工种工作应写进书面范围。'))) +
    section('company', tr(l, 'Company and contact', '公司与联系资料'), p(tr(l,
      'This Sydney carpentry service is operated by Mel One Property Maintenance Pty Ltd, ABN 39 666 325 408 and ACN 666 325 408. Contact Felix2 on 0403 202 949 or handyman.kevinlee@gmail.com. Enquiries are taken Monday to Sunday, 09:00–21:00 Sydney time; the actual job and appointment are confirmed individually.',
      '悉尼木工服务由 Mel One Property Maintenance Pty Ltd 经营，ABN 39 666 325 408，ACN 666 325 408。联系 Felix2：0403 202 949，handyman.kevinlee@gmail.com。询价时间为悉尼时间周一至周日 09:00–21:00；具体工作和预约须分别确认。')) +
      '<p><a class="text-link" href="https://abr.business.gov.au/ABN/View?id=39666325408" target="_blank" rel="noopener noreferrer">' +
      tr(l, 'Check this ABN on the Australian Business Register', '在澳大利亚商业登记册核对该 ABN') + '</a></p>' + officeAddress(l,facts)) +
    section('insurance', tr(l, 'Insurance and work scope', '保险与工作范围'), p(tr(l,
      'The company holds Chubb public and products liability cover. The certificate on file records a limit of AUD 20 million for 13 April 2026 to 13 April 2027. Cover for a particular job remains subject to the policy terms, exclusions and confirmed scope; ask us for current evidence if needed.',
      '公司持有 Chubb 公众及产品责任保险。现有证明文件记录保额为澳币 2,000 万元，有效期为 2026 年 4 月 13 日至 2027 年 4 月 13 日。具体工作是否承保仍以保单条款、除外责任及确定的工作范围为准；如需现行证明可向我们索取。'))) +
    section('proof', tr(l, 'Evidence before promises', '有依据再作承诺'), p(tr(l,
      'The service pages show real work photos and explain what the images can and cannot establish. We do not assign an unverified suburb or finished outcome to a photograph.',
      '服务页展示真实施工照片，也说明照片能证明和不能证明的内容。未经核实，不把照片归属到具体郊区，也不据此宣称完工结果。')) +
      '<p><a class="text-link" href="' + href('/#selected-work',l) + '">' +
      tr(l, 'Browse the real-work photo collection', '查看真实施工照片') + '</a></p>');
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
        '拍全景、损坏近照和可进入位置；不要为拍照登高或拆动不稳构件。')],
      ...customerConcerns(l),
      [tr(l, 'What affects the cost of a timber repair?', '木作维修费用由什么决定？'), tr(l,
        'The damaged component, extent, safe access, material match, hardware, preparation, finishing and disposal all matter. A written quote should identify what is included and what is excluded; we cannot give one reliable price for every property.',
        '受损构件、范围、安全通道、材料与五金匹配、前处理、收尾及清运都会影响费用。书面报价应列明包含和不包含的内容，不能用同一价格套所有房屋。')],
      [tr(l, 'Who supplies materials and handles disposal?', '材料与清运由谁负责？'), tr(l,
        'Confirm timber type, profile, visible finish and any hardware before ordering. Supply, removal of old material and disposal should each appear in the agreed scope; none is automatically included.',
        '订料前先确认木材种类、线条、可见饰面和五金。材料供应、拆旧及清运应逐项写进同意的工作范围，不自动视为包含。')],
      [tr(l, 'When can work be scheduled?', '什么时候可以安排施工？'), tr(l,
        'Send the suburb, affected part and safe photos first. Timing depends on the assessed scope, access, materials and availability; enquiry hours are not a same-day attendance guarantee.',
        '先提供所在地区、受损部位及安全拍摄的照片。安排时间取决于工作范围、通道、材料和可用档期；咨询时间不等于当天到场承诺。')],
      [tr(l, 'How can I check the company and insurance?', '怎样核实公司和保险？'), tr(l,
        'The About page names the operating company, ABN and ACN, and describes the current insurance evidence and its limits. Ask for a current certificate if your job or property manager needs it; cover remains subject to the policy terms and confirmed work.',
        '关于我们页面列出经营公司、ABN、ACN及现有保险证明和适用边界。若工程或物业管理方需要，可索取现行证明；具体承保仍以保单条款与确定的工作范围为准。')]
    ]) + '<p class="below-faq"><a class="text-link" href="' + href('/services/', l) + '">' +
    tr(l, 'Questions specific to each component', '查看各构件专属问题') + '</a> · <a class="text-link" href="' + href('/about/', l) + '">' +
    tr(l, 'Company and insurance', '公司与保险') + '</a> · <a class="text-link" href="' + href('/services/timber-fence-repairs/', l) + '">' +
    tr(l, 'Fence maintenance questions', '木围栏保养问题') + '</a> · <a class="text-link" href="' + href('/contact/', l) + '">' +
    tr(l, 'Ask about your job', '咨询你的项目') + '</a></p>';
  if (page.id === 'H07') return '<div class="page-lead">' + p(tr(l,
    'Describe the timber issue and suburb. Photos are optional; do not enter a full street address. At least one working contact method is needed for a reply.',
    '请说明木作问题及suburb。照片可选，无需输入完整街道地址；至少留一种有效联系方式以便回复。')) +
    '</div><div class="contact-layout"><div>' + contactForm(l, selected, facts) +
    '</div><aside class="aside-note"><h2>' + tr(l, 'Before you send', '发送前请留意') + '</h2>' + p(tr(l,
      'Only share images you may provide. Avoid faces, number plates and documents. Review and send your draft through your email app, or call us to discuss the work.',
      '只分享有权提供的照片，避开人脸、车牌和文件。请在电邮软件中核对并发送草稿，也可致电讨论工作。')) +
    businessContact(l,facts) +
    (facts.telephone ? '<p><a href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' + esc(facts.telephone) + '</a></p>' : '') +
    (facts.email ? '<p><a href="mailto:' + esc(facts.email) + '" data-event="email_click">' + esc(facts.email) + '</a></p>' : '') + officeAddress(l,facts) +
    '</aside></div>' + officeMap(l, facts) + '<script src="/form.js" defer></script>';
  if (page.id === 'H08') return '<div class="page-lead">' + p(tr(l,
    'An enquiry can contain contact details, a suburb, a description and optional photographs. These are used to assess and respond, not placed in public content or analytics events.',
    '询价可能包含联系方式、suburb、问题描述与可选照片。这些资料用于评估和回复，不会进入公开网页正文或分析事件。')) +
    '</div>' + section('handling', tr(l, 'Handling and access', '处理与访问'), p(tr(l,
      facts.publicEmailDrafts ? 'The enquiry builder prepares a draft in your browser. It does not upload photos or send your enquiry. When you choose to send, your email provider handles the email and attachments. We use received enquiries to assess and reply. For questions about your information, call or email us.' : 'Uploaded photographs are stored privately. Please do not include faces, number plates or documents. For questions about information you have sent, contact us by phone or email.',
      facts.publicEmailDrafts ? '询价工具在浏览器中整理草稿，不上传照片或自动发送资料。你选择发送时，由电邮服务商处理邮件与附件。我们将收到的询价用于评估和回复。如需询问资料处理，请电话或电邮联系。' : '上传的照片存放在私有空间。请不要包含人脸、车牌或文件。如需询问已提交资料的处理方式，请通过电话或电邮联系我们。'))) +
    section('maps-privacy', tr(l, 'Maps', '地图'), p(tr(l,
      'Embedded maps are provided by Google. Loading or opening a map connects your browser to Google and is subject to its privacy practices. The suburb map shows an area, not your precise address.',
      '嵌入地图由Google提供。加载或打开地图时，浏览器会连接Google，其资料处理适用Google的隐私规则。郊区地图显示地区，不是你的精确地址。'))) +
    section('contact-privacy', tr(l, 'Questions about your data', '资料相关问题'), p(tr(l,
      'Call or email us using the contact details shown on this website.',
      '请使用本网站显示的电话或电邮联系我们。')));
  return '';
}

function structuredData(page, facts, base) {
  if (!base || !facts.brand) return '';
  const provider = base + '/#organization';
  const graph = [
    { '@type': 'Organization', '@id': provider, name: facts.brand, url: base + '/',
      ...(facts.legalEntity ? { legalName: facts.legalEntity } : {}),
      ...(facts.telephone ? { telephone: facts.telephone } : {}),
      ...(facts.email ? { email: facts.email } : {}),
      ...(facts.officeAddress ? { address: { '@type': 'PostalAddress', streetAddress: facts.officeAddress, addressRegion: 'NSW', addressCountry: 'AU' } } : {}),
    },
    { '@type': 'WebSite', '@id': base + '/#website', url: base + '/', name: facts.brand, publisher: { '@id': provider } },
    { '@type': 'WebPage', '@id': base + page.path + '#webpage', url: base + page.path, name: page.h1,
      inLanguage: page.locale === 'zh' ? 'zh-Hans' : 'en-AU', isPartOf: { '@id': base + '/#website' },
      about: { '@id': page.area || page.id.startsWith('S') ? base + page.path + '#service' : provider },
    },
  ];
  if (page.id.startsWith('S') && (facts.indexingAuthorized || facts.approvedServices?.includes(page.id))) graph.push({
    '@type': 'Service', '@id': base + page.path + '#service', name: page.h1, url: base + page.path,
    provider: { '@id': provider }, areaServed: facts.indexingAuthorized ? [{ '@type': 'Place', name: 'Sydney, NSW, Australia' }] : (facts.approvedAreas ?? [])
      .filter(a => a.coverage_status === 'APPROVED' && a.public_copy_approved && a.approved_service_ids?.includes(page.id))
      .map(a => ({ '@type': 'Place', name: a.name })),
  });
  if (page.area) graph.push({
    '@type': 'Service', '@id': base + page.path + '#service', name: page.h1, url: base + page.path,
    serviceType: page.locale === 'zh' ? '住宅木作维修询价' : 'Residential timber repair enquiries',
    provider: { '@id': provider }, areaServed: { '@type': 'Place', name: page.area.name + ', NSW, Australia' },
    description: page.area[page.locale],
  });
  if (page.id !== 'H00') graph.push({ '@type': 'BreadcrumbList', itemListElement: [
    { '@type': 'ListItem', position: 1, name: page.locale === 'zh' ? '首页' : 'Home', item: base + href('/', page.locale) },
    { '@type': 'ListItem', position: 2, name: page.h1, item: base + page.path },
  ] });
  return '<script type="application/ld+json">' +
    JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c') + '</script>';
}

export function renderPage(inputPath, facts, { production = false, indexable = false } = {}) {
  if (indexable) facts = { ...facts, publicEmailDrafts: true };
  const url = new URL(inputPath, 'https://local.invalid');
  const page = pages.find(item => item.path === url.pathname);
  if (!page || (production && page.area && !facts.approvedAreas?.some(a=>a.name===page.area.name && a.coverage_status==='APPROVED' && a.public_copy_approved && a.area_page_publish_approved)) || (production && page.id.startsWith('S') && !facts.approvedServices?.includes(page.id)))
    return { status: 404, html: '<!doctype html><title>Not found</title><h1>Page not found</h1>' };
  const l = page.locale;
  const base = facts.domain && ((indexable && facts.indexingAuthorized) || (production && productionGaps(facts).length === 0)) ? facts.domain : null;
  const canonical = base ? '<link rel="canonical" href="' + esc(base + page.path) + '">' +
    '<link rel="alternate" hreflang="en-AU" href="' + esc(base + (l === 'en' ? page.path : page.alternate)) + '">' +
    '<link rel="alternate" hreflang="zh-Hans" href="' + esc(base + (l === 'zh' ? page.path : page.alternate)) + '">'+
    '<link rel="alternate" hreflang="x-default" href="' + esc(base + (l === 'en' ? page.path : page.alternate)) + '">' : '';
  const description = page.content?.lead ?? tr(l,
    page.h1 + '. Find the right residential timber repair, understand the scope and prepare your Sydney carpentry enquiry.',
    page.h1 + '。了解住宅木作问题与工作范围，并按构件和地区整理悉尼木工询价。');
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
    esc(description) + '">' + (base ? '<meta name="robots" content="index,follow,max-image-preview:large"><link rel="describedby" href="/llms.txt" type="text/plain">' : '<meta name="robots" content="noindex,nofollow">') + canonical +
    '<link rel="icon" href="/assets/mel-one-logo.jpg" type="image/jpeg"><link rel="apple-touch-icon" href="/assets/mel-one-logo.jpg"><link rel="stylesheet" href="/site.css?v=20260923-area-rfq">' +
    structuredData(page, facts, base) + '</head><body><a class="skip-link" href="#main">' +
    tr(l, 'Skip to content', '跳至正文') + '</a>' +
    '' +
    '<header class="site-header">' + businessContact(l,facts) + '<div class="header-inner"><a class="brand" href="' + href('/', l) +
    '" aria-label="' + brand + ' ' + tr(l, 'home', '首页') + '"><img class="brand-logo" src="/assets/mel-one-logo.jpg" width="940" height="940" alt="Mel One"><span>' +
    brand + '<small>' + tr(l, 'Residential carpentry', '住宅木工') + '</small></span></a>' +
    '<button id="menu-toggle" class="menu-toggle" aria-controls="primary-nav" aria-expanded="false" type="button">' +
    tr(l, 'Menu', '菜单') + '</button><nav id="primary-nav" aria-label="' + tr(l, 'Primary', '主导航') + '">' +
    links + '</nav><a class="language" lang="' + (l === 'en' ? 'zh-Hans' : 'en-AU') +
    '" hreflang="' + (l === 'en' ? 'zh-Hans' : 'en-AU') + '" href="' + page.alternate + '">' +
    (l === 'en' ? '中文' : 'English') + '</a></div></header>' +
    '<main id="main" class="' + (page.id === 'H00' ? 'home-main' : 'page-main') + '">' + main + '</main>' + conversionRail(l, facts) +
    '<footer class="site-footer"><div class="footer-inner">' +
    '<div class="footer-group footer-identity"><img class="footer-logo" src="/assets/mel-one-logo.jpg" width="940" height="940" alt="Mel One"><p class="footer-brand">' + brand + '</p><p>' +
    tr(l, 'Residential timber repairs and maintenance, with the job scope confirmed before booking.', '住宅木作维修与保养；预约前先确认实际工作范围。') +
    '</p><p>' + esc(facts.legalEntity || 'Mel One Property Maintenance Pty Ltd') + '<br>ABN 39 666 325 408 · ACN 666 325 408</p>' + officeAddress(l,facts) + '</div>' +
    '<nav class="footer-group" aria-label="' + tr(l, 'Service links', '服务链接') + '"><h2>' + tr(l, 'Services', '木工服务') + '</h2>' +
    services.filter(s => ['S05','S01','S02','S07','S09'].includes(s.id) && (!production || facts.approvedServices?.includes(s.id))).map(s => '<a href="' + servicePath(s,l) + '">' + esc(shortName(s,l)) + '</a>').join('') +
    '<a href="' + href('/services/',l) + '">' + tr(l, 'All nine services', '全部九项服务') + '</a></nav>' +
    '<nav class="footer-group" aria-label="' + tr(l, 'Areas and work', '地区与案例') + '"><h2>' + tr(l, 'Explore', '了解更多') + '</h2>' +
    '<a href="' + href('/areas/',l) + '">' + tr(l, '56 Sydney enquiry areas', '56 个悉尼服务地区') + '</a><a href="' + href('/#selected-work',l) + '">' + tr(l, 'Real work photos', '真实施工照片') + '</a><a href="' + href('/faq/',l) + '">' + tr(l, 'Common questions', '常见问题') + '</a></nav>' +
    '<nav class="footer-group" aria-label="' + tr(l, 'Company and contact', '公司与联系') + '"><h2>' + tr(l, 'Get in touch', '联系我们') + '</h2>' +
    '<a href="' + href('/contact/',l) + '">' + tr(l, 'Send photos & request a quote', '发送照片并询价') + '</a>' +
    (facts.telephone ? '<a href="tel:' + esc(facts.telephone) + '" data-event="phone_click">' + esc(facts.telephone) + '</a>' : '') +
    (facts.email ? '<a href="mailto:' + esc(facts.email) + '" data-event="email_click">' + esc(facts.email) + '</a>' : '') +
    '<span>' + tr(l, 'Felix2 · Mon–Sun 09:00–21:00 Sydney time', 'Felix2 · 周一至周日 09:00–21:00（悉尼时间）') + '</span>' +
    '<a href="' + href('/about/',l) + '">' + tr(l, 'About the company', '关于公司') + '</a><a href="' + href('/privacy/',l) + '">' + tr(l, 'Privacy', '隐私政策') + '</a></nav>' +
    '</div></footer><script src="/site.js" defer></script></body></html>';
  return { status: 200, html, page };
}
