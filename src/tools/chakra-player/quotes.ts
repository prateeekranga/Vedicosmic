export interface Quote { text: string; attribution?: string }

/** Public-domain-safe / proverb-style lines, to avoid any misattribution risk. */
export const QUOTES: Quote[] = [
  { text: 'Music is the space between the notes.', attribution: 'Claude Debussy' },
  { text: 'Where words fail, music speaks.', attribution: 'Hans Christian Andersen' },
  { text: 'Silence is the canvas on which sound paints itself.' },
  { text: 'Sound is the first thing we hear, and often the last thing we forget.' },
  { text: 'In the stillness between two breaths lies a quiet kind of peace.' },
];
