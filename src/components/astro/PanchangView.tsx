import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { DayOverview } from '@/engine/day';
import { CHOGHADIYA_QUALITY, type Choghadiya, type Window } from '@/engine/muhurta';
import { VARAS, type LunarMonth, type MonthName, type Span } from '@/engine/panchang';
import { timeInZone } from '@/engine/time';
import {
  ABHIJIT_WEDNESDAY_NOTE, CHOGHADIYA_INTRO, CHOGHADIYA_LABEL, CHOGHADIYA_TEXT, LIMB_TEXT, MONTH_BORDERLINE_NOTE,
  VARA_LORD, WEEKDAYS, WINDOW_TEXT, illumination, phaseName, type WindowText,
} from '@/data/panchangText';
import { clockLabel, clockLabelOn, durationLabel, formatLongDate } from '@/lib/format';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AstroNote } from './AstroNote';
import { MethodLine } from './MethodLine';
import { MoonPhase } from './MoonPhase';

const H3 = 'mb-3 font-heading text-h5 text-white';
const TH = 'p-2.5 text-xs font-medium uppercase tracking-wide text-white/60';
const TD = 'p-2.5 align-top';

type WindowId = keyof typeof WINDOW_TEXT;
const WINDOW_COLOUR: Record<WindowId, string> = { brahma: '#A78BFA', abhijit: '#34D399', rahu: '#F87171', yamaganda: '#FB923C', gulika: '#FBBF24' };
const QUALITY_BADGE = { good: 'success', neutral: 'cyan', bad: 'warning' } as const;

const monthLabel = (m: MonthName) => (m.adhika ? `Adhika ${m.name}` : m.name);
/** Whether a window is running, still to come or over; null when the page is not showing today. */
function statusOf(w: Window, now: number | null): 'now' | 'upcoming' | 'passed' | null {
  if (now === null) return null;
  return now >= w.start && now < w.end ? 'now' : now < w.start ? 'upcoming' : 'passed';
}

/**
 * One day's panchang, drawn from a DayOverview. Pure: everything it shows comes from its props,
 * and `now` is passed in only when the page is showing today, to mark what is running.
 */
