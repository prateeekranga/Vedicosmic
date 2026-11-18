/**
 * Lucky tips for each Mulank–Bhagyank pair (Day number with Life number), from the pair tables the
 * founder uses in practice: for each of the 81 pairs, the numbers, dates, colours, stones and lines of
 * work the tradition favours, the dates and colours it treats with care, and the name totals that suit.
 *
 * These are the source's lists, written out as data. Its long readings are not reproduced, and its
 * lists of illnesses are left out, because the site does not name illnesses. A few slips in the
 * source are corrected, each one noted here so it can be checked:
 * - 1 & 2: lucky dates "7, 6, 25" read as 7, 16, 25.
 * - 1 & 6: lucky dates "15, 249, 18" read as 15, 24, 9, 18.
 * - 2 & 4: "Writer, Orator" written as lines of work, Writing and Oratory.
 * - 4 & 9: Red is listed both as lucky and as a colour to avoid; it is kept as lucky (Mars, the planet of 9).
 * - 6 & 4: the name totals repeat those of 6 & 3 (the 9 series); the business totals, which follow the pair's
 *   own lucky numbers 6 and 1, are used for names too.
 * - 8 & 2: "Blue Diamond" under colours is a stone; it is listed as a stone to skip, and so is the
 *   second "Blue Diamond" row.
 * - 9 & 3: the name totals include the 6 series, which the source itself calls opposed to 3; the business
 *   totals (3, 5 and 9 series) are used for names too.
 * - 5 & 8: "all days are the same" and "all colours are the same" are shown as none to single out.
 * - 9 & 9: "Fire Arms, Ammunitions" written as Defence supplies.
 */
import { DIGITS, PLANET_OF, rootOf, type Digit } from '@/engine/numerology';

export interface PairTips {
  /** Numbers the pair tradition counts lucky. */
  numbers: Digit[];
  /** Dates of a month that suit, 1 to 31. */
  dates: number[];
  /** Dates of a month to go carefully with; empty when the source singles out none. */
  carefulDates: number[];
  /** Name totals (Chaldean) that suit the pair. */
  names: number[];
  /** Totals that suit a business name. */
  business: number[];
  /** One name total the source picks out as the best, when it does. */
  bestName?: number;
  work: string[];
  colours: string[];
  /** Colours to go easy on; empty when the source singles out none. */
  carefulColours: string[];
  stones: string[];
  /** Stones the source says to skip, when it names any. */
  stonesToSkip: string[];
}

const nums = (s: string): number[] => [...new Set(s.split(/[\s,]+/).filter(Boolean).map(Number))].sort((a, b) => a - b);
const words = (s: string): string[] => (s ? s.split(/\s*,\s*/) : []);

/** One pair, in the source's order: numbers, dates, careful dates, names, business totals, work, colours, careful colours, stones, stones to skip. */
function p(
  numbers: string, dates: string, carefulDates: string, names: string, business: string | null,
  work: string, colours: string, carefulColours: string, stones: string, stonesToSkip = '', bestName?: number,
): PairTips {
  return {
    numbers: nums(numbers) as Digit[], dates: nums(dates), carefulDates: nums(carefulDates), names: nums(names),
    business: nums(business ?? names), work: words(work), colours: words(colours), carefulColours: words(carefulColours),
    stones: words(stones), stonesToSkip: words(stonesToSkip), ...(bestName ? { bestName } : {}),
  };
}

const S1 = '19, 37, 46, 64';
const S5 = '14, 23, 32, 41, 50, 59, 77';
const S6 = '15, 24, 33, 42, 51, 60, 69';

