export type SharePlatform = 'whatsapp' | 'telegram' | 'x' | 'facebook' | 'pinterest' | 'email';

export const SHARE_PLATFORMS: { id: SharePlatform; label: string }[] = [
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'x', label: 'X' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'email', label: 'Email' },
];

interface ShareContent { url: string; title: string; text: string }

function withUtm(url: string, platform: SharePlatform): string {
  const u = new URL(url);
  u.searchParams.set('utm_source', platform);
  u.searchParams.set('utm_medium', 'share');
  u.searchParams.set('utm_campaign', 'tool-share');
  return u.toString();
}

/** Builds the share-intent URL for a given platform, tuned to how each one actually reads shares. */
export function shareLink(platform: SharePlatform, { url, title, text }: ShareContent): string {
  const target = withUtm(url, platform);
  switch (platform) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text}\n${target}`)}`;
    case 'telegram':
      return `https://t.me/share/url?url=${encodeURIComponent(target)}&text=${encodeURIComponent(text)}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${text} #VediCosmic`)}&url=${encodeURIComponent(target)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(target)}`;
    case 'pinterest':
      return `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(target)}&description=${encodeURIComponent(text)}`;
    case 'email':
      return `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${target}`)}`;
    default:
      return target;
  }
}
