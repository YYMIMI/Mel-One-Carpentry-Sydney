const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
export const backyardDoorAnchor = 'backyard-door-replacement';
const directory = '/assets/real-work/';
const text = {
  en: {
    title: 'Before and after: backyard door replacement and painting',
    intro: 'The old backyard door leaf had visibly worn paint and damage around the latch edge. Mel One removed the old leaf, fitted a replacement to the existing opening, adjusted its position and opening and closing movement, then prepared and painted the surface.',
    steps: [
      ['Remove the worn door leaf', 'The deteriorated leaf was removed so the replacement could be fitted to the site dimensions.'],
      ['Fit and adjust the replacement', 'The replacement leaf was fitted to the existing opening, with its position and opening and closing movement adjusted.'],
      ['Prepare and paint the surface', 'Surface preparation and painting completed the agreed door-leaf work, giving the visible door a fresh, consistent finish.'],
    ],
    result: 'The finished views show the replacement leaf fitted and painted from both sides. The work shown here is the door-leaf replacement, adjustment and paint finish.',
    enquiry: 'If a door leaf or frame is distorted, has soft or damaged timber, or has peeling paint, send a full view and close-ups of the edge, hinges and affected frame. Include your suburb, approximate opening size and whether the door still closes so we can discuss repair or replacement.',
    action: 'Send photos of your door',
  },
  zh: {
    title: '更换前后：后院旧门板更换、调整与刷漆',
    intro: '这扇后院旧门板的漆面已明显老化，锁舌附近的门边也可见破损。Mel One 拆下旧门板，按现场开口尺寸换上新门板，调整位置及开关，再完成表面处理和刷漆。',
    steps: [
      ['拆下老化旧门板', '拆除原有老化门板，让新门板按现场尺寸配合安装。'],
      ['配合开口安装与调整', '新门板安装到原有开口，并调整门板位置与开关状态。'],
      ['表面处理及刷漆收尾', '完成约定的门板表面处理和刷漆，让可见漆面呈现整洁、协调的效果。'],
    ],
    result: '完成照片从两侧展示已安装和刷漆的新门板。本案例的工作范围是门板更换、开关调整与漆面收尾。',
    enquiry: '家里的门板或门框如有变形、木材发软破损或漆面脱落，可提供整扇门全景，以及门边、铰链和受损门框近照。再说明所在地区、开口大致尺寸及门能否正常关闭，方便讨论适合维修还是更换。',
    action: '发送门板与门框照片询价',
  },
};
const photographs = [
  ['backyard-door-before.webp', 1080, 1920, 'Before: the old backyard door leaf with visibly worn and flaking paint', '更换前：后院旧门板表面老化，漆面磨损剥落'],
  ['backyard-door-edge-before.webp', 1080, 1920, 'Before: damaged door edge around the latch', '更换前：旧门板锁舌周边的门边破损细节'],
  ['backyard-door-after-front.webp', 1280, 1708, 'After: exterior view of the replacement door leaf following fitting and painting', '更换后：新门板完成安装与刷漆后的外侧效果'],
  ['backyard-door-after-reverse.webp', 1280, 1708, 'After: the fitted and painted replacement door leaf shown open from the other side', '更换后：从另一侧拍摄已安装、刷漆的新门板开启状态'],
];

export function backyardDoorCase(locale) {
  const copy = text[locale === 'zh' ? 'zh' : 'en'];
  return '<section class="content-section backyard-door-case" id="' + backyardDoorAnchor + '"><h2>' + escape(copy.title) + '</h2><p>' + escape(copy.intro) + '</p>' +
    '<div class="rfq-guidance-grid">' + copy.steps.map(([title, description]) => '<article><h3>' + escape(title) + '</h3><p>' + escape(description) + '</p></article>').join('') + '</div>' +
    '<div class="work-gallery">' + photographs.map(([name, width, height, en, zh]) => '<figure class="work-photo"><img src="' + directory + name + '" width="' + width + '" height="' + height + '" loading="lazy" decoding="async" alt="' + escape(locale === 'zh' ? zh : en) + '"><figcaption>' + escape(locale === 'zh' ? zh : en) + '</figcaption></figure>').join('') + '</div>' +
    '<p>' + escape(copy.result) + '</p><p>' + escape(copy.enquiry) + '</p><p><a class="button button-primary" href="' + (locale === 'zh' ? '/zh/contact/' : '/contact/') + '?service=S02">' + escape(copy.action) + '</a></p></section>';
}

export function backyardDoorCaseSchema(page, base) {
  const copy = text[page.locale === 'zh' ? 'zh' : 'en'];
  const url = base + page.path + '#' + backyardDoorAnchor;
  return {
    '@type': 'Article', '@id': url, url,
    headline: copy.title, description: copy.intro,
    inLanguage: page.locale === 'zh' ? 'zh-Hans' : 'en-AU',
    isPartOf: { '@id': base + page.path + '#webpage' },
    about: { '@id': base + page.path + '#service' },
    author: { '@id': base + '/#organization' },
    image: photographs.map(([name]) => base + directory + name),
  };
}
