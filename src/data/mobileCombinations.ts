/**
 * Two-Digit Mobile Number Combination Analysis — a popular Vedic mobile
 * numerology system that reads every adjacent pair of digits in a phone
 * number (not just repeats) against the classical planetary rulers of
 * 1–9 (Sun, Moon, Jupiter, Rahu, Mercury, Venus, Ketu, Saturn, Mars — the
 * same mapping used across this site's Lo Shu Grid) plus 0 as Shunya, the
 * "void" that amplifies whatever digit sits beside it.
 *
 * The core combinations below (all pairs involving 1, the 2→9 adjacent
 * chain, and the doubled digits) come from a widely-circulated reference
 * chart. The remaining combinations — every other pairing among 0–9 — are
 * derived from the classical Vedic graha-maitri (planetary friendship)
 * table: friends read Benefic, enemies read Malefic, and neutral
 * relationships read Neutral, each phrased in the same everyday-life
 * register (money, family, health, career, temperament) as the sourced
 * entries.
 */

export type CombinationImpact = 'Benefic' | 'Malefic' | 'Neutral';

export interface MobileCombination {
  impact: CombinationImpact;
  result: string;
}

export const MOBILE_COMBINATIONS: Record<string, MobileCombination> = {
  // ---- doubled digits ----
  '00': { impact: 'Neutral', result: 'Shunya squared — a mirror of pure potential. Outcomes swing toward whatever surrounds it, so keep intentions clear.' },
  '11': { impact: 'Benefic', result: 'You are a creative, intuitive, innovative, and emotional person.' },
  '22': { impact: 'Benefic', result: 'You are emotional, intuitive, and a push is required to initiate any work.' },
  '33': { impact: 'Benefic', result: 'Expressive, attached to kith & kin, attached to family (mom-dad) even after marriage.' },
  '44': { impact: 'Malefic', result: 'Health issues, gastric related problems.' },
  '55': { impact: 'Benefic', result: 'Money-minded, restlessness of mind, communicative.' },
  '66': { impact: 'Benefic', result: 'Attract luxury, helping nature, and too much concern about family members.' },
  '77': { impact: 'Benefic', result: 'Relationship issues, spiritual, research-minded, sleep related problem.' },
  '88': { impact: 'Malefic', result: 'Doubled Saturn — heavy karmic lessons, discipline and delay; success comes only through sustained, patient effort.' },
  '99': { impact: 'Malefic', result: 'Doubled Mars — a quick temper and impatience; channel the intensity into sport, courage or bold decisive action rather than conflict.' },

  // ---- 0 (Shunya) with every other digit ----
  '01': { impact: 'Benefic', result: 'You are independent, a leader, and a good decision maker.' },
  '10': { impact: 'Benefic', result: 'You are independent, leaders and good decision makers.' },
  '02': { impact: 'Neutral', result: "Zero amplifies the Moon's sensitivity — emotional swings are more visible, for better or worse." },
  '20': { impact: 'Neutral', result: "Zero amplifies the Moon's sensitivity — emotional swings are more visible, for better or worse." },
  '03': { impact: 'Benefic', result: "Zero expands Jupiter's generosity and wisdom — a naturally optimistic, expansive combination." },
  '30': { impact: 'Benefic', result: "Zero expands Jupiter's generosity and wisdom — a naturally optimistic, expansive combination." },
  '04': { impact: 'Neutral', result: "Zero adds volatility to Rahu's restlessness — outcomes depend heavily on conscious direction." },
  '40': { impact: 'Neutral', result: "Zero adds volatility to Rahu's restlessness — outcomes depend heavily on conscious direction." },
  '05': { impact: 'Neutral', result: "Zero sharpens Mercury's mind but can scatter focus — good for ideas, needs follow-through." },
  '50': { impact: 'Neutral', result: "Zero sharpens Mercury's mind but can scatter focus — good for ideas, needs follow-through." },
  '06': { impact: 'Benefic', result: "Zero amplifies Venus's charm and comfort — an easy, likeable, aesthetically-inclined presence." },
  '60': { impact: 'Benefic', result: "Zero amplifies Venus's charm and comfort — an easy, likeable, aesthetically-inclined presence." },
  '07': { impact: 'Neutral', result: "Zero deepens Ketu's detachment — introspective and private, sometimes to a fault." },
  '70': { impact: 'Neutral', result: "Zero deepens Ketu's detachment — introspective and private, sometimes to a fault." },
  '08': { impact: 'Malefic', result: "Zero intensifies Saturn's weight — delays and discipline both increase; patience is essential." },
  '80': { impact: 'Malefic', result: "Zero intensifies Saturn's weight — delays and discipline both increase; patience is essential." },
  '09': { impact: 'Benefic', result: 'Humanitarian, philanthropist, leader, spiritual.' },
  '90': { impact: 'Benefic', result: 'Humanitarian, Philanthropist, Leader, Spiritual' },

  // ---- 1 (Sun) with every other digit — the fullest-sourced row ----
  '12': { impact: 'Benefic', result: 'You have an attractive face. You make a plan before spending money.' },
  '21': { impact: 'Benefic', result: 'Wastage of Money' },
  '13': { impact: 'Benefic', result: 'You are an educated person and a good advisor.' },
  '31': { impact: 'Benefic', result: 'Educated / Good Advisor' },
  '14': { impact: 'Malefic', result: 'This combination leads to loan liabilities and health issues.' },
  '41': { impact: 'Benefic', result: 'Loan Liability and Health Issues' },
  '15': { impact: 'Benefic', result: 'The combination creates an auspicious yoga, which will bring benefits from your father or boss.' },
  '51': { impact: 'Benefic', result: 'The combination creates an auspicious yoga, which will bring benefits from your father or boss.' },
  '16': { impact: 'Neutral', result: "Your spouse's health may suffer; however, it will grant you administrative abilities." },
  '61': { impact: 'Benefic', result: "Your spouse's health may suffer; however, it will grant you administrative abilities." },
  '17': { impact: 'Benefic', result: 'This combination creates Raj yog, but make sure the number 8 is not present. It can lead to international travel opportunities and government support. There is a high chance of someone in the family being famous, in government, or working in a multinational corporation.' },
  '71': { impact: 'Benefic', result: 'This combination creates Raj yog, but make sure the number 8 is not present. It can lead to international travel opportunities and government support. There is a high chance of someone in the family being famous, in government, or working in a multinational corporation.' },
  '18': { impact: 'Malefic', result: "This combination can result in issues such as spouse's health problems, government-related issues, father-son conflicts, problems with the boss, or authority issues." },
  '81': { impact: 'Malefic', result: "This combination can result in issues such as spouse's health problems, government-related issues, father-son conflicts, problems with the boss, or authority issues." },
  '19': { impact: 'Benefic', result: 'You are a freedom-loving and independent leader.' },
  '91': { impact: 'Benefic', result: 'Freedom Loving' },

  // ---- the classic 2→9 adjacent chain, sourced ----
  '23': { impact: 'Benefic', result: 'Lack of response from the child / enemies cannot harm.' },
  '32': { impact: 'Benefic', result: 'Lack of response from the child / enemies cannot harm.' },
  '34': { impact: 'Malefic', result: 'Stubborn, heart problem / paralysis.' },
  '43': { impact: 'Malefic', result: 'Stubborn, heart problem / paralysis.' },
  '45': { impact: 'Malefic', result: 'Bandhan Yoga / court / hospital. Sister and daughter may be ill — daughter-sister situation may be bad.' },
  '54': { impact: 'Malefic', result: 'Bandhan Yoga / court / hospital. Sister and daughter may be ill — daughter-sister situation may be bad.' },
  '56': { impact: 'Benefic', result: "Unable to ask for money, that's why money gets stuck." },
  '65': { impact: 'Benefic', result: "Unable to ask for money, that's why money gets stuck." },
  '67': { impact: 'Benefic', result: 'Music lover / love romance / attract luxury.' },
  '76': { impact: 'Benefic', result: 'Music lover / love romance / attract luxury.' },
  '78': { impact: 'Malefic', result: 'Healer / spiritual but may get depressed. Unlucky.' },
  '87': { impact: 'Malefic', result: 'Healer / spiritual but may get depressed. Unlucky.' },
  '89': { impact: 'Malefic', result: 'Argumentative for what he feels is right / good lawyer.' },
  '98': { impact: 'Malefic', result: 'Argumentative for what he feels is right / good lawyer.' },

  // ---- researched: remaining pairs among 2,3,5,6,8,9 (Moon, Jupiter, Mercury, Venus, Saturn, Mars) ----
  '25': { impact: 'Neutral', result: 'A thoughtful, communicative nature — though moods and words may occasionally clash.' },
  '52': { impact: 'Neutral', result: 'A thoughtful, communicative nature — though moods and words may occasionally clash.' },
  '26': { impact: 'Neutral', result: 'Emotional and aesthetic; comfort-loving, but can swing between indulgence and insecurity.' },
  '62': { impact: 'Neutral', result: 'Emotional and aesthetic; comfort-loving, but can swing between indulgence and insecurity.' },
  '28': { impact: 'Malefic', result: 'Can bring emotional heaviness or self-doubt, echoing the classical Moon-Saturn Vish Yoga; steady routines help most.' },
  '82': { impact: 'Malefic', result: 'Can bring emotional heaviness or self-doubt, echoing the classical Moon-Saturn Vish Yoga; steady routines help most.' },
  '29': { impact: 'Benefic', result: 'Echoes the classical Chandra-Mangal yoga — emotional drive paired with courage, often bringing resourcefulness and material grit.' },
  '92': { impact: 'Benefic', result: 'Echoes the classical Chandra-Mangal yoga — emotional drive paired with courage, often bringing resourcefulness and material grit.' },
  '35': { impact: 'Malefic', result: 'Wisdom and cleverness can pull in different directions; overthinking or scattered focus is the main lesson.' },
  '53': { impact: 'Malefic', result: 'Wisdom and cleverness can pull in different directions; overthinking or scattered focus is the main lesson.' },
  '36': { impact: 'Malefic', result: 'The classical Guru-Shukra tension — values and desires may conflict; discernment between wisdom and indulgence matters.' },
  '63': { impact: 'Malefic', result: 'The classical Guru-Shukra tension — values and desires may conflict; discernment between wisdom and indulgence matters.' },
  '38': { impact: 'Neutral', result: "Patience paired with wisdom; growth is steady rather than fast, and that's no bad thing." },
  '83': { impact: 'Neutral', result: "Patience paired with wisdom; growth is steady rather than fast, and that's no bad thing." },
  '39': { impact: 'Benefic', result: 'Confidence, courage and higher purpose reinforce each other — a naturally driven, principled combination.' },
  '93': { impact: 'Benefic', result: 'Confidence, courage and higher purpose reinforce each other — a naturally driven, principled combination.' },
  '58': { impact: 'Benefic', result: 'A practical, hardworking pairing — the discipline to follow through on clever ideas.' },
  '85': { impact: 'Benefic', result: 'A practical, hardworking pairing — the discipline to follow through on clever ideas.' },
  '59': { impact: 'Malefic', result: 'Quick thinking can turn into quick temper; pause before reacting in words or action.' },
  '95': { impact: 'Malefic', result: 'Quick thinking can turn into quick temper; pause before reacting in words or action.' },
  '68': { impact: 'Benefic', result: 'A steady, loyal, comfort-building combination — patience in love and money both pay off.' },
  '86': { impact: 'Benefic', result: 'A steady, loyal, comfort-building combination — patience in love and money both pay off.' },
  '69': { impact: 'Neutral', result: 'Passion and charm coexist; balance desire with genuine connection.' },
  '96': { impact: 'Neutral', result: 'Passion and charm coexist; balance desire with genuine connection.' },

  // ---- researched: Ketu(7) with 2,3,5,6,9 ----
  '27': { impact: 'Benefic', result: 'A reflective, intuitive pairing; inner life and detachment blend well, though emotional withdrawal is worth watching.' },
  '72': { impact: 'Benefic', result: 'A reflective, intuitive pairing; inner life and detachment blend well, though emotional withdrawal is worth watching.' },
  '37': { impact: 'Benefic', result: 'Spiritually inclined and wise — suits teaching, research or a contemplative path.' },
  '73': { impact: 'Benefic', result: 'Spiritually inclined and wise — suits teaching, research or a contemplative path.' },
  '57': { impact: 'Malefic', result: 'Communication and detachment can pull apart; scattered focus or difficulty finishing what you start.' },
  '75': { impact: 'Malefic', result: 'Communication and detachment can pull apart; scattered focus or difficulty finishing what you start.' },
  '79': { impact: 'Benefic', result: 'Ketu and Mars share a fiery, driven nature — strong willpower directed toward a higher purpose.' },
  '97': { impact: 'Benefic', result: 'Ketu and Mars share a fiery, driven nature — strong willpower directed toward a higher purpose.' },

  // ---- researched: Rahu(4) with 2,6,7,8,9 ----
  '24': { impact: 'Malefic', result: 'Restlessness or overthinking; grounding practices and a consistent routine help steady the mind.' },
  '42': { impact: 'Malefic', result: 'Restlessness or overthinking; grounding practices and a consistent routine help steady the mind.' },
  '46': { impact: 'Benefic', result: 'Often linked to material gain and sudden opportunity — attractive, ambitious, and image-conscious.' },
  '64': { impact: 'Benefic', result: 'Often linked to material gain and sudden opportunity — attractive, ambitious, and image-conscious.' },
  '47': { impact: 'Neutral', result: 'The shadow axis meeting itself — a push-pull between worldly ambition (Rahu) and release (Ketu); balance is the lesson.' },
  '74': { impact: 'Neutral', result: 'The shadow axis meeting itself — a push-pull between worldly ambition (Rahu) and release (Ketu); balance is the lesson.' },
  '48': { impact: 'Malefic', result: 'Echoes the classical Shrapit Yoga — heavy responsibility or delays; success comes through unusually persistent effort.' },
  '84': { impact: 'Malefic', result: 'Echoes the classical Shrapit Yoga — heavy responsibility or delays; success comes through unusually persistent effort.' },
  '49': { impact: 'Malefic', result: 'Impulsive and intense; channel the drive deliberately, or frustration and rash decisions follow.' },
  '94': { impact: 'Malefic', result: 'Impulsive and intense; channel the drive deliberately, or frustration and rash decisions follow.' },
};

/** Look up a two-digit combination, e.g. "45" — order matters, "45" and "54" may differ. */
export function lookupCombination(pair: string): MobileCombination | undefined {
  return MOBILE_COMBINATIONS[pair];
}
