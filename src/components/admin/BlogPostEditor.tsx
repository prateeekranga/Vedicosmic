import { useState, useEffect } from 'react';
import { Input, Textarea, Select } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ArrayEditor } from '@/components/admin/ArrayEditor';
import { BlogBlockFieldsEditor, emptyBlockRow, type EditableBlockRow } from '@/components/admin/BlogBlockFieldsEditor';
import { BlogContentRenderer } from '@/components/blog/BlogContentRenderer';
import { KeyTakeaways } from '@/components/blog/KeyTakeaways';
import { Accordion } from '@/components/ui/Accordion';
import { BLOG_CATEGORIES } from '@/data/blogCategories';
import { AUTHORS } from '@/data/authors';
import { slugify, estimateReadingTime, estimateWordCount } from '@/lib/blogUtils';
import type { BlogPost, BlogContentBlock, BlogCategoryId } from '@/types/blog.types';
import type { FAQItem } from '@/types/content.types';

type EditableHowToStep = { id: string; name: string; text: string };

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
  tags: string; slug: string; slugTouched: boolean; heroImage: string; publishedAt: string;
  isFeatured: boolean; isPinned: boolean; content: EditableBlockRow[];
  relatedToolSlugs: string; relatedCourseSlugs: string; keyTakeaways: string;
  howToSteps: EditableHowToStep[]; faqs: FAQItem[];
} {
  if (!post) {
    return {
      title: '', seoTitle: '', excerpt: '', category: BLOG_CATEGORIES.find((c) => c.id !== 'all')?.id ?? 'numerology',
      authorId: '', tags: '', slug: '', slugTouched: false, heroImage: '',
      publishedAt: new Date().toISOString().slice(0, 10), isFeatured: false, isPinned: false,
      content: [], relatedToolSlugs: '', relatedCourseSlugs: '', keyTakeaways: '', howToSteps: [], faqs: [],
    };
  }
  return {
    title: post.title, seoTitle: post.seoTitle ?? '', excerpt: post.excerpt, category: post.category,
    authorId: post.authorId ?? '', tags: post.tags.join('\n'), slug: post.slug, slugTouched: true,
    heroImage: post.heroImage ?? '', publishedAt: post.publishedAt.slice(0, 10),
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
  useEffect(() => { setD(draftFromPost(seed)); }, [seed]);
  const update = (patch: Partial<typeof d>) => setD((prev) => ({ ...prev, ...patch }));

  const isNew = !seed;
  const previewBlocks: BlogContentBlock[] = d.content.map((row) => row.block);

  const save = () => {
    const slug = d.slugTouched && d.slug.trim() ? slugify(d.slug) : slugify(d.title);
    onSave({
      slug,
      title: d.title.trim(),
      seoTitle: d.seoTitle.trim() || undefined,
      excerpt: d.excerpt.trim(),
      category: d.category as BlogCategoryId,
      tags: linesToArray(d.tags),
      authorId: d.authorId || undefined,
      publishedAt: d.publishedAt,
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
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Title" value={d.title} onChange={(e) => update({ title: e.target.value })} />
              <Input label="URL slug" value={d.slug} placeholder="auto-generated from title if left blank"
                onChange={(e) => update({ slug: e.target.value, slugTouched: true })} />
            </div>
            <Input label="SEO title (optional)" value={d.seoTitle} placeholder={`${d.title || 'Untitled'} · VediCosmic`}
              onChange={(e) => update({ seoTitle: e.target.value })} />
            <Textarea label="Excerpt" rows={2} value={d.excerpt} onChange={(e) => update({ excerpt: e.target.value })} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Category" value={d.category} onChange={(e) => update({ category: e.target.value })}>
                {BLOG_CATEGORIES.filter((c) => c.id !== 'all').map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
              <Select label="Author" value={d.authorId} onChange={(e) => update({ authorId: e.target.value })}>
                <option value="">No author</option>
                {Object.entries(AUTHORS).map(([id, a]) => <option key={id} value={id}>{a.name}</option>)}
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Published date" type="date" value={d.publishedAt} onChange={(e) => update({ publishedAt: e.target.value })} />
              <Input label="Hero image URL (optional)" value={d.heroImage}
                placeholder="Leave blank — a hero image is generated automatically on save"
                onChange={(e) => update({ heroImage: e.target.value })} />
            </div>
            <Textarea label="Tags (one per line)" rows={2} value={d.tags} onChange={(e) => update({ tags: e.target.value })} />
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
