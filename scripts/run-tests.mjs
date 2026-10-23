// Runs the test suite once per process time zone. Calculations must never depend on the
// visitor's device zone, so the same tests have to pass in India and in New York.
import { spawnSync } from 'node:child_process';

const ZONES = ['Asia/Kolkata', 'America/New_York'];
let failed = false;

for (const tz of ZONES) {
  console.log(`\n[tests] TZ=${tz}`);
  const run = spawnSync(process.execPath, ['node_modules/vitest/vitest.mjs', 'run', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, TZ: tz },
  });
  if (run.status !== 0) failed = true;
}

process.exitCode = failed ? 1 : 0;
