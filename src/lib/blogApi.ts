import { supabase } from '@/lib/supabaseClient';
import { generateHeroImage } from '@/lib/generateHeroImage';
import type { BlogPost, BlogCategoryId } from '@/types/blog.types';

/** Row shape as stored in the `posts` table (snake_case) — see the migration applied via
 *  Supabase MCP (create_posts_table_and_storage). */
interface PostRow {
  id: number;
  slug: string;
  title: string;
  seo_title: string | null;
  excerpt: string;
  category: string;
  tags: string[];
  author_id: string | null;
  published_at: string;
  content_updated_at: string | null;
  reading_time_min: number | null;
  hero_image: string | null;
  is_featured: boolean;
  is_pinned: boolean;
  hidden: boolean;
  sort_order: number;
  content: unknown;
  related_tool_slugs: string[] | null;
  related_course_slugs: string[] | null;
  faqs: unknown;
  key_takeaways: string[] | null;
  how_to_steps: unknown;
}

function toBlogPost(row: PostRow): BlogPost {
  return {
    id: row.slug,
    slug: row.slug,
    title: row.title,
    seoTitle: row.seo_title ?? undefined,
    excerpt: row.excerpt,
    category: row.category as BlogCategoryId,
    tags: row.tags ?? [],
    authorId: row.author_id ?? undefined,
    publishedAt: row.published_at,
    updatedAt: row.content_updated_at ?? undefined,
    readingTimeMin: row.reading_time_min ?? undefined,
    heroImage: row.hero_image ?? undefined,
    isFeatured: row.is_featured,
    isPinned: row.is_pinned,
    content: (row.content as BlogPost['content']) ?? [],
    relatedToolSlugs: row.related_tool_slugs ?? [],
    relatedCourseSlugs: row.related_course_slugs ?? [],
    faqs: (row.faqs as BlogPost['faqs']) ?? [],
    keyTakeaways: row.key_takeaways ?? [],
    howToSteps: (row.how_to_steps as BlogPost['howToSteps']) ?? [],
  };
}

function toAdminPost(row: PostRow): BlogPost & { hidden: boolean; sortOrder: number } {
  return { ...toBlogPost(row), hidden: row.hidden, sortOrder: row.sort_order };
}

/** snake_case row fields accepted by insert/update, built from a Partial<BlogPost> input. */
function fromInput(input: Partial<BlogPost>) {
  return {
    slug: input.slug,
    title: input.title,
    seo_title: input.seoTitle ?? null,
    excerpt: input.excerpt,
    category: input.category,
    tags: input.tags ?? [],
    author_id: input.authorId ?? null,
    published_at: input.publishedAt,
    content_updated_at: input.updatedAt ?? null,
    reading_time_min: input.readingTimeMin ?? null,
    is_featured: input.isFeatured ?? false,
    is_pinned: input.isPinned ?? false,
    content: input.content ?? [],
    related_tool_slugs: input.relatedToolSlugs ?? [],
    related_course_slugs: input.relatedCourseSlugs ?? [],
    faqs: input.faqs ?? [],
    key_takeaways: input.keyTakeaways ?? [],
    how_to_steps: input.howToSteps ?? [],
  };
}

/** Public, unauthenticated reads — used by the live site (Blog.tsx, BlogPostPage.tsx, ToolPage.tsx)
 *  and, via fetchDbPosts.mjs, by the Node build scripts (prerender.mjs/generate-seo-files.mjs).
 *  RLS restricts these to `hidden = false` rows automatically for the anon role. */
export async function fetchPublicPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });
  if (error) throw new Error(`Failed to load posts: ${error.message}`);
  return (data as PostRow[]).map(toBlogPost);
}

export async function fetchPublicPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return data ? toBlogPost(data as PostRow) : null;
}

/** Admin-only — includes hidden posts, for the BlogManager table. Requires a signed-in session;
 *  RLS grants authenticated users SELECT over every row. */
export async function fetchAdminPosts(): Promise<(BlogPost & { hidden: boolean; sortOrder: number })[]> {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('published_at', { ascending: false });
  if (error) throw new Error(`Failed to load admin posts: ${error.message}`);
  return (data as PostRow[]).map(toAdminPost);
}

