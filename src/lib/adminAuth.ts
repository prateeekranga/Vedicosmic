import { supabase } from '@/lib/supabaseClient';

/**
 * Access to the /vc-portal-x7 dashboard. Signing in is not enough: the account must also be
 * on the admin allowlist, checked server-side by the `is_admin()` function that
 * `supabase/policies.sql` installs (the same function guards every write in the database).
 * The allowlist lives only in the database, so no admin email ships in the site's code.
 *
 * - `admin`: signed in and on the allowlist.
 * - `not-admin`: signed in, not on the allowlist.
 * - `unchecked`: signed in, but `is_admin()` could not be called (policies.sql not installed
 *   yet, or the network failed). The dashboard opens with a warning; database writes are then
 *   protected only by whatever policies are already installed.
 * - `signed-out`: no session.
 */
export type AdminAccess = 'admin' | 'not-admin' | 'unchecked' | 'signed-out';

export async function getAdminAccess(): Promise<AdminAccess> {
  const { data } = await supabase.auth.getSession();
  if (!data.session) return 'signed-out';
  const { data: isAdmin, error } = await supabase.rpc('is_admin');
  if (error) return 'unchecked';
  return isAdmin ? 'admin' : 'not-admin';
}

/** Subscribes to sign-in/sign-out events (including token expiry) — returns an unsubscribe fn. */
export function onAdminAuthChange(callback: () => void): () => void {
  const { data } = supabase.auth.onAuthStateChange(() => callback());
  return () => data.subscription.unsubscribe();
}

/** The signed-in admin's email — for the "Howdy, ___" greeting in the WordPress-style admin bar. */
export async function getAdminEmail(): Promise<string | undefined> {
  const { data } = await supabase.auth.getUser();
  return data.user?.email ?? undefined;
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
