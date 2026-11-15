/**
 * The reading for every pair of neighbouring digits in a mobile number, after the two-digit
 * combination chart of Indian mobile numerology. The class of each pair (benefic, neutral or
 * malefic) is in src/engine/numerology/mobileChart.ts, with a note on where each row comes from.
 *
 * Each line says what the chart associates with the pair. Where the chart speaks of health, money
 * or the law, the theme is kept and the advice the tradition gives with it, without naming an
 * illness or promising an event: a phone number has no measurable effect on either.
 */
import { pairKey, type PairImpact, type PairYoga } from '@/engine/numerology';

/** Keyed with the smaller digit first, like the chart. */
export const PAIR_READING: Readonly<Record<string, string>> = {
  // Doubled digits.
  '00': 'Two zeros together are read as open space: the pair takes its colour from the digits around it, and the chart gives it no leaning of its own.',
  '11': 'A doubled Sun is read as creative and original, quick with new ideas, with feelings that run closer to the surface than the confident manner suggests.',
  '22': 'A doubled Moon is read as intuitive and caring. The chart adds that work tends to begin only after a push, so a fixed starting time helps.',
  '33': 'A doubled Jupiter is read as expressive and devoted to family, staying close to parents and relatives at every stage of life.',
  '44': 'A doubled Rahu is read as restless habits and an unsettled routine. The chart marks it for care; regular meals and sleep are the usual advice.',
  '55': 'A doubled Mercury is read as a talker with a sharp eye for business. The mind rarely rests, so tradition pairs it with a calming daily habit.',
  '66': 'A doubled Venus is read as a taste for comfort and a helpful nature, with a habit of worrying about family more than is needed.',
  '77': 'A doubled Ketu is read as a researcher’s mind, inward and spiritual. The chart’s cautions are distance in close relationships and thoughts that stay busy at night.',
  '88': 'A doubled Saturn is read as heavy responsibility and results that arrive late. The chart marks it for patience: steady, sustained effort is what this pair rewards.',
  '99': 'A doubled Mars is read as a quick temper and impatience. The chart’s advice is to give the heat an outlet in sport or in bold, useful work.',

  // Zero beside each number: it has no planet and is read as strengthening its neighbour.
  '01': 'Zero beside the Sun is read as independence: a natural leader who makes decisions alone and is comfortable doing so.',
  '02': 'Zero is read as turning up the Moon’s sensitivity, so changes of mood show more plainly, for better or worse.',
  '03': 'Zero is read as widening Jupiter’s generosity and good sense: an optimistic, open-handed pairing.',
  '04': 'Zero adds swing to Rahu’s restlessness, and the chart says the outcome depends on how deliberately the energy is directed.',
  '05': 'Zero is read as sharpening Mercury’s wit while scattering its focus: good for ideas, and in need of follow-through.',
  '06': 'Zero is read as heightening the charm of Venus: an easy, likeable presence with an eye for beauty.',
  '07': 'Zero deepens Ketu’s detachment: private and introspective, sometimes to the point of seeming distant.',
  '08': 'Zero is read as adding weight to Saturn, so delay and discipline both increase. The chart marks this pair for patience.',
  '09': 'Zero beside Mars is read as a humanitarian streak: a leader who gives freely and leans towards the spiritual.',

  // 1, the Sun.
  '12': 'Sun then Moon is read as a pleasant, attractive presence and careful money habits: spending is planned before it happens.',
  '13': 'Sun with Jupiter is read as learning and good counsel: a well-educated mind that others come to for advice.',
  '14': 'Sun with Rahu recalls the Grahan yoga of astrology, the eclipse: it is read as pressure from borrowing and overwork, and the chart marks it for care with money owed and with rest.',
  '15': 'The chart counts Sun with Mercury the auspicious Budhaditya yoga, linked with goodwill and help from a father, an employer or a mentor.',
  '16': 'Sun with Venus is read as real administrative ability. The chart’s caution is to give a partner time and care, since work easily takes all the attention.',
  '17': 'The chart calls Sun with Ketu a Raj yog, linked with recognition, support from people in authority and chances to travel abroad. Teachers attach one condition: no 8 in the number.',
  '18': 'Sun with Saturn, father and son in the old stories, is the chart’s most cautioned pair: it is read as friction with an employer, a parent or anyone in authority.',
  '19': 'Sun with Mars is read as a freedom-loving, independent leader who would rather set the rules than follow them.',

  // 2, the Moon.
  '23': 'Moon with Jupiter recalls the Gajakesari yoga of astrology and is read as protective: rivals are said to do little harm. The chart’s one caution is that children may be slow to respond.',
  '24': 'Moon with Rahu recalls the Grahan yoga of astrology, the eclipse of the Moon: read as an overactive, restless mind. Grounding habits and a fixed routine are the usual advice.',
  '25': 'Moon with Mercury is read as thoughtful and talkative, though mood and words do not always agree.',
  '26': 'Moon with Venus is read as emotional and artistic, fond of comfort, and inclined to swing between indulgence and self-doubt.',
  '27': 'Moon with Ketu is read as reflective and intuitive, at home in the inner life, with emotional withdrawal the thing to watch.',
  '28': 'Moon with Saturn recalls the Vish yoga of astrology: it is read as emotional heaviness or self-doubt, and steady routines are the usual advice.',
  '29': 'Moon with Mars recalls the Chandra-Mangal yoga of astrology: feeling joined to courage, read as resourcefulness and practical grit.',

  // 3, Jupiter.
  '34': 'Jupiter with Rahu recalls the Guru-Chandal yoga of astrology: a stubborn streak and fixed opinions. The chart marks it for care: stay flexible, and do not let strain build up.',
  '35': 'Jupiter with Mercury is read as wisdom and cleverness pulling different ways, with overthinking as the main lesson.',
  '36': 'Jupiter and Venus are the two teachers of astrology, and the pair is read as principle against pleasure: the lesson is telling a want from a value.',
  '37': 'Jupiter with Ketu is read as a wise, spiritual bent that suits teaching, research or a contemplative path.',
  '38': 'Jupiter with Saturn is read as patience joined to judgement: growth that comes slowly and tends to last.',
  '39': 'Jupiter with Mars is read as confidence and courage serving a purpose: a driven, principled pairing.',

  // 4, Rahu.
  '45': 'The chart names Rahu with Mercury Bandhan yog, a feeling of being tied down by obligations and paperwork. Patience with formalities is the usual advice.',
  '46': 'Rahu with Venus is read as ambition and style, linked with material gain and unexpected openings.',
  '47': 'Rahu and Ketu are the two lunar nodes, read as worldly ambition against letting go. The chart’s lesson for the pair is balance.',
  '48': 'Rahu with Saturn recalls the Shrapit yoga of astrology: heavy duties and delay, with results that come through unusually persistent effort.',
  '49': 'Rahu with Mars recalls the Angarak yoga of astrology and is read as impulsive and intense. The chart’s advice is to direct the drive on purpose, before it turns into rash decisions.',

  // 5, Mercury.
  '56': 'Mercury with Venus recalls the Lakshmi-Narayan yoga of astrology: charm and a good head for trade, with one quirk, hesitation in asking for what one is owed.',
  '57': 'Mercury with Ketu is read as talk and detachment pulling apart: attention scatters and tasks are left half done.',
  '58': 'Mercury with Saturn is read as practical and hardworking: the discipline to carry a clever idea through to the end.',
  '59': 'Mercury with Mars is read as quick thinking that turns into quick words. Pausing before replying is the tradition’s advice.',

  // 6, Venus; 7, Ketu; 8, Saturn.
  '67': 'Venus with Ketu is read as a lover of music and romance, with a taste for beautiful and comfortable things.',
  '68': 'Venus with Saturn is read as steady and loyal: patience in love and in saving both tend to be repaid.',
  '69': 'Venus with Mars is read as charm together with passion, and the chart asks that desire be balanced with real companionship.',
  '78': 'Ketu with Saturn is read as a healer’s pairing, spiritual and deep, with a pull towards heaviness of mood. Company and daylight are the tradition’s balance.',
  '79': 'Ketu with Mars is read as fiery willpower put to a purpose beyond personal gain.',
  '89': 'Saturn with Mars is read as arguing hard for what one believes is right. The chart says it suits an advocate; the caution is quarrelling for its own sake.',
};

