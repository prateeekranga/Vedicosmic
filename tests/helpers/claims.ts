/**
 * Words that would turn a traditional reading into a claim about health, money, the law,
 * relationships or fate. A reading may name a theme; it may not predict or guarantee one. Used by
 * the reading-text tests and by the printed-report tests.
 */
export const BANNED_CLAIMS: readonly RegExp[] = [
  /\bguarantee/i, /\bcure[sd]?\b/i, /\bdisease/i, /\billness/i, /\bcancer\b/i, /\bheart (attack|problem)/i, /\bparalys/i,
  /\bhospital/i, /\bcourt\b/i, /\blawsuit/i, /\bjail\b/i, /\bprison/i, /\bdeath\b/i, /\bdie[sd]?\b/i, /\baccident/i,
  /\bdivorce/i, /\bbankrupt/i, /\blottery/i, /\bjackpot/i, /\b(get|become|be) rich\b/i, /\bsure to\b/i, /\bwill (bring|make|give|get) you\b/i,
  /\bunlucky\b/i, /\bassassin/i, /\bruin(ed|s)?\b/i, /\bdepress(ed|ion)\b/i, /\bloan\b/i,
];

/** Each banned pattern found in the texts, with the text it was found in. */
export function claimHits(texts: readonly string[]): string[] {
  const hits: string[] = [];
  for (const text of texts) for (const re of BANNED_CLAIMS) if (re.test(text)) hits.push(`${re}: ${text}`);
  return hits;
}
