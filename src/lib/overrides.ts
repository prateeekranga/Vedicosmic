import { COURSES } from '@/data/courses';
import { TOOLS } from '@/data/tools';
import type { Course } from '@/types/course.types';
import type { ToolMeta } from '@/types/tool.types';
import { read, write } from './storage';

/**
 * Client-side admin overrides, persisted to localStorage. Lets the admin panel
 * edit course pricing/visibility, tool visibility and a site announcement
 * without a backend. Public pages merge these at render time.
 */
/** Patch applied over a course's base fields (built-in or custom) — covers every editable field. */
export type CourseOverride = Partial<Omit<Course, 'id' | 'slug'>> & { hidden?: boolean };
export interface ToolOverride { hidden?: boolean; isNew?: boolean }
export interface Announcement { text: string; active: boolean; tone: 'gold' | 'cyan' | 'info' }

const K = {
  pass: 'vc.admin.pass',
  courses: 'vc.overrides.courses',
  tools: 'vc.overrides.tools',
  ann: 'vc.announcement',
  customCourses: 'vc.courses.custom',
};
export const DEFAULT_PASSCODE = 'vedicosmic';

export const getCourseOverrides = () => read<Record<string, CourseOverride>>(K.courses, {});
export const getToolOverrides = () => read<Record<string, ToolOverride>>(K.tools, {});
export const getAnnouncement = () => read<Announcement>(K.ann, { text: '', active: false, tone: 'gold' });

export function setCourseOverride(id: string, patch: CourseOverride) {
  const all = getCourseOverrides();
  all[id] = { ...all[id], ...patch };
  write(K.courses, all);
}
export function setToolOverride(id: string, patch: ToolOverride) {
  const all = getToolOverrides();
  all[id] = { ...all[id], ...patch };
  write(K.tools, all);
}
export function setAnnouncement(a: Announcement) { write(K.ann, a); }
export function resetCourseOverrides() { write(K.courses, {}); }
export function resetToolOverrides() { write(K.tools, {}); }

// ---- custom (admin-created) courses, stored as full Course objects ----
export const getCustomCourses = (): Record<string, Course> => read(K.customCourses, {});
export function addCustomCourse(course: Course) {
  const all = getCustomCourses();
  all[course.id] = course;
  write(K.customCourses, all);
}
export function deleteCustomCourse(id: string) {
  const all = getCustomCourses();
  delete all[id];
  write(K.customCourses, all);
  const ov = getCourseOverrides();
  if (ov[id]) { delete ov[id]; write(K.courses, ov); }
}
export function isCustomCourseId(id: string): boolean { return id in getCustomCourses(); }

// ---- merged views used by public pages ----
function allBaseCourses(): Course[] {
  return [...COURSES, ...Object.values(getCustomCourses())];
}
export function mergedCourses(): Course[] {
  const ov = getCourseOverrides();
  return allBaseCourses().map((c) => (ov[c.id] ? { ...c, ...ov[c.id] } : c));
}
export function visibleCourses(): Course[] {
  const ov = getCourseOverrides();
  return mergedCourses().filter((c) => !ov[c.id]?.hidden);
}
export function mergedCourse(slug: string): Course | undefined {
  return mergedCourses().find((c) => c.slug === slug);
}
export function mergedTools(): ToolMeta[] {
  const ov = getToolOverrides();
  return TOOLS.map((t) => { const o = ov[t.id]; return o ? { ...t, ...(o.isNew != null ? { isNew: o.isNew } : {}) } : t; });
}
export function visibleTools(): ToolMeta[] {
  const ov = getToolOverrides();
  return mergedTools().filter((t) => !ov[t.id]?.hidden);
}

// ---- admin auth (local demo gate) ----
async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}
export async function verifyPasscode(input: string): Promise<boolean> {
  const stored = localStorage.getItem(K.pass);
  if (!stored) return input === DEFAULT_PASSCODE;
  return (await sha256(input)) === stored;
}
export async function setPasscode(next: string) {
  localStorage.setItem(K.pass, await sha256(next));
}

export function exportOverrides(): string {
  return JSON.stringify({ courses: getCourseOverrides(), tools: getToolOverrides(), announcement: getAnnouncement() }, null, 2);
}
