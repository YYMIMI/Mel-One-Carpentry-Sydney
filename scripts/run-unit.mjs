import { spawnSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const started=new Date().toISOString();
const result=spawnSync(process.execPath,['--test','tests/build.test.mjs','tests/inquiry.test.mjs','tests/site.test.mjs','tests/worker.test.mjs'],
  { cwd:resolve('.'), encoding:'utf8' });
await mkdir(resolve('reports'),{recursive:true});
await writeFile(resolve('reports/unit-tests.txt'),`Started: ${started}\nExit: ${result.status}\n\n${result.stdout}${result.stderr}`);
process.stdout.write(result.stdout);process.stderr.write(result.stderr);
process.exitCode=result.status||0;
