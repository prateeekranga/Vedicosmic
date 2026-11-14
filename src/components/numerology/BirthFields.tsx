import { DateSelect } from '@/components/ui/DateSelect';
import { Select } from '@/components/ui/Field';
import type { Gender } from '@/engine/numerology';

export type GenderChoice = '' | Gender;

/**
 * Date of birth, and optionally gender. Gender is used for one thing only, the Kua number, whose
 * formula differs for men and women; it starts unset and nothing else depends on it.
 */
export function BirthFields({
  idPrefix, dob, onDob, gender, onGender, withGender = true,
}: {
  idPrefix: string;
  dob: string; onDob: (iso: string) => void;
  gender?: GenderChoice; onGender?: (g: GenderChoice) => void;
  withGender?: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <DateSelect value={dob} onChange={onDob} />
      {withGender && onGender && (
        <div>
          <Select id={`${idPrefix}-gender`} label="Gender (optional)" value={gender ?? ''}
            aria-describedby={`${idPrefix}-gender-help`}
            onChange={(e) => onGender(e.target.value as GenderChoice)}>
            <option value="">Not given</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </Select>
          <p id={`${idPrefix}-gender-help`} className="mt-1.5 text-xs text-white/55">Used only for the Kua number.</p>
        </div>
      )}
    </div>
  );
}
