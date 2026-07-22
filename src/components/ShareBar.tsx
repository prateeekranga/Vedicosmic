import { useState } from 'react';
import { Share2, Facebook, Mail, Check, Link as LinkIcon } from 'lucide-react';
import { WhatsAppIcon, TelegramIcon, XIcon, PinterestIcon } from '@/components/icons/BrandIcons';
import { shareLink, type SharePlatform } from '@/lib/share';
import { useToast } from '@/contexts/ToastContext';
import { cn } from '@/lib/cn';

const ICONS: Record<SharePlatform, React.ComponentType<{ className?: string }>> = {
  whatsapp: WhatsAppIcon, telegram: TelegramIcon, x: XIcon, facebook: Facebook, pinterest: PinterestIcon, email: Mail,
};

const PLATFORMS: { id: SharePlatform; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'x', label: 'X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'email', label: 'Email' },
];

interface ShareBarProps {
  url: string;
  title: string;
  text: string;
  className?: string;
}

const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

/** Mobile keeps the OS share sheet (it already lists every installed app). Desktop gets an explicit row instead. */
export function ShareBar({ url, title, text, className }: ShareBarProps) {
  const { notify } = useToast();
  const [copied, setCopied] = useState(false);

  const nativeShare = async () => {
    try { await navigator.share({ title, text, url }); } catch { /* user cancelled */ }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      notify('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable */ }
  };

  if (canNativeShare) {
    return (
      <button type="button" onClick={nativeShare} data-sound="tap"
        className={cn('inline-flex items-center gap-2 rounded-full border border-white/12 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/25 hover:text-white', className)}>
        <Share2 className="h-4 w-4" /> Share
      </button>
    );
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {PLATFORMS.map(({ id, label }) => {
        const Icon = ICONS[id];
        return (
          <a key={id} href={shareLink(id, { url, title, text })} target="_blank" rel="noopener noreferrer"
            aria-label={`Share on ${label}`} data-sound="tap"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/60 transition-colors hover:border-white/25 hover:text-white">
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
      <button type="button" onClick={copyLink} aria-label="Copy link" data-sound="tap"
        className="grid h-9 w-9 place-items-center rounded-full border border-white/12 text-white/60 transition-colors hover:border-white/25 hover:text-white">
        {copied ? <Check className="h-4 w-4" /> : <LinkIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}