export function PanchangView({ day, place, now }: {
  day: DayOverview;
  place: { label: string; zone: string };
  now: number | null;
}) {
  const p = day.panchang;
  const clock = (ms: number) => clockLabelOn(ms, place.zone, day.date);
  const windows: { id: WindowId; text: WindowText; w: Window }[] = [
    { id: 'brahma', text: WINDOW_TEXT.brahma, w: day.brahmaMuhurta },
    { id: 'abhijit', text: WINDOW_TEXT.abhijit, w: day.abhijit },
    { id: 'rahu', text: WINDOW_TEXT.rahu, w: day.rahuKaal },
    { id: 'yamaganda', text: WINDOW_TEXT.yamaganda, w: day.yamaganda },
    { id: 'gulika', text: WINDOW_TEXT.gulika, w: day.gulikaKaal },
  ];
  const lit = illumination(p.moonPhase);

  return (
    <div className="space-y-10">
      <section data-testid="panchang-limbs">
        <h3 className={H3}>Panchang for {WEEKDAYS[p.vara]}, {formatLongDate(day.date)}</h3>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">
          {place.label}. The day runs from sunrise at {clockLabel(p.sunrise, place.zone)} to the next sunrise, and each limb is the one in force at sunrise, with the time it ends.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Limb label="Tithi" about={LIMB_TEXT.tithi} spans={p.tithi} until={p.nextSunrise} clock={clock} />
          <Limb label="Nakshatra" about={LIMB_TEXT.nakshatra} spans={p.nakshatra} until={p.nextSunrise} clock={clock} />
          <Limb label="Yoga" about={LIMB_TEXT.yoga} spans={p.yoga} until={p.nextSunrise} clock={clock} />
          <Limb label="Karana" about={LIMB_TEXT.karana} spans={p.karana} until={p.nextSunrise} clock={clock} />
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-white/60">Vara</h4>
            <p className="mt-1 font-heading text-xl text-white">{VARAS[p.vara]}</p>
            <p className="text-sm text-white/75">{WEEKDAYS[p.vara]}, the day of the {VARA_LORD[p.vara]}</p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">{LIMB_TEXT.vara}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <h4 className="text-xs font-medium uppercase tracking-wide text-white/60">Lunar month</h4>
            <p className="mt-1 font-heading text-xl text-white">{monthLabel(day.month.purnimanta)}</p>
            <p className="text-sm text-white/75">{p.paksha} paksha, the {p.paksha === 'Shukla' ? 'bright' : 'dark'} fortnight</p>
            <MonthLines month={day.month} />
            {day.monthChange && (
              <p className="mt-2 text-xs leading-relaxed text-white/75">
                From {clock(day.monthChange.at)}: {monthLabel(day.monthChange.month.purnimanta)} (purnimanta), {monthLabel(day.monthChange.month.amanta)} (amanta).
              </p>
            )}
          </div>
        </div>
        {(day.month.borderline || day.monthChange?.month.borderline) && <div className="mt-3"><AstroNote>{MONTH_BORDERLINE_NOTE}</AstroNote></div>}
      </section>

      <section data-testid="panchang-sun-moon">
        <h3 className={H3}>Sun and Moon</h3>
        <Card className="p-5 sm:p-6">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
              <Fact term="Sunrise" value={clockLabel(p.sunrise, place.zone)} />
              <Fact term="Sunset" value={clockLabel(p.sunset, place.zone)} />
              <Fact term="Day length" value={durationLabel(day.dayLength)} />
              <Fact term="Moonrise" value={day.moon.moonrise === null ? 'None this day' : clock(day.moon.moonrise)} />
              <Fact term="Moonset" value={day.moon.moonset === null ? 'None this day' : clock(day.moon.moonset)} />
              <Fact term="Night length" value={durationLabel(day.nightLength)} />
            </dl>
            <div className="flex items-center gap-4">
              <MoonPhase phase={p.moonPhase} size={88} />
              <div>
                <p className="font-heading text-lg text-white">{phaseName(p.moonPhase)}</p>
                <p className="text-sm text-white/70">{lit}% lit at sunrise</p>
              </div>
            </div>
          </div>
          {(day.moon.moonrise === null || day.moon.moonset === null) && (
            <p className="mt-4 text-xs leading-relaxed text-white/60">
              The Moon rises about fifty minutes later each day, so about once a month a sunrise-to-sunrise day passes without a moonrise, and another without a moonset.
            </p>
          )}
        </Card>
      </section>

      <section data-testid="panchang-windows">
        <h3 className={H3}>Rahu Kaal and the muhurtas of the day</h3>
        <div className="grid gap-8 lg:grid-cols-2">
          <Card className="p-5 sm:p-6 lg:self-start">
            <DayWheel day={day} zone={place.zone} now={now} windows={windows} />
            <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-white/70">
              {windows.map(({ id, text }) => (
                <li key={id} className="flex items-center gap-1.5"><span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: WINDOW_COLOUR[id] }} />{text.name}</li>
              ))}
            </ul>
          </Card>
          <ul className="space-y-3">
            {windows.map(({ id, text, w }) => {
              const status = statusOf(w, now);
              return (
                <li key={id} className={`rounded-xl border bg-white/[0.04] p-4 ${status === 'now' ? 'border-gold-soft/60' : 'border-white/10'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="flex items-center gap-2 text-sm font-medium text-white">
                      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: WINDOW_COLOUR[id] }} />
                      {text.name} <span lang="hi" className="font-normal text-white/60">{text.devanagari}</span>
                    </h4>
                    <span className="flex items-center gap-2">
                      {status === 'now' && <Badge tone="gold">Now</Badge>}
                      {status === 'upcoming' && <Badge tone="cyan">Upcoming</Badge>}
                      <Badge tone={text.kind === 'good' ? 'success' : 'warning'}>{text.kind === 'good' ? 'Favourable' : 'Avoid'}</Badge>
                    </span>
                  </div>
                  <p className="mt-1.5 font-mono text-lg text-white">{clock(w.start)} to {clock(w.end)}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/65">
                    {text.note}{id === 'abhijit' && day.abhijitSkipped ? ` ${ABHIJIT_WEDNESDAY_NOTE}` : ''}
                  </p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section>
        <h3 className={H3}>Choghadiya</h3>
        <p className="mb-4 max-w-3xl text-sm leading-relaxed text-white/65">{CHOGHADIYA_INTRO}</p>
        <div className="grid gap-6 xl:grid-cols-2">
          <ChoghadiyaTable testId="panchang-choghadiya-day" title="Day Choghadiya" caption={`Sunrise ${clockLabel(p.sunrise, place.zone)} to sunset ${clockLabel(p.sunset, place.zone)}`}
            parts={day.choghadiya.filter((c) => !c.night)} clock={(ms) => clockLabel(ms, place.zone)} now={now} />
          <ChoghadiyaTable testId="panchang-choghadiya-night" title="Night Choghadiya" caption={`Sunset ${clockLabel(p.sunset, place.zone)} to the next sunrise ${clock(p.nextSunrise)}`}
            parts={day.choghadiya.filter((c) => c.night)} clock={(ms) => clockLabel(ms, place.zone)} now={now} />
        </div>
      </section>

      <section>
        <h3 className={H3}>More for this day</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li>
            <Link to={`/tools/planetary-hours?date=${day.date}`} className="flex h-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white transition-colors hover:border-gold-soft/50">
              <span><span className="block font-medium">Hora for this day</span><span className="block text-xs text-white/65">The 24 planetary hours, counted from the same sunrise.</span></span>
              <ArrowRight className="h-4 w-4 flex-none text-gold-pale" aria-hidden="true" />
            </Link>
          </li>
          <li>
            <Link to="/tools/vrat-calendar" className="flex h-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm text-white transition-colors hover:border-gold-soft/50">
              <span><span className="block font-medium">Ekadashi and vrat calendar</span><span className="block text-xs text-white/65">The next Ekadashi, Pradosh, Purnima and Amavasya for your city.</span></span>
              <ArrowRight className="h-4 w-4 flex-none text-gold-pale" aria-hidden="true" />
            </Link>
          </li>
        </ul>
      </section>

      <div className="space-y-1">
        <p className="text-xs text-white/60">All times are local to {place.label}. A time with a date after it falls on that other day.</p>
        <MethodLine kind="day" />
      </div>
    </div>
  );
}

/** One limb: the value at sunrise with its end time, then whatever follows before the next sunrise. */
function Limb({ label, about, spans, until, clock }: { label: string; about: string; spans: Span[]; until: number; clock: (ms: number) => string }) {
  const [first, ...rest] = spans;
  // A span belongs to this day if it begins before the next sunrise, that is, if the one before it ends by then.
  const later = rest.filter((_, i) => spans[i].ends < until);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <h4 className="text-xs font-medium uppercase tracking-wide text-white/60">{label}</h4>
      <p className="mt-1 font-heading text-xl text-white">{first.name}</p>
      <p className="text-sm text-white/75">until {clock(first.ends)}</p>
      {later.length > 0 && (
        <ul className="mt-2 space-y-0.5 text-sm text-white/75">
          {later.map((s) => <li key={`${s.index}-${s.ends}`}>then <span className="text-white">{s.name}</span> until {clock(s.ends)}</li>)}
        </ul>
      )}
      <p className="mt-2 text-xs leading-relaxed text-white/60">{about}</p>
    </div>
  );
}

function MonthLines({ month }: { month: LunarMonth }) {
  const same = month.amanta.index === month.purnimanta.index && month.amanta.adhika === month.purnimanta.adhika;
  return (
    <p className="mt-2 text-xs leading-relaxed text-white/60">
      {same
        ? `${monthLabel(month.amanta)} in both the purnimanta count of the north and the amanta count of the south and west.`
        : `${monthLabel(month.purnimanta)} in the purnimanta count of the north; ${monthLabel(month.amanta)} in the amanta count of the south and west.`}
      {month.amanta.adhika ? ' An adhika month is an extra month, added about every third year to keep the lunar year in step with the Sun.' : ''}
    </p>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-white/60">{term}</dt>
      <dd className="mt-0.5 font-heading text-lg text-white">{value}</dd>
    </div>
  );
}

function ChoghadiyaTable({ testId, title, caption, parts, clock, now }: {
  testId: string; title: string; caption: string; parts: Choghadiya[]; clock: (ms: number) => string; now: number | null;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]" data-testid={testId}>
      <table className="w-full text-left text-sm">
        <caption className="border-b border-white/10 p-3 text-left">
          <span className="block font-medium text-white">{title}</span>
          <span className="block text-xs text-white/60">{caption}</span>
        </caption>
        <thead>
          <tr>
            <th scope="col" className={TH}>Part</th>
            <th scope="col" className={TH}>Time</th>
            <th scope="col" className={TH}>Class</th>
            <th scope="col" className={`${TH} hidden md:table-cell`}>Traditional use</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((c) => {
            const quality = CHOGHADIYA_QUALITY[c.name];
            const running = statusOf(c, now) === 'now';
            const text = CHOGHADIYA_TEXT[c.name];
            return (
              <tr key={c.start} className={`border-t border-white/5 ${running ? 'bg-gold-bright/[0.08]' : ''}`}>
                <th scope="row" className={`${TD} w-[44%] font-normal md:w-auto`}>
                  <span className="block font-medium text-white">{c.name}{running && <span className="ml-2 text-xs font-normal text-gold-pale">now</span>}</span>
                  <span className="block text-xs text-white/60">{text.meaning} · {text.lord}</span>
                  <span className="mt-1 block text-xs leading-snug text-white/65 md:hidden">{text.use}</span>
                </th>
                <td className={`${TD} text-white/85 md:whitespace-nowrap`}>{clock(c.start)} to {clock(c.end)}</td>
                <td className={TD}><Badge tone={QUALITY_BADGE[quality]}>{CHOGHADIYA_LABEL[quality]}</Badge></td>
                <td className={`${TD} hidden text-xs leading-snug text-white/70 md:table-cell`}>{text.use}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const RAD = Math.PI / 180;
const C = 140, R = 108, RING = 22;
const point = (angle: number, radius: number) => ({ x: C + radius * Math.cos(angle * RAD), y: C + radius * Math.sin(angle * RAD) });

/**
 * A 24-hour dial in the place's own clock, midnight at the top: the daytime as a pale band, the
 * five windows as coloured arcs, and a hand for the present moment when the page shows today.
 * The list beside it gives the same times as text.
 */
function DayWheel({ day, zone, now, windows }: {
  day: DayOverview; zone: string; now: number | null; windows: { id: WindowId; text: WindowText; w: Window }[];
}) {
  const angleOf = (ms: number) => {
    const [h, m] = timeInZone(ms, zone).split(':').map(Number);
    return ((h * 60 + m) / 1440) * 360 - 90;
  };
  const arc = (start: number, end: number) => {
    const a1 = angleOf(start), a2 = angleOf(end);
    const p1 = point(a1, R), p2 = point(a2, R);
    return `M ${p1.x} ${p1.y} A ${R} ${R} 0 ${((a2 - a1 + 360) % 360) > 180 ? 1 : 0} 1 ${p2.x} ${p2.y}`;
  };
  const p = day.panchang;
  const hand = now === null ? null : angleOf(now);
  return (
    <svg viewBox="-18 -6 316 292" className="mx-auto w-full max-w-[400px]" role="img"
      aria-label={`24-hour dial for ${formatLongDate(day.date)}: daytime from ${clockLabel(p.sunrise, zone)} to ${clockLabel(p.sunset, zone)}, with Brahma Muhurta, Abhijit Muhurta, Rahu Kaal, Yamaganda and Gulika Kaal marked.`}>
      <circle cx={C} cy={C} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={RING} />
      {Array.from({ length: 24 }, (_, h) => {
        const a = (h / 24) * 360 - 90;
        const p1 = point(a, R + RING / 2 + 2), p2 = point(a, R + RING / 2 + (h % 6 === 0 ? 9 : 5));
        return <line key={h} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.3)" strokeWidth={h % 6 === 0 ? 1.4 : 0.7} />;
      })}
      {[0, 6, 12, 18].map((h) => {
        const at = point((h / 24) * 360 - 90, R + RING / 2 + 18);
        return <text key={h} x={at.x} y={at.y + 3} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.7)">{h === 0 ? '12 am' : h === 12 ? '12 pm' : h < 12 ? `${h} am` : `${h - 12} pm`}</text>;
      })}
      <path d={arc(p.sunrise, p.sunset)} fill="none" stroke="rgba(255,215,0,0.16)" strokeWidth={RING} />
      {windows.map(({ id, w }) => (
        <motion.path key={id} d={arc(w.start, w.end)} fill="none" stroke={WINDOW_COLOUR[id]} strokeWidth={RING - 6} strokeLinecap="round"
          initial={{ opacity: 0 }} animate={{ opacity: 0.9 }} transition={{ duration: 0.6 }} />
      ))}
      {hand !== null && (() => {
        const p1 = point(hand, 26), p2 = point(hand, R + RING / 2 - 1);
        return (
          <g>
            <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#FFD700" strokeWidth="1.8" />
            <circle cx={C} cy={C} r="4" fill="#FFD700" />
          </g>
        );
      })()}
      <text x={C} y={C - 6} textAnchor="middle" fontSize="12" fill="rgba(255,255,255,0.9)">{WEEKDAYS[p.vara]}</text>
      <text x={C} y={C + 11} textAnchor="middle" fontSize="9.5" fill="rgba(255,255,255,0.7)">{formatLongDate(day.date)}</text>
    </svg>
  );
}
