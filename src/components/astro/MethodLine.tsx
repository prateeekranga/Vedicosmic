import { Link } from 'react-router-dom';
import { ENGINE } from '@/engine/sky';

const ENGINE_TEXT = `Engine: ${ENGINE.name} ${ENGINE.version}.`;

const TEXT = {
  chart: 'Calculated on your device. Lahiri ayanamsa, whole-sign houses, mean node.',
  moon: 'Calculated on your device. Lahiri ayanamsa.',
  day: 'Calculated on your device. Sunrise and sunset when the Sun’s upper edge meets a sea-level horizon, with standard refraction. Lahiri ayanamsa.',
} as const;

/** The method statement shown under every computed result. */
export function MethodLine({ kind, className = '' }: { kind: keyof typeof TEXT; className?: string }) {
  return (
    <p className={`text-xs leading-relaxed text-white/60 ${className}`}>
      {TEXT[kind]} {ENGINE_TEXT}{' '}
      <Link to="/how-we-calculate" className="text-brand-cyan-soft underline underline-offset-2 hover:text-white">How we calculate</Link>
    </p>
  );
}
