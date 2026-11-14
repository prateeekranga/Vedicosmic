/**
 * Compound numbers in Chaldean numerology, 10 to 52, after Cheiro (Count Louis Hamon), "Book of
 * Numbers" (1926), who gives each a symbol and a short reading and treats the higher numbers as
 * repeating earlier ones. The readings below are restated in plain words and in the tradition's
 * own terms. Cheiro's sterner warnings are given as cautions about conduct, not as forecasts.
 */

export interface CompoundText {
  /** Cheiro's symbolic name for the number, where he gives one. */
  symbol?: string;
  text: string;
}

const OWN: Readonly<Record<number, CompoundText>> = {
  10: { symbol: 'The Wheel of Fortune', text: 'Read as a number of confidence and reputation: plans tend to be carried out, and the name becomes known for whatever its bearer chooses to do with it.' },
  11: { symbol: 'The Clenched Hand', text: 'Read as a number of hidden tests. Cheiro’s caution is to choose associates carefully and not to take agreements on trust alone.' },
  12: { symbol: 'The Sacrifice', text: 'Read as a number of giving way to others’ plans. The caution is to notice when help is being taken for granted and to say so.' },
  13: { symbol: 'Change', text: 'Read as a number of upheaval and renewal, not of bad luck. Cheiro treats it as power that serves well when used with care.' },
  14: { symbol: 'Movement', text: 'Read as a number of travel, change and dealings with many people. It is counted favourable for trade, with a caution against relying on others’ judgement.' },
  15: { symbol: 'The Magician', text: 'Read as a number of charm, eloquence and a feeling for music and art. It is counted favourable for winning support from others.' },
  16: { symbol: 'The Tower', text: 'Read as a warning against overconfidence. The caution is to plan ahead and keep something in reserve when things are going well.' },
  17: { symbol: 'The Star of the Magi', text: 'Read as a number of peace and inner strength: its bearer is said to rise above early difficulties and to be well remembered.' },
  18: { symbol: 'The Rayed Moon', text: 'Read as a number where material aims and higher aims pull apart. The caution is to avoid quarrels and to be careful whom one trusts.' },
  19: { symbol: 'The Prince of Heaven', text: 'Read as the Sun’s own number and one of the most favourable: it is associated with esteem, cheerfulness and plans that go well.' },
  20: { symbol: 'The Awakening', text: 'Read as a call to a new purpose or duty. It is counted a number of ideals more than of worldly gain.' },
  21: { symbol: 'The Crown of the Magi', text: 'Read as a number of advancement after long effort. It is counted favourable for anything worked at patiently.' },
  22: { symbol: 'The Blind Wanderer', text: 'Read as a good nature misled by others’ poor advice. The caution is to check the facts oneself before acting.' },
  23: { symbol: 'The Royal Star of the Lion', text: 'Read as a number of help from people in authority and of plans that find support. Cheiro counts it among the most favourable.' },
  24: { text: 'Read as a number of support from people of standing and of warm personal ties. It is counted favourable.' },
  25: { text: 'Read as strength gained through experience: early difficulty that teaches good judgement of people and things. It is counted favourable for later life.' },
  26: { text: 'Read as a caution about partnerships and joint ventures. The advice is to keep one’s own counsel and weigh others’ suggestions carefully.' },
  27: { symbol: 'The Sceptre', text: 'Read as a number of authority earned through a productive mind. The advice is to carry out one’s own ideas.' },
  28: { text: 'Read as a number of promise that needs prudence: gains are kept by planning ahead and by not placing too much trust in others.' },
  29: { text: 'Read as a number of uncertainty in dealings with others. The caution is to choose friends and partners slowly.' },
  30: { text: 'Read as a number of thought and reflection. Its bearer tends to put ideas before possessions, so its effect depends on what the mind is turned to.' },
  31: { text: 'Read much as 30, with a more solitary and self-contained temper. It is not counted a number of worldly ambition.' },
  32: { text: 'Read as a number of working with groups of people. It is counted favourable when its bearer keeps to their own judgement.' },
  37: { text: 'Read as a number of good friendships and of partnerships of every kind. It is counted favourable.' },
  43: { text: 'Read as a number of strife and setbacks. The caution is to avoid conflict where it can be avoided and to build patiently.' },
  51: { symbol: 'The Warrior', text: 'Read as a number of sudden advancement in whatever is undertaken, suited to leadership. The caution is that prominence attracts opposition.' },
};

/** Cheiro gives these numbers the reading of an earlier one. */
const SAME_AS: Readonly<Record<number, number>> = {
  33: 24, 34: 25, 35: 26, 36: 27, 38: 29, 39: 30, 40: 31, 41: 32,
  42: 24, 44: 26, 45: 27, 46: 37, 47: 29, 48: 30, 49: 31, 50: 32, 52: 43,
};

export interface CompoundReading extends CompoundText {
  number: number;
  /** The number whose reading this one shares, when Cheiro gives it no reading of its own. */
  sameAs: number | null;
}

/** The reading for a compound number from 10 to 52; null outside that range. */
export function compoundReading(n: number): CompoundReading | null {
  if (!Number.isInteger(n) || n < 10 || n > 52) return null;
  const sameAs = SAME_AS[n] ?? null;
  const base = OWN[sameAs ?? n];
  return base ? { number: n, sameAs, ...base } : null;
}

export const COMPOUND_SOURCE = 'After Cheiro, Book of Numbers (1926), restated in plain words.';
