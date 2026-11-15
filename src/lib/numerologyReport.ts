/**
 * How a Western core number is written out, shared by the tools and their printed reports
 * (src/lib/print/numerologyPrint.ts builds the reports themselves).
 */
import type { CoreNumber } from '@/engine/numerology';

/** "Month 8 + Day 6 + Year 1 = 15, then 1 + 5 = 6". */
export function coreWorking(n: CoreNumber): string {
  const sum = n.parts.reduce((a, p) => a + p.reduced, 0);
  const parts = n.parts.map((p) => `${p.label} ${p.reduced}`).join(' + ');
  const trail = n.trail.slice(1).map((t, i) => `${String(n.trail[i]).split('').join(' + ')} = ${t}`).join(', then ');
  return n.parts.length > 1 ? `${parts} = ${sum}${trail ? `, then ${trail}` : ''}` : `${n.parts[0]?.total ?? n.input}${trail ? `: ${trail}` : ''}`;
}

/** A core number as printed: "11/2" for a master number, otherwise the number. */
export const coreLabel = (n: CoreNumber) => (n.master ? `${n.value}/${n.root}` : String(n.value));
