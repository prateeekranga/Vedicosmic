import { Link } from 'react-router-dom';
import { Home, LogOut, ExternalLink } from 'lucide-react';

/** WordPress's admin bar, adapted: a thin, always-on-top strip above everything else in the
 *  dashboard — the one piece of chrome that makes /vc-portal-x7 read as "an admin tool", not
 *  a themed page of the public site. Real wp-admin never shows the active theme's header here;
 *  this is the equivalent stand-in, permanently fixed regardless of sidebar/content scroll. */
export function AdminBar({ email, onLogout }: { email?: string; onLogout: () => void }) {
  return (
    <div className="fixed inset-x-0 top-0 z-[70] flex h-8 items-center justify-between border-b border-white/10 bg-[#0c0c1c] px-3 text-xs text-white/65">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1.5 font-medium text-white/85 hover:text-gold-300">
          <Home className="h-3.5 w-3.5" /> VediCosmic
        </Link>
        <a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-1 hover:text-white sm:inline-flex">
          Visit Site <ExternalLink className="h-3 w-3" />
        </a>
      </div>
      <div className="flex items-center gap-3">
        {email && <span className="hidden text-white/45 sm:inline">Howdy, {email}</span>}
        <button onClick={onLogout} className="flex items-center gap-1.5 hover:text-white">
          <LogOut className="h-3.5 w-3.5" /> Log out
        </button>
      </div>
    </div>
  );
}

export const ADMIN_BAR_HEIGHT = 32;
