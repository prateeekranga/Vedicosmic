import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, RotateCcw, ChevronUp, ChevronDown, Plus, Search, X } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blog';
import { getBlogCategory } from '@/data/blogCategories';
import {
  getBlogOverrides, setBlogOverride, resetBlogOverrides, mergedBlogPosts,
  type BlogPostOverride,
} from '@/lib/blogOverrides';
import { getSEOOverrides, setSEOOverride } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { useAdminNotice } from '@/hooks/useAdminNotice';
import {
  fetchAdminPosts, fetchAdminPostBySlug, createPost, updatePost, deletePost, setPostVisibility, reorderPosts,
} from '@/lib/blogApi';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { AdminNoticeBanner } from '@/components/admin/AdminNotice';
import { StatusFilterPills } from '@/components/admin/StatusFilterPills';
import { BulkActionBar, type BulkAction } from '@/components/admin/BulkActionBar';
import { BlogPostEditor, type BlogPostDraftInput } from '@/components/admin/BlogPostEditor';
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

type DbPost = BlogPost & { hidden: boolean; sortOrder: number };
type EditorState = { mode: 'new' } | { mode: 'edit'; post: BlogPost } | null;

function matchesSearch(p: BlogPost, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [p.title, p.slug, p.category, ...p.tags].join(' ').toLowerCase().includes(q);
}

/** Shared search box for both post tables below — plain text match against title, slug,
 *  category and tags, so finding one post among a growing library doesn't mean scrolling. */
function TableSearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative max-w-sm flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/12 bg-cosmic-darker/60 py-2 pl-9 pr-8 text-sm text-white placeholder-white/30 transition-colors focus:border-brand-cyan focus:outline-none"
      />
      {value && (
        <button onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/70">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

const POST_BULK_ACTIONS: BulkAction[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'feature', label: 'Mark as Featured' },
  { value: 'unfeature', label: 'Remove Featured' },
  { value: 'pin', label: 'Pin' },
  { value: 'unpin', label: 'Unpin' },
];

export function BlogManager() {
  const v = useOverridesVersion();
  const ov = getBlogOverrides();
  const allRows = rankedPosts(mergedBlogPosts(), ov);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState('');
  const { notice, notify, dismiss } = useAdminNotice();

  const visibleCount = allRows.filter(({ post: p }) => !ov[p.id]?.hidden).length;
  const hiddenCount = allRows.length - visibleCount;
  const statusFiltered = useMemo(() => allRows.filter(({ post: p }) => {
    if (statusFilter === 'visible') return !ov[p.id]?.hidden;
    if (statusFilter === 'hidden') return !!ov[p.id]?.hidden;
    return true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [allRows, statusFilter, v]);
  const rows = useMemo(() => statusFiltered.filter(({ post }) => matchesSearch(post, query)), [statusFiltered, query]);

  const [seoSlug, setSeoSlug] = useState<string | null>(null);
  const seoPost = seoSlug ? BLOG_POSTS.find((p) => p.slug === seoSlug) : undefined;

  const toggleSelectAll = (checked: boolean) => setSelected(checked ? new Set(rows.map(({ post }) => post.id)) : new Set());
  const toggleSelect = (id: string, checked: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    if (checked) next.add(id); else next.delete(id);
    return next;
  });

  const applyBulk = () => {
    if (!bulkValue || selected.size === 0) return;
    selected.forEach((id) => {
      if (bulkValue === 'show') setBlogOverride(id, { hidden: false });
      else if (bulkValue === 'hide') setBlogOverride(id, { hidden: true });
      else if (bulkValue === 'feature') setBlogOverride(id, { isFeatured: true });
      else if (bulkValue === 'unfeature') setBlogOverride(id, { isFeatured: false });
      else if (bulkValue === 'pin') setBlogOverride(id, { isPinned: true });
      else if (bulkValue === 'unpin') setBlogOverride(id, { isPinned: false });
    });
    const label = POST_BULK_ACTIONS.find((a) => a.value === bulkValue)?.label ?? 'Action';
    notify('success', `${label}: ${selected.size} post${selected.size === 1 ? '' : 's'} updated.`);
    setSelected(new Set());
    setBulkValue('');
  };

  return (
    <div className="space-y-10" key={v}>
      <div>
        {notice && <div className="mb-3"><AdminNoticeBanner notice={notice} onDismiss={dismiss} /></div>}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-heading text-h3 text-white">Blog</h1>
          <div className="flex flex-1 items-center justify-end gap-3">
            <TableSearchBox value={query} onChange={setQuery} placeholder="Search title, slug, category, tag…" />
            <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all blog changes?')) { resetBlogOverrides(); notify('success', 'All blog changes reset.'); } }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <StatusFilterPills value={statusFilter} onChange={setStatusFilter} options={[
            { id: 'all', label: 'All', count: allRows.length },
            { id: 'visible', label: 'Visible', count: visibleCount },
            { id: 'hidden', label: 'Hidden', count: hiddenCount },
          ]} />
          {query && <p className="text-xs text-white/40">{rows.length} of {statusFiltered.length} match "{query}"</p>}
        </div>

        <div className="mt-3">
          <BulkActionBar actions={POST_BULK_ACTIONS} selectedCount={selected.size} value={bulkValue} onChange={setBulkValue} onApply={applyBulk} />
        </div>

        <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
              <tr>
                <th className="w-10 p-3">
                  <input type="checkbox" checked={rows.length > 0 && selected.size === rows.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)} className="h-4 w-4 accent-gold-400" aria-label="Select all" />
                </th>
                <th className="p-3">Post</th>
                <th className="p-3">Category</th>
                <th className="p-3 text-center">Featured</th>
                <th className="p-3 text-center">Pinned</th>
                <th className="p-3 text-center">Visible</th>
                <th className="p-3 text-center">Order</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ post: p }, i) => {
                const o = ov[p.id] ?? {};
                const hidden = !!o.hidden;
                const category = getBlogCategory(p.category);
                return (
                  <tr key={p.id} className="border-b border-white/5">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(p.id)} onChange={(e) => toggleSelect(p.id, e.target.checked)}
                        className="h-4 w-4 accent-gold-400" aria-label={`Select ${p.title}`} />
                    </td>
                    <td className="p-3">
                      <p className="font-medium text-white">{p.title}</p>
                      <p className="text-xs text-white/40">{p.slug}</p>
                      <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
                        <button onClick={() => setSeoSlug(p.slug)} className="text-brand-cyan-soft hover:underline">Edit SEO</button>
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white hover:underline">View</a>
                      </div>
                    </td>
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-white/40">Hidden posts disappear from the Blog hub and category pages — their direct link still works, exactly like Tools. Pinned posts always sort first. Changes are instant.</p>
      </div>

      <DbPostsSection />

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

const DB_POST_BULK_ACTIONS: BulkAction[] = [
  { value: 'show', label: 'Show' },
  { value: 'hide', label: 'Hide' },
  { value: 'feature', label: 'Mark as Featured' },
  { value: 'unfeature', label: 'Remove Featured' },
  { value: 'pin', label: 'Pin' },
  { value: 'unpin', label: 'Unpin' },
  { value: 'delete', label: 'Delete' },
];

/** No login gate of its own — Admin.tsx's outer Supabase auth gate already guarantees a
 *  signed-in session before this component ever mounts (see adminAuth.ts). If that session
 *  expires mid-use, Admin.tsx's onAdminAuthChange subscription unmounts the whole dashboard
 *  (this section included) and shows the login screen again — no local handling needed here. */
function DbPostsSection() {
  const [posts, setPosts] = useState<DbPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [editorSeed, setEditorSeed] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'scheduled' | 'hidden'>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkValue, setBulkValue] = useState('');
  const { notice, notify, dismiss } = useAdminNotice();
  const { posts: allPosts } = useAllBlogPosts(); // for the internal-link picker inside the editor

  const isScheduled = (p: DbPost) => !p.hidden && new Date(p.publishedAt).getTime() > Date.now();
  const statusFiltered = useMemo(() => (posts ?? []).filter((p) => {
    if (statusFilter === 'hidden') return p.hidden;
    if (statusFilter === 'scheduled') return isScheduled(p);
    if (statusFilter === 'published') return !p.hidden && !isScheduled(p);
    return true;
  }), [posts, statusFilter]);
  const filteredPosts = useMemo(() => statusFiltered.filter((p) => matchesSearch(p, query)), [statusFiltered, query]);

  const refresh = () => {
    fetchAdminPosts().then(setPosts).catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load'));
  };

  useEffect(() => { refresh(); }, []);

  const openNew = () => { setEditorSeed(null); setEditor({ mode: 'new' }); };
  const openEdit = async (slug: string) => {
    const full = await fetchAdminPostBySlug(slug);
    setEditorSeed(full);
    setEditor({ mode: 'edit', post: full });
  };

  const handleSave = async (input: BlogPostDraftInput) => {
    setSaving(true);
    try {
      if (editor?.mode === 'edit') {
        await updatePost(editor.post.slug, input);
        notify('success', `"${input.title}" updated.`);
      } else {
        await createPost(input);
        notify('success', `"${input.title}" created — remember to make it visible when it's ready.`);
      }
      setEditor(null);
      refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleHidden = async (slug: string, hidden: boolean) => {
    await setPostVisibility(slug, { hidden });
    refresh();
  };
  const toggleFlag = async (slug: string, patch: { isFeatured?: boolean; isPinned?: boolean }) => {
    await setPostVisibility(slug, patch);
    refresh();
  };
  const move = async (list: DbPost[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[index], next[j]] = [next[j], next[index]];
    await reorderPosts(next.map((p) => p.slug));
    refresh();
  };
  const remove = async (slug: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    await deletePost(slug);
    notify('success', `"${title}" deleted.`);
    refresh();
  };

  const toggleSelectAll = (checked: boolean) => setSelected(checked ? new Set(filteredPosts.map((p) => p.slug)) : new Set());
  const toggleSelect = (slug: string, checked: boolean) => setSelected((prev) => {
    const next = new Set(prev);
    if (checked) next.add(slug); else next.delete(slug);
    return next;
  });

  const applyBulk = async () => {
    if (!bulkValue || selected.size === 0) return;
    const slugs = Array.from(selected);
    if (bulkValue === 'delete') {
      if (!confirm(`Delete ${slugs.length} post${slugs.length === 1 ? '' : 's'} permanently? This cannot be undone.`)) return;
      await Promise.all(slugs.map((slug) => deletePost(slug)));
    } else {
      await Promise.all(slugs.map((slug) => {
        if (bulkValue === 'show') return setPostVisibility(slug, { hidden: false });
        if (bulkValue === 'hide') return setPostVisibility(slug, { hidden: true });
        if (bulkValue === 'feature') return setPostVisibility(slug, { isFeatured: true });
        if (bulkValue === 'unfeature') return setPostVisibility(slug, { isFeatured: false });
        if (bulkValue === 'pin') return setPostVisibility(slug, { isPinned: true });
        if (bulkValue === 'unpin') return setPostVisibility(slug, { isPinned: false });
        return Promise.resolve();
      }));
    }
    const label = DB_POST_BULK_ACTIONS.find((a) => a.value === bulkValue)?.label ?? 'Action';
    notify('success', `${label}: ${slugs.length} post${slugs.length === 1 ? '' : 's'} updated.`);
    setSelected(new Set());
    setBulkValue('');
    refresh();
  };

  if (editor) {
    return (
      <BlogPostEditor
        seed={editorSeed}
        allPosts={allPosts}
        saving={saving}
        onSave={handleSave}
        onCancel={() => setEditor(null)}
      />
    );
  }

  const publishedCount = (posts ?? []).filter((p) => !p.hidden && !isScheduled(p)).length;
  const scheduledCount = (posts ?? []).filter(isScheduled).length;
  const hiddenCount = (posts ?? []).filter((p) => p.hidden).length;

  return (
    <div>
      {notice && <div className="mb-3"><AdminNoticeBanner notice={notice} onDismiss={dismiss} /></div>}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-heading text-h3 text-white">Database Posts</h1>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          {posts && posts.length > 0 && <TableSearchBox value={query} onChange={setQuery} placeholder="Search title, slug, category, tag…" />}
          <Button size="sm" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> Add New Post</Button>
        </div>
      </div>

      {loadError && <p className="mt-3 text-sm text-error">{loadError}</p>}

      {posts && posts.length === 0 && (
        <p className="mt-4 text-sm text-white/50">No database posts yet — click "Add New Post" to write one.</p>
      )}

      {posts && posts.length > 0 && (
        <>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <StatusFilterPills value={statusFilter} onChange={setStatusFilter} options={[
              { id: 'all', label: 'All', count: posts.length },
              { id: 'published', label: 'Published', count: publishedCount },
              { id: 'scheduled', label: 'Scheduled', count: scheduledCount },
              { id: 'hidden', label: 'Hidden', count: hiddenCount },
            ]} />
            {query && <p className="text-xs text-white/40">{filteredPosts.length} of {statusFiltered.length} match "{query}"</p>}
          </div>

          <div className="mt-3">
            <BulkActionBar actions={DB_POST_BULK_ACTIONS} selectedCount={selected.size} value={bulkValue} onChange={setBulkValue} onApply={applyBulk} />
          </div>

          <div className="mt-3 overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-white/40">
                <tr>
                  <th className="w-10 p-3">
                    <input type="checkbox" checked={filteredPosts.length > 0 && selected.size === filteredPosts.length}
                      onChange={(e) => toggleSelectAll(e.target.checked)} className="h-4 w-4 accent-gold-400" aria-label="Select all" />
                  </th>
                  <th className="p-3">Post</th>
                  <th className="p-3">Category</th>
                  <th className="p-3 text-center">Featured</th>
                  <th className="p-3 text-center">Pinned</th>
                  <th className="p-3 text-center">Visible</th>
                  <th className="p-3 text-center">Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((p) => {
                  const category = getBlogCategory(p.category);
                  // Reordering swaps adjacent positions in the *full* list, not the filtered view —
                  // using the filtered array's loop index here would silently collide sort_order
                  // with whatever the search/status filter is currently hiding. Look up the true
                  // index instead, so up/down stay correct (and their disabled state stays accurate).
                  const trueIndex = posts.findIndex((x) => x.slug === p.slug);
                  const scheduled = isScheduled(p);
                  return (
                    <tr key={p.slug} className="border-b border-white/5">
                      <td className="p-3">
                        <input type="checkbox" checked={selected.has(p.slug)} onChange={(e) => toggleSelect(p.slug, e.target.checked)}
                          className="h-4 w-4 accent-gold-400" aria-label={`Select ${p.title}`} />
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-white">
                          {p.title}
                          {scheduled && <span className="ml-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-brand-cyan-soft">Scheduled</span>}
                        </p>
                        <p className="text-xs text-white/40">{p.slug}</p>
                        <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
                          <button onClick={() => openEdit(p.slug)} className="text-brand-cyan-soft hover:underline">Edit</button>
                          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-white/40 hover:text-white hover:underline">View</a>
                          <button onClick={() => remove(p.slug, p.title)} className="text-error/70 hover:text-error hover:underline">Delete</button>
                        </div>
                      </td>
                      <td className="p-3 text-white/60">{category?.label ?? p.category}</td>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={!!p.isFeatured} onChange={(e) => toggleFlag(p.slug, { isFeatured: e.target.checked })} className="h-4 w-4 accent-gold-400" />
                      </td>
                      <td className="p-3 text-center">
                        <input type="checkbox" checked={!!p.isPinned} onChange={(e) => toggleFlag(p.slug, { isPinned: e.target.checked })} className="h-4 w-4 accent-brand-cyan-400" />
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => toggleHidden(p.slug, !p.hidden)} className={p.hidden ? 'text-white/30' : 'text-brand-cyan-300'}>
                          {p.hidden ? <EyeOff className="mx-auto h-5 w-5" /> : <Eye className="mx-auto h-5 w-5" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => move(posts, trueIndex, -1)} disabled={trueIndex === 0} className="text-white/50 hover:text-white disabled:opacity-20" aria-label="Move up"><ChevronUp className="h-4 w-4" /></button>
                          <button onClick={() => move(posts, trueIndex, 1)} disabled={trueIndex === posts.length - 1} className="text-white/50 hover:text-white disabled:opacity-20" aria-label="Move down"><ChevronDown className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
      <p className="mt-2 text-xs text-white/40">Posts saved here publish to every visitor immediately once made visible — a hero image is generated automatically unless you supply your own.</p>
    </div>
  );
}
