import { useCallback, useState } from 'react';
import { DEFAULT_PLACE, type ChosenPlace } from '@/lib/places';
import { trackEvent } from '@/lib/analytics';

const KEY = 'vc:place:v1';

function read(): ChosenPlace {
  try {
    const raw = localStorage.getItem(KEY);
    const p = raw ? (JSON.parse(raw) as ChosenPlace) : null;
    return p && typeof p.lat === 'number' && typeof p.lon === 'number' && p.zone ? p : DEFAULT_PLACE;
  } catch { return DEFAULT_PLACE; }
}

/**
 * The city used for daily timings (panchang, muhurta, horas, vrats), shared by those tools and
 * remembered in this browser as a preference. Never used for birth places, which are not stored.
 */
export function usePreferredPlace() {
  const [place, setPlace] = useState<ChosenPlace>(read);
  const choose = useCallback((p: ChosenPlace) => {
    setPlace(p);
    try { localStorage.setItem(KEY, JSON.stringify({ ...p, offsetMinutes: null })); } catch { /* storage unavailable */ }
    trackEvent('city_set');
  }, []);
  return [place, choose] as const;
}
