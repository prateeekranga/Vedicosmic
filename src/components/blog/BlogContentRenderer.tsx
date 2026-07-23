import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { Info, Lightbulb, TriangleAlert, ArrowRight } from 'lucide-react';
import { getTool } from '@/data/tools';
import { getCourse } from '@/data/courses';
import type { BlogContentBlock } from '@/types/blog.types';

/** Splits on `**bold**` and wraps matches in <strong> — no markdown parser, no dangerouslySetInnerHTML. */
function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

const CALLOUT_STYLE: Record<'info' | 'tip' | 'warning', { box: string; Icon: typeof Info }> = {
  info: { box: 'border-brand-cyan/30 bg-brand-cyan/8 text-brand-cyan-soft', Icon: Info },
  tip: { box: 'border-gold-soft/30 bg-gold-bright/8 text-gold-pale', Icon: Lightbulb },
  warning: { box: 'border-warning/30 bg-warning/8 text-warning', Icon: TriangleAlert },
};

export function BlogContentRenderer({ blocks }: { blocks: BlogContentBlock[] }) {
  return <div className="space-y-6">{blocks.map((b, i) => <Block key={i} block={b} />)}</div>;
}

function Block({ block }: { block: BlogContentBlock }) {
  switch (block.type) {
    case 'heading':
      return block.level === 2
        ? <h2 className="mt-10 font-heading text-h3 text-white">{block.text}</h2>
        : <h3 className="mt-8 font-heading text-h4 text-white">{block.text}</h3>;

    case 'paragraph':
      return <p className="text-body leading-relaxed text-white/70">{renderInlineBold(block.text)}</p>;

    case 'list': {
      const Tag = block.style === 'number' ? 'ol' : 'ul';
      return (
        <Tag className={`space-y-2 pl-5 text-body leading-relaxed text-white/70 ${block.style === 'number' ? 'list-decimal' : 'list-disc'}`}>
          {block.items.map((item, i) => <li key={i}>{renderInlineBold(item)}</li>)}
        </Tag>
      );
    }

    case 'image':
      return (
        <figure>
          <img src={block.src} alt={block.alt} loading="lazy" className="w-full rounded-2xl border border-white/10" />
          {block.caption && <figcaption className="mt-2 text-center text-xs text-white/40">{block.caption}</figcaption>}
        </figure>
      );

    case 'quote':
      return (
        <blockquote className="border-l-4 border-gold-soft/40 pl-5 italic text-white/70">
          <p>{renderInlineBold(block.text)}</p>
          {block.attribution && <footer className="mt-2 text-sm not-italic text-white/40">— {block.attribution}</footer>}
        </blockquote>
      );

    case 'callout': {
      const { box, Icon } = CALLOUT_STYLE[block.tone];
      return (
        <div className={`flex gap-3 rounded-2xl border p-5 ${box}`}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            {block.title && <p className="mb-1 font-medium">{block.title}</p>}
            <p className="text-sm leading-relaxed text-white/70">{renderInlineBold(block.text)}</p>
          </div>
        </div>
      );
    }

    case 'cta-tool': {
      const tool = getTool(block.toolSlug);
      if (!tool) {
        if (import.meta.env.DEV) console.warn(`BlogContentRenderer: unknown toolSlug "${block.toolSlug}"`);
        return null;
      }
      return (
        <Link to={`/tools/${tool.slug}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-cosmic-light/40 p-5 transition-colors hover:border-gold-soft/30">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-bright/10 text-gold-soft">
            <tool.Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-white">{tool.name}</p>
            <p className="truncate text-sm text-white/50">{tool.subtitle}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm text-brand-cyan-soft">
            {block.label ?? 'Try it free'} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      );
    }

    case 'cta-course': {
      const course = getCourse(block.courseSlug);
      if (!course) {
        if (import.meta.env.DEV) console.warn(`BlogContentRenderer: unknown courseSlug "${block.courseSlug}"`);
        return null;
      }
      return (
        <Link to={`/courses/${course.slug}`} className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-cosmic-light/40 p-5 transition-colors hover:border-gold-soft/30">
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-white/40">Go deeper</p>
            <p className="font-medium text-white">{course.title}</p>
            <p className="truncate text-sm text-white/50">{course.subtitle}</p>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-sm text-brand-cyan-soft">
            {block.label ?? 'Explore course'} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      );
    }

    case 'divider':
      return <hr className="my-8 border-white/10" />;

    default: {
      const _exhaustive: never = block;
      return _exhaustive;
    }
  }
}