export async function fetchAdminPostBySlug(slug: string): Promise<BlogPost> {
  const { data, error } = await supabase.from('posts').select('*').eq('slug', slug).single();
  if (error) throw new Error(`Failed to load post: ${error.message}`);
  return toBlogPost(data as PostRow);
}

async function nextSortOrder(): Promise<number> {
  const { data, error } = await supabase
    .from('posts')
    .select('sort_order')
    .order('sort_order', { ascending: false })
    .limit(1);
  if (error) throw new Error(`Failed to compute sort order: ${error.message}`);
  return data.length > 0 ? (data[0] as { sort_order: number }).sort_order + 1 : 0;
}

function friendlyError(error: { code?: string; message: string }, slug: string): Error {
  if (error.code === '23505') return new Error(`A post with slug "${slug}" already exists`);
  return new Error(error.message);
}

export async function createPost(input: Partial<BlogPost>): Promise<BlogPost> {
  const slug = input.slug!;
  const heroImage = input.heroImage
    ?? (await generateHeroImage({ slug, title: input.title!, category: input.category! }));
  const sortOrder = await nextSortOrder();

  const { data, error } = await supabase
    .from('posts')
    .insert({ ...fromInput(input), hero_image: heroImage, hidden: true, sort_order: sortOrder })
    .select('*')
    .single();
  if (error) throw friendlyError(error, slug);
  return toBlogPost(data as PostRow);
}

export async function updatePost(currentSlug: string, input: Partial<BlogPost>): Promise<BlogPost> {
  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('title, category, hero_image')
    .eq('slug', currentSlug)
    .single();
  if (fetchError) throw new Error(`Post not found: ${fetchError.message}`);

  // The editor prefills its "Hero image URL" field with whatever is already stored (including a
  // previously auto-generated one) so the admin can see/copy it — so `input.heroImage` being
  // truthy doesn't by itself mean an explicit override. Only treat it as one if it actually
  // *differs* from what's stored; otherwise fall through to regenerating when title/category
  // (the only inputs to the render) changed, or keeping the existing image untouched.
  const titleOrCategoryChanged = existing.title !== input.title || existing.category !== input.category;
  const explicitOverride = input.heroImage && input.heroImage !== existing.hero_image ? input.heroImage : undefined;
  const heroImage = explicitOverride
    ?? (titleOrCategoryChanged
      ? await generateHeroImage({ slug: input.slug ?? currentSlug, title: input.title!, category: input.category! })
      : existing.hero_image);

  const { data, error } = await supabase
    .from('posts')
    .update({ ...fromInput(input), hero_image: heroImage })
    .eq('slug', currentSlug)
    .select('*')
    .single();
  if (error) throw friendlyError(error, input.slug ?? currentSlug);
  return toBlogPost(data as PostRow);
}

export async function setPostVisibility(
  slug: string,
  patch: { hidden?: boolean; isFeatured?: boolean; isPinned?: boolean },
): Promise<BlogPost> {
  const row: Record<string, boolean> = {};
  if (patch.hidden !== undefined) row.hidden = patch.hidden;
  if (patch.isFeatured !== undefined) row.is_featured = patch.isFeatured;
  if (patch.isPinned !== undefined) row.is_pinned = patch.isPinned;

  const { data, error } = await supabase.from('posts').update(row).eq('slug', slug).select('*').single();
  if (error) throw new Error(`Failed to update visibility: ${error.message}`);
  return toBlogPost(data as PostRow);
}

export async function reorderPosts(order: string[]): Promise<void> {
  const results = await Promise.all(
    order.map((slug, index) => supabase.from('posts').update({ sort_order: index }).eq('slug', slug)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(`Failed to reorder posts: ${failed.error.message}`);
}

export async function deletePost(slug: string): Promise<void> {
  const { error } = await supabase.from('posts').delete().eq('slug', slug);
  if (error) throw new Error(`Failed to delete post: ${error.message}`);
}
