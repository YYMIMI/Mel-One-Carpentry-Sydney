import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildSite } from '../scripts/build.mjs';

test('preview build emits 144 noindex routes and no research files or production sitemap', async () => {
  const dest = await mkdtemp(join(tmpdir(), 'carpentry-build-'));
  try {
    const result = await buildSite({ dest, production: false });
    assert.equal(result.routes.length, 144);
    const en = await readFile(join(dest, 'services/timber-window-repairs/index.html'), 'utf8');
    const zh = await readFile(join(dest, 'zh/services/timber-window-repairs/index.html'), 'utf8');
    assert.match(en, /noindex,nofollow/);
    assert.match(zh, /悉尼木窗与木窗框维修/);
    assert.deepEqual((await readdir(dest)).filter(x => /keywords|research|sitemap/.test(x)), []);
  } finally { await rm(dest, { recursive: true, force: true }); }
});

test('production build refuses missing business facts before writing output', async () => {
  const dest = await mkdtemp(join(tmpdir(), 'carpentry-gate-'));
  try {
    await assert.rejects(buildSite({ dest, production: true }), /Missing production facts/);
    assert.deepEqual(await readdir(dest), []);
  } finally { await rm(dest, { recursive: true, force: true }); }
});
