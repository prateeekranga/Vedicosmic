import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Wand2 } from 'lucide-react';
import { Input, Textarea, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ArrayEditor } from '@/components/admin/ArrayEditor';
import { TagInput } from '@/components/admin/TagInput';
import { BlogBlockFieldsEditor, emptyBlockRow, type EditableBlockRow } from '@/components/admin/BlogBlockFieldsEditor';
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
import { KeyTakeaways } from '@/components/blog/KeyTakeaways';
import { Accordion } from '@/components/ui/Accordion';
import { BLOG_CATEGORIES } from '@/data/blogCategories';
import { AUTHORS } from '@/data/authors';
import { slugify, estimateReadingTime, estimateWordCount } from '@/lib/blogUtils';
import { parsePastedContent } from '@/lib/parsePastedContent';
import { SITE_URL } from '@/config/site';
import type { BlogPost, BlogContentBlock, BlogCategoryId } from '@/types/blog.types';
import type { FAQItem } from '@/types/content.types';

type EditableHowToStep = { id: string; name: string; text: string };

/** `datetime-local` inputs need `YYYY-MM-DDTHH:mm` in the *viewer's* local time — using
 *  toISOString() here would silently shift the displayed time by the UTC offset. */
function toLocalDateTimeInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface BlogPostDraftInput {
  slug: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  category: BlogCategoryId;
  tags: string[];
  authorId?: string;
  publishedAt: string;
  heroImage?: string;
  isFeatured: boolean;
  isPinned: boolean;
  content: BlogContentBlock[];
  relatedToolSlugs: string[];
  relatedCourseSlugs: string[];
  faqs: FAQItem[];
  keyTakeaways: string[];
  howToSteps: { name: string; text: string }[];
}

function toEditableBlocks(blocks: BlogContentBlock[]): EditableBlockRow[] {
  return blocks.map((block, i) => ({ id: `b-${i}-${Date.now()}`, block }));
}

function draftFromPost(post: BlogPost | null): {
  title: string; seoTitle: string; excerpt: string; category: string; authorId: string;
  tags: string[]; slug: string; slugTouched: boolean; heroImage: string; publishedAt: string;
  isFeatured: boolean; isPinned: boolean; content: EditableBlockRow[];
  relatedToolSlugs: string; relatedCourseSlugs: string; keyTakeaways: string;
  howToSteps: EditableHowToStep[]; faqs: FAQItem[];
} {
  if (!post) {
    return {
      title: '', seoTitle: '', excerpt: '', category: BLOG_CATEGORIES.find((c) => c.id !== 'all')?.id ?? 'numerology',
      authorId: 'parikshiva', tags: [], slug: '', slugTouched: false, heroImage: '',
      publishedAt: toLocalDateTimeInput(new Date()), isFeatured: false, isPinned: false,
      content: [], relatedToolSlugs: '', relatedCourseSlugs: '', keyTakeaways: '', howToSteps: [], faqs: [],
    };
  }
  return {
    title: post.title, seoTitle: post.seoTitle ?? '', excerpt: post.excerpt, category: post.category,
    authorId: post.authorId ?? '', tags: post.tags, slug: post.slug, slugTouched: true,
    heroImage: post.heroImage ?? '', publishedAt: toLocalDateTimeInput(new Date(post.publishedAt)),
    isFeatured: !!post.isFeatured, isPinned: !!post.isPinned, content: toEditableBlocks(post.content),
    relatedToolSlugs: (post.relatedToolSlugs ?? []).join('\n'), relatedCourseSlugs: (post.relatedCourseSlugs ?? []).join('\n'),
    keyTakeaways: (post.keyTakeaways ?? []).join('\n'),
    howToSteps: (post.howToSteps ?? []).map((s, i) => ({ id: `h-${i}`, ...s })),
    faqs: post.faqs ?? [],
  };
}

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