/** Pairs read differently when written the other way round, keyed as written. */
export const PAIR_READING_AS_WRITTEN: Readonly<Record<string, string>> = {
  '21': 'Moon then Sun turns the reading of 12 around: money is said to slip away on small things, so the chart advises a written budget.',
};

/** The reading for two neighbouring digits, in the order they are written. */
export function pairReading(a: number, b: number): string {
  return PAIR_READING_AS_WRITTEN[`${a}${b}`] ?? PAIR_READING[pairKey(a, b)];
}

/** The chart's own words for its three classes, shown as text so they never depend on colour. */
export const IMPACT_LABEL: Readonly<Record<PairImpact, string>> = { benefic: 'Benefic', neutral: 'Neutral', malefic: 'Malefic' };

export const YOGA_LABEL: Readonly<Record<PairYoga, string>> = {
  raj: 'Raj yog', bandhan: 'Bandhan yog', budhaditya: 'Budhaditya yog', gajakesari: 'Gajakesari yog',
  'chandra-mangal': 'Chandra-Mangal yog', 'lakshmi-narayan': 'Lakshmi-Narayan yog', grahan: 'Grahan yog',
  'guru-chandal': 'Guru-Chandal yog', vish: 'Vish yog', shrapit: 'Shrapit yog', angarak: 'Angarak yog',
};

/** Which two planets each named yoga joins, for the list of yogas found in a number. */
export const YOGA_PLANETS: Readonly<Record<PairYoga, string>> = {
  raj: 'Sun and Ketu', bandhan: 'Rahu and Mercury', budhaditya: 'Sun and Mercury', gajakesari: 'Moon and Jupiter',
  'chandra-mangal': 'Moon and Mars', 'lakshmi-narayan': 'Mercury and Venus', grahan: 'Sun or Moon with Rahu',
  'guru-chandal': 'Jupiter and Rahu', vish: 'Moon and Saturn', shrapit: 'Rahu and Saturn', angarak: 'Rahu and Mars',
};

export const YOGA_NOTE = 'Raj yog and Bandhan yog are the combination chart’s own names. The others are the names astrology gives the same two planets together, which mobile numerology teachers carry over to the digits.';

/** Shown under a number that has 1 and 7 side by side, according to whether it also has an 8. */
export const RAJ_YOG_NOTE = {
  clear: 'This number has 1 and 7 side by side and no 8, so the condition teachers attach to its Raj yog is met.',
  weakened: 'This number has 1 and 7 side by side, a Raj yog in the chart, but it also contains an 8, which teachers say weakens it.',
} as const;

export const IMPACT_NOTE = 'Benefic, neutral and malefic are the chart’s own words. Malefic marks a pair the tradition asks you to be aware of; it is not a forecast, and no pair decides anything by itself.';
