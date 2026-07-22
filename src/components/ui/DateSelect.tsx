import { useEffect, useState } from 'react';
import { Select } from '@/components/ui/Field';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');
const YEARS = Array.from({ length: 110 }, (_, i) => new Date().getFullYear() - i);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Day / Month / Year dropdown date picker. Emits a `yyyy-mm-dd` string via
 * onChange (or '' until all three are chosen) — a drop-in replacement for a
 * native <input type="date">, styled to match the site.
 */
export function DateSelect({
  value, onChange, label = 'Date of birth', className = '',
}: { value: string; onChange: (iso: string) => void; label?: string; className?: string }) {
  const [d, setD] = useState(''); const [m, setM] = useState(''); const [y, setY] = useState('');

  // hydrate only from a complete ISO value (never wipe partial in-progress input)
  useEffect(() => {
    if (value && ISO.test(value)) {
      const [yy, mm, dd] = value.split('-');
      setY(yy); setM(String(+mm)); setD(String(+dd));
    }
  }, [value]);

  const emit = (nd: string, nm: string, ny: string) =>
    onChange(nd && nm && ny ? `${ny}-${pad(+nm)}-${pad(+nd)}` : '');

  return (
    <div className={className}>
      {label && <label className="mb-1.5 block text-sm text-white/70">{label}</label>}
      <div className="grid grid-cols-3 gap-3">
        <Select aria-label="Day" value={d} onChange={(e) => { setD(e.target.value); emit(e.target.value, m, y); }}>
          <option value="">Day</option>
          {Array.from({ length: 31 }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </Select>
        <Select aria-label="Month" value={m} onChange={(e) => { setM(e.target.value); emit(d, e.target.value, y); }}>
          <option value="">Month</option>
          {MONTHS.map((mn, i) => <option key={mn} value={i + 1}>{mn}</option>)}
        </Select>
        <Select aria-label="Year" value={y} onChange={(e) => { setY(e.target.value); emit(d, m, e.target.value); }}>
          <option value="">Year</option>
          {YEARS.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
        </Select>
      </div>
    </div>
  );
}
