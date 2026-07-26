import { useEffect, useState } from 'react';
import { visibleBlogPosts } from '@/lib/blogOverrides';
import { fetchPublicPosts } from '@/lib/blogApi';
import type { BlogPost } from '@/types/blog.types';

let dbPostsCache: Promise<BlogPost[]> | null = null;
function loadDbPosts(): Promise<BlogPost[]> {
  if (!dbPostsCache) {
    dbPostsCache = fetchPublicPosts().catch((err) => {
      dbPostsCache = null; // let a later mount retry instead of caching the failure forever
      throw err;
    });
  }
  return dbPostsCache;
}

function mergeAndSort(staticPosts: BlogPost[], dbPosts: BlogPost[]): BlogPost[] {
  return [...staticPosts, ...dbPosts].sort((a, b) => {
    if (!!a.isPinned !== !!b.isPinned) return a.isPinned ? -1 : 1;
    return +new Date(b.publishedAt) - +new Date(a.publishedAt);
  });
}

/** Merges the 18 static posts with live DB-authored posts — used everywhere the site lists
 *  posts (Blog.tsx hub/category grids, ToolPage.tsx's "From the Blog" section). DB posts don't
 *  get the static posts' manual drag-order override; they sort by pinned then published date,
 *  same as blogOverrides.ts's own documented default. */
export function useAllBlogPosts(): { posts: BlogPost[]; loading: boolean; error: string | null } {
  const [dbPosts, setDbPosts] = useState<BlogPost[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadDbPosts()
      .then((posts) => { if (!cancelled) setDbPosts(posts); })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : 'Failed to load posts');
        setDbPosts([]);
      });
    return () => { cancelled = true; };
  }, []);

  const staticPosts = visibleBlogPosts();
  const posts = dbPosts === null ? staticPosts : mergeAndSort(staticPosts, dbPosts);
  return { posts, loading: dbPosts === null, error };
}
