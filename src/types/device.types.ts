/** Everything VediCosmic keeps about a visitor, stored only in their own browser. */
export interface SavedReading {
  id: string;
  toolId: string;
  toolName: string;
  date: string;
  summary: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  tarotCardId?: string;
  content: string;
}

export interface PracticeStreak {
  /** Local calendar date (YYYY-MM-DD) of the last completed session. */
  lastSessionDate: string;
  currentStreak: number;
  totalSessions: number;
  totalRepetitions: number;
}

export interface DeviceData {
  /** The visitor agreed to keep readings and journal entries on this device. */
  consented: boolean;
  savedReadings: SavedReading[];
  journalEntries: JournalEntry[];
  crystalKit: string[];
  practiceStreak: PracticeStreak;
}
