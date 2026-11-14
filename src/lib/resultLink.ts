/**
 * Links that reopen a tool with a result, e.g. /tools/loshu-grid#dob=1990-08-15&g=f.
 *
 * The details travel in the URL fragment (the part after "#"), which browsers never send to a
 * server, so they do not reach our host's logs or a "referrer" header. A link is built only when
 * the visitor presses "copy link", and the fragment is removed from the address bar as soon as
 * the page has read it, before analytics starts. Names and phone numbers are never put in links.
 */
import { SITE_URL } from '@/config/site';
import { parseISODate, type Gender } from '@/engine/numerology/core';

export interface ResultLinkData { dob: string; gender: Gender | null }

let captured: ResultLinkData | null = null;

/** Called once at startup: reads a result fragment, remembers it, and cleans the address bar. */
export function captureResultLink(): void {
  if (typeof window === 'undefined') return;
  const hash = window.location.hash;
  // "#/…" is a route in the single-file build, not a result.
  if (!hash || hash.startsWith('#/') || !hash.includes('dob=')) return;
  const params = new URLSearchParams(hash.slice(1));
  const dob = params.get('dob') ?? '';
  if (parseISODate(dob)) {
    const g = params.get('g');
    captured = { dob, gender: g === 'm' ? 'male' : g === 'f' ? 'female' : null };
  }
  try {
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  } catch { /* the address stays as it is */ }
}

/** The result a link asked for, handed over once to the first tool that asks. */
export function takeResultLink(): ResultLinkData | null {
  const data = captured;
  captured = null;
  return data;
}

/** A link to a tool that reopens it with this date of birth. Always points at the public site. */
export function buildResultLink(toolSlug: string, data: ResultLinkData): string {
  const params = new URLSearchParams({ dob: data.dob });
  if (data.gender) params.set('g', data.gender === 'male' ? 'm' : 'f');
  return `${SITE_URL}/tools/${toolSlug}#${params.toString()}`;
}
