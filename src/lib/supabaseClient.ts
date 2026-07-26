import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set');
}

/** Single shared client. The anon key is safe to expose client-side — every write is gated by
 *  the `posts`/`storage.objects` RLS policies, which require an authenticated (signed-in) session. */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
