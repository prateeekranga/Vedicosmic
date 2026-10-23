import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { DeviceData, JournalEntry, PracticeStreak, SavedReading } from '@/types/device.types';

/**
 * Progress kept in this browser only: practice streak, crystal kit, and — after the visitor
 * agrees — saved readings and journal reflections. Nothing here is sent anywhere, and there are
 * no accounts or passwords. Replaces the old browser-only "sign in", whose data is migrated once.
 */
const KEY = 'vc:device:v1';
const LEGACY_SESSION_KEY = 'vedicosmic:auth';
const LEGACY_USERS_KEY = 'vedicosmic:users';

const EMPTY_STREAK: PracticeStreak = { lastSessionDate: '', currentStreak: 0, totalSessions: 0, totalRepetitions: 0 };
const EMPTY: DeviceData = { consented: false, savedReadings: [], journalEntries: [], crystalKit: [], practiceStreak: EMPTY_STREAK };

/** Local calendar date as YYYY-MM-DD, so a "day" starts at the visitor's midnight, not UTC's. */
export function localDateKey(d: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function yesterdayKey(): string {
  const now = new Date();
  return localDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
}

type LegacyUser = Partial<Pick<DeviceData, 'savedReadings' | 'journalEntries' | 'crystalKit'>> & { mantraStreak?: PracticeStreak };

/** One-time move of data saved under the old browser-only accounts. Merges every local
 *  account (they all lived on this device), then deletes the stored password hashes. */
function migrateLegacy(): DeviceData | null {
  let users: LegacyUser[] = [];
  try {
    const all = JSON.parse(localStorage.getItem(LEGACY_USERS_KEY) ?? '{}') as Record<string, { user?: LegacyUser }>;
    users = Object.values(all).map((r) => r.user).filter((u): u is LegacyUser => !!u);
    const session = JSON.parse(localStorage.getItem(LEGACY_SESSION_KEY) ?? '{}') as { user?: LegacyUser };
    if (session.user) users.push(session.user);
  } catch { /* unreadable legacy data: nothing to migrate */ }
  if (!users.length && localStorage.getItem(LEGACY_USERS_KEY) === null && localStorage.getItem(LEGACY_SESSION_KEY) === null) return null;

  const byId = <T extends { id: string }>(items: T[]) => [...new Map(items.map((i) => [i.id, i])).values()];
  const streaks = users.map((u) => u.mantraStreak).filter((s): s is PracticeStreak => !!s);
  const best = streaks.sort((a, b) => b.lastSessionDate.localeCompare(a.lastSessionDate))[0];
  const migrated: DeviceData = {
    ...EMPTY,
    savedReadings: byId(users.flatMap((u) => u.savedReadings ?? [])),
    journalEntries: byId(users.flatMap((u) => u.journalEntries ?? [])),
    crystalKit: [...new Set(users.flatMap((u) => u.crystalKit ?? []))],
    practiceStreak: best ? {
      ...best,
      totalSessions: streaks.reduce((s, x) => s + x.totalSessions, 0),
      totalRepetitions: streaks.reduce((s, x) => s + x.totalRepetitions, 0),
    } : EMPTY_STREAK,
  };
  // Readings and journals were saved on purpose under the old account, so keep them.
  migrated.consented = migrated.savedReadings.length > 0 || migrated.journalEntries.length > 0;
  try {
    localStorage.removeItem(LEGACY_USERS_KEY);
    localStorage.removeItem(LEGACY_SESSION_KEY);
  } catch { /* ignore */ }
  return migrated;
}

function load(): DeviceData {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored) return { ...EMPTY, ...(JSON.parse(stored) as Partial<DeviceData>) };
    return migrateLegacy() ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

interface DeviceStoreValue {
  data: DeviceData;
  /** Days in a row, counting today or yesterday as unbroken; 0 once a day is missed. */
  streakNow: number;
  giveConsent: () => void;
  /** Saves only when the visitor has consented (use SaveOnDeviceButton to ask first). */
  saveReading: (r: Omit<SavedReading, 'id' | 'date'>) => void;
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'date'>) => void;
  deleteReading: (id: string) => void;
  deleteJournalEntry: (id: string) => void;
  toggleCrystal: (crystalId: string) => void;
  recordPracticeSession: (repetitions: number) => void;
  /** Removes everything VediCosmic stored in this browser, including consent. */
  clearAll: () => void;
}

