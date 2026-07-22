/**
 * Chaldean numerology — the older Babylonian system. Letters map to 1–8
 * (9 is sacred and never assigned to a letter); digits keep their own value.
 * A name, phone number, or date can all be reduced the same way:
 * sum every character → the "compound" (Σ) → reduce to a single "root" 1–9.
 */
const CHALDEAN: Record<string, number> = {
  A: 1, I: 1, J: 1, Q: 1, Y: 1,
  B: 2, K: 2, R: 2,
  C: 3, G: 3, L: 3, S: 3,
  D: 4, M: 4, T: 4,
  E: 5, H: 5, N: 5, X: 5,
  U: 6, V: 6, W: 6,
  O: 7, Z: 7,
  F: 8, P: 8,
};

export function reduceDigits(n: number): number {
  let x = Math.abs(Math.trunc(n));
  while (x > 9) x = String(x).split('').reduce((a, d) => a + Number(d), 0);
  return x;
}

export type InputKind = 'name' | 'number' | 'mixed' | 'date';

export interface ChaldeanResult {
  input: string;
  kind: InputKind;
  count: number;
  compound: number;
  root: number;
  breakdown: { ch: string; val: number }[];
}

export function chaldean(raw: string): ChaldeanResult | null {
  const cleaned = raw.trim();
  if (!cleaned) return null;

  const breakdown: { ch: string; val: number }[] = [];
  let sum = 0, letters = 0, digits = 0;

  for (const chRaw of cleaned) {
    const ch = chRaw.toUpperCase();
    if (ch >= 'A' && ch <= 'Z') {
      const v = CHALDEAN[ch] ?? 0;
      sum += v; letters++; breakdown.push({ ch: chRaw, val: v });
    } else if (ch >= '0' && ch <= '9') {
      const v = Number(ch);
      sum += v; digits++; breakdown.push({ ch: chRaw, val: v });
    }
  }
  if (breakdown.length === 0) return null;

  const isDate = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(cleaned);
  const kind: InputKind = letters && digits ? 'mixed' : letters ? 'name' : isDate ? 'date' : 'number';

  return { input: cleaned, kind, count: breakdown.length, compound: sum, root: reduceDigits(sum), breakdown };
}