interface Props {
  seed: BlogPost | null;
  allPosts: BlogPost[];
  saving: boolean;
  onSave: (input: BlogPostDraftInput) => void;
  onCancel: () => void;
}

export function BlogPostEditor({ seed, allPosts, saving, onSave, onCancel }: Props) {
  const [d, setD] = useState(() => draftFromPost(seed));
  const [pasteText, setPasteText] = useState('');
  useEffect(() => { setD(draftFromPost(seed)); }, [seed]);
  const update = (patch: Partial<typeof d>) => setD((prev) => ({ ...prev, ...patch }));

  const isNew = !seed;
  const previewBlocks: BlogContentBlock[] = d.content.map((row) => row.block);
  const displayTitle = d.seoTitle || (d.title ? `${d.title} · VediCosmic` : '');
  const focusKeyword = d.tags[0]?.toLowerCase() ?? '';
  const firstParagraph = previewBlocks.find((b): b is Extract<BlogContentBlock, { type: 'paragraph' }> => b.type === 'paragraph');
  const checklist = focusKeyword ? [
    { label: 'Focus keyword is in the title', pass: d.title.toLowerCase().includes(focusKeyword) },
    { label: 'Focus keyword is in the URL slug', pass: d.slug.toLowerCase().replace(/-/g, ' ').includes(focusKeyword) },
    { label: 'Focus keyword is in the meta description', pass: d.excerpt.toLowerCase().includes(focusKeyword) },
    { label: 'Focus keyword is in the first paragraph', pass: !!firstParagraph && firstParagraph.text.toLowerCase().includes(focusKeyword) },
    { label: 'SEO title is 30–60 characters', pass: displayTitle.length >= 30 && displayTitle.length <= 60 },
    { label: 'Meta description is 120–160 characters', pass: d.excerpt.length >= 120 && d.excerpt.length <= 160 },
  ] : [];

  const save = () => {
    const slug = d.slugTouched && d.slug.trim() ? slugify(d.slug) : slugify(d.title);
    onSave({
      slug,
      title: d.title.trim(),
      seoTitle: d.seoTitle.trim() || undefined,
      excerpt: d.excerpt.trim(),
      category: d.category as BlogCategoryId,
      tags: d.tags,
      authorId: d.authorId || undefined,
      // datetime-local gives "YYYY-MM-DDTHH:mm" in the browser's local time zone; `new Date(...)`
      // parses that as local time, so toISOString() converts it to a correct UTC instant to store.
      publishedAt: new Date(d.publishedAt).toISOString(),
      heroImage: d.heroImage.trim() || undefined,
      isFeatured: d.isFeatured,
      isPinned: d.isPinned,
      content: previewBlocks,
      relatedToolSlugs: linesToArray(d.relatedToolSlugs),
      relatedCourseSlugs: linesToArray(d.relatedCourseSlugs),
      faqs: d.faqs,
      keyTakeaways: linesToArray(d.keyTakeaways),
      howToSteps: d.howToSteps.map(({ id: _k, ...rest }) => rest),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-h3 text-white">{isNew ? 'New Post' : `Edit: ${seed!.title}`}</h2>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button onClick={save} disabled={saving || !d.title.trim() || !d.excerpt.trim()}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">Post</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title" value={d.title} onChange={(e) => update({ title: e.target.value })} />
              <Input label="URL slug" value={d.slug} placeholder="auto-generated from title if left blank"
                onChange={(e) => update({ slug: e.target.value, slugTouched: true })} />
            </div>
            <p className="-mt-2 truncate text-xs text-white/35">{SITE_URL}/blog/{(d.slugTouched && d.slug.trim() ? slugify(d.slug) : slugify(d.title)) || 'your-post-slug'}</p>
            <div>
              <Textarea label="Excerpt — shown on the post and used as the meta description" rows={2}
                value={d.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
              <p className={`mt-1 text-xs ${d.excerpt.length > 0 && (d.excerpt.length < 120 || d.excerpt.length > 160) ? 'text-warning' : 'text-white/40'}`}>
                {d.excerpt.length} characters — aim for 120–160
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">SEO, GEO &amp; AEO</h4>
            <div>
              <Input label="SEO title (optional)" value={d.seoTitle} placeholder={`${d.title || 'Untitled'} · VediCosmic`}
                onChange={(e) => update({ seoTitle: e.target.value })} />
              <p className={`mt-1 text-xs ${displayTitle.length > 60 ? 'text-warning' : 'text-white/40'}`}>
                {displayTitle.length} characters — aim for 50–60
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wide text-white/35">Search snippet preview</p>
              <p className="truncate text-sm text-brand-cyan-soft">{SITE_URL}/blog/{d.slug || 'your-post-slug'}</p>
              <p className="truncate text-base text-gold-pale">{displayTitle || 'Untitled post · VediCosmic'}</p>
              <p className="line-clamp-2 text-sm text-white/55">{d.excerpt || 'Your excerpt doubles as the meta description shown here.'}</p>
            </div>

            <TagInput label="Keywords / Tags" value={d.tags} onChange={(tags) => update({ tags })} />

            {checklist.length > 0 && (
              <div className="rounded-xl border border-white/10 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-white/35">
                  On-page checklist · {checklist.filter((c) => c.pass).length}/{checklist.length} passed
                </p>
                <ul className="space-y-1.5">
                  {checklist.map((c) => (
                    <li key={c.label} className={`flex items-center gap-2 text-sm ${c.pass ? 'text-success' : 'text-white/45'}`}>
                      {c.pass ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <XCircle className="h-4 w-4 shrink-0 text-white/25" />}
                      {c.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-xs text-white/40">
              Hero image alt text isn't a separate field yet — it falls back to the post title sitewide (see chat for why).
              FAQs and How-to steps further down feed the FAQPage/HowTo structured data that answer engines
              (Google AI Overviews, ChatGPT, Perplexity) read directly — fill them in for the best GEO/AEO results.
            </p>
          </div>

          <div className="space-y-4 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">Publishing</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Category" value={d.category} onChange={(e) => update({ category: e.target.value })}>
                {BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
              <Select label="Author" value={d.authorId} onChange={(e) => update({ authorId: e.target.value })}>
                <option value="">No author</option>
                {Object.entries(AUTHORS).map(([id, a]) => <option key={id} value={id}>{a.name}</option>)}
              </Select>
            </div>
            <div>
              <Input label="Publish date & time" type="datetime-local" value={d.publishedAt} onChange={(e) => update({ publishedAt: e.target.value })} />
              <p className="mt-1 text-xs text-white/40">
                Pick a future time to schedule this post — it stays off the public site until that moment, then goes live on its own.
              </p>
            </div>
            <Input label="Hero image URL (optional)" value={d.heroImage}
              placeholder="Leave blank — a hero image is generated automatically on save"
              onChange={(e) => update({ heroImage: e.target.value })} />
            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={d.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} className="h-4 w-4 accent-gold-400" />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input type="checkbox" checked={d.isPinned} onChange={(e) => update({ isPinned: e.target.checked })} className="h-4 w-4 accent-brand-cyan-400" />
                Pinned
              </label>
            </div>
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">Content blocks</h4>

            <div className="rounded-xl border border-dashed border-white/15 bg-cosmic-dark/30 p-3">
              <p className="mb-2 text-xs text-white/50">
                Write or paste a full draft here — <code>## </code>/<code>### </code> headings, "- " bullet lists,
                "1. " numbered lists and "&gt; " quotes are recognised automatically. Blank lines separate blocks.
              </p>
              <Textarea rows={5} value={pasteText} onChange={(e) => setPasteText(e.target.value)}
                placeholder={'## A heading\n\nA paragraph of normal writing…\n\n- A bullet\n- Another bullet'} />
              <Button
                variant="outline" size="sm" className="mt-2" disabled={!pasteText.trim()}
                onClick={() => {
                  const parsed = parsePastedContent(pasteText);
                  if (parsed.length === 0) return;
                  update({ content: [...d.content, ...parsed.map((block, i) => ({ id: `b-paste-${Date.now()}-${i}`, block }))] });
                  setPasteText('');
                }}
              >
                <Wand2 className="mr-2 h-4 w-4" /> Convert &amp; add to post
              </Button>
            </div>

            <ArrayEditor<EditableBlockRow>
              items={d.content}
              onChange={(content) => update({ content })}
              addLabel="Add block"
              emptyItem={() => emptyBlockRow(`b-${Date.now()}`)}
              renderFields={(row, updateRow) => (
                <BlogBlockFieldsEditor row={row} update={updateRow} allPosts={allPosts} />
              )}
            />
          </div>

          <div className="grid gap-4 rounded-2xl border border-white/10 p-4 sm:grid-cols-2">
            <Textarea label="Related tool slugs (one per line)" rows={3} value={d.relatedToolSlugs}
              onChange={(e) => update({ relatedToolSlugs: e.target.value })} />
            <Textarea label="Related course slugs (one per line)" rows={3} value={d.relatedCourseSlugs}
              onChange={(e) => update({ relatedCourseSlugs: e.target.value })} />
          </div>

          <div className="space-y-2 rounded-2xl border border-white/10 p-4">
            <Textarea label="Key takeaways (one per line)" rows={4} value={d.keyTakeaways}
              onChange={(e) => update({ keyTakeaways: e.target.value })} />
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">How-to steps (optional — feeds HowTo schema)</h4>
            <ArrayEditor<EditableHowToStep>
              items={d.howToSteps}
              onChange={(howToSteps) => update({ howToSteps })}
              addLabel="Add step"
              emptyItem={() => ({ id: `h-${Date.now()}`, name: '', text: '' })}
              renderFields={(step, updateStep) => (
                <>
                  <Input label="Step name" value={step.name} onChange={(e) => updateStep({ name: e.target.value })} />
                  <Textarea label="Step text" rows={2} value={step.text} onChange={(e) => updateStep({ text: e.target.value })} />
                </>
              )}
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-white/10 p-4">
            <h4 className="text-sm font-medium text-white/70">FAQs</h4>
            <ArrayEditor<FAQItem>
              items={d.faqs}
              onChange={(faqs) => update({ faqs })}
              addLabel="Add FAQ"
              emptyItem={() => ({ id: `blog-faq-${Date.now()}`, header: '', body: '' })}
              renderFields={(faq, updateFaq) => (
                <>
                  <Input label="Question" value={faq.header} onChange={(e) => updateFaq({ header: e.target.value })} />
                  <Textarea label="Answer" rows={2} value={faq.body} onChange={(e) => updateFaq({ body: e.target.value })} />
                </>
              )}
            />
          </div>
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-xs uppercase tracking-wider text-white/35">Live preview</p>
          <div className="max-h-[80vh] overflow-y-auto rounded-2xl border border-white/10 bg-cosmic-dark/40 p-6">
            <h1 className="font-display text-h2 text-white">{d.title || 'Untitled post'}</h1>
            <p className="mt-2 text-white/60">{d.excerpt}</p>
            {linesToArray(d.keyTakeaways).length > 0 && <KeyTakeaways items={linesToArray(d.keyTakeaways)} />}
            <div className="mt-6"><BlogContentRenderer blocks={previewBlocks} /></div>
            {d.faqs.length > 0 && (
              <div className="mt-8"><Accordion items={d.faqs} /></div>
            )}
          </div>
          <p className="mt-2 text-xs text-white/40">
            {estimateWordCount(previewBlocks)} words · ~{estimateReadingTime(previewBlocks)} min read
          </p>
        </div>
      </div>
    </div>
  );
}
