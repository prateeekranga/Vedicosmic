import { Link } from 'react-router-dom';
import { CalendarDays, Palette, Sparkles } from 'lucide-react';
import { favourableDates, type Digit, type MobileResult } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { NODE_DAY, REMEDY_INTRO } from '@/data/numerology/mobileText';
import { Card } from '@/components/ui/Card';

const dayOf = (d: Digit) => NUMBERS[d].day ?? NODE_DAY[d] ?? null;
/** "the Sun" and "the Moon" read naturally in a sentence; the other planets take no article. */
const the = (planet: string) => (planet === 'Sun' || planet === 'Moon' ? `the ${planet}` : planet);
const list = (xs: (string | number)[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : String(xs[0] ?? ''));

/**
 * The customs tradition suggests around a phone number: colours for the cover or wallpaper from
 * the Mulank's planet, the mantra of the number's own planet, and dates to start a new number.
 * With a level of 4 or 5 the card says nothing needs correcting and keeps only the lucky details.
 */
export function MobileRemedies({ result }: { result: MobileResult }) {
  const b = result.withBirth;
  if (!b) return null;
  const weak = b.compatibility.level <= 3;
  const mulank = NUMBERS[b.driver];
  const own = NUMBERS[result.root];
  const ownDay = dayOf(result.root);
  const mulankDay = dayOf(b.driver);
  const dates = favourableDates(b.driver);

  const items = [
    {
      icon: Palette, title: 'Phone cover or wallpaper', link: false,
      text: `${list(mulank.colours)}: the colours of ${the(mulank.planet)}, the planet of your Mulank ${b.driver}.`,
    },
    ...(weak ? [{
      icon: Sparkles, title: 'Mantra',
      text: `“${own.mantra}”, 108 times${ownDay ? ` on a ${ownDay}` : ''}: the mantra of ${the(own.planet)}, the planet of this number’s root ${result.root}.`,
      link: true,
    }] : []),
    {
      icon: CalendarDays, title: 'Starting a new number', link: false,
      text: `Dates ${list(dates.own)} of a month carry your own number; ${list(dates.friendly)} carry friendly numbers.${mulankDay ? ` ${mulankDay}, the day of ${the(mulank.planet)}, is the traditional choice.` : ''}`,
    },
  ];

  return (
    <Card className="p-6 sm:p-8">
      <div data-testid="mobile-remedies">
        <p className="max-w-3xl text-body leading-relaxed text-white/75">{weak ? REMEDY_INTRO.weak : REMEDY_INTRO.good}</p>
        <ul className="mt-5 grid gap-3 md:grid-cols-3">
          {items.map(({ icon: Icon, title, text, link }) => (
            <li key={title} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="flex items-center gap-2 font-medium text-white"><Icon className="h-4 w-4 text-gold-soft" aria-hidden="true" />{title}</p>
              <p className="mt-2 text-sm leading-relaxed text-white/70">{text}</p>
              {link && (
                <Link to="/tools/mantra-timer" className="mt-2 inline-block text-sm text-brand-cyan-soft underline underline-offset-2 hover:text-white">
                  Keep count with the Japa Counter
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}
