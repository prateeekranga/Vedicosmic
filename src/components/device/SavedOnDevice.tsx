import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useDeviceStore } from '@/contexts/DeviceStoreContext';

const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

/** Everything VediCosmic keeps in this browser, with a way to delete each item or all of it. */
export function SavedOnDevice() {
  const { data, streakNow, deleteReading, deleteJournalEntry, clearAll } = useDeviceStore();
  const [confirming, setConfirming] = useState(false);
  const hasAnything = data.savedReadings.length > 0 || data.journalEntries.length > 0
    || data.crystalKit.length > 0 || data.practiceStreak.totalSessions > 0;

  return (
    <Card className="p-6">
      <h2 className="font-heading text-h4 text-white">Saved on this device</h2>
      <p className="mt-1 text-sm text-white/55">
        Kept in this browser’s storage only. Nothing here is sent to us, and clearing the site’s data in your browser
        also removes it.
      </p>

      {!hasAnything && <p className="mt-4 text-sm text-white/45">Nothing is saved yet.</p>}

      {data.practiceStreak.totalSessions > 0 && (
        <p className="mt-4 text-sm text-white/70">
          Practice: {streakNow} day{streakNow === 1 ? '' : 's'} in a row · {data.practiceStreak.totalSessions} session{data.practiceStreak.totalSessions === 1 ? '' : 's'} logged
        </p>
      )}
      {data.crystalKit.length > 0 && (
        <p className="mt-2 text-sm text-white/70">Crystal kit: {data.crystalKit.length} stone{data.crystalKit.length === 1 ? '' : 's'}</p>
      )}

      {data.savedReadings.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-medium text-white/80">Readings</h3>
          <ul className="mt-2 space-y-2">
            {data.savedReadings.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl bg-cosmic-light/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm text-white">{r.toolName} <span className="text-white/40">· {fmtDate(r.date)}</span></p>
                  <p className="mt-0.5 text-xs leading-relaxed text-white/55">{r.summary}</p>
                </div>
                <button onClick={() => deleteReading(r.id)} aria-label={`Delete ${r.toolName} reading from ${fmtDate(r.date)}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/5 hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {data.journalEntries.length > 0 && (
        <>
          <h3 className="mt-5 text-sm font-medium text-white/80">Reflections</h3>
          <ul className="mt-2 space-y-2">
            {data.journalEntries.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-3 rounded-xl bg-cosmic-light/30 p-3">
                <div className="min-w-0">
                  <p className="text-xs text-white/40">{fmtDate(e.date)}</p>
                  <p className="mt-0.5 whitespace-pre-line text-sm leading-relaxed text-white/70">{e.content}</p>
                </div>
                <button onClick={() => deleteJournalEntry(e.id)} aria-label={`Delete reflection from ${fmtDate(e.date)}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-white/40 hover:bg-white/5 hover:text-error">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      {hasAnything && (
        <div className="mt-6 border-t border-white/8 pt-4">
          {confirming ? (
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-white/70">Delete everything saved on this device?</span>
              <Button size="sm" variant="outline" onClick={() => { clearAll(); setConfirming(false); }}>Yes, delete everything</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete everything on this device
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
