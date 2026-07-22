import { useEffect, useState } from 'react';

/** Bumps whenever admin overrides change, so public pages can re-read live. */
export function useOverridesVersion(): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    const h = () => setV((x) => x + 1);
    window.addEventListener('vc:overrides', h);
    return () => window.removeEventListener('vc:overrides', h);
  }, []);
  return v;
}