/** PAIR_TIPS[mulank][bhagyank]. */
export const PAIR_TIPS: Readonly<Record<Digit, Readonly<Record<Digit, PairTips>>>> = {
  1: {
    1: p('1, 6', '1, 10, 19, 28, 6, 15, 24, 4, 13, 22, 31', '8, 17, 26', '1, 19, 37, 46, 64, 6, 15, 24, 33, 42, 69', null,
      'Fire, Iron and steel, Electricity, Power', 'Yellow, Light blue', 'Black, Red, Dark brown', 'Yellow sapphire, Golden sapphire'),
    2: p('6, 2, 7', '1, 10, 19, 28, 6, 15, 24, 7, 16, 25', '8, 17, 26, 9, 18, 27', '15, 24, 33, 42, 69', null,
      'Exports, Fancy goods, Fire, Electricals', 'Light yellow, Light blue, Light green', 'Black, Red', 'Yellow sapphire, Pearl, Cat’s eye'),
    3: p('1, 3', '1, 10, 19, 28, 3, 12, 21, 30, 5, 14, 23, 9, 18, 27', '8, 17, 26, 6, 15, 24', S1, null,
      'Fire, Rice, Grocery, Malls, Dairy, Poultry, Automobiles', 'Light yellow, Light blue, Rose, Orange, Violet', 'Black, Green', 'Yellow sapphire, Amethyst'),
    4: p('1, 6', '1, 10, 19, 28, 6, 15, 24', '8, 17, 26', S1, '19, 37, 46, 64, 82, 15, 24, 33, 42, 60, 69',
      'Fire, Iron, Electrical goods, Writing, Politics', 'Light yellow, Light blue', 'Black, Green', 'Golden sapphire, Light blue sapphire'),
    5: p('1, 5, 6', '1, 10, 19, 28, 5, 14, 23, 6, 15, 24', '8, 17, 26', `19, 37, 46, 64, 82, ${S5}`, null,
      'Commission agency, Contracts, Steel, Fire, Exports', 'Yellow, Light blue, Grey', 'Black, Brown', 'Ruby, Diamond, Golden sapphire'),
    6: p('1, 6', '1, 10, 19, 28, 6, 15, 24, 9, 18, 27', '3, 12, 21, 30, 8, 17, 26', '19, 37, 46, 64, 82, 15, 33, 42, 60, 69', null,
      'Contracts, Fancy goods, Jewellery, Steel, Fire', 'Yellow, Light blue, Green', 'Black, Orange, Violet', 'Golden sapphire, Ruby, Emerald'),
    7: p('1, 2, 6', '1, 10, 19, 28, 2, 11, 20, 29, 6, 15, 24', '9, 18, 27, 8, 17, 26', '19, 37, 46, 64, 15, 24, 33, 42', null,
      'Metal, Granite, Fire, Minerals', 'Yellow, Light blue, Light green', 'Black, Red', 'Golden sapphire, Pearl, Cat’s eye, Yellow sapphire'),
    8: p('1, 5, 6', '1, 10, 19, 28, 5, 14, 23, 6, 15, 24', '8, 17, 26', '19, 37, 46, 64, 14, 23, 32, 41, 59, 15, 24, 33, 42', null,
      'Steel, Fire, Real estate, Contracts, Transport, Commission', 'Yellow, Blue', 'Black', 'Blue sapphire, Golden sapphire, Yellow sapphire, Ruby, Diamond'),
    9: p('1, 9, 5, 6', '1, 10, 19, 28, 9, 18, 27, 5, 14, 23, 6, 15, 24', '8, 17, 26',
      '19, 37, 46, 64, 9, 18, 27, 14, 23, 32, 41, 59, 15, 24, 33, 42, 6, 51, 60, 69, 78, 87, 96',
      '19, 37, 46, 64, 14, 23, 32, 41, 59, 15, 24, 33, 42, 51, 60, 69, 78, 87, 96, 9, 18, 27, 36, 45, 54, 63, 72, 90, 99',
      'Steel, Fire, Real estate, Contracts, Transport, Commission', 'Yellow, Blue, Red', 'Black', 'Blue sapphire, Golden sapphire, Yellow sapphire, Coral, Diamond'),
  },
  2: {
    1: p('6, 7', '7, 16, 25, 6, 15, 24, 1, 10, 19, 28', '9, 18, 27, 8, 17, 26', '15, 24, 33, 42, 51', null,
      'Fancy goods, Nursery, Contracts, Commission, Agriculture', 'Yellow, Light blue, Light green', 'Black, Red', 'Golden sapphire, Pearl, Cat’s eye'),
    2: p('7, 6', '7, 16, 25, 6, 15, 24', '9, 18, 27', '34, 43, 15, 24, 33, 42, 60, 69', null,
      'Fancy goods, Commission, Contracts, Agriculture, Horticulture', 'Green, Light blue', 'Red', 'Cat’s eye, Pearl'),
    3: p('7, 3', '7, 16, 25, 3, 12, 21, 30, 5, 14, 23', '9, 18, 27, 6, 15, 24', '14, 23, 41, 50, 59, 21, 39', null,
      'Arts, Fine arts, Books, Beauty products, Utensils', 'Light yellow, Light blue', 'Red', 'Cat’s eye, Pearl'),
    4: p('6, 7', '6, 15, 24, 2, 11, 20, 29, 1, 10, 19, 28', '9, 18, 27, 8, 17, 26', '15, 24, 33, 42, 60, 69', null,
      'Quarrying, Exports, Leather, Beauty products, Vehicles, Writing, Oratory', 'Light yellow, Green, Light blue', 'Black, Red', 'Cat’s eye, Pearl'),
    5: p('7, 5', '7, 16, 25, 5, 14, 23, 6, 15, 24', '9, 18, 27', `${S5}, 6, 15, 24, 33, 42`, null,
      'Commission, Contracts, Beauty products, Electricals, Green goods', 'Green, Grey', 'Red', 'Cat’s eye, Pearl, Moonstone'),
    6: p('7, 6', '7, 16, 25, 6, 15, 24', '9, 18, 27', '15, 24, 33, 42, 69', null,
      'Agriculture, Vegetables, Contracts, Perfumes, Jewellery, Beauty products, Green goods', 'Light blue, Green', 'Red, Orange, Rose, Violet', 'Cat’s eye, Jade, Moonstone'),
    7: p('6, 7', '6, 15, 24, 7, 16, 25', '9, 18, 27', '15, 24, 33, 42, 51, 69, 34, 43', null,
      'Chemicals, Media, Dyes, Textiles, Hotels, Catering, Fine arts', 'Light yellow, Green, Light blue', 'Red', 'Cat’s eye, Pearl, Jade, Moonstone'),
    8: p('7, 5, 6', '7, 16, 25, 5, 14, 23, 6, 15, 24', '9, 18, 27', '14, 23, 32, 41, 50, 59, 7, 16, 25', null,
      'Fancy goods, Vehicles, Metal, Contracts, Machines, Commission agency, Arts', 'Green, Dark blue, Yellow', 'Black, Red', 'Cat’s eye, Pearl, Moonstone'),
    9: p('6, 5', '6, 15, 24, 5, 14, 23', '9, 18, 27', `14, 23, 32, 41, 50, 59, 15, 24, 33, 42, 51, 69`, null,
      'Agriculture, Teaching, Arbitration, Law, Commission, Military, Contracts', 'Light blue, Light yellow', 'Red', 'Cat’s eye, Pearl, Moonstone'),
  },
  3: {
    1: p('3, 1', '3, 12, 21, 30, 9, 18, 27, 1, 10, 19, 28', '6, 15, 24', '21, 39, 19, 46, 64', null,
      'Administration, Teaching, Metal, Fire, Stone, Wood, Supermarkets', 'Rose, Orange, Violet, Blue, Yellow', 'Black, Red', 'Amethyst, Yellow sapphire, Golden sapphire'),
    2: p('3, 7, 5', '3, 12, 21, 30, 7, 16, 25, 5, 14, 23', '9, 18, 27', '19, 37, 46, 55, 64, 21, 39, 14, 23, 41, 50, 59', '21, 39, 14, 23, 41, 50, 59',
      'Beauty products, Commission, Contracts', 'Rose, Orange, Violet', 'Green, Red', 'Amethyst, Moonstone, Cat’s eye'),
    3: p('5, 9, 3', '3, 12, 21, 30, 9, 18, 27, 5, 14, 23', '6, 15, 24', '19, 37, 46, 64, 73, 14, 23, 41, 50, 59, 27, 36, 45, 21, 39', '14, 23, 41, 50, 59, 27, 36, 45, 21, 39',
      'Dairy, Supermarkets, Commission, Contracts', 'Rose, Orange, Violet', 'Green', 'Amethyst', '', 45),
    4: p('3, 1', '3, 12, 21, 30, 1, 10, 19, 28', '6, 15, 24', '21, 39, 19, 37, 46, 64', null,
      'Arbitration, Law, Magazines, Auditing, Transport, Vehicles', 'Rose, Orange, Violet, Light yellow, Blue', 'Green', 'Amethyst, Golden sapphire'),
    5: p('3, 5, 9', '3, 12, 21, 30, 5, 14, 23, 9, 18, 27', '6, 15, 24', '21, 39, 14, 23, 41, 59', '21, 39, 14, 23, 41, 50, 59',
      'Commission, Agency, Granite, Power, Metals', 'Rose, Orange, Violet, Grey, Light blue', 'Green', 'Amethyst, Diamond, Zircon'),
    6: p('1, 9', '1, 10, 19, 28, 9, 18, 27', '', '1, 10, 19, 9, 18, 27', null,
      'Fancy goods, Agency, Textiles, Supermarkets', 'Light blue, Light green', '', 'Golden sapphire, Yellow sapphire, White sapphire'),
    7: p('3, 2', '3, 12, 21, 30, 2, 11, 20, 5, 14, 23', '6, 15, 24', `21, 39, ${S5}`, null,
      'Liquids, Chemicals, Medical goods, Minerals', 'Rose, Orange, Violet', 'Red', 'Amethyst, Cat’s eye'),
    8: p('3, 5', '3, 12, 21, 30, 5, 14, 23, 1, 10, 19', '6, 15, 24, 8, 17, 26', `21, 39, ${S5}, 19, 37, 46, 64`, `21, 39, ${S5}, 9, 18, 27`,
      'Metals, Machine shops, Transport, Iron, Journalism', 'Rose, Orange, Violet, Blue, Yellow', 'Black, Green', 'Amethyst, Blue sapphire'),
    9: p('3, 5, 1, 9', '3, 12, 21, 30, 5, 14, 23, 1, 10, 19, 9, 18, 27', '6, 15, 24, 8, 17, 26, 7, 16, 25', `21, 39, ${S5}, 19, 37, 46, 64, 9, 18, 27`, null,
      'Metals, Machines, Armoury, Transport, Iron, Journalism', 'Rose, Orange, Violet, Blue, Yellow', 'Black, Green', 'Amethyst, Coral, Diamond'),
  },
  4: {
    1: p('1, 6', '1, 10, 19, 28, 6, 15, 24', '8, 17, 26', `19, 37, 46, 64, 73, 91, ${S6}`, null,
      'Oratory, Websites, Commission, Vehicles, Fire and iron, Journalism', 'Blue, Yellow', 'Black, Red', 'Garnet, Light blue sapphire'),
    2: p('6, 1', '6, 15, 24, 1, 10, 19, 28', '8, 17, 26', `${S6}, 19, 37, 46, 64, 73, 91`, null,
      'Websites, Transport, Commission, Vehicles, Exports, Fire, Iron, Chemicals', 'Light blue, Yellow, Sandal, Light green', 'Black, Red, Dark brown', 'Garnet, Light blue sapphire'),
    3: p('1, 3', '1, 10, 19, 28, 3, 12, 21, 30', '8, 17, 26, 6, 15, 24', '10, 19, 37, 46, 64, 73', null,
      'Medicine, Websites, Four-wheelers, Vehicles, Food, Iron', 'Light blue, Yellow, Violet, Rose, Orange', 'Black, Red, Green', 'Garnet, Light blue sapphire'),
    4: p('1, 6', '1, 10, 19, 28, 6, 15, 24', '8, 17, 26', `10, 19, 37, 46, 64, 73, ${S6}`, null,
      'Oratory, Websites, Writing, Four-wheelers, Medical goods, Vehicles, Steel, Iron', 'Light blue, Yellow, Sandal', 'Black, Red, Coffee brown', 'Garnet, Light blue sapphire'),
    5: p('1, 6, 5', '1, 10, 19, 28, 6, 15, 24, 5, 14, 23', '8, 17, 26', `10, 19, 37, 46, 64, 73, ${S6}, 14, 23, 32, 41, 50, 59`, null,
      'Agency, Websites, Power, Commission, Medical goods, Vehicles, Steel, Iron', 'Yellow, Light blue, Sandal, Grey', 'Black, Red', 'Garnet, Diamond, Light blue sapphire'),
    6: p('1, 6', '1, 10, 19, 28, 6, 15, 24', '8, 17, 26, 3, 12, 21, 30', `10, 19, 37, 46, 64, 73, ${S6}`, null,
      'Fine arts, Arbitration, Luxury and beauty goods, Vehicles, Steel, Iron', 'Yellow, Light blue, Light green', 'Black, Red, Violet', 'Light blue sapphire, Garnet'),
    7: p('6, 1', '6, 15, 24, 1, 10, 19, 28', '8, 17, 26, 9, 18, 27', `${S6}, 10, 19, 37, 46, 64, 73`, null,
      'Fine arts, Writing, Websites, Vehicles, Commission, Luxury goods', 'Yellow, Light blue, Light green', 'Black, Red, Coffee brown', 'Light blue sapphire, Garnet'),
    8: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19, 28', '8, 17, 26', `14, 23, 41, 50, 59, ${S6}, 10, 19, 37, 46, 64, 73`, null,
      'Handicrafts, Vehicles, Commission, Iron, Arbitration', 'Yellow, Blue, Light blue', 'Black, Red, Coffee brown', 'Light blue sapphire, Garnet'),
    9: p('6, 1, 5', '6, 15, 24, 1, 10, 19, 28, 5, 14, 23', '8, 17, 26, 2, 11, 20, 29, 7, 16, 25', `${S6}, 19, 37, 46, 64, 14, 23, 41, 50, 59`, null,
      'Contracts, Brokerage, Vehicles, Commission, Iron, Arbitration', 'Yellow, Blue, Red', 'Black, Coffee brown', 'Light blue sapphire, Garnet'),
  },
  5: {
    1: p('5, 1', '5, 14, 23, 1, 10, 19, 28', '', `5, ${S5}, 19, 37, 46, 64, 73, 91`, null,
      'Contracts, Agencies, Commission, Vehicles, Fire, Power, Steel', 'Grey, Yellow, Light blue', 'Black', 'Diamond, Zircon, Golden sapphire'),
    2: p('5, 7', '5, 14, 23, 7, 16, 25', '9, 18, 27', '14, 23, 32, 41, 59, 77', null,
      'Contracts, Agencies, Commission, Vehicles, Beauty products, Electricals, Steel', 'Grey, Light green, Light blue', 'Red', 'Diamond, Zircon, Tiger’s eye, Moonstone'),
    3: p('5, 3, 9', '5, 14, 23, 3, 12, 21, 30, 9, 18, 27', '6, 15, 24', `5, ${S5}, 21, 39`, null,
      'Contracts, Agencies, Commission, Vehicles, Beauty and cosmetics, Electricals, Steel goods', 'Light blue, Grey, Rose, Orange, Violet', 'Green', 'Diamond, Zircon, Amethyst'),
    4: p('5, 1', '5, 14, 23, 1, 10, 19, 28, 6, 15, 24', '', `5, ${S5}, 19, 37, 46, ${S6}`, null,
      'Contracts, Agencies, Commission, Vehicles, Steel', 'Light blue, Grey, Light yellow', 'Black', 'Diamond, Zircon, Garnet'),
    5: p('5, 9', '5, 14, 23, 9, 18, 27, 3, 12, 21, 30', '', `5, ${S5}, 27, 36, 45, 54, 63, 72, 90`, null,
      'Contracts, Agencies, Commission, Vehicles, Metals, Medicine, Websites', 'Grey, and any colour', '', 'Diamond, Zircon'),
    6: p('5, 6', '5, 14, 23, 6, 15, 24, 1, 10, 19, 28', '3, 12, 21, 30', `5, ${S5}, 6, ${S6}`, null,
      'Luxury and fancy goods, Contracts, Agencies, Metals, Commission, Vehicles', 'Grey, Light green, Light blue', 'Rose, Orange, Violet', 'Diamond, Zircon, Emerald'),
    7: p('5, 2, 6', '5, 14, 23, 2, 11, 20, 29, 6, 15, 24', '9, 18, 27', `5, ${S5}, 6, ${S6}`, null,
      'Writing, Oratory, Contracts, Agencies, Metals, Commission, Vehicles', 'Grey, Green, Light blue, Light yellow', 'Red', 'Diamond, Zircon'),
    8: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19, 28', '', `5, ${S5}, 6, ${S6}`, null,
      'Iron, Silver, Gold, Contracts, Agencies, Metals, Commission, Vehicles', 'Blue, Grey', '', 'Diamond, Zircon'),
    9: p('5, 9', '5, 14, 23, 9, 18, 27, 6, 15, 24, 3, 12, 21, 30', '2, 11, 20, 29', `5, ${S5}, 9, 18, 27, 36, 45, 54`, null,
      'Iron, Silver, Gold, Contracts, Agencies, Metals, Commission, Vehicles', 'Red, Grey', 'Green', 'Diamond, Zircon, Coral'),
  },
  6: {
    1: p('6, 1', '6, 15, 24, 1, 10, 19, 28, 9, 18, 27', '3, 12, 21, 30', `6, ${S6}, 19, 37, 46, 55, 64`, null,
      'Iron, Silver, Gold, Contracts, Agencies, Jewellery, Commission, Vehicles', 'Yellow, Green', 'Orange, Rose, Violet, Black', 'Emerald'),
    2: p('6, 7', '6, 15, 24, 7, 16, 25, 1, 10, 19, 28', '3, 12, 21, 30', `6, ${S6}`, null,
      'Fancy and luxury goods, Contracts, Agencies, Jewellery, Commission, Vehicles, Green goods', 'Light blue, Green', 'Red, Orange, Rose, Violet', 'Emerald, Jade, Tiger’s eye, Moonstone, Pearl'),
    3: p('1, 9', '1, 10, 19, 28, 9, 18, 27', '', '19, 37, 46, 55, 64, 27, 36, 45, 54', null,
      'Fancy and luxury goods, Contracts, Agencies, Commission, Textiles', 'Light blue, Light yellow', '', 'Yellow sapphire, Golden sapphire'),
    4: p('6, 1', '6, 15, 24, 1, 10, 19, 28', '3, 12, 21, 30', `${S6}, 19, 37, 46, 55, 64`, null,
      'Fancy and luxury goods, Contracts, Agencies, Commission, Textiles', 'Green, Light blue, Yellow', 'Rose, Orange, Violet, Black, Red', 'Emerald, Garnet'),
    5: p('6, 5, 1', '6, 15, 24, 5, 14, 23, 1, 10, 19, 28', '3, 12, 21, 30', `${S6}, 14, 23, 32, 41, 50, 59`, null,
      'Fancy and luxury goods, Contracts, Agencies, Commission, Iron, Vehicles', 'Green, Blue, Grey', 'Rose, Orange, Violet', 'Emerald, Diamond'),
    6: p('6, 1', '6, 15, 24, 1, 10, 19, 28', '3, 12, 21, 30', `19, 37, 46, 55, 64, 9, 18, 27, ${S6}`, null,
      'Fancy and luxury goods, Beauty, Cosmetics, Jewellery, Iron, Medicine, Green goods', 'Green, Light blue', 'Rose, Orange, Violet', 'Emerald, Coral'),
    7: p('6, 2', '6, 15, 24, 2, 11, 20, 29', '3, 12, 21, 30, 9, 18, 27', `19, 37, 46, 55, 64, ${S6}`, null,
      'Writing, Speaking, Fancy and luxury goods, Green goods, Textiles', 'Green, Light blue, Light green', 'Rose, Orange, Violet, Red', 'Emerald, Jade'),
    8: p('6, 5, 1', '6, 15, 24, 5, 14, 23', '3, 12, 21, 30', `${S6}, 14, 23, 32, 41, 50, 59, 19, 37, 46, 55, 64`, null,
      'Fire, Power, Iron, Fancy and luxury goods, Commission, Contracts', 'Blue, Green, Yellow', 'Black, Red, Rose, Orange, Violet', 'Emerald, Blue sapphire'),
    9: p('6, 9', '6, 15, 24, 9, 18, 27', '3, 12, 21, 30', `${S6}, 27, 36, 45, 54`, null,
      'Commission, Contracts, Vehicles, Cosmetics, Fancy and luxury goods', 'Light green, Red, Light blue', 'Rose, Orange, Violet', 'Emerald, Coral'),
  },
  7: {
    1: p('6, 2, 1', '6, 15, 24, 2, 11, 20, 29, 1, 10, 19, 28', '9, 18, 27, 8, 17, 26', `6, ${S6}, 19, 37, 46, 64`, null,
      'Contracts, Agencies, Commission, Vehicles, Metals, Fire, Iron', 'Green, Yellow, Blue, Sandal', 'Black, Red', 'Moonstone, Pearl, Cat’s eye, Yellow sapphire, Golden sapphire', '', 42),
    2: p('6, 2', '6, 15, 24, 2, 11, 20', '9, 18, 27', `6, ${S6}, 38, 56, 65`, `6, ${S6}, 56, 65`,
      'Contracts, Agencies, Commission, Textiles, Fancy goods, Writing, Oratory', 'Green, Yellow, Light blue', 'Red', 'Cat’s eye, Moonstone, Tiger’s eye'),
    3: p('2, 5, 3', '2, 11, 20, 5, 14, 23, 3, 12, 21, 30', '9, 18, 27, 6, 15, 24', `5, 14, 23, 32, 41, 50, 59, 21, 39`, null,
      'Professions, Trading, Liquids, Stone, Medicine, Arts, Contracts, Agency', 'Green, Yellow, Light blue', 'Red', 'Cat’s eye, Moonstone, Tiger’s eye'),
    4: p('6, 1', '6, 15, 24, 1, 10, 19, 28, 2, 11, 20', '9, 18, 27, 8, 17, 26', `6, ${S6}`, null,
      'Arts, Religion, Oratory, Writing, Commission, Fancy goods, Books, Paper', 'Green, Yellow, Blue', 'Red, Black', 'Cat’s eye, Moonstone, Tiger’s eye, Garnet'),
    5: p('2, 5, 6', '2, 11, 20, 5, 14, 23, 6, 15, 24', '9, 18, 27, 8, 17, 26', `${S5}, ${S6}`, null,
      'Speaking, Writing, Contracts, Medicine, Vehicles, Metal', 'Green, Yellow, Grey, Light blue', 'Red', 'Cat’s eye, Moonstone, Tiger’s eye, Diamond'),
    6: p('2, 6, 1', '2, 11, 20, 6, 15, 24, 1, 10, 19, 28', '9, 18, 27, 3, 12, 21, 30', `19, 37, 46, 55, 64, ${S6}`, null,
      'Speaking, Writing, Commission, Contracts, Fancy goods, Medicine, Green goods, Textiles, Vehicles, Transport', 'Green, Light yellow, Light blue', 'Rose, Orange, Red, Violet', 'Cat’s eye, Moonstone, Tiger’s eye, Emerald'),
    7: p('2, 6, 5', '2, 11, 20, 6, 15, 24, 5, 14, 23', '9, 18, 27', `${S6}, ${S5}`, null,
      'Mediation, Writing, Law, Medicine, Commission, Contracts, Electricals, Electronics, Computers', 'Green, Light blue, Light yellow', 'Red', 'Cat’s eye, Pearl, Tiger’s eye, Moonstone', '', 42),
    8: p('2, 5, 6', '2, 11, 20, 5, 14, 23, 6, 15, 24', '9, 18, 27, 8, 17, 26', `${S5}, ${S6}`, null,
      'Speaking, Writing, Commission, Contracts, Medicine, Food, Electricals, Electronics, Metal, Computers, Stationery', 'Green, Blue, Yellow', 'Black, Red', 'Cat’s eye, Moonstone, Tiger’s eye, Diamond', '', 42),
    9: p('5, 6', '5, 14, 23, 6, 15, 24', '', `${S5}, ${S6}`, null,
      'Mediation, Writing, Commission, Contracts, Medicine, Iron, Steel, Metal', 'Light yellow, Light blue', '', 'Cat’s eye, Moonstone, Tiger’s eye, Diamond'),
  },
  8: {
    1: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19, 28', '8, 17, 26', S5, null,
      'Contracts, Printing, Commission, Advertising, Electronics, Computers, Iron, Law, Religion', 'Blue, Yellow', 'Black, Red', 'Diamond, Ruby, Emerald'),
    2: p('5, 6', '5, 14, 23, 6, 15, 24, 7, 16, 25', '9, 18, 27, 8, 17, 26', `${S5}, ${S6}`, null,
      'Contracts, Machines, Steel, Green goods, Fancy goods, Vehicles, Iron', 'Blue, Green, Yellow', 'Red', 'Cat’s eye, Moonstone, Tiger’s eye', 'Blue diamond'),
    3: p('5, 3, 1', '5, 14, 23, 3, 12, 21, 1, 10, 19', '8, 17, 26, 6, 15, 24', `${S5}, 86, 10, 19, 37, 46, 64, 73, 82, 91`, null,
      'Iron and steel, Contracts, Commission, Handicrafts, Arts, Transport, Printing', 'Blue, Yellow, Violet', 'Black, Green, Red', 'Ruby, Diamond, Amethyst', 'Blue diamond, Emerald'),
    4: p('5, 1, 6', '5, 14, 23, 6, 15, 24, 1, 10, 19', '2, 11, 20, 29, 8, 17, 26', `${S5}, 86, 19, 37, 46, 55, 64, ${S6}, 78`, `${S5}, 86, ${S6}, 78, 19, 37, 46, 55, 64, 73, 82`,
      'Iron and steel, Writing, Speaking, Vehicles, Contracts, Commission agencies', 'Light blue, Light yellow', 'Dark blue, Black', 'Diamond, Zircon, Garnet', 'Blue diamond, Pearl, Cat’s eye'),
    5: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19, 28', '8, 17, 26', `${S5}, ${S6}`, null,
      'Contracts, Printing, Commission, Advertising, Electronics, Computers, Iron, Law, Religion', 'Blue, Yellow, Grey', 'Black, Red', 'Blue sapphire, Diamond'),
    6: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19', '3, 12, 21, 30, 8, 17, 26', `${S5}, 86, ${S6}, 78, 10, 19, 37, 46, 55, 64, 73, 82`, null,
      'Iron and steel, Fire, Textiles, Power projects, Luxuries, Fancy goods, Contracts, Commission, Vehicles', 'Blue, Yellow, Green', 'Black, Dark blue', 'Ruby, Emerald', 'Blue diamond, Amethyst'),
    7: p('5, 6', '5, 14, 23, 6, 15, 24', '8, 17, 26, 9, 18, 27', `${S5}, ${S6}`, null,
      'Contracts, Printing, Commission agency, Publishing, Writing, Iron and steel', 'Blue, Yellow, Green', 'Black, Dark blue', 'Pearl, Cat’s eye, Moonstone', 'Blue diamond'),
    8: p('5, 6, 1', '5, 14, 23, 6, 15, 24, 1, 10, 19', '4, 13, 22, 31, 7, 16, 25, 8, 17, 26', `${S5}, 24, 33, 42, 51, 60, 69, 78`, null,
      'Vehicles, Iron and steel, Contracts, Commission, Writing and speaking, Book publishing', 'Light blue, Light yellow', 'Dark blue, Black, Red', 'Diamond, Emerald, Yellow sapphire', 'Garnet, Cat’s eye, Blue diamond'),
    9: p('5, 6', '5, 14, 23, 6, 15, 24, 9, 18, 27, 1, 10, 19', '8, 17, 26, 7, 16, 25, 2, 11, 20, 29', `${S5}, ${S6}`, null,
      'Groceries, Supermarkets, Iron, Metal, Vehicles, Contracts, Commission, Beauty goods', 'Blue, Yellow', 'Black, Green', 'Blue sapphire, Aquamarine'),
  },
  9: {
    1: p('9, 5, 1, 6', '5, 14, 23, 6, 15, 24, 9, 18, 27, 1, 10, 19, 28', '2, 11, 20, 29, 7, 16, 25', `27, 45, 19, 37, 46, 64, ${S6}, 5, ${S5}`, null,
      'Contracts, Agencies, Paper, Commission, Metals, Fire, Writing, Publishing, Websites', 'Yellow, Light blue, Red', 'Black, Green', 'Coral, Ruby, Navratna (nine gems), Golden sapphire, Yellow sapphire'),
    2: p('5, 6', '5, 14, 23, 6, 15, 24', '', `${S6}, 5, ${S5}`, null,
      'Contracts, Agencies, Commission, Vehicles, Agriculture, Paper, Fancy and green goods, Writing, Websites', 'Yellow, Light blue, Blue', '', 'Moonstone, Cat’s eye, Tiger’s eye'),
    3: p('9, 3, 5', '9, 18, 27, 5, 14, 23, 3, 12, 21, 30', '2, 11, 20, 29, 7, 16, 25', `18, 27, 36, 45, 54, 21, 39, 5, ${S5}`, null,
      'Contracts, Agencies, Construction, Commission, Metals, Writing, Oratory, Oil, Vehicles, Supermarkets, Malls', 'Yellow, Light blue, Red, Rose, Orange, Violet', 'Green', 'Coral, Amethyst, Navratna (nine gems)'),
    4: p('9, 6, 5, 1', '9, 18, 27, 5, 14, 23, 6, 15, 24, 1, 10, 19', '2, 11, 20, 29, 7, 16, 25', `18, 27, 36, 45, 54, ${S6}, 5, ${S5}, 19, 37, 46, 64`, null,
      'Contracts, Agencies, Commission, Vehicles, Writing, Websites, Politics, Oratory', 'Light blue, Light yellow, Red', 'Green, Black', 'Coral, Garnet, Navratna (nine gems), Light blue sapphire'),
    5: p('5, 6', '9, 18, 27, 5, 14, 23, 6, 15, 24', '2, 11, 20, 29, 7, 16, 25', `27, 36, 45, 54, ${S5}`, null,
      'Contracts, Agencies, Commission, Vehicles, Construction, Shipping, Farm produce, Metal', 'Light blue, Red, Grey', 'Green', 'Coral, Diamond, Navratna (nine gems)'),
    6: p('9, 6, 5', '9, 18, 27, 6, 15, 24, 5, 14, 23, 1, 10, 19', '2, 11, 20, 29, 7, 16, 25', `27, 36, 45, 54, ${S6}, ${S5}`, null,
      'Contracts, Commission, Fancy goods, Shipping, Construction, Farm produce, Metal', 'Light blue, Red, Light yellow', 'Dark green, Rose, Orange, Violet', 'Coral'),
    7: p('6, 5', '6, 15, 24, 5, 14, 23', '', `${S6}, ${S5}`, null,
      'Contracts, Agencies, Commission, Vehicles, Supermarkets, Malls, Farm produce, Iron', 'Light blue, Yellow', '', 'Moonstone, Cat’s eye'),
    8: p('9, 5, 6', '5, 14, 23, 6, 15, 24, 9, 18, 27', '2, 11, 20, 29, 7, 16, 25, 8, 17, 26', `${S5}, ${S6}, 27, 36, 45, 54`, null,
      'Contracts, Multiplexes, Vehicles, Construction, Dairies, Farm produce, Iron', 'Red, White, Yellow', 'Black, Blue, Coffee brown', 'Coral, Ruby, Diamond', 'Blue diamond, Garnet, Cat’s eye, Pearl'),
    9: p('9, 6, 5', '6, 15, 24, 5, 14, 23, 9, 18, 27', '2, 11, 20, 29, 7, 16, 25', `${S5}, ${S6}, 27, 36, 45, 54`, null,
      'Contracts, Agencies, Commission, Groceries, Construction, Mini markets, Handicrafts, Art, Defence supplies', 'Red, Blue, Yellow', 'Green', 'Coral'),
  },
};

