import { useEffect, useState } from 'react';

function getInitial(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function usePrefersReducedMotion(): boolean {
  // Lazy initializer reads matchMedia synchronously on first render, so
  // consumers never briefly see "not reduced" before an effect corrects it —
  // some (like CosmicGate) trigger one-time side effects on mount that a
  // later correction can't undo.
  const [reduced, setReduced] = useState(getInitial);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => setReduced(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}
