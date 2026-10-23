import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import type { Person } from '@/content/people';

/** Byline card for a verified person. Shows only what the person has confirmed about
 *  themselves: name, role and, once written, their own bio. */
export function AuthorBio({ person }: { person: Person }) {
  const initials = person.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <Card className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold-bright/15 text-lg font-semibold text-gold-pale">
        {initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-white/40">Written by</p>
        <p className="mt-0.5 font-heading text-lg text-white">{person.name}</p>
        <p className="text-sm text-gold-soft">{person.role}</p>
        {person.nameNote && <p className="mt-1 text-sm text-white/55">{person.nameNote}</p>}
        {person.bio && <p className="mt-2 text-sm leading-relaxed text-white/60">{person.bio}</p>}
        <Link to={`/blog?author=${person.id}`} className="mt-3 inline-block text-sm text-brand-cyan-soft hover:underline">
          More articles by {person.name} →
        </Link>
      </div>
    </Card>
  );
}
