import { Link } from 'react-router-dom';

export interface Crumb { name: string; path: string }

/**
 * The page's trail. Pass the same array to `breadcrumbList()` so the visible trail and the
 * structured data can never disagree. The last item is the current page and is not a link.
 */
export function Breadcrumbs({ items, className = '' }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-white/55">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-x-2">
              {last
                ? <span aria-current="page" className="text-white/80">{item.name}</span>
                : <Link to={item.path} className="hover:text-white">{item.name}</Link>}
              {!last && <span aria-hidden="true" className="text-white/30">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
