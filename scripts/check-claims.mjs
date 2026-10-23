// Fails the build if the shipped site (dist/) contains an invented claim or an
// unfilled [OWNER TO PROVIDE] marker. Runs last in `postbuild`, so it checks exactly
// what visitors and crawlers receive: HTML, JS bundles, sitemap and llms.txt.
// Rationale and history of each pattern: docs/claims-removed.md.
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dist = path.resolve(__dirname, '..', 'dist');

/** Patterns that must never ship. `textOnly` patterns skip JS bundles, where
 *  library code can contain the same characters for unrelated reasons. */
const BANNED = [
  { re: /\[OWNER TO PROVIDE\]/, why: 'unfilled owner marker' },
  { re: /(?<![\d.])60,?000\+?(?![\d.])/, why: 'unsourced popularity number' },
  { re: /\b4\.9\s*(?:★|stars?\b|\/\s*5|out of 5|rating|instructor)|\brat(?:ing|ed)\W{0,20}4\.9\b/i, why: 'invented rating' },
  { re: /instructor rating|students taught/i, why: 'invented author credentials' },
  { re: /AggregateRating/, why: 'rating markup without real reviews' },
  { re: /\bseekers\b/i, why: 'popularity claim ("seekers")' },
  { re: /modern seeker/i, why: 'banned voice phrase' },
  { re: /\benrol(?:l|ls|led|ling|ment|ments)?\b/i, why: 'course enrolment that does not exist' },
  { re: /\binstructors?\b/i, why: 'course instructors that do not exist' },
  { re: /\b(?:eight|8)\s+(?:in-depth\s+)?courses\b|structured courses|Chakra Healing Course/i, why: 'courses that do not exist' },
  { re: /\bten free tools\b|\bfourteen tools\b/i, why: 'stale hand-written tool count' },
  { re: /cosmic tuning/i, why: '"432 Hz" used as a statistic' },
  { re: /cosmic blueprint/i, why: 'banned homepage claim' },
  { re: /Ananya Mishra|Ananya Devi|Rajan Verma|Rajan Nath|Meera Krishnan|Meera Iyer|Kabir Sharma|Leela Krishnan|Vasanti Rao|Harish Menon/, why: 'person who is not real' },
];

/** Known false positives: [published-path regex, pattern `why`]. Keep this list short and explain each entry. */
const ALLOW = [
  // supabase-js ships an `mfa.enroll()` method in the shared vendor chunk; it is library code, not copy.
  [/^assets\/vendor-[\w-]+\.js$/, 'course enrolment that does not exist'],
];

const EXTENSIONS = new Set(['.html', '.js', '.txt', '.xml', '.json', '.webmanifest']);

async function walk(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

async function main() {
  const files = await walk(dist);
  const hits = [];
  for (const file of files) {
    const rel = path.relative(dist, file).split(path.sep).join('/');
    const isJs = rel.endsWith('.js');
    const text = await fs.readFile(file, 'utf8');
    for (const { re, why, textOnly } of BANNED) {
      if (textOnly && isJs) continue;
      if (ALLOW.some(([pathRe, allowedWhy]) => pathRe.test(rel) && allowedWhy === why)) continue;
      const m = text.match(re);
      if (m) {
        const i = m.index ?? 0;
        hits.push(`  ${rel}: ${why} — "…${text.slice(Math.max(0, i - 40), i + m[0].length + 40).replace(/\s+/g, ' ')}…"`);
      }
    }
  }
  if (hits.length) {
    console.error(`[check-claims] ${hits.length} banned claim(s) or owner marker(s) found in dist/:`);
    console.error(hits.join('\n'));
    console.error('[check-claims] Remove the claim, or fill in the owner detail. See docs/claims-removed.md.');
    process.exitCode = 1;
    return;
  }
  console.log(`[check-claims] OK — scanned ${files.length} files, no banned claims or owner markers.`);
}

main().catch((err) => { console.error(err); process.exitCode = 1; });
