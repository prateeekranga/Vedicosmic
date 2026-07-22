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

export interface MantraStreak {
  lastSessionDate: string;
  currentStreak: number;
  totalSessions: number;
  totalRepetitions: number;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  createdAt: string;
  enrolledCourses: string[];
  savedReadings: SavedReading[];
  journalEntries: JournalEntry[];
  crystalKit: string[];
  mantraStreak: MantraStreak;
}
