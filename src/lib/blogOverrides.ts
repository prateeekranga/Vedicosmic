import { BLOG_POSTS } from '@/data/blog';
import type { BlogPost } from '@/types/blog.types';
import { read, write } from './storage';

/**
 * Client-side admin overrides for blog posts, persisted to localStorage —
 * same mechanism as course/tool overrides in `overrides.ts`. Lets the admin
 * panel hide/show, feature, pin and reorder posts without a backend. Posts
 * themselves stay source-controlled; this only layers visibility/ranking on top.
 */
export interface BlogPostOverride { hidden?: boolean; isFeatured?: boolean; isPinned?: boolean; order?: number }

const K = { blog: 'vc.overrides.blog' };

export const getBlogOverrides = () => read<Record<string, BlogPostOverride>>(K.blog, {});
export function setBlogOverride(id: string, patch: BlogPostOverride) {
  const all = getBlogOverrides();
  all[id] = { ...all[id], ...patch };
  write(K.blog, all);
}
export function resetBlogOverrides() { write(K.blog, {}); }

function applyOverride(post: BlogPost, o: BlogPostOverride | undefined): BlogPost {
  if (!o) return post;
  return {
    ...post,
    ...(o.isFeatured != null ? { isFeatured: o.isFeatured } : {}),
    ...(o.isPinned != null ? { isPinned: o.isPinned } : {}),
  };
}

/** Default sort = newest first; an admin `order` override takes precedence once set. */
export function mergedBlogPosts(): BlogPost[] {
  const ov = getBlogOverrides();
  return [...BLOG_POSTS]
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt))
    .map((p) => applyOverride(p, ov[p.id]));
}

export function visibleBlogPosts(): BlogPost[] {
  const ov = getBlogOverrides();
  const byDate = mergedBlogPosts();
  return byDate
    .map((p, i) => ({ post: p, order: ov[p.id]?.order ?? i, pinned: !!p.isPinned }))
    .filter((x) => !ov[x.post.id]?.hidden)
    .sort((a, b) => (a.pinned !== b.pinned ? (a.pinned ? -1 : 1) : a.order - b.order))
    .map((x) => x.post);
}
