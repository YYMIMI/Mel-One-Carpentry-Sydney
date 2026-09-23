# Sydney carpentry — isolated bilingual preview

This is a locally runnable bilingual Sydney carpentry website implementation, but **not a published business website**. It was developed from the owner's supplied planning materials, real work photos and subsequent requirements. The private research source package and local QA reports are intentionally not committed to the public code repository; the runnable source, tests and public images are included. No other city or roofing project is part of this codebase.

## Open the preview

Requirements: Node.js 20+, pnpm 11. From this directory:

```text
pnpm install
pnpm test
pnpm build
pnpm exec wrangler d1 migrations apply DB --local
pnpm dev
```

Open `http://127.0.0.1:8787/` and `/zh/`. This binds only to local loopback. The current preview build generates 144 routes into `dist/`, including 56 independent English/Chinese suburb page pairs. The Worker serves static pages plus the local D1/R2-backed inquiry API. Preview pages say they are previews, carry `noindex,nofollow`, and `robots.txt` disallows crawlers. This is **not a protected hosted staging deployment**; do not enter real customer details while the recipient/privacy terms are unapproved. Use synthetic test details only.

To reproduce URL and research checks while the server runs:

```text
pnpm check
node scripts/coverage.mjs
node scripts/integration.mjs
```

`scripts/integration.mjs` writes synthetic fixture leads to local D1/R2. It does not send real email. `scripts/notification-failure.mjs` expects a local preview started with a deliberately failing webhook and a test-only internal token; its recorded result is in `reports/notification-failure.json`. Never use that test token in production. Local data is under `.wrangler/` and is excluded from the deliverable archive.

## Editorial and service-area model

`src/content.mjs` contains distinct EN/zh-Hans draft bodies for nine core Owner services. `src/site.mjs` contains support pages, independent suburb routes, metadata, cross-language links, area decision logic and production gates. `scripts/build.mjs` copies only `public/` and generated HTML into `dist/`. The original research expressions are not emitted as keyword lists. `DESIGN.md` and `MEDIA.md` describe the editorial direction and image provenance.

Selected well-known Sydney area names have independent bilingual preview pages as **enquiry examples requiring confirmation**, not service promises. The preview shows 56 suburb pairs across the research districts and four featured district cards on the homepage. Production rendering hides pending examples entirely. To publish an actual area, update `site.config.json` only after verification with `coverage_status: "APPROVED"`, `public_copy_approved: true`, and explicit `approved_service_ids`. One area approval does not approve all services or adjacent suburbs. Suburb pages contain distinct local context and do not claim an unverified completed job.

## Inquiry system

`src/worker.mjs` uses D1 for accepted leads, idempotency, a notification outbox and a basic rate bucket; R2 holds privately named photos. It validates fields, JPEG/PNG/WebP type and limits server-side, accepts phone **or** email, denies public photo access, returns a receipt only after storage acceptance, and retries failed notifications on the scheduled Worker trigger. A configured alert webhook can receive a lead ID only after three delivery failures. Authorized internal reads/deletes require `INTERNAL_API_TOKEN`. The front end preserves input on errors and only emits `lead_submit_success` after server acceptance. Analytics payloads contain no contact details, street address or photo URL.

Production bindings/secrets are deliberately **not** configured. The approved operator must supply real D1/R2 resources, `INTERNAL_API_TOKEN`, `RATE_LIMIT_SALT`, `NOTIFY_WEBHOOK_URL`/`NOTIFY_WEBHOOK_TOKEN`, and `ALERT_WEBHOOK_URL`/`ALERT_WEBHOOK_TOKEN`. Webhooks must use HTTPS. The authorized receiving endpoint must be tested for actual delivery and access to private photos before launch. Retention/deletion policy and privacy wording require approval; no guessed retention period is applied.

## Release gate and rollback

`site.config.json` retains null public facts and `productionAuthorized: false`. `node scripts/build.mjs --production` refuses to write an indexable build until the brand, domain, contact route, recipient, all nine core service approvals, at least one explicitly approved area/service matrix, approved privacy copy and production authorization are supplied. That build gate is necessary, not sufficient: confirm the exact target repository/site, credentials, real end-to-end recipient receipt, alert route, data policy, legal/qualification claims, and per-URL live checks before production. GBP remains disabled and all URLs null.

No production rollback is needed now because nothing was published. For this isolated preview, stop the local Wrangler process; the original v3 source remains in `source-package/` and the deliverable archive restores the implementation. After any future authorized integration, retain the target's pre-change commit/deployment and database snapshot; roll back the site to that point, but preserve/export new inquiry records and private photos before altering storage or schema. Never treat a code rollback as a deletion of live leads.

Local-only QA evidence is written under `reports/` when the tests and checks run. That folder is excluded from the public repository because it can contain machine-specific paths and synthetic test details. A code commit is not a production deployment or proof of real enquiry delivery.
