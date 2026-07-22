/**
 * Minimal YouTube IFrame Player API loader + types. We only use a handful of
 * the API's surface (play/pause/seek/volume/rate) since the player's visible
 * controls are entirely custom-built — this just drives an invisible-chrome
 * embed (`controls: 0`).
 */
export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setVolume(v: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setPlaybackRate(rate: number): void;
  getPlaybackRate(): number;
  getAvailablePlaybackRates(): number[];
  destroy(): void;
}
interface YTPlayerEvent { target: YTPlayer; data: number }
export interface YTNamespace {
  Player: new (el: HTMLElement, opts: {
    videoId: string;
    playerVars?: Record<string, number | string>;
    events?: {
      onReady?: (e: YTPlayerEvent) => void;
      onStateChange?: (e: YTPlayerEvent) => void;
    };
  }) => YTPlayer;
  PlayerState: { UNSTARTED: number; ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
}
declare global {
  interface Window { YT?: YTNamespace; onYouTubeIframeAPIReady?: () => void }
}

const ID_RE = /^[a-zA-Z0-9_-]{11}$/;

/** Accepts a bare video ID or any common YouTube URL shape (watch/youtu.be/embed/shorts/live) and returns the 11-char video ID, or null if unrecognized. */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  if (ID_RE.test(s)) return s;
  try {
    const url = new URL(s);
    const host = url.hostname.replace(/^www\.|^m\.|^music\./, '');
    if (host === 'youtu.be') {
      const id = url.pathname.slice(1).split('/')[0];
      return ID_RE.test(id) ? id : null;
    }
    if (host === 'youtube.com') {
      if (url.pathname === '/watch') {
        const id = url.searchParams.get('v');
        return id && ID_RE.test(id) ? id : null;
      }
      const m = url.pathname.match(/^\/(?:embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (m) return m[1];
    }
  } catch { /* not a parseable URL, fall through to a loose scan below */ }
  const m = s.match(/(?:[?&]v=|\/(?:shorts|embed|live)\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

let apiPromise: Promise<YTNamespace> | null = null;
export function loadYouTubeAPI(): Promise<YTNamespace> {
  if (apiPromise) return apiPromise;
  apiPromise = new Promise((resolve) => {
    if (window.YT?.Player) { resolve(window.YT); return; }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT!); };
    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.setAttribute('data-youtube-iframe-api', '1');
      document.head.appendChild(tag);
    }
  });
  return apiPromise;
}
