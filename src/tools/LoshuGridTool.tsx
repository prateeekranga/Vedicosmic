import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarClock, Compass, Grid3x3, Heart, Lock, Pencil, Printer, RotateCcw, Smartphone, Sparkles, Star } from 'lucide-react';
import {
  analyseMobile, carefulNumbers, compareYMD, dashaGrid, dashaOn, formatYMD, lifeAreaSteps, lifeAreas, loShu, marriageListStart, marriageSteps,
  marriageYears, moneyReading, nameReading, normalizeMobile, parseISODate, readingSummary, remedyPriorities, toISODate, windowOutlook, yearFocus,
  yearOutlook, type DashaNow, type LoShuResult,
} from '@/engine/numerology';
import { localDateKey } from '@/engine/time';
import { NUMBERS } from '@/data/numerology/numbers';
import { loShuPrint } from '@/lib/print/numerologyPrint';
import { takeResultLink } from '@/lib/resultLink';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { DateSelect } from '@/components/ui/DateSelect';
import { TabPanel, Tabs, type TabItem } from '@/components/ui/Tabs';
import type { GenderChoice } from '@/components/numerology/BirthFields';
import { ResultActions } from '@/components/numerology/ResultActions';
import { PrintReport } from '@/components/numerology/PrintReport';
import { SummaryPanel, type TabId } from '@/components/numerology/loshu/SummaryPanel';
import { GridPanel } from '@/components/numerology/loshu/GridPanel';
import { AreasPanel } from '@/components/numerology/loshu/AreasPanel';
import { YearsPanel } from '@/components/numerology/loshu/YearsPanel';
import { LoShuRemedies } from '@/components/numerology/loshu/Remedies';
import { LuckyPanel } from '@/components/numerology/loshu/LuckyPanel';
import { MorePanel } from '@/components/numerology/loshu/MorePanel';
import { MarriagePanel } from '@/components/numerology/loshu/MarriagePanel';
import { PersonPanel } from '@/components/numerology/loshu/PersonPanel';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';
import { useShareResult } from '@/contexts/ShareContext';
import { useToast } from '@/contexts/ToastContext';

const TAB_LABEL: Record<TabId, string> = {
  summary: 'Summary', grid: 'Grid reading', areas: 'Career, money, love, health', years: 'Years ahead', marriage: 'Marriage years',
  remedies: 'Remedies', person: 'Name and mobile', lucky: 'Numbers and dates', more: 'Reference',
};

/** The name and mobile number typed with the date, kept beside the result (never in a link). */
interface Extras { name: string; mobile: string }
const NO_EXTRAS: Extras = { name: '', mobile: '' };

const INCLUDES = [
  { icon: Grid3x3, text: 'Your Lo Shu grid, its planes and Raj Yogs' },
  { icon: Compass, text: 'Career, money, love and health' },
  { icon: CalendarClock, text: 'The years ahead and your dasha periods' },
  { icon: Heart, text: 'Years that favour marriage' },
  { icon: Sparkles, text: 'Remedies for every missing and repeated number' },
  { icon: Smartphone, text: 'Your name number and mobile number fit' },
  { icon: Star, text: 'Lucky numbers, dates and colours for your pair' },
  { icon: Printer, text: 'A printable report' },
] as const;

