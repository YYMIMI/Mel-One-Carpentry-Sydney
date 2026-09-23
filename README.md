# Mel One Sydney carpentry

Bilingual residential timber repair site, published at https://mel-one-carpentry-sydney.vercel.app. The 144 public routes include 56 suburb pairs, nine service pairs and seven support-page pairs. This repository concerns Sydney only.

## Vercel deployment

Import the repository root, select Framework Preset **Other**, build with `node scripts/build.mjs --indexable`, and serve `dist`. These settings are recorded in `vercel.json`. `public` contains assets rather than the generated homepage and must not be used as the output directory.

The public build requires `indexingAuthorized: true` and a valid HTTPS origin in `site.config.json`. It emits indexable HTML, self-canonicals, reciprocal en-AU/zh-Hans and x-default links, a complete sitemap, permissive robots.txt, and llms.txt. These files permit discovery; they do not prove Google indexing or AI recommendations. All existing public pages, including privacy, remain indexable.

## Local development and checks

Use Node.js 20+ and install dependencies from the lockfile. Commands:

```text
node --test tests/*.test.mjs
node scripts/build.mjs --indexable
node scripts/check-public.mjs
```

`CHECK_ORIGIN` overrides the checked host (for example a local static server), while canonical expectations still use the configured public origin. Reports are written under ignored `reports/`. The checker covers all public routes, metadata, structured data, internal links and anchors, assets, orphan pages, robots, sitemap and llms.txt.

`node scripts/build.mjs` without flags remains a protected noindex preview. `pnpm dev` starts the original local Worker preview. To visually check the Vercel build, serve the generated `dist` directory with a local static server. Do not deploy test reports or the private research source package.

## Content and entities

`src/content.mjs` owns the nine bilingual service descriptions and region directory. `src/suburbs.mjs` contains individual enquiry scenarios. `src/suburb-details.mjs` adds 56 slug-keyed, individually edited scope decisions, each in English and Chinese. These are guidance scenarios, not claims about typical housing stock or completed jobs in a suburb. Area pages connect the relevant service guides, repair scope, quote inputs, FAQs, a locality map and an RFQ draft.

`src/site.mjs` renders the site. JSON-LD links one Organization to its WebSite, individual WebPages and Services with relevant areaServed. The confirmed Sydney CBD office is not repeated as fictitious suburb branches. Existing titles, H1s, URLs and supplied real-work galleries are preserved. llms.txt is generated from the same facts and route list to limit drift. DESIGN.md and MEDIA.md retain design and image provenance notes.

## Current public enquiry path

The Vercel static build uses an email RFQ draft. Visitors enter a suburb, service, scope and contact method; preparation stays in the browser. They review the draft, open their email application, optionally attach photos and send it themselves, or copy the draft into their email service. The site does not claim submission, storage, delivery or a successful lead event. Phone and direct email alternatives remain available. No enquiry contents are placed in public URLs, local storage or analytics.

`public/rfq.js` implements the draft flow; `src/rfq.mjs` renders the public form and area guidance. Service/suburb query parameters prefill only those public selections. Editing fields invalidates an earlier draft so it cannot silently send stale information. Google map embeds are described in the privacy page.

## Separate Cloudflare backend

`src/worker.mjs` retains the original D1/R2 inquiry API, idempotency and notification outbox. It is not deployed by Vercel. `node scripts/build.mjs --production` retains its stricter backend/business-fact gates; public indexing does not assert that these backend requirements are satisfied. Real inbox delivery, private uploads, notification endpoints and retention controls must be configured and verified before enabling server-submitted enquiries. Do not mark recipient/privacy/backend fields approved merely to enable indexing.

## Release and rollback

Run tests, build the public output, verify locally, then commit and push to main. Verify the exact Vercel deployment and all canonical live URLs. For rollback, restore the prior Git commit or Vercel deployment. Keep any independent inquiry data intact; reverting site code is not permission to remove leads.
