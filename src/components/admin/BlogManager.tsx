import { useState } from 'react';
import { Eye, EyeOff, RotateCcw, ChevronUp, ChevronDown, Pencil, ExternalLink } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blog';
import { getBlogCategory } from '@/data/blogCategories';
import {
  getBlogOverrides, setBlogOverride, resetBlogOverrides, mergedBlogPosts,
  type BlogPostOverride,
} from '@/lib/blogOverrides';
import { getSEOOverrides, setSEOOverride } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import type { BlogPost } from '@/types/blog.types';

function rankedPosts(posts: BlogPost[], ov: Record<string, BlogPostOverride>) {
  return posts
    .map((post, i) => ({ post, order: ov[post.id]?.order ?? i }))
    .sort((a, b) => a.order - b.order);
}

function moveRow(posts: BlogPost[], id: string, dir: -1 | 1) {
  const ov = getBlogOverrides();
  const ranked = rankedPosts(posts, ov);
  const idx = ranked.findIndex((r) => r.post.id === id);
  const swapIdx = idx + dir;
  if (idx < 0 || swapIdx < 0 || swapIdx >= ranked.length) return;
  // materialize an explicit 0..n-1 order for every post first, so a swap never leaves gaps/collisions
  ranked.forEach((r, i) => setBlogOverride(r.post.id, { order: i }));
  setBlogOverride(ranked[idx].post.id, { order: swapIdx });
  setBlogOverride(ranked[swapIdx].post.id, { order: idx });
}

export function BlogManager() {
  const v = useOverridesVersion();
  const ov = getBlogOverrides();
  const rows = rankedPosts(mergedBlogPosts(), ov);
  const [seoSlug, setSeoSlug] = useState<string | null>(null);
  const seoPost = seoSlug ? BLOG_POSTS.find((p) => p.slug === seoSlug) : undefined;

  return (
    <div className="space-y-5" key={v}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-h3 text-white">Blog</h2>
        <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all blog changes?')) resetBlogOverrides(); }}>
          <RotateCcw className="mr-2 h-4 w-4" /> Reset
        </Button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
            <tr>
              <th className="p-3">Post</th>
              <th className="p-3">Category</th>
              <th className="p-3 text-center">Featured</th>
              <th className="p-3 text-center">Pinned</th>
              <th className="p-3 text-center">Visible</th>
              <th className="p-3 text-center">Order</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ post: p }, i) => {
              const o = ov[p.id] ?? {};
              const hidden = !!o.hidden;
              const category = getBlogCategory(p.category);
              return (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="p-3"><p className="font-medium text-white">{p.title}</p><p className="text-xs text-white/40">{p.slug}</p></td>
                  <td className="p-3 text-white/60">{category?.label ?? p.category}</td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={o.isFeatured ?? !!p.isFeatured} onChange={(e) => setBlogOverride(p.id, { isFeatured: e.target.checked })} className="h-4 w-4 accent-gold-400" />
                  </td>
                  <td className="p-3 text-center">
                    <input type="checkbox" checked={o.isPinned ?? !!p.isPinned} onChange={(e) => setBlogOverride(p.id, { isPinned: e.target.checked })} className="h-4 w-4 accent-brand-cyan-400" />
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => setBlogOverride(p.id, { hidden: !hidden })} className={hidden ? 'text-white/30' : 'text-brand-cyan-300'}>
                      {hidden ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => moveRow(mergedBlogPosts(), p.id, -1)} disabled={i === 0} className="text-white/50 hover:text-white disabled:opacity-20" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                      <button onClick={() => moveRow(mergedBlogPosts(), p.id, 1)} disabled={i === rows.length - 1} className="text-white/50 hover:text-white disabled:opacity-20" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setSeoSlug(p.slug)} className="text-white/50 hover:text-white" aria-label="Edit SEO"><Pencil className="h-4 w-4" /></button>
                      <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white" aria-label="View live"><ExternalLink className="h-4 w-4" /></a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/40">Hidden posts disappear from the Blog hub and category pages — their direct link still works, exactly like Tools. Pinned posts always sort first. Changes are instant.</p>
      {seoPost && <BlogSEOModal post={seoPost} onClose={() => setSeoSlug(null)} />}
    </div>
  );
}

function BlogSEOModal({ post, onClose }: { post: BlogPost; onClose: () => void }) {
  const key = `blog:${post.slug}`;
  const ov = getSEOOverrides()[key] ?? {};
  const [title, setTitle] = useState(ov.title ?? '');
  const [description, setDescription] = useState(ov.description ?? '');
  const [ogImage, setOgImage] = useState(ov.ogImage ?? '');

  const save = (patch: { title?: string; description?: string; ogImage?: string }) => setSEOOverride(key, patch);

  return (
    <Modal open onClose={onClose} title="Edit SEO" maxWidth="max-w-lg">
      <div className="space-y-4">
        <Input label="Title override" placeholder={post.seoTitle ?? `${post.title} · VediCosmic`} value={title}
          onChange={(e) => { setTitle(e.target.value); save({ title: e.target.value }); }} />
        <Textarea label="Description override" rows={3} placeholder={post.excerpt} value={description}
          onChange={(e) => { setDescription(e.target.value); save({ description: e.target.value }); }} />
        <Input label="OG image URL override" placeholder="Leave blank to use the site default" value={ogImage}
          onChange={(e) => { setOgImage(e.target.value); save({ ogImage: e.target.value }); }} />
        <p className="text-xs text-white/40">Blank fields fall back to this post's built-in title/excerpt. Takes effect immediately.</p>
      </div>
    </Modal>
  );
}
