import { useEffect, useMemo, useRef, useState } from 'react';
import { Grid3x3, Pencil, RotateCcw } from 'lucide-react';
import {
  carefulNumbers, compareYMD, dashaGrid, dashaOn, formatYMD, lifeAreaSteps, lifeAreas, loShu, parseISODate, readingSummary, remedyPriorities,
  toISODate, windowOutlook, yearFocus, yearOutlook, type DashaNow, type LoShuResult,
} from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { NUMBERS } from '@/data/numerology/numbers';
import { loShuPrint } from '@/lib/print/numerologyPrint';
import { takeResultLink } from '@/lib/resultLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TabPanel, Tabs, type TabItem } from '@/components/ui/Tabs';
import { BirthFields, type GenderChoice } from '@/components/numerology/BirthFields';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { SummaryPanel, type TabId } from '@/components/numerology/loshu/SummaryPanel';
import { GridPanel } from '@/components/numerology/loshu/GridPanel';
import { AreasPanel } from '@/components/numerology/loshu/AreasPanel';
import { YearsPanel } from '@/components/numerology/loshu/YearsPanel';
import { LoShuRemedies } from '@/components/numerology/loshu/Remedies';
import { LuckyPanel } from '@/components/numerology/loshu/LuckyPanel';
import { MorePanel } from '@/components/numerology/loshu/MorePanel';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const TAB_LABEL: Record<TabId, string> = {
  summary: 'Summary', grid: 'Grid reading', areas: 'Career, love, health', years: 'Years ahead', remedies: 'Remedies', lucky: 'Numbers and dates', more: 'Reference',
};

