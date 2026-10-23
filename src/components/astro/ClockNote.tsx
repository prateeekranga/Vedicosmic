import { offsetLabel, zoneOffsetMinutes, type ResolvedTime } from '@/engine/time';
import { AstroNote } from './AstroNote';

/** Explains a birth time that fell in a clock change, and offers the other reading of a repeated time. */
export function ClockNote({ resolved, time, zone, useLater, onUseLater }: {
  resolved: ResolvedTime;
  time: string;
  zone: string;
  useLater: boolean;
  onUseLater: (later: boolean) => void;
}) {
  if (resolved.kind === 'skipped') {
    return (
      <AstroNote>
        The clocks went forward on this date, so {time} never showed on clocks there. The chart uses the time just after
        the change (UTC{offsetLabel(resolved.offsetMinutes)}). Please check the record.
      </AstroNote>
    );
  }
  if (resolved.kind === 'repeated' && resolved.laterUtcMs !== undefined) {
    const first = zoneOffsetMinutes(zone, resolved.utcMs);
    const second = zoneOffsetMinutes(zone, resolved.laterUtcMs);
    return (
      <AstroNote>
        The clocks went back on this date, so {time} happened twice. This chart uses the {useLater ? 'second' : 'first'} time
        (UTC{offsetLabel(useLater ? second : first)}).{' '}
        <button type="button" className="underline underline-offset-2" onClick={() => onUseLater(!useLater)}>
          Use the {useLater ? 'first' : 'second'} instead
        </button>
      </AstroNote>
    );
  }
  return null;
}