/** Beside the form on a wide screen: what the report holds, so the space says something useful. */
function ReportIncludes() {
  return (
    <aside className="mt-8 border-t border-white/10 pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0" aria-label="What your report includes">
      <p className="text-xs font-medium uppercase tracking-wider text-gold-soft">Your report includes</p>
      <ul className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {INCLUDES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm leading-snug text-white/80">
            <Icon className="mt-0.5 h-4 w-4 flex-none text-gold-soft" aria-hidden="true" />{text}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-white/55">Only the date of birth is needed. Gender adds the Kua number; a name and mobile number add their own checks.</p>
    </aside>
  );
}

export default function LoshuGridTool() {
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<GenderChoice>('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [extras, setExtras] = useState<Extras>(NO_EXTRAS);
  const [result, setResult] = useState<LoShuResult | null>(null);
  const [now, setNow] = useState<DashaNow | null>(null);
  const [editing, setEditing] = useState(true);
  const [tab, setTab] = useState<TabId>('summary');
  const heading = useRef<HTMLHeadingElement>(null);
  const tabsTop = useRef<HTMLDivElement>(null);
  const { saveReading } = useDeviceStore();
  const { notify } = useToast();

  const compute = (iso: string, g: GenderChoice, more: Extras = NO_EXTRAS) => {
    const date = parseISODate(iso);
    if (!date) return;
    setResult(loShu(date, g || null));
    setExtras({ name: more.name.trim(), mobile: more.mobile.trim() });
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
  const named = useMemo(() => (result && extras.name ? nameReading(extras.name, result) : null), [result, extras.name]);
  const phone = useMemo(() => (result && extras.mobile
    ? analyseMobile(extras.mobile, { date: result.date, gender: result.gender, name: extras.name || undefined })
    : null), [result, extras]);
  const printable = useMemo(() => (result
    ? loShuPrint(result, now, parseISODate(localDateKey())!, { name: extras.name || null, named, mobile: phone })
    : null), [result, now, extras.name, named, phone]);
  const areas = useMemo(() => (result ? lifeAreas(result) : null), [result]);
  const summary = useMemo(() => (result ? readingSummary(result) : null), [result]);
  const outlook = useMemo(() => (result && now ? yearOutlook(result, now.antar.year, 5) : []), [result, now]);
  const windows = useMemo(() => (result && now ? windowOutlook(result, now) : []), [result, now]);
  const focus = useMemo(() => (outlook[0] ? yearFocus(outlook[0].areas) : null), [outlook]);
  const priorities = useMemo(() => (result ? remedyPriorities(result) : []), [result]);
  const careful = useMemo(() => (result ? carefulNumbers(result.driver, result.conductor) : null), [result]);
  const today = now?.on ?? null;
  const money = useMemo(() => (result ? moneyReading(result) : null), [result]);
  // Marriage years are listed from this year (or the 18th birthday), by this device's calendar.
  const thisYear = parseISODate(localDateKey())!.y;
  const marriage = useMemo(() => (result ? marriageYears(result.date, marriageListStart(result.date, thisYear)) : []), [result, thisYear]);
  const nextMarriage = marriage.filter((y) => y.match).slice(0, 3).map((y) => y.year);

  const save = () => {
    if (!result) return;
    const kua = result.kua ? ` · Kua ${result.kua.mansion}` : '';
    const dasha = now ? ` · Maha Dasha ${now.maha.number}, Antar Dasha ${now.antar.number}` : '';
    const nameNo = named ? ` · Name number ${named.chaldean.compound}/${named.chaldean.root}` : '';
    const wed = nextMarriage.length ? ` · Marriage years ${nextMarriage.join(', ')}` : '';
    saveReading({
      toolId: 'loshu-grid', toolName: 'Lo Shu Grid',
      summary: `Driver ${result.driver} (${NUMBERS[result.driver].planet}) · Conductor ${result.conductor} (${NUMBERS[result.conductor].planet})${kua} · Missing: ${result.full.missing.length ? result.full.missing.join(', ') : 'none'}${dasha}${nameNo}${wed}`,
    });
    notify('Lo Shu grid saved on this device');
  };

  const go = (next: TabId, anchor?: string) => {
    setTab(next);
    requestAnimationFrame(() => (anchor ? document.getElementById(anchor) : tabsTop.current)?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const tabs: TabItem[] = (['summary', 'grid', 'areas', ...(now ? ['years' as const] : []), 'marriage', 'remedies', 'person', 'lucky', 'more'] as TabId[])
    .map((id) => ({ id, label: TAB_LABEL[id] }));

  const showForm = editing || !result;
  const mobileBad = !!mobile.trim() && !normalizeMobile(mobile).valid;
  const reset = () => { setResult(null); setNow(null); setDob(''); setGender(''); setName(''); setMobile(''); setExtras(NO_EXTRAS); setEditing(true); };

  return (
    <div className="space-y-6">
      {showForm ? (
        <Card className="p-6 sm:p-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,42rem)_minmax(0,1fr)] lg:gap-10">
            <div>
              {/* One four-column grid for every field, so each box lines up with the one above it: the date takes three
                  columns (its own three boxes match them exactly) and gender the fourth; name and mobile take two each. */}
              <div className="grid gap-x-3 gap-y-5 sm:grid-cols-4">
                <DateSelect value={dob} onChange={setDob} className="sm:col-span-3" />
                <div>
                  <Select id="loshu-gender" label="Gender (optional)" value={gender} aria-describedby="loshu-gender-help"
                    onChange={(e) => setGender(e.target.value as GenderChoice)}>
                    <option value="">Not given</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                  <p id="loshu-gender-help" className="mt-1.5 text-xs text-white/55">Only for the Kua number.</p>
                </div>
                <div className="sm:col-span-2">
                  <Input id="loshu-name" label="Full name (optional)" autoComplete="off" spellCheck={false} value={name}
                    aria-describedby="loshu-name-help" onChange={(e) => setName(e.target.value)} />
                  <p id="loshu-name-help" className="mt-1.5 text-xs text-white/55">As you use it, in English letters.</p>
                </div>
                <div className="sm:col-span-2">
                  <Input id="loshu-mobile" label="Mobile number (optional)" type="tel" inputMode="tel" autoComplete="off" value={mobile}
                    error={mobileBad ? 'Seven to fifteen digits, please.' : undefined}
                    aria-describedby="loshu-mobile-help" onChange={(e) => setMobile(e.target.value)} />
                  <p id="loshu-mobile-help" className="mt-1.5 text-xs text-white/55">Checked against your date of birth.</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-white/10 pt-5">
                <Button onClick={() => compute(dob, gender, { name, mobile: mobileBad ? '' : mobile })} disabled={!dob}>
                  <Grid3x3 className="mr-2 h-4 w-4" /> Make my grid
                </Button>
                {result && (
                  <Button variant="ghost" onClick={() => { setDob(toISODate(result.date)); setGender(result.gender ?? ''); setName(extras.name); setMobile(extras.mobile); setEditing(false); }}>
                    Cancel
                  </Button>
                )}
                <p className="flex items-center gap-1.5 text-xs text-white/55"><Lock className="h-3.5 w-3.5 flex-none" aria-hidden="true" />Worked out on this device. A shared link never carries the name or number.</p>
              </div>
            </div>
            <ReportIncludes />
          </div>
        </Card>
      ) : result && (
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 ref={heading} tabIndex={-1} className="font-heading text-h4 text-white outline-none">Your Lo Shu report</h3>
              <p className="mt-1 text-sm text-white/75" data-testid="loshu-subject">
                {extras.name ? `${extras.name} · ` : ''}Born {formatYMD(result.date)}{result.gender ? ` · ${result.gender === 'male' ? 'Male' : 'Female'}` : ''}
                {phone ? ` · Mobile ending ${phone.digits.slice(-4).join('')}` : ''}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}><Pencil className="h-4 w-4" /> Edit details</Button>
              <Button variant="ghost" size="sm" onClick={reset}>
                <RotateCcw className="h-4 w-4" /> Start again
              </Button>
            </div>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3 sm:mt-4 sm:pt-4">
            <ResultActions toolSlug="loshu-grid" link={{ dob: toISODate(result.date), gender: result.gender }} onSave={save} saveLabel="Save" compact />
          </div>
        </Card>
      )}

      {result && !showForm && areas && summary && careful && money && (
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
            <SummaryPanel result={result} now={now} support={areas} money={money} summary={summary} priorities={priorities} marriage={nextMarriage} onGo={go} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="grid" value={tab}>
            <GridPanel result={result} now={now} period={period} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="areas" value={tab}>
            <AreasPanel result={result} support={areas} money={money} />
          </TabPanel>
          {now && period && focus && (
            <TabPanel idPrefix="loshu" id="years" value={tab}>
              <YearsPanel result={result} now={now} period={period} years={outlook} windows={windows} focus={focus} />
            </TabPanel>
          )}
          <TabPanel idPrefix="loshu" id="marriage" value={tab}>
            <MarriagePanel result={result} years={marriage} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="remedies" value={tab}>
            <LoShuRemedies result={result} priorities={priorities} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="person" value={tab}>
            <PersonPanel result={result} name={extras.name} named={named} phone={phone} onEdit={() => setEditing(true)} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="lucky" value={tab}>
            <LuckyPanel result={result} today={today} />
          </TabPanel>
          <TabPanel idPrefix="loshu" id="more" value={tab}>
            <MorePanel result={result} steps={[...result.steps, ...(now?.steps ?? []), ...lifeAreaSteps(result, now), ...marriageSteps(result.date, marriage[0]), ...(named?.chaldean.steps ?? [])]} />
          </TabPanel>
        </div>
      )}

      {printable && <PrintReport report={printable} />}
    </div>
  );
}
