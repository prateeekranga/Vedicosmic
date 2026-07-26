import { createClient } from '@supabase/supabase-js';
import WebSocket from 'ws';

/**
 * Fetches DB-authored blog posts (Supabase `posts` table) during the Node build so they get
 * merged into prerendered routes, sitemap.xml and llms.txt alongside the 18 static posts. Never
 * throws — an unreachable Supabase project degrades to "static posts only", mirroring the existing
 * Playwright-unavailable fallback already used elsewhere in these build scripts.
 */
// Same defaults as src/lib/supabaseClient.ts — the anon key isn't a secret (RLS gates every
// write), so falling back to the real project rather than skipping DB posts keeps this working
// in deploy environments (e.g. Hostinger's Node.js build panel) that don't have these set.
const DEFAULT_URL = 'https://sghuhnhylmalbuowggwk.supabase.co';
const DEFAULT_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNnaHVobmh5bG1hbGJ1b3dnZ3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUwNTgwNTEsImV4cCI6MjEwMDYzNDA1MX0.Qs0XBqrXdzf-uPoMto77LuZIWLbqVXT9POqLK7RSgEw';

export async function fetchDbPosts() {
  const url = process.env.VITE_SUPABASE_URL || DEFAULT_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;
  try {
    // Node builds on Hostinger run Node 18, which lacks the native WebSocket global that
    // supabase-js needs even just to construct the client (it eagerly sets up a Realtime
    // client, unused here) — supply the `ws` package explicitly so this doesn't throw.
    const supabase = createClient(url, anonKey, { realtime: { transport: WebSocket } });
    // RLS restricts the anon role to `hidden = false` rows automatically.
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('sort_order', { ascending: true })
      .order('published_at', { ascending: false });
    if (error) throw new Error(error.message);

    const posts = data.map((row) => ({
      id: row.slug,
      slug: row.slug,
      title: row.title,
      seoTitle: row.seo_title ?? undefined,
      excerpt: row.excerpt,
      category: row.category,
      tags: row.tags ?? [],
      authorId: row.author_id ?? undefined,
      publishedAt: row.published_at,
      updatedAt: row.content_updated_at ?? undefined,
      readingTimeMin: row.reading_time_min ?? undefined,
      heroImage: row.hero_image ?? undefined,
      isFeatured: row.is_featured,
      isPinned: row.is_pinned,
      content: row.content ?? [],
      relatedToolSlugs: row.related_tool_slugs ?? [],
      relatedCourseSlugs: row.related_course_slugs ?? [],
      faqs: row.faqs ?? [],
      keyTakeaways: row.key_takeaways ?? [],
      howToSteps: row.how_to_steps ?? [],
    }));
    console.log(`[build] fetched ${posts.length} DB-authored post(s) from Supabase`);
    return posts;
  } catch (err) {
    console.warn(`[build] DB posts unavailable (${err.message}) — continuing with static posts only.`);
    return [];
  }
}
