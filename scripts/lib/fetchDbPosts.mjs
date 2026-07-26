import { createClient } from '@supabase/supabase-js';

/**
 * Fetches DB-authored blog posts (Supabase `posts` table) during the Node build so they get
 * merged into prerendered routes, sitemap.xml and llms.txt alongside the 18 static posts. Never
 * throws — an unreachable Supabase project degrades to "static posts only", mirroring the existing
 * Playwright-unavailable fallback already used elsewhere in these build scripts.
 */
export async function fetchDbPosts() {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn('[build] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY not set — skipping DB-authored posts.');
    return [];
  }
  try {
    const supabase = createClient(url, anonKey);
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
