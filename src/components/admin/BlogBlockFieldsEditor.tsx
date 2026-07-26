import { Input, Textarea, Select } from '@/components/ui/Field';
import { TOOLS } from '@/data/tools';
import { COURSES } from '@/data/courses';
import type { BlogContentBlock, BlogPost } from '@/types/blog.types';

/** Wraps a block with a stable row identity for ArrayEditor — kept separate from the block's own
 *  fields since the `diagram` block type already has its own `id` field (the diagram identifier),
 *  which would otherwise collide with ArrayEditor's required `{ id: string }` row key. */
export interface EditableBlockRow {
  id: string;
  block: BlogContentBlock;
}

const BLOCK_TYPES: BlogContentBlock['type'][] = [
  'heading', 'paragraph', 'list', 'image', 'quote', 'callout',
  'cta-tool', 'cta-course', 'internal-link', 'diagram', 'divider',
];

const DIAGRAM_IDS: Extract<BlogContentBlock, { type: 'diagram' }>['id'][] = ['loshu-grid', 'nakshatra-wheel', 'chakra-column'];

function blankBlockOfType(type: BlogContentBlock['type']): BlogContentBlock {
  switch (type) {
    case 'heading': return { type, level: 2, text: '' };
    case 'paragraph': return { type, text: '' };
    case 'list': return { type, style: 'bullet', items: [''] };
    case 'image': return { type, src: '', alt: '' };
    case 'quote': return { type, text: '' };
    case 'callout': return { type, tone: 'info', text: '' };
    case 'cta-tool': return { type, toolSlug: TOOLS[0]?.slug ?? '' };
    case 'cta-course': return { type, courseSlug: COURSES[0]?.slug ?? '' };
    case 'internal-link': return { type, postSlug: '' };
    case 'diagram': return { type, id: 'loshu-grid' };
    case 'divider': return { type };
  }
}

export function emptyBlockRow(rowId: string, type: BlogContentBlock['type'] = 'paragraph'): EditableBlockRow {
  return { id: rowId, block: blankBlockOfType(type) };
}

export function BlogBlockFieldsEditor({
  row, update, allPosts,
}: {
  row: EditableBlockRow;
  update: (patch: Partial<EditableBlockRow>) => void;
  allPosts: BlogPost[];
}) {
  const block = row.block;
  const updateBlock = (patch: Partial<BlogContentBlock>) => update({ block: { ...block, ...patch } as BlogContentBlock });

  return (
    <div className="space-y-3">
      <Select
        label="Block type"
        value={block.type}
        onChange={(e) => update({ block: blankBlockOfType(e.target.value as BlogContentBlock['type']) })}
      >
        {BLOCK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>

      {block.type === 'heading' && (
        <>
          <Select label="Level" value={block.level} onChange={(e) => updateBlock({ level: Number(e.target.value) as 2 | 3 })}>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </Select>
          <Input label="Text" value={block.text} onChange={(e) => updateBlock({ text: e.target.value })} />
        </>
      )}

      {block.type === 'paragraph' && (
        <Textarea label="Text" rows={4} value={block.text} onChange={(e) => updateBlock({ text: e.target.value })} />
      )}

      {block.type === 'list' && (
        <>
          <Select label="Style" value={block.style} onChange={(e) => updateBlock({ style: e.target.value as 'bullet' | 'number' })}>
            <option value="bullet">Bullet</option>
            <option value="number">Numbered</option>
          </Select>
          <Textarea label="Items (one per line)" rows={4} value={block.items.join('\n')} onChange={(e) => updateBlock({ items: e.target.value.split('\n') })} />
        </>
      )}

      {block.type === 'image' && (
        <>
          <Input label="Image URL" value={block.src} onChange={(e) => updateBlock({ src: e.target.value })} />
          <Input label="Alt text" value={block.alt} onChange={(e) => updateBlock({ alt: e.target.value })} />
          <Input label="Caption (optional)" value={block.caption ?? ''} onChange={(e) => updateBlock({ caption: e.target.value })} />
        </>
      )}

      {block.type === 'quote' && (
        <>
          <Textarea label="Quote text" rows={3} value={block.text} onChange={(e) => updateBlock({ text: e.target.value })} />
          <Input label="Attribution (optional)" value={block.attribution ?? ''} onChange={(e) => updateBlock({ attribution: e.target.value })} />
        </>
      )}

      {block.type === 'callout' && (
        <>
          <Select label="Tone" value={block.tone} onChange={(e) => updateBlock({ tone: e.target.value as 'info' | 'tip' | 'warning' })}>
            <option value="info">Info</option>
            <option value="tip">Tip</option>
            <option value="warning">Warning</option>
          </Select>
          <Input label="Title (optional)" value={block.title ?? ''} onChange={(e) => updateBlock({ title: e.target.value })} />
          <Textarea label="Text" rows={3} value={block.text} onChange={(e) => updateBlock({ text: e.target.value })} />
        </>
      )}

      {block.type === 'cta-tool' && (
        <>
          <Select label="Tool" value={block.toolSlug} onChange={(e) => updateBlock({ toolSlug: e.target.value })}>
            {TOOLS.map((t) => <option key={t.slug} value={t.slug}>{t.name}</option>)}
          </Select>
          <Input label="Label (optional)" value={block.label ?? ''} onChange={(e) => updateBlock({ label: e.target.value })} />
        </>
      )}

      {block.type === 'cta-course' && (
        <>
          <Select label="Course" value={block.courseSlug} onChange={(e) => updateBlock({ courseSlug: e.target.value })}>
            {COURSES.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </Select>
          <Input label="Label (optional)" value={block.label ?? ''} onChange={(e) => updateBlock({ label: e.target.value })} />
        </>
      )}

      {block.type === 'internal-link' && (
        <>
          <Select label="Post" value={block.postSlug} onChange={(e) => updateBlock({ postSlug: e.target.value })}>
            <option value="">Select a post…</option>
            {allPosts.map((p) => <option key={p.slug} value={p.slug}>{p.title}</option>)}
          </Select>
          <Input label="Label (optional)" value={block.label ?? ''} onChange={(e) => updateBlock({ label: e.target.value })} />
        </>
      )}

      {block.type === 'diagram' && (
        <>
          <Select label="Diagram" value={block.id} onChange={(e) => updateBlock({ id: e.target.value as typeof block.id })}>
            {DIAGRAM_IDS.map((id) => <option key={id} value={id}>{id}</option>)}
          </Select>
          <Input label="Caption (optional)" value={block.caption ?? ''} onChange={(e) => updateBlock({ caption: e.target.value })} />
        </>
      )}

      {block.type === 'divider' && <p className="text-xs text-white/40">No fields — renders a plain horizontal rule.</p>}
    </div>
  );
}
