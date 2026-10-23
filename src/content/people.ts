/**
 * Every person the site names. A person is shown only when `verified` is true, meaning the
 * owner has confirmed they are real and that every field here is accurate. Never add ratings,
 * student counts, titles or credentials the owner has not supplied.
 */
export interface Person {
  id: string;
  name: string;
  /** Plain description of what this person does on VediCosmic. */
  role: string;
  /** Shown next to the name when the name needs explaining (e.g. a spiritual name). */
  nameNote?: string;
  photo?: string;
  /** Written by the person themselves. Not rendered while null. */
  bio: string | null;
  credentials: string[];
  lineage?: string;
  verified: boolean;
}

export const PEOPLE: Record<string, Person> = {
  parikshiva: {
    id: 'parikshiva',
    name: 'Parikshiva',
    role: 'Founder of VediCosmic',
    nameNote: 'Parikshiva is the spiritual name of VediCosmic’s founder.',
    bio: null, // [OWNER TO PROVIDE] a short bio, written by the founder
    credentials: [],
    verified: true,
  },
};

/** A verified person, or undefined. Use this everywhere a person might be shown. */
export function getPerson(id: string | undefined): Person | undefined {
  const person = id ? PEOPLE[id] : undefined;
  return person?.verified ? person : undefined;
}
