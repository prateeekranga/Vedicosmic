import { describe, expect, it } from 'vitest';
import {
  CHAKRAS, CHAKRA_RAW_MAX, CHAKRA_RAW_MIN, chakraReading, chakraScores, chakraStatus,
} from '@/data/chakras';

const QUESTION_COUNT = CHAKRAS.reduce((n, ch) => n + ch.questions.length, 0);
const allAnswers = (v: number) => Array.from({ length: QUESTION_COUNT }, () => v);

describe('chakra assessment scoring', () => {
  it('asks three statements per chakra', () => {
    for (const ch of CHAKRAS) expect(ch.questions).toHaveLength(3);
    expect(QUESTION_COUNT).toBe(21);
  });

  it('maps every reachable raw total to its band', () => {
    const expected: Record<number, string> = {
      3: 'Blocked', 4: 'Blocked', 5: 'Blocked', 6: 'Blocked',
      7: 'Partially Open', 8: 'Partially Open', 9: 'Partially Open', 10: 'Partially Open',
      11: 'Balanced', 12: 'Balanced',
    };
    for (let raw = CHAKRA_RAW_MIN; raw <= CHAKRA_RAW_MAX; raw++) {
      expect(chakraStatus(raw).label, `raw ${raw}`).toBe(expected[raw]);
    }
  });

  it('never labels a chakra overactive', () => {
    for (let raw = 0; raw <= 20; raw++) expect(chakraStatus(raw).label).not.toMatch(/overactive/i);
  });

  it('reads uniform answers as expected', () => {
    const labels = (v: number) => chakraScores(allAnswers(v)).map((s) => chakraStatus(s.raw).label);
    expect(new Set(labels(1))).toEqual(new Set(['Blocked']));
    expect(new Set(labels(2))).toEqual(new Set(['Blocked']));
    expect(new Set(labels(3))).toEqual(new Set(['Partially Open']));
    expect(new Set(labels(4))).toEqual(new Set(['Balanced']));
  });

  it('scores each chakra from its own three answers', () => {
    // Root answered 4, 4, 3; everything else 1.
    const answers = allAnswers(1);
    answers[0] = 4; answers[1] = 4; answers[2] = 3;
    const scores = chakraScores(answers);
    expect(scores[0]).toEqual({ raw: 11, percent: 92 });
    expect(chakraStatus(scores[0].raw).label).toBe('Balanced');
    for (const s of scores.slice(1)) expect(s).toEqual({ raw: 3, percent: 25 });
  });

  it('gives different answers different results', () => {
    const answers = allAnswers(1);
    for (let i = 0; i < 3; i++) answers[i] = 4;       // Root open
    for (let i = 3; i < 6; i++) answers[i] = 3;       // Sacral partly open
    const labels = chakraScores(answers).map((s) => chakraStatus(s.raw).label);
    expect(new Set(labels).size).toBe(3);
  });

  it('matches the reading text to the status', () => {
    const root = CHAKRAS[0];
    expect(chakraReading(root, 'balanced')).toBe(root.balanced);
    expect(chakraReading(root, 'blocked')).toBe(root.blocked);
    expect(chakraReading(root, 'partial')).toContain('held back');
  });
});
