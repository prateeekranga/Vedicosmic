import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface Notice { id: number; type: 'success' | 'error'; text: string }

/** WordPress's dismissible admin notice — the green/red left-bordered bar that appears after
 *  "Post updated.", "3 items moved to Trash.", etc. Auto-dismisses after 5s like WP's do,
 *  but can also be closed immediately. */
export function AdminNoticeBanner({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice.id]);

  const Icon = notice.type === 'success' ? CheckCircle2 : AlertTriangle;
  return (
    <div className={`flex items-center gap-3 rounded-lg border-l-4 px-4 py-3 text-sm ${
      notice.type === 'success' ? 'border-success bg-success/10 text-success' : 'border-error bg-error/10 text-error'
    }`}>
      <Icon className="h-4 w-4 shrink-0" />
      <p className="flex-1">{notice.text}</p>
      <button onClick={onDismiss} aria-label="Dismiss notice" className="text-current/60 hover:text-current">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
