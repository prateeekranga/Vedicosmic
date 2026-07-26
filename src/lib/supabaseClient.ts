import { createClient } from '@supabase/supabase-js';

// Same pattern as src/config/site.ts: default to the real project values, override via env var
// if ever needed (e.g. a staging project). The anon key isn't a secret — every write is gated by
// the `posts`/`storage.objects` RLS policies, which require an authenticated (signed-in) session —
// so it's safe to bake in a default rather than have the whole site hard-fail if a deploy
// environment (e.g. Hostinger's Node.js build panel) doesn't have it configured.
const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || 'https://sghuhnhylmalbuowggwk.supabase.co';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaHVobmh5bG1hbGJ1b3dnZ3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTgwNTEsImV4cCI6MjEwMDYzNDA1MX0.Qs0XBqrXdzf-uPoMto77LuZIWLbqVXT9POqLK7RSgEw';

/** Single shared client. */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
