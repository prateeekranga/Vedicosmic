import { useEffect, useState } from 'react';
import { getBlogPost } from '@/data/blog';
import { fetchPublicPostBySlug } from '@/lib/blogApi';
import type { BlogPost } from '@/types/blog.types';

/** Static-first: the 18 hand-authored posts resolve synchronously with zero network latency,
 *  exactly as before. Only slugs that aren't one of those 18 fall through to a DB fetch. Unlike
 *  the static posts (whose "hidden" state is just a local browser override, so the post itself is
 *  never actually gated), a hidden DB post is *not* reachable by direct URL — the anon-role RLS
 *  policy on `posts` only grants SELECT where `hidden = false`, so it 404s until made visible. */
export function useBlogPost(slug: string | undefined): { post: BlogPost | undefined; loading: boolean; notFound: boolean } {
  const staticPost = slug ? getBlogPost(slug) : undefined;
  const [dbPost, setDbPost] = useState<BlogPost | null | undefined>(undefined); // undefined = not fetched yet, null = 404

  useEffect(() => {
    if (staticPost || !slug) return;
    let cancelled = false;
    setDbPost(undefined);
    fetchPublicPostBySlug(slug)
      .then((post) => { if (!cancelled) setDbPost(post); })
      .catch(() => { if (!cancelled) setDbPost(null); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, !!staticPost]);

  if (staticPost) return { post: staticPost, loading: false, notFound: false };
  if (!slug) return { post: undefined, loading: false, notFound: true };
  if (dbPost === undefined) return { post: undefined, loading: true, notFound: false };
  return { post: dbPost ?? undefined, loading: false, notFound: dbPost === null };
}
