import { Briefcase, Heart, HeartPulse } from 'lucide-react';
import { AREA_IDS, LOSHU_LINES, type AreaId, type AreaSupport } from '@/engine/numerology';
import { NUMBERS } from '@/data/numerology/numbers';
import { LINE_STATUS_LABEL, LINE_TEXT, repeatReading } from '@/data/numerology/loshuText';
import {
  AREA_BAND_TEXT, AREA_NUMBER_TEXT, AREA_STEP_NONE, AREA_TEXT, FOLD_OWN_AREAS, HEALTH_NOTE, OWN_AREAS_NOTE, PANEL_TEXT,
} from '@/data/numerology/lifeAreaText';
import { Card } from '@/components/ui/Card';
import { CountDots, DigitChip, Fold, PanelSection } from './bits';

const ICON = { career: Briefcase, relationships: Heart, health: HeartPulse } as const;

/**
 * Career, relationships and health side by side. Each card shows how many of the area's five key
 * numbers are in the grid (as the numbers themselves), the supporting line, one step for the most
 * important gap, and a fold with each number's reading. The points arithmetic is in a fold of its
 * own, labelled as this page's method.
 */
export function AreasPanel({ support }: { support: Record<AreaId, AreaSupport> }) {
  return (
    <PanelSection title="Career, relationships and health" lede={PANEL_TEXT.areas} id="loshu-areas" testId="loshu-areas">
      <div className="grid gap-4 lg:grid-cols-3">
        {AREA_IDS.map((id) => {
          const s = support[id];
          const text = AREA_NUMBER_TEXT[id];
          const Icon = ICON[id];
          const firstGap = s.missingKeys[0];
          return (
            <Card key={id} className="flex flex-col p-5" >
              <article className="flex h-full flex-col" data-testid={`area-${id}`}>
                <h4 className="flex items-center gap-2 font-heading text-lg text-white">
                  <Icon className="h-5 w-5 text-gold-soft" aria-hidden="true" />{AREA_TEXT[id].name}
                </h4>
                <p className="text-xs text-white/65">{AREA_TEXT[id].blurb}</p>

                <p className="mt-4 flex items-center gap-2">
                  <CountDots value={s.presentCount} band={s.band} />
                  <span className="text-sm text-white">{s.presentCount} of {s.keyCount} key numbers present</span>
                </p>
                <p className="mt-0.5 text-xs text-white/70">{s.missingKeys.length ? `To build: ${s.missingKeys.join(', ')}` : 'All five are present'}</p>
                <p className="mt-3 text-sm leading-relaxed text-white/75">{AREA_BAND_TEXT[id][s.band]}</p>

                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Key numbers for ${AREA_TEXT[id].name.toLowerCase()}`}>
                  {s.keys.map((k) => (
                    <li key={k.digit} title={text[k.digit]!.role}><DigitChip digit={k.digit} count={k.count} missing={!k.present} /></li>
                  ))}
                </ul>
                <ul className="mt-3 space-y-1 text-xs text-white/70">
                  {s.lines.map((l) => (
                    <li key={l.id}>{LINE_TEXT[l.id].name} ({LOSHU_LINES.find((x) => x.id === l.id)!.cells.join('-')}): {LINE_STATUS_LABEL[l.status].toLowerCase()}</li>
                  ))}
                </ul>

                <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm leading-relaxed">
                  {firstGap
                    ? <p className="text-gold-pale"><span className="font-medium">Try: </span>{text[firstGap]!.habit}</p>
                    : <p className="text-white/75">{AREA_STEP_NONE}</p>}
                </div>
                {id === 'health' && <p className="mt-3 text-xs leading-relaxed text-white/65">{HEALTH_NOTE}</p>}

                <Fold title="Read each number" className="mt-4" testId={`area-${id}-detail`}>
                  <ul className="space-y-3">
                    {s.keys.map((k) => {
                      const t = text[k.digit]!;
                      return (
                        <li key={k.digit} className="text-sm leading-relaxed text-white/75">
                          <p className="text-white"><span className="font-medium">{t.role}</span><span className="text-white/65"> · {NUMBERS[k.digit].planet}</span></p>
                          <p className="mt-0.5">{k.present ? t.gives : t.gap}</p>
                          {k.count >= 3 && <p className="mt-0.5 text-white/65">{repeatReading(k.digit, k.count)}</p>}
                          {!k.present && <p className="mt-0.5 text-gold-pale"><span className="font-medium">Try: </span>{t.habit}</p>}
                        </li>
                      );
                    })}
                  </ul>
                </Fold>
              </article>
            </Card>
          );
        })}
      </div>

      <Fold title={FOLD_OWN_AREAS} className="mt-4" testId="area-working">
        <p className="text-sm leading-relaxed text-white/70">{OWN_AREAS_NOTE}</p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-white/75">
          {AREA_IDS.map((id) => <li key={id}><span className="font-medium text-white">{AREA_TEXT[id].name}: </span>{support[id].working}</li>)}
        </ul>
      </Fold>
    </PanelSection>
  );
}
