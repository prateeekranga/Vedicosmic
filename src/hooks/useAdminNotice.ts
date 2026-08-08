import { useState } from 'react';
import type { Notice } from '@/components/admin/AdminNotice';

/** One active WordPress-style admin notice at a time — matches how wp-admin only ever shows
 *  the result of the action you just took, not a growing stack. */
export function useAdminNotice() {
  const [notice, setNotice] = useState<Notice | null>(null);
  const notify = (type: Notice['type'], text: string) => setNotice({ id: Date.now(), type, text });
  return { notice, notify, dismiss: () => setNotice(null) };
}
