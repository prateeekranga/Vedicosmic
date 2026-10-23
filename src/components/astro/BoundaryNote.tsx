import { Info } from 'lucide-react';
import { nearBoundary } from '@/lib/nakshatra';

const LABEL = { sign: 'sign', nakshatra: 'nakshatra', pada: 'pada' } as const;

/** Shown when a computed longitude sits close enough to an edge that the approximate
 *  method, or a few minutes' difference in birth time, could change the result. */
export function BoundaryNote({ longitude, body = 'Moon', signOnly = false }: { longitude: number; body?: string; signOnly?: boolean }) {
  const edge = nearBoundary(longitude);
  if (!edge || (signOnly && edge !== 'sign')) return null;
  return (
    <p role="note" className="flex items-start gap-2 rounded-xl border border-warning/30 bg-warning/10 p-3 text-xs leading-relaxed text-warning">
      <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      Borderline: your {body} is within half a degree of the edge of a {LABEL[edge]}, so the result depends on the exact
      birth time and could fall on the other side.
    </p>
  );
}
