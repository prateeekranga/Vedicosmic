/**
 * A name beside a Lo Shu reading: its Chaldean compound and root (chaldean.ts, the system Indian
 * name numerology uses), and how the root sits with the Driver and Conductor through the same
 * friendship table every other check on the site uses.
 */
import { chaldeanName, type ChaldeanResult } from './chaldean';
import { fitOf, type NumberFit } from './lifeAreas';
import type { LoShuResult } from './loshu';
import { pairRelation, type PairRelation } from './relations';

export interface NameReading {
  chaldean: ChaldeanResult;
  /** The root's verdict beside the Driver and Conductor: yours, friendly, neutral or a careful tier. */
  fit: NumberFit;
  toDriver: PairRelation;
  toConductor: PairRelation;
  /** The root is a number the grid lacks, so the name carries it. */
  suppliesMissing: boolean;
}

/** Null when the name has nothing that can be counted. */
export function nameReading(raw: string, result: LoShuResult): NameReading | null {
  const chaldean = chaldeanName(raw);
  if (!chaldean) return null;
  const root = chaldean.root;
  return {
    chaldean,
    fit: fitOf(root, result),
    toDriver: pairRelation(root, result.driver),
    toConductor: pairRelation(root, result.conductor),
    suppliesMissing: result.full.counts[root] === 0,
  };
}