export default function LoshuGridTool() {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderChoice>('');
  const [result, setResult] = useState<LoShuResult | null>(null);
  const [now, setNow] = useState<DashaNow | null>(null);
  const [editing, setEditing] = useState(true);
  const [tab, setTab] = useState<TabId>('summary');
  const heading = useRef<HTMLHeadingElement>(null);
  const tabsTop = useRef<HTMLDivElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const compute = (iso: string, g: GenderChoice) => {
    const date = parseISODate(iso);
    if (!date) return;
    setResult(loShu(date, g || null));
    // The dasha periods are read for today's date on this device.
    const today = parseISODate(localDateKey());
    setNow(today && compareYMD(today, date) >= 0 ? dashaOn(date, today) : null);
    setEditing(false);
    setTab('summary');
  };

  // A shared link reopens the tool with its result.
  useEffect(() => {
    const link = takeResultLink();
    if (!link) return;
    setDob(link.dob);
    setGender(link.gender ?? '');
    compute(link.dob, link.gender ?? '');
  }, []);

  // Move focus to the report so keyboard and screen-reader users land on it.
  useEffect(() => { if (result && !editing) heading.current?.focus(); }, [result, editing]);

  useShareResult(result ? `My Lo Shu grid: Driver ${result.driver} (${NUMBERS[result.driver].planet}), Conductor ${result.conductor} (${NUMBERS[result.conductor].planet}).` : null);

  const period = useMemo(() => (result && now ? dashaGrid(result, [now.maha.number, now.antar.number]) : null), [result, now]);
  const printable = useMemo(() => (result ? loShuPrint(result, now, parseISODate(localDateKey())!) : null), [result, now]);
  const areas = useMemo(() => (result ? lifeAreas(result) : null), [result]);
  const summary = useMemo(() => (result ? readingSummary(result) : null), [result]);
  const outlook = useMemo(() => (result && now ? yearOutlook(result, now.antar.year, 5) : []), [result, now]);
  const windows = useMemo(() => (result && now ? windowOutlook(result, now) : []), [result, now]);
  const focus = useMemo(() => (outlook[0] ? yearFocus(outlook[0].areas) : null), [outlook]);
  const priorities = useMemo(() => (result ? remedyPriorities(result) : []), [result]);
  const careful = useMemo(() => (result ? carefulNumbers(result.driver, result.conductor) : null), [result]);
  const today = now?.on ?? null;

  const save = () => {
    if (!result) return;
    const kua = result.kua ? ` · Kua ${result.kua.mansion}` : '';
    const dasha = now ? ` · Maha Dasha ${now.maha.number}, Antar Dasha ${now.antar.number}` : '';
    saveReading({
      toolId: 'loshu-grid', toolName: 'Lo Shu Grid',
      summary: `Driver ${result.driver} (${NUMBERS[result.driver].planet}) · Conductor ${result.conductor} (${NUMBERS[result.conductor].planet})${kua} · Missing: ${result.full.missing.length ? result.full.missing.join(', ') : 'none'}${dasha}`,
    });
    notify('Lo Shu grid saved on this device');
  };

  const go = (next: TabId, anchor?: string) => {
    setTab(next);
    requestAnimationFrame(() => (anchor ? document.getElementById(anchor) : tabsTop.current)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const tabs: TabItem[] = (['summary', 'grid', 'areas', ...(now ? ['years' as const] : []), 'remedies', 'lucky', 'more'] as TabId[])
    .map((id) => ({ id, label: TAB_LABEL[id] }));

  const showForm = editing || !result;

  return (
    <div className="space-y-6">
      {showForm ? (
        <Card className="p-6 sm:p-8">
          <div className="sm:max-w-xl">
            <BirthFields idPrefix="loshu" dob={dob} onDob={setDob} gender={gender} onGender={setGender} />
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => compute(dob, gender)} disabled={!dob}>
              <Grid3x3 className="mr-2 h-4 w-4" /> Make my grid
            </Button>
            {result && (
              <Button variant="ghost" onClick={() => { setDob(toISODate(result.date)); setGender(result.gender ?? ''); setEditing(false); }}>
                Cancel
              </Button>
            )}
          </div>
        </Card>
      ) : result && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 ref={heading} tabIndex={-1} className="font-heading text-h4 text-white outline-none">Your Lo Shu report</h3>
              <p className="mt-1 text-sm text-white/75" data-testid="loshu-subject">
                Born {formatYMD(result.date)}{result.gender ? ` · ${result.gender === 'male' ? 'Male' : 'Female'}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit details</Button>
              <Button variant="ghost" size="sm" onClick={() => { setResult(null); setNow(null); setDob(''); setGender(''); setEditing(true); }}>
                <RotateCcw className="h-4 w-4" /> Start again
              </Button>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
            <ResultActions toolSlug="loshu-grid" link={{ dob: toISODate(result.date), gender: result.gender }} onSave={save} saveLabel="Save" compact />
          </div>
        </Card>
      )}

      {result && !showForm && areas && summary && careful && (
        <div className="space-y-5">
          {/* The site header is fixed and 69px tall at every width, so the bar sticks at 68px: flush beneath it, with no gap for the page to show through. */}
          <div ref={tabsTop} className="sticky top-[68px] z-20 -mx-1 scroll-mt-24 bg-cosmic-darker/95 px-1 py-2 backdrop-blur">
            <div className="relative">
              <Tabs idPrefix="loshu" label="Parts of your report" items={tabs} value={tab} onChange={(id) => setTab(id as TabId)} />
              {/* A fade at the right edge on a phone says there are more tabs than fit. */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-y-1 right-1 w-10 rounded-r-lg bg-gradient-to-l from-cosmic-darker to-transparent sm:hidden" />
            </div>
          </div>

          <TabPanel idPrefix="loshu" id="summary" value={tab}>
            <SummaryPanel result={result} now={now} support={areas} summary={summary} priorities={priorities} onGo={go} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="grid" value={tab}>
            <GridPanel result={result} now={now} period={period} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="areas" value={tab}>
            <AreasPanel support={areas} />
          </TabPanel>
          {now && period && focus && (
            <TabPanel idPrefix="loshu" id="years" value={tab}>
              <YearsPanel result={result} now={now} period={period} years={outlook} windows={windows} focus={focus} />
            </TabPanel>
          )}
          <TabPanel idPrefix="loshu" id="remedies" value={tab}>
            <LoShuRemedies result={result} priorities={priorities} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="lucky" value={tab}>
            <LuckyPanel result={result} today={today} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="more" value={tab}>
            <MorePanel result={result} steps={[...result.steps, ...(now?.steps ?? []), ...lifeAreaSteps(result, now)]} />
          </TabPanel>
        </div>
      )}

      {printable && <PrintReport report={printable} />}
    </div>
  );
}
