import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface OnThisPageItem {
  id: string;
  label: string;
  /** 3 indents the entry under the one before it. */
  level?: 2 | 3;
}

/** How far below the top of the window a heading counts as the one being read (under the fixed bar). */
const READING_LINE = 140;

/** The id of the section being read: the last one whose top has scrolled past the reading line. */
function useActiveId(ids: string[]): string | undefined {
  const [active, setActive] = useState<string | undefined>(undefined);
  const key = ids.join('|');

  useEffect(() => {
    const list = key ? key.split('|') : [];
    let frame = 0;
    const update = () => {
      frame = 0;
      const present = list.filter((id) => document.getElementById(id));
      let current: string | undefined;
      for (const id of present) {
        if (document.getElementById(id)!.getBoundingClientRect().top <= READING_LINE) current = id;
      }
      // A short last section never reaches the reading line; at the foot of the page it is the one shown.
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 8;
      if (atBottom && current && present.length) current = present[present.length - 1];
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [key]);

  return active;
}

/**
 * The "On this page" menu that sits in a side column on wide screens, with the section being
 * read marked. Plain anchor links, so it works before JavaScript and in pre-rendered pages.
 */
export function OnThisPage({
  items, className, label = 'On this page',
}: { items: OnThisPageItem[]; className?: string; label?: string }) {
  const active = useActiveId(items.map((i) => i.id));
  if (items.length < 2) return null;
  return (
    <nav aria-label={label} className={className}>
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gold-soft/80">{label}</p>
      <ul className="border-l border-white/10 text-sm">
        {items.map((it) => {
          const on = it.id === active;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={on ? 'location' : undefined}
                className={cn(
                  '-ml-px block border-l py-1.5 pr-2 leading-snug transition-colors',
                  it.level === 3 ? 'pl-7 text-[0.8125rem]' : 'pl-4',
                  on ? 'border-gold-soft text-gold-pale' : 'border-transparent text-white/60 hover:border-white/30 hover:text-white',
                )}
              >
                {it.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
