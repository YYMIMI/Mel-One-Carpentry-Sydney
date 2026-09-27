import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pages, renderPage } from '../src/site.mjs';
import { companyReviews } from '../src/company-reviews.mjs';

test('home and About show attributed company excerpts, not Sydney job reviews', () => {
  for (const path of ['/', '/zh/', '/about/', '/zh/about/']) {
    const html = renderPage(path, {}).html;
    const feedback = html.split('id="customer-feedback"')[1].split('</section>')[0];
    assert.ok(feedback);
    for (const review of companyReviews) {
      assert.ok(feedback.includes(review.author));
      assert.ok(feedback.includes(review.quote));
    }
    assert.match(feedback, /Melbourne|墨尔本/);
    assert.match(feedback, /not reviews of Sydney carpentry jobs|并非悉尼木工项目评价/);
    assert.match(feedback, /google\.com\/maps\/place\/Mel\+One\+Maintenance/);
    assert.doesNotMatch(feedback, /★★★★★|ratingValue|reviewCount/);
    if (path.startsWith('/zh')) assert.match(feedback, /摘录译文/);
    if (path.includes('about')) assert.match(feedback, /downstairs ceiling|楼下天花板/);
  }
});

test('company feedback is not attached to service or suburb evidence or rating schema', () => {
  for (const page of pages) {
    const html = renderPage(page.path, {}).html;
    const schema = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)?.[1] || '';
    assert.doesNotMatch(schema, /AggregateRating|"Review"|ratingValue|7dee54b29c5d00fa/);
    if (page.id.startsWith('S') || page.area) assert.doesNotMatch(html, /id="customer-feedback"/);
  }
});
