import { Link } from 'react-router-dom';
import { Star, Users } from 'lucide-react';
import type { Instructor } from '@/types/course.types';

/**
 * E-E-A-T byline card — real bio/credentials/stats shared with course
 * instructor cards, not content authored just for this box.
 */
export function AuthorBio({ author, slug }: { author: Instructor; slug: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-cosmic-light/40 p-6 sm:flex-row sm:items-start">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gold-bright/15 text-lg font-semibold text-gold-pale">
        {author.initials}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-white/40">Written by</p>
        <p className="mt-0.5 font-heading text-lg text-white">{author.name}</p>
        <p className="text-sm text-gold-soft">{author.title}</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{author.bio}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/45">
          <span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-gold-soft" /> {author.rating} instructor rating</span>
          <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {author.studentCount.toLocaleString('en-IN')}+ students taught</span>
        </div>
        <Link to={`/blog?author=${slug}`} className="mt-3 inline-block text-sm text-brand-cyan-soft hover:underline">
          More articles by {author.name.split(' ').slice(-1)[0]} →
        </Link>
      </div>
    </div>
  );
}