export function pairTips(mulank: Digit, bhagyank: Digit): PairTips {
  return PAIR_TIPS[mulank][bhagyank];
}

/** "1 Sun, 6 Venus". */
export const numbersWithPlanets = (ds: readonly Digit[]): string => ds.map((d) => `${d} ${PLANET_OF[d]}`).join(', ');

/** Every pair, for tests and for the method page. */
export const ALL_PAIRS: readonly [Digit, Digit][] = DIGITS.flatMap((a) => DIGITS.map((b) => [a, b] as [Digit, Digit]));

/** Whether a name total is one the pair's list gives. */
export const nameSuitsPair = (tips: PairTips, total: number): boolean => tips.names.includes(total);

/** The single digits the pair's name totals add down to, for a short "names adding to 5 or 6" line. */
export const nameRoots = (tips: PairTips): Digit[] => [...new Set(tips.names.map((n) => rootOf(n)))].sort((a, b) => a - b);

export const PAIR_LABEL = {
  numbers: 'Lucky numbers',
  dates: 'Dates that suit',
  carefulDates: 'Dates to go carefully with',
  colours: 'Colours that suit',
  carefulColours: 'Colours to go easy on',
  stones: 'Stones linked with the pair',
  stonesToSkip: 'Stones the tables say to skip',
  work: 'Lines of work that suit',
  names: 'Name totals that suit',
  business: 'Business name totals',
} as const;

export const PAIR_INTRO = 'The pair tables read your Mulank and Bhagyank together, so these tips are for your exact pair of numbers. They are the tables the founder of VediCosmic works with, a living teaching rather than a classical text.';
export const PAIR_NONE = 'None singled out for your pair.';
/** When a pair's lucky number is one the friendship table treats with care. */
export const PAIR_DIFFERS = 'Where the pair tables and the friendship table differ. The pair tables count a number lucky for your exact pair; the friendship table, used for the numbers to go carefully with, looks only at how the planets regard each other. Teachers differ, and many use the pair tables for names and dates.';
export const PAIR_DATES_INTRO = 'The next dates from today that the pair tables give for your pair, with the dates of your own number first, and the next dates they ask you to go carefully with.';
export const PAIR_DATES_LABEL = { own: 'Best: your own number', other: 'Good: other dates that suit', careful: 'Go carefully' } as const;
export const PAIR_STONES_NOTE = 'Stones are listed as the tables give them. Ask a qualified astrologer before wearing one, as the note under Remedies explains.';
