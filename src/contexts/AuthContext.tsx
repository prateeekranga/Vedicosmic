import {
  createContext, useCallback, useContext, useEffect, useReducer, type ReactNode,
} from 'react';
import type { User, SavedReading, JournalEntry } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

type Action =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_USER'; payload: User };

function reducer(state: AuthState, action: Action): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return { user: action.payload, isLoading: false, error: null };
    case 'UPDATE_USER':
      return { ...state, user: action.payload };
    case 'LOGOUT':
      return { user: null, isLoading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload, error: null };
    default:
      return state;
  }
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, displayName: string) => Promise<boolean>;
  logout: () => void;
  toggleEnrollment: (courseId: string) => void;
  isEnrolled: (courseId: string) => boolean;
  saveReading: (r: Omit<SavedReading, 'id' | 'date'>) => void;
  addJournalEntry: (e: Omit<JournalEntry, 'id' | 'date'>) => void;
  toggleCrystal: (crystalId: string) => void;
  recordMantraSession: (repetitions: number) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'vedicosmic:auth';
const USERS_KEY = 'vedicosmic:users';

type UserRecord = Record<string, { user: User; passwordHash: string; salt?: string }>;

const LEGACY_SALT = 'vc-salt-2026';

function randomSalt(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(password + salt);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function readUsers(): UserRecord {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? '{}'); } catch { return {}; }
}
function writeUsers(u: UserRecord) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }
function persistSession(user: User) { localStorage.setItem(STORAGE_KEY, JSON.stringify({ user })); }

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true, error: null });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { user } = JSON.parse(stored);
        if (user) { dispatch({ type: 'LOGIN_SUCCESS', payload: user }); return; }
      }
    } catch { /* ignore */ }
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const persistUser = useCallback((user: User) => {
    const users = readUsers();
    const rec = users[user.email.toLowerCase()];
    if (rec) { rec.user = user; writeUsers(users); }
    persistSession(user);
    dispatch({ type: 'UPDATE_USER', payload: user });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const users = readUsers();
    const key = email.toLowerCase();
    const rec = users[key];
    if (!rec) { dispatch({ type: 'SET_ERROR', payload: 'No account found for that email.' }); return false; }
    const salt = rec.salt ?? LEGACY_SALT;
    if ((await hashPassword(password, salt)) !== rec.passwordHash) {
      dispatch({ type: 'SET_ERROR', payload: 'That password is incorrect.' }); return false;
    }
    if (!rec.salt) {
      const upgradedSalt = randomSalt();
      users[key] = { ...rec, salt: upgradedSalt, passwordHash: await hashPassword(password, upgradedSalt) };
      writeUsers(users);
    }
    dispatch({ type: 'LOGIN_SUCCESS', payload: rec.user });
    persistSession(rec.user);
    return true;
  }, []);

  const register = useCallback(async (email: string, password: string, displayName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const users = readUsers();
    if (users[email.toLowerCase()]) {
      dispatch({ type: 'SET_ERROR', payload: 'That email is already registered.' }); return false;
    }
    const newUser: User = {
      id: crypto.randomUUID(), email, displayName,
      createdAt: new Date().toISOString(),
      enrolledCourses: [], savedReadings: [], journalEntries: [], crystalKit: [],
      mantraStreak: { lastSessionDate: '', currentStreak: 0, totalSessions: 0, totalRepetitions: 0 },
    };
    const salt = randomSalt();
    users[email.toLowerCase()] = { user: newUser, passwordHash: await hashPassword(password, salt), salt };
    writeUsers(users);
    persistSession(newUser);
    dispatch({ type: 'LOGIN_SUCCESS', payload: newUser });
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: 'LOGOUT' });
  }, []);

  const toggleEnrollment = useCallback((courseId: string) => {
    if (!state.user) return;
    const enrolled = state.user.enrolledCourses.includes(courseId)
      ? state.user.enrolledCourses.filter((id) => id !== courseId)
      : [...state.user.enrolledCourses, courseId];
    persistUser({ ...state.user, enrolledCourses: enrolled });
  }, [state.user, persistUser]);

  const isEnrolled = useCallback((courseId: string) =>
    !!state.user?.enrolledCourses.includes(courseId), [state.user]);

  const saveReading = useCallback((r: Omit<SavedReading, 'id' | 'date'>) => {
    if (!state.user) return;
    const reading: SavedReading = { ...r, id: crypto.randomUUID(), date: new Date().toISOString() };
    persistUser({ ...state.user, savedReadings: [reading, ...state.user.savedReadings].slice(0, 50) });
  }, [state.user, persistUser]);

  const addJournalEntry = useCallback((e: Omit<JournalEntry, 'id' | 'date'>) => {
    if (!state.user) return;
    const entry: JournalEntry = { ...e, id: crypto.randomUUID(), date: new Date().toISOString() };
    persistUser({ ...state.user, journalEntries: [entry, ...state.user.journalEntries] });
  }, [state.user, persistUser]);

  const toggleCrystal = useCallback((crystalId: string) => {
    if (!state.user) return;
    const kit = state.user.crystalKit.includes(crystalId)
      ? state.user.crystalKit.filter((id) => id !== crystalId)
      : [...state.user.crystalKit, crystalId];
    persistUser({ ...state.user, crystalKit: kit });
  }, [state.user, persistUser]);

  const recordMantraSession = useCallback((repetitions: number) => {
    if (!state.user) return;
    const today = new Date().toISOString().slice(0, 10);
    const s = state.user.mantraStreak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    let streak = s.currentStreak;
    if (s.lastSessionDate === today) { /* same day */ }
    else if (s.lastSessionDate === yesterday) streak += 1;
    else streak = 1;
    persistUser({
      ...state.user,
      mantraStreak: {
        lastSessionDate: today,
        currentStreak: streak,
        totalSessions: s.totalSessions + 1,
        totalRepetitions: s.totalRepetitions + repetitions,
      },
    });
  }, [state.user, persistUser]);

  const clearError = useCallback(() => dispatch({ type: 'SET_ERROR', payload: '' }), []);

  return (
    <AuthContext.Provider value={{
      ...state, login, register, logout, toggleEnrollment, isEnrolled,
      saveReading, addJournalEntry, toggleCrystal, recordMantraSession, clearError,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
