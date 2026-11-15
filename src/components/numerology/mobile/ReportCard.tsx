import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  pairRelation, relationTone, type CompatibilityLevel, type Digit, type MobileResult, type PairImpact,
} from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LEVEL_LABEL, SCORE_BAND_TEXT, SCORE_NEEDS_BIRTH, SCORE_NOTE, SCORE_PART_LABEL, cautionText } from '@/data/numerology/mobileText';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

/** One colour per level or band, shared by the meter, the ring and the roots grid; the words always sit beside it. */
export const LEVEL_COLOUR: Record<CompatibilityLevel, string> = { 5: '#34D399', 4: '#34D399', 3: '#39B7F0', 2: '#FBBF24', 1: '#F87171' };
const PAIR_COLOUR: Record<PairImpact, string> = { benefic: 'bg-success', neutral: 'bg-brand-cyan', malefic: 'bg-error' };
const TONE_RING = { supportive: 'ring-success', mixed: 'ring-white/0', challenging: 'ring-error' } as const;

/**
 * The top of the report: the number drawn as digit tiles with its pairs underneath, the Number
 * score as a ring, the four parts of the score as bars, and the points to watch.
 */
export function ReportCard({ result, animate }: { result: MobileResult; animate: boolean }) {
  const fit = result.withBirth;
  return (
    <Card className="p-5 sm:p-8">
      <div data-testid="mobile-score">
      <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
        <NumberRibbon result={result} />
        {fit ? (
          <div className="flex flex-col items-center gap-3 text-center lg:w-64">
            <ScoreRing total={fit.score.total} band={fit.score.band} animate={animate} />
            <p className="max-w-xs text-sm leading-relaxed text-white/75">{SCORE_BAND_TEXT[fit.score.band]}</p>
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-white/20 p-4 text-sm leading-relaxed text-white/70 lg:w-64">{SCORE_NEEDS_BIRTH}</p>
        )}
      </div>

      {fit && (
        <div className="mt-8 border-t border-white/10 pt-6">
          <h4 className="text-xs font-medium uppercase tracking-wide text-white/60">How the score is made</h4>
          <ul className="mt-3 grid gap-3 md:grid-cols-2">
            {fit.score.parts.map((p, i) => (
              <li key={p.key}>
                <details className="group rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                    <span className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="font-medium text-white">
                        <span className="mr-1.5 inline-block text-white/50 transition-transform group-open:rotate-90" aria-hidden="true">›</span>
                        {SCORE_PART_LABEL[p.key]}
                      </span>
                      <span className="whitespace-nowrap text-white/75"><span className="font-heading text-base text-white">{p.points}</span> / {p.max}</span>
                    </span>
                    <span aria-hidden="true" className="mt-2 block h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.span className="block h-full origin-left rounded-full bg-gold-bright/80"
                        style={{ width: `${(p.points / p.max) * 100}%` }}
                        initial={animate ? { scaleX: 0 } : false} animate={{ scaleX: 1 }}
                        transition={{ delay: animate ? 0.3 + i * 0.12 : 0, duration: 0.5, ease: 'easeOut' }} />
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-white/70">{p.working}</p>
                </details>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs leading-relaxed text-white/55">{SCORE_NOTE}</p>
        </div>
      )}

      <div className="mt-6" data-testid="mobile-cautions">
        <h4 className="text-xs font-medium uppercase tracking-wide text-white/60">Points to watch</h4>
        {result.cautions.length ? (
          <ul className="mt-3 space-y-2">
            {result.cautions.map((c, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-white/80">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-warning" aria-hidden="true" />
                <span>{cautionText(c)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 flex gap-2.5 text-sm text-white/80">
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-success" aria-hidden="true" />
            No malefic yoga, no difficult ending and no overloaded digit: nothing the tradition flags.
          </p>
        )}
      </div>
      </div>
    </Card>
  );
}

/**
 * The number as tiles in each digit's colour, with a bar under every pair of neighbours in the
 * colour of its class and a bracket under the last four digits. With a date of birth, a green or
 * red ring marks digits whose planet is friendly or unfriendly to the Mulank. Everything it shows
 * is also in the sections below in words, so it is one image for screen readers.
 */
export function NumberRibbon({ result }: { result: MobileResult }) {
  const n = result.digits.length;
  const driver = result.withBirth?.driver ?? null;
  const tally = result.sequence.reduce((t, p) => ({ ...t, [p.impact]: t[p.impact] + 1 }), { benefic: 0, neutral: 0, malefic: 0 } as Record<PairImpact, number>);
  const label = `The number ${result.digits.join('')}. Neighbouring pairs in order: ${tally.benefic} benefic, ${tally.neutral} neutral, ${tally.malefic} malefic. `
    + `The last four digits, ${result.ending.digits.join('')}, are the ending.`;
  const tone = (d: number) => (driver && d > 0 ? (d === driver ? 'supportive' : relationTone(pairRelation(d as Digit, driver).mutual)) : null);

  return (
    <figure className="min-w-0">
      <div role="img" aria-label={label}>
        <div className="grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          {result.digits.map((d, i) => {
            const info = d > 0 ? NUMBERS[d as Digit] : null;
            const t = tone(d);
            return (
              <span key={i} className={cn(
                'flex aspect-[3/4] flex-col items-center justify-center rounded-md font-heading text-xl font-bold leading-none ring-[1.5px] ring-offset-1 ring-offset-cosmic-darker sm:rounded-lg sm:text-3xl sm:ring-2 sm:ring-offset-2',
                info ? '' : 'border border-dashed border-white/30 bg-white/[0.04] text-white/70',
                t ? TONE_RING[t] : 'ring-transparent',
              )} style={info ? { background: info.colour.fill, color: info.colour.ink } : undefined}>
                {d}
                <span className="mt-1 hidden text-[0.6rem] font-medium uppercase tracking-wide opacity-80 md:block">{info ? info.planet.slice(0, 3) : '—'}</span>
              </span>
            );
          })}
        </div>
        <div className="mt-2 grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${2 * n}, minmax(0, 1fr))` }}>
          {result.sequence.map((p) => (
            <span key={p.index} className={cn('h-1.5 rounded-full', PAIR_COLOUR[p.impact], p.yoga && 'h-2.5')}
              style={{ gridColumn: `${2 * p.index + 2} / span 2`, gridRow: 1 }} />
          ))}
        </div>
        <div className="mt-2 grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
          <span className="flex flex-col items-center border-t-2 border-gold-soft/70 pt-1 text-center text-[0.7rem] text-gold-pale"
            style={{ gridColumn: `${n - result.ending.digits.length + 1} / span ${result.ending.digits.length}` }}>
            Ending{result.ending.root ? ` · root ${result.ending.root}` : ''}
          </span>
        </div>
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-white/60">
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-success" aria-hidden="true" />benefic pair</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-brand-cyan" aria-hidden="true" />neutral</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-1.5 w-4 rounded-full bg-error" aria-hidden="true" />malefic</span>
        <span>thicker bar: a named yoga</span>
        {driver && <span>green or red ring: friendly or unfriendly to your Mulank {driver}</span>}
      </figcaption>
    </figure>
  );
}

/** The Number score as a ring filled to the score, in the colour of its band, with the band named in words. */
export function ScoreRing({ total, band, animate, size = 168 }: { total: number; band: CompatibilityLevel; animate: boolean; size?: number }) {
  const r = 70;
  const length = 2 * Math.PI * r;
  const colour = LEVEL_COLOUR[band];
  return (
    <div role="img" aria-label={`Number score ${total} out of 100: ${LEVEL_LABEL[band]}`} className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 168 168" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="84" cy="84" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
        <motion.circle cx="84" cy="84" r={r} fill="none" stroke={colour} strokeWidth="12" strokeLinecap="round"
          strokeDasharray={length}
          initial={{ strokeDashoffset: animate ? length : length * (1 - total / 100) }}
          animate={{ strokeDashoffset: length * (1 - total / 100) }}
          transition={{ duration: animate ? 1.1 : 0, ease: 'easeOut', delay: animate ? 0.15 : 0 }}
          style={{ filter: `drop-shadow(0 0 6px ${colour}66)` }} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
        <span className="font-display text-5xl font-bold leading-none text-white">{total}</span>
        <span className="mt-1 text-xs text-white/60">out of 100</span>
        <span className="mt-1.5 text-sm font-medium" style={{ color: colour }}>{LEVEL_LABEL[band]}</span>
      </span>
    </div>
  );
}
