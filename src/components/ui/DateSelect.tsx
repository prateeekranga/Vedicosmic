import { useEffect, useId, useState } from 'react';
import { Select } from '@/components/ui/Field';
import { daysInMonth, isValidYMD } from '@/engine/numerology/core';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n: number) => String(n).padStart(2, '0');
const YEARS = Array.from({ length: 110 }, (_, i) => new Date().getFullYear() - i);
const ISO = /^\d{4}-\d{2}-\d{2}$/;

/** Why a chosen day, month and year cannot be used, or null when they make a usable date. */
function problemWith(d: number, m: number, y: number, allowFuture: boolean): string | null {
  if (!isValidYMD(y, m, d)) return `${MONTHS[m - 1]} ${y} has only ${daysInMonth(y, m)} days.`;
  if (!allowFuture) {
    const now = new Date();
    const today = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
    if (y * 10000 + m * 100 + d > today) return 'That date is in the future.';
  }
  return null;
}

/**
 * Day / Month / Year dropdown date picker. Emits a `yyyy-mm-dd` string via onChange, or '' until
 * all three are chosen and form a real date: an impossible date such as 31 February (or, for a
 * date of birth, a future date) is never emitted, and the reason is shown and announced.
 */
export function DateSelect({
  value, onChange, label = 'Date of birth', className = '', allowFuture = false,
}: { value: string; onChange: (iso: string) => void; label?: string; className?: string; allowFuture?: boolean }) {
  const [d, setD] = useState(''); const [m, setM] = useState(''); const [y, setY] = useState('');
  const errorId = useId();

  // hydrate only from a complete ISO value (never wipe partial in-progress input)
  useEffect(() => {
    if (value && ISO.test(value)) {
      const [yy, mm, dd] = value.split('-');
      setY(yy); setM(String(+mm)); setD(String(+dd));
    }
  }, [value]);

  const complete = d !== '' && m !== '' && y !== '';
  const problem = complete ? problemWith(+d, +m, +y, allowFuture) : null;

  const emit = (nd: string, nm: string, ny: string) => {
    const ok = nd && nm && ny && !problemWith(+nd, +nm, +ny, allowFuture);
    onChange(ok ? `${ny}-${pad(+nm)}-${pad(+nd)}` : '');
  };

  return (
    <fieldset className={`min-w-0 ${className}`} aria-describedby={problem ? errorId : undefined}>
      {label && <legend className="mb-1.5 block text-sm text-white/70">{label}</legend>}
      <div className="grid grid-cols-3 gap-3">
        <Select aria-label="Day" aria-invalid={problem ? true : undefined} value={d}
          onChange={(e) => { setD(e.target.value); emit(e.target.value, m, y); }}>
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
      {problem && <p id={errorId} role="alert" className="mt-1.5 text-xs text-error">{problem} Please check the date.</p>}
    </fieldset>
  );
}