const DeviceStoreContext = createContext<DeviceStoreValue | null>(null);

export function DeviceStoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DeviceData>(load);

  // Write nothing until there is something worth keeping, so most visits leave no trace.
  useEffect(() => {
    const empty = !data.consented && !data.savedReadings.length && !data.journalEntries.length
      && !data.crystalKit.length && data.practiceStreak.totalSessions === 0;
    try {
      if (empty) localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, JSON.stringify(data));
    } catch { /* storage full or blocked */ }
  }, [data]);

  const giveConsent = useCallback(() => setData((d) => ({ ...d, consented: true })), []);

  const saveReading = useCallback((r: Omit<SavedReading, 'id' | 'date'>) => {
    setData((d) => d.consented
      ? { ...d, savedReadings: [{ ...r, id: crypto.randomUUID(), date: new Date().toISOString() }, ...d.savedReadings].slice(0, 50) }
      : d);
  }, []);

  const addJournalEntry = useCallback((e: Omit<JournalEntry, 'id' | 'date'>) => {
    setData((d) => d.consented
      ? { ...d, journalEntries: [{ ...e, id: crypto.randomUUID(), date: new Date().toISOString() }, ...d.journalEntries] }
      : d);
  }, []);

  const deleteReading = useCallback((id: string) => {
    setData((d) => ({ ...d, savedReadings: d.savedReadings.filter((r) => r.id !== id) }));
  }, []);

  const deleteJournalEntry = useCallback((id: string) => {
    setData((d) => ({ ...d, journalEntries: d.journalEntries.filter((e) => e.id !== id) }));
  }, []);

  const toggleCrystal = useCallback((crystalId: string) => {
    setData((d) => ({
      ...d,
      crystalKit: d.crystalKit.includes(crystalId) ? d.crystalKit.filter((id) => id !== crystalId) : [...d.crystalKit, crystalId],
    }));
  }, []);

  const recordPracticeSession = useCallback((repetitions: number) => {
    setData((d) => {
      const s = d.practiceStreak;
      const today = localDateKey();
      let streak = s.currentStreak;
      if (s.lastSessionDate === today) { /* same day: streak unchanged */ }
      else if (s.lastSessionDate === yesterdayKey()) streak += 1;
      else streak = 1;
      return {
        ...d,
        practiceStreak: {
          lastSessionDate: today,
          currentStreak: streak,
          totalSessions: s.totalSessions + 1,
          totalRepetitions: s.totalRepetitions + repetitions,
        },
      };
    });
  }, []);

  const clearAll = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setData(EMPTY);
  }, []);

  const s = data.practiceStreak;
  const streakNow = s.lastSessionDate === localDateKey() || s.lastSessionDate === yesterdayKey() ? s.currentStreak : 0;

  const value = useMemo(() => ({
    data, streakNow, giveConsent, saveReading, addJournalEntry, deleteReading, deleteJournalEntry,
    toggleCrystal, recordPracticeSession, clearAll,
  }), [data, streakNow, giveConsent, saveReading, addJournalEntry, deleteReading, deleteJournalEntry, toggleCrystal, recordPracticeSession, clearAll]);

  return <DeviceStoreContext.Provider value={value}>{children}</DeviceStoreContext.Provider>;
}

export function useDeviceStore(): DeviceStoreValue {
  const ctx = useContext(DeviceStoreContext);
  if (!ctx) throw new Error('useDeviceStore must be used inside DeviceStoreProvider');
  return ctx;
}
