import { useEffect, useMemo, useState } from 'react';
import { Eye, EyeOff, RotateCcw, ChevronUp, ChevronDown, Pencil, ExternalLink, Trash2, Plus, LogIn, LogOut, Search, X } from 'lucide-react';
import { BLOG_POSTS } from '@/data/blog';
import { getBlogCategory } from '@/data/blogCategories';
import {
  getBlogOverrides, setBlogOverride, resetBlogOverrides, mergedBlogPosts,
  type BlogPostOverride,
} from '@/lib/blogOverrides';
import { getSEOOverrides, setSEOOverride } from '@/lib/siteContent';
import { useOverridesVersion } from '@/hooks/useOverridesVersion';
import { useAllBlogPosts } from '@/hooks/useAllBlogPosts';
import { isBlogAdminAuthed, onAdminAuthChange, adminLogin, adminLogout } from '@/lib/adminAuth';
import {
  fetchAdminPosts, fetchAdminPostBySlug, createPost, updatePost, deletePost, setPostVisibility, reorderPosts,
} from '@/lib/blogApi';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
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

export function BlogManager() {
  const v = useOverridesVersion();
  const ov = getBlogOverrides();
  const allRows = rankedPosts(mergedBlogPosts(), ov);
  const [query, setQuery] = useState('');
  const rows = useMemo(() => allRows.filter(({ post }) => matchesSearch(post, query)), [allRows, query]);
  const [seoSlug, setSeoSlug] = useState<string | null>(null);
  const seoPost = seoSlug ? BLOG_POSTS.find((p) => p.slug === seoSlug) : undefined;

  return (
    <div className="space-y-10" key={v}>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-h3 text-white">Blog</h2>
          <div className="flex flex-1 items-center justify-end gap-3">
            <TableSearchBox value={query} onChange={setQuery} placeholder="Search title, slug, category, tag…" />
            <Button variant="ghost" size="sm" onClick={() => { if (confirm('Reset all blog changes?')) resetBlogOverrides(); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Reset
            </Button>
          </div>
        </div>
        {query && <p className="mt-2 text-xs text-white/40">{rows.length} of {allRows.length} posts match "{query}"</p>}
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
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

/** Everything for live, database-published posts — a separate, server-verified login gates
 *  writes here (the localStorage passcode above only ever gated this browser). */
function DbPostsSection() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [posts, setPosts] = useState<DbPost[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(null);
  const [editorSeed, setEditorSeed] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const { posts: allPosts } = useAllBlogPosts(); // for the internal-link picker inside the editor
  const filteredPosts = useMemo(() => (posts ?? []).filter((p) => matchesSearch(p, query)), [posts, query]);

  const refresh = () => {
    fetchAdminPosts().then(setPosts).catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load'));
  };

  useEffect(() => {
    isBlogAdminAuthed().then(setAuthed);
    return onAdminAuthChange(setAuthed);
  }, []);
  useEffect(() => { if (authed) refresh(); }, [authed]);

  if (authed === null) return null;

  if (!authed) {
    return <BlogAdminLoginForm onAuthed={() => setAuthed(true)} />;
  }

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
      } else {
        await createPost(input);
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

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-h3 text-white">Database Posts</h2>
        <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
          {posts && posts.length > 0 && <TableSearchBox value={query} onChange={setQuery} placeholder="Search title, slug, category, tag…" />}
          <Button size="sm" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> New Post</Button>
          <Button variant="ghost" size="sm" onClick={() => adminLogout().then(() => setAuthed(false))}>
            <LogOut className="mr-2 h-4 w-4" /> Log out
          </Button>
        </div>
      </div>

      {loadError && <p className="mt-3 text-sm text-error">{loadError}</p>}

      {posts && posts.length === 0 && (
        <p className="mt-4 text-sm text-white/50">No database posts yet — click "New Post" to write one.</p>
      )}

      {query && posts && posts.length > 0 && (
        <p className="mt-2 text-xs text-white/40">{filteredPosts.length} of {posts.length} posts match "{query}"</p>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10 bg-cosmic-light/40">
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
              {filteredPosts.map((p) => {
                const category = getBlogCategory(p.category);
                // Reordering swaps adjacent positions in the *full* list, not the filtered view —
                // using the filtered array's loop index here would silently collide sort_order
                // with whatever the search box is currently hiding. Look up the true index instead,
                // so up/down stay correct (and their disabled state stays accurate) while searching.
                const trueIndex = posts.findIndex((x) => x.slug === p.slug);
                return (
                  <tr key={p.slug} className="border-b border-white/5">
                    <td className="p-3"><p className="font-medium text-white">{p.title}</p><p className="text-xs text-white/40">{p.slug}</p></td>
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
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-3">
                        <button onClick={() => openEdit(p.slug)} className="text-white/50 hover:text-white" aria-label="Edit post"><Pencil className="h-4 w-4" /></button>
                        <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer" className="text-white/50 hover:text-white" aria-label="View live"><ExternalLink className="h-4 w-4" /></a>
                        <button onClick={() => remove(p.slug, p.title)} className="text-error/70 hover:text-error" aria-label="Delete post"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-white/40">Posts saved here publish to every visitor immediately once made visible — a hero image is generated automatically unless you supply your own.</p>
    </div>
  );
}

function BlogAdminLoginForm({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const result = await adminLogin(email, password);
    setLoading(false);
    if (result.ok) onAuthed();
    else setError(result.error);
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-cosmic-light/40 p-6">
      <h2 className="font-heading text-h3 text-white">Database Posts</h2>
      <p className="mt-1 text-sm text-white/50">
        Writing and publishing new posts requires a separate, server-verified login — this keeps write
        access to the live database gated by more than a browser-local passcode.
      </p>
      <form onSubmit={submit} className="mt-4 max-w-sm space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" disabled={loading}>
          <LogIn className="mr-2 h-4 w-4" /> {loading ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </div>
  );
}
