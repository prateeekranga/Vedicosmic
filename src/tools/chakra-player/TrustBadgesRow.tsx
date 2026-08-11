import { Gift, UserX, ShieldCheck, Ban, Share2 } from 'lucide-react';

/** Each claim verified true for this specific page before writing it: no pricing/auth
 *  gate, no useAuth reference anywhere in this tool, AdSlot never renders on /tools/*,
 *  and ShareBar is the real, existing share feature already on every tool page. */
const BADGES = [
  { Icon: Gift, title: '100% Free', text: 'No paywall, no premium tier' },
  { Icon: UserX, title: 'No Sign-Up', text: 'Nothing to create, nothing to remember' },
  { Icon: ShieldCheck, title: 'Private & On-Device', text: 'Every tone is synthesised live in your browser' },
  { Icon: Ban, title: 'Ad-Free Experience', text: 'No ads interrupt your session' },
  { Icon: Share2, title: 'Share With Love', text: 'One tap to WhatsApp, X, email & more' },
];

export function TrustBadgesRow() {
  return (
    <div className="grid grid-cols-2 gap-5 border-t border-white/8 pt-8 sm:grid-cols-5">
      {BADGES.map(({ Icon, title, text }) => (
        <div key={title} className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-white/5 text-gold-soft">
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-white/45">{text}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
