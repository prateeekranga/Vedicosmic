import { Link } from 'react-router-dom';
import { DIGITS, NUMBER_DIRECTION, type CalcStep, type Digit, type LoShuResult } from '@/engine/numerology';
import {
  DIRECTION_NAME, KUA_DIRECTION_TEXT, KUA_GROUP_TEXT, KUA_TEXT,
} from '@/data/numerology/loshuText';
import { NUMERO_VASTU_NOTE } from '@/data/numerology/dashaText';
import { GENTLE_DIRECTIONS, GENTLE_LABEL, GLOSSARY, GLOSSARY_INTRO, PANEL_TEXT, SOURCES_INTRO, SOURCE_OWN, SOURCE_TRADITION } from '@/data/numerology/lifeAreaText';
import { SOURCE_LINEAGE, SOURCE_LINEAGE_INTRO } from '@/data/numerology/extrasText';
import { HowCalculated, NumerologyMethodLine } from '@/components/numerology/HowCalculated';
import { Fold, PanelSection } from './bits';

const directionOf = (d: Digit) => (NUMBER_DIRECTION[d] === 'centre' ? 'Centre' : DIRECTION_NAME[NUMBER_DIRECTION[d] as keyof typeof DIRECTION_NAME]);

const GO_FURTHER = [
  { to: '/tools/numerology', label: 'Numerology Calculator', why: 'add your name for the Western core numbers' },
  { to: '/tools/chaldean', label: 'Chaldean Name Number', why: 'what your name adds up to in the Chaldean system' },
  { to: '/tools/mobile-numerology', label: 'Mobile Number Numerology', why: 'how a phone number sits beside your date of birth' },
  { to: '/tools/life-path', label: 'Life Path Number', why: 'the Life Path, personal year and pinnacles from the same date' },
] as const;

/** Reference material: the Lo Shu directions, the Kua, the words used, the working and the sources. */
export function MorePanel({ result, steps }: { result: LoShuResult; steps: CalcStep[] }) {
  const kua = result.kua;
  return (
    <div className="space-y-10">
      <PanelSection title="Words used on this page" lede={GLOSSARY_INTRO} id="loshu-glossary">
        <dl className="grid gap-3 md:grid-cols-2" data-testid="loshu-glossary">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <dt className="font-medium text-white">{g.term}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/75">{g.text}</dd>
            </div>
          ))}
        </dl>
      </PanelSection>

      <PanelSection title="Lo Shu directions" lede={NUMERO_VASTU_NOTE} testId="loshu-directions">
        <p className="text-sm leading-relaxed text-white/75">
          {result.full.missing.length
            ? `Your missing numbers point to: ${result.full.missing.map((d) => `${directionOf(d)} (${d})`).join(', ')}.`
            : 'No number is missing, so no direction is marked for attention.'}
        </p>
        <p className="mt-2 text-xs leading-relaxed text-white/65">
          All nine: {DIGITS.map((d) => `${d} ${directionOf(d)}`).join(' · ')}.
        </p>
      </PanelSection>

      {kua && (
        <PanelSection title={`Kua ${kua.mansion}: favourable directions`} lede={`${KUA_GROUP_TEXT[kua.group]} ${KUA_TEXT[kua.mansion]}`}>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(['shengQi', 'tianYi', 'yanNian', 'fuWei'] as const).map((key) => (
              <div key={key} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <dt className="text-xs uppercase tracking-wide text-white/65">{KUA_DIRECTION_TEXT[key].name} · {KUA_DIRECTION_TEXT[key].english}</dt>
                <dd className="mt-1 font-heading text-lg text-white">{DIRECTION_NAME[kua.directions[key]]}</dd>
                <dd className="mt-1 text-xs leading-snug text-white/65">For {KUA_DIRECTION_TEXT[key].use}.</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm text-white/75"><span className="font-medium text-white">{GENTLE_LABEL}: </span>{GENTLE_DIRECTIONS[kua.group]}.</p>
          {kua.raw === 5 && (
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              The formula gives 5, the centre of the square, which has no direction of its own. Eight Mansions reads it as {kua.mansion} for a {result.gender === 'male' ? 'man' : 'woman'}.
            </p>
          )}
          {kua.solarYearAlternative && kua.solarYearAlternative.mansion !== kua.mansion && (
            <p className="mt-3 text-xs leading-relaxed text-white/65">
              You were born before 4 February. Feng shui teachers who count the Chinese solar year would use {kua.solarYearAlternative.year} and give Kua {kua.solarYearAlternative.mansion}. This page uses the calendar year, as Indian numerology usually does.
            </p>
          )}
        </PanelSection>
      )}

      <PanelSection title="How this was worked out" lede={PANEL_TEXT.more}>
        <div className="space-y-3">
          <HowCalculated steps={steps} />
          <Fold title="What is traditional here, and what is this page’s own method">
            <div className="space-y-3 text-sm leading-relaxed text-white/70">
              <p>{SOURCES_INTRO}</p>
              <div>
                <h4 className="font-medium text-white">From the tradition</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5">{SOURCE_TRADITION.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div>
                <h4 className="font-medium text-white">This page’s own method</h4>
                <ul className="mt-1 list-disc space-y-1 pl-5">{SOURCE_OWN.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div>
                <h4 className="font-medium text-white">The founder’s lineage</h4>
                <p className="mt-1">{SOURCE_LINEAGE_INTRO}</p>
                <ul className="mt-1 list-disc space-y-1 pl-5">{SOURCE_LINEAGE.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>
          </Fold>
          <NumerologyMethodLine method="Date digits with the Driver, Conductor and Kua added to the grid; zeros have no cell. Dasha periods start with the Driver and turn on the birthday. Marriage years: the year plus the Mulank Maha, added down to the Vivah Mulank." />
        </div>
      </PanelSection>

      <PanelSection title="Go further">
        <ul className="grid gap-3 sm:grid-cols-2">
          {GO_FURTHER.map((g) => (
            <li key={g.to}>
              <Link to={g.to} className="block h-full rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:border-gold-soft/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-bright">
                <span className="font-medium text-brand-cyan-soft">{g.label}</span>
                <span className="mt-1 block text-sm text-white/70">{g.why}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PanelSection>
    </div>
  );
}
