import { supabase } from '@/lib/supabaseClient';

/** Gates the entire /vc-portal-x7 dashboard (Admin.tsx) — not just the Blog tab's Database
 *  Posts section, despite the "blog" naming here. One Supabase Auth account for the whole
 *  admin surface; names kept as-is to avoid a wider rename across both call sites. */
export async function isBlogAdminAuthed(): Promise<boolean> {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Subscribes to sign-in/sign-out events (including token expiry) — returns an unsubscribe fn. */
export function onAdminAuthChange(callback: (authed: boolean) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(!!session));
  return () => data.subscription.unsubscribe();
}

export async function adminLogin(email: string, password: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function adminLogout(): Promise<void> {
  await supabase.auth.signOut();
}

/** Real, server-side password change for the signed-in admin account — used by the Settings
 *  tab. Requires an active session (Supabase re-validates it server-side before applying). */
export async function changeAdminPassword(newPassword: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
