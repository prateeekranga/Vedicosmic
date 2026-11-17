/**
 * Remedies for the numbers of the Lo Shu grid, one set for a number the grid lacks and one for a
 * number it holds more than once. Each is a custom of the tradition or a habit set in a planet's
 * frame; none is a promise. The daily habits are ordinary advice (waking early, exercise, rest,
 * study) given the character of the planet that rules the number. The offerings, mantras, colours,
 * days and gifts are customs common among Indian numerology and Jyotish teachers. The balancing
 * customs for a number held often apply the same planetary logic to the template teachers give for
 * the Sun, and are this page's own arrangement: no classical text lists them.
 */
import type { Digit } from '@/engine/numerology';

export interface MissingRemedy {
  /** Habits for the day: the practical correction. */
  daily: readonly [string, string, string];
  /** An offering to make, with the planet's mantra given beside it elsewhere. */
  offering: string;
  /** Colours to wear in everyday clothes. */
  wear: string;
  /** Five practical things to buy or swap in, always in this order: a watch, a pen, a bottle or cup, a wallet or bag, a phone cover. */
  items: readonly [string, string, string, string, string];
  /** A picture for the phone and the laptop. */
  wallpaper: string;
  /** A thing to use or keep in daily life. */
  use: string;
}

export interface ExcessRemedy {
  /** What too much of the number is read as. */
  signs: string;
  /** Two habits that balance it. */
  balance: readonly [string, string];
  /** Colours to go easy on, and colours that balance them. */
  colour: string;
  /** Two practical things to swap or add in daily life. */
  items: readonly [string, string];
  /** A picture for the phone and the laptop that balances the number. */
  wallpaper: string;
  /** What to give. */
  give: string;
  /** How to speak and act. */
  speak: string;
}

export const MISSING_REMEDY: Readonly<Record<Digit, MissingRemedy>> = {
  1: {
    daily: [
      'Wake early, before sunrise if you can, and spend ten minutes in morning light.',
      'Walk, run or do Surya Namaskar (sun salutations) each morning to build steady energy.',
      'Say what you want plainly, once a day, and make one small decision without asking anyone first.',
    ],
    offering: 'Offer water to the rising Sun each morning from a copper vessel, facing East, with the Sun mantra below.',
    wear: 'Wear or use gold, copper, deep orange or warm yellow in your shirts, scarves and everyday clothes.',
    items: [
      'A watch with a copper or gold-toned case, and an orange or tan strap.',
      'A pen in orange, gold or deep yellow, kept on your desk for your plans.',
      'A water bottle or mug in orange, gold-toned steel or deep yellow.',
      'A wallet or bag in tan, orange or deep yellow.',
      'A phone cover in orange or gold, or a plain deep-orange one.',
    ],
    wallpaper: 'A sunrise over water or a hill in gold and orange; a plain gold-to-orange gradient also works.',
    use: 'Drink water from a copper glass, as the tradition does, and keep a copper item or a picture of the Sun in the East of your room.',
  },
  2: {
    daily: [
      'Keep a fixed bedtime and a quiet last hour before sleep, with the phone put away.',
      'Spend time near water, a garden or moonlight, and write down your feelings each evening.',
      'Call or visit your mother, or someone who cares for you, once a week.',
    ],
    offering: 'On Monday evening offer a little milk and water to Shiva, or water to the rising Moon, with the Moon mantra below.',
    wear: 'Wear or use white, cream or silver in your shirts, scarves and everyday clothes.',
    items: [
      'A watch with a white or silver dial and a silver-toned or white strap.',
      'A white or silver pen, kept with your diary.',
      'A white or silver-toned bottle or mug that you use only for water.',
      'A white, cream or silver wallet, pouch or bag.',
      'A white, cream or pale silver phone cover.',
    ],
    wallpaper: 'A full Moon over calm water, or a soft white-and-silver night sky.',
    use: 'Keep a glass of fresh water by your bed, and use a silver cup or spoon if you have one.',
  },
  3: {
    daily: [
      'Read or study something worthwhile for thirty minutes a day.',
      'Explain what you know to someone else once a week; teaching is the practice.',
      'Greet a teacher or an elder with respect on Thursday, and keep your word on small promises.',
    ],
    offering: 'On Thursday offer yellow flowers, or a little turmeric and chana dal, to Vishnu or to your teacher, with the Jupiter mantra below.',
    wear: 'Wear or use yellow, saffron or gold in your shirts, scarves and everyday clothes.',
    items: [
      'A watch with a gold-toned case and a yellow or cream dial.',
      'A gold-coloured or yellow pen, with a yellow or saffron notebook for study.',
      'A brass or gold-toned water bottle, or a yellow mug.',
      'A yellow, saffron or cream wallet, bag or laptop sleeve.',
      'A yellow or saffron phone cover.',
    ],
    wallpaper: 'A golden-yellow field at dawn, or an open book in soft yellow light.',
    use: 'Eat turmeric-spiced food on Thursday and keep your study table tidy and well lit.',
  },
  4: {
    daily: [
      'Plan the day on paper each morning and keep one fixed routine through the week.',
      'Take one full rest day a week, and sleep and wake at regular times.',
      'Tidy one drawer, shelf or file each day, and finish paperwork before you start new tasks.',
    ],
    offering: 'On Saturday evening light a lamp at a shrine of Durga, or of Shiva or Hanuman, with the Rahu mantra below.',
    wear: 'Wear or use smoky blue, grey or dark blue, in plain, well-ordered clothes.',
    items: [
      'A plain steel watch with a grey or dark blue dial and strap.',
      'A grey or blue pen, kept with a diary in one fixed place.',
      'A steel or smoky blue bottle or flask, carried the same way each day.',
      'A smoky blue or grey bag or wallet, with a desk organiser for your papers at home.',
      'A grey or smoky blue phone cover.',
    ],
    wallpaper: 'A calm grey-blue sky or a misty mountain, simple and uncluttered, in smoky blue.',
    use: 'Keep your desk clear of clutter, with one tray for papers still to do.',
  },
  5: {
    daily: [
      'Read, write or learn something new for twenty minutes a day.',
      'Keep one notebook for plans, numbers and promises, and check it each evening.',
      'Breathe slowly for five minutes a day, and say one clear sentence at a time in conversation.',
    ],
    offering: 'On Wednesday offer a few durva blades to Ganesha, or a tulsi leaf to Vishnu, with the Mercury mantra below.',
    wear: 'Wear or use green or light blue in your shirts, scarves and everyday clothes.',
    items: [
      'A watch with a green or silver dial and a steel or green strap.',
      'A green pen, used for your daily plans and notes.',
      'A green water bottle or flask, refilled and carried every day.',
      'A green, turquoise or light blue wallet, bag or laptop sleeve.',
      'A green or turquoise phone cover.',
    ],
    wallpaper: 'A green forest, a leafy plant or a green hill after rain; a plain green gradient also works.',
    use: 'Keep a tulsi or other green plant where you work, and drink water slowly through the day.',
  },
  6: {
    daily: [
      'Keep your home and your appearance tidy: a made bed, fresh clothes and a clear table.',
      'Give an hour a week to music, art or a hobby you enjoy, and share a meal with someone you love.',
      'Say one kind thing to your partner, family or a friend each day.',
    ],
    offering: 'On Friday offer white flowers, or a little rice and sugar, to Lakshmi, with the Venus mantra below.',
    wear: 'Wear or use white, pink or pastel blue, in clean, fresh clothes, with a silver or white-metal chain, ring or bracelet.',
    items: [
      'A watch with a gold-toned metal case and a green dial.',
      'A white, pink or pearl-coloured pen, kept in your bag.',
      'A white or glass bottle, or a pastel mug, for water.',
      'A white, cream or pink wallet, card holder or handbag.',
      'A pastel blue, white or pink phone cover.',
    ],
    wallpaper: 'Fresh white or pink flowers such as lilies, roses or a lotus, or a soft pastel sky.',
    use: 'Keep a little sandal or rose fragrance, fresh flowers at home, and the North-West of the home tidy.',
  },
  7: {
    daily: [
      'Sit in silence for ten minutes a day, with no phone.',
      'Spend time in nature or a quiet place each week, and study something that truly interests you.',
      'Let one thing you no longer use go each week; the letting go is the practice.',
    ],
    offering: 'On Tuesday evening light a lamp for Ganesha, or feed a stray dog, with the Ketu mantra below.',
    wear: 'Wear or use smoke grey, off-white or earth tones, in simple clothes.',
    items: [
      'A watch with a plain grey or off-white dial and a simple strap.',
      'A plain grey or earth-toned pen, with a small notebook for quiet thoughts.',
      'A clay or plain steel cup or bottle, with no logo.',
      'A smoke-grey, off-white or earth-toned bag or wallet, without logos.',
      'A plain grey or off-white phone cover.',
    ],
    wallpaper: 'A quiet misty hill, a lone tree or still water in soft grey and off-white.',
    use: 'Keep one quiet corner for reading or prayer, free of screens, with a plain mat to sit on and a simple wooden mala if it is your custom.',
  },
  8: {
    daily: [
      'Choose one fixed routine and keep it every day for forty days.',
      'Give an hour a week to honest service, such as helping an elderly neighbour.',
      'Keep a written record of your spending and your time, and finish what you start before beginning something new.',
    ],
    offering: 'On Saturday evening light a sesame-oil lamp under a peepal tree, or at a shrine of Shani or Hanuman, with the Saturn mantra below.',
    wear: 'Wear or use black, dark blue or violet in your everyday clothes.',
    items: [
      'A watch with a dark blue or black dial and a steel-toned case.',
      'A black or dark blue pen in steel or iron-toned metal.',
      'A steel bottle or flask, or an iron or steel lunch box.',
      'A black or dark blue wallet, belt or bag, kept clean and in good repair.',
      'A dark blue or black phone cover.',
    ],
    wallpaper: 'A deep blue sky or a calm night sea; a plain dark-blue gradient also works.',
    use: 'Use an iron or steel utensil in the kitchen, and keep your shoes and footwear tidy.',
  },
  9: {
    daily: [
      'Exercise hard three or four times a week: running, sport, yoga or the gym.',
      'Finish one pending task each day before you start another, and speak calmly when you disagree.',
      'Give your hands to a cause: clean, carry or build something for other people.',
    ],
    offering: 'On Tuesday offer red flowers or red lentils to Hanuman, with the Mars mantra below.',
    wear: 'Wear or use red, coral or maroon in your shirts and everyday clothes.',
    items: [
      'A sports watch or fitness band with a red or coral strap, to keep your exercise time.',
      'A red or maroon pen, kept with your to-do list.',
      'A red, coral or copper-toned bottle or flask for the gym or sport.',
      'A red or maroon wallet or gym bag.',
      'A red or coral phone cover.',
    ],
    wallpaper: 'A red-orange sunrise over mountains, or a red lotus; keep it strong and simple.',
    use: 'Keep a picture of Hanuman, or a red cloth, in your room.',
  },
};

export const EXCESS_REMEDY: Readonly<Record<Digit, ExcessRemedy>> = {
  1: {
    signs: 'Too much of the Sun’s fire is read as stubbornness, ego or unbalanced energy: a need to lead every conversation and to be proved right.',
    balance: [
      'Cool the day down: finish with a calm evening walk, a bath or time near water.',
      'Share credit openly, and ask for another person’s view before you decide.',
    ],
    colour: 'Go easy on strong red, gold and ruby-toned things if your energy runs hot; add calming green, soft blue and white.',
    items: [
      'Swap a red or gold watch strap, phone cover or wallet for a green, blue or silver one.',
      'Keep a green plant on your desk, and a plain glass or steel bottle for water.',
    ],
    wallpaper: 'A calm green forest or a soft blue sky, rather than a strong red or gold sunrise.',
    give: 'Donate red-coloured items, or wheat and jaggery, on a Sunday, to spend some of the Sun’s intensity.',
    speak: 'Practise active listening: let the other person finish, and soften your tone when you disagree.',
  },
  2: {
    signs: 'Too much of the Moon is read as heavy sensitivity: moods that swing, hurt that lingers and a feeling that is hard to let pass.',
    balance: [
      'Keep fixed meal and sleep times, so that your feelings have a steady frame.',
      'Move your body for twenty minutes a day; fresh air helps feelings settle.',
    ],
    colour: 'Go easy on all-white and pale silver if you feel low or drifting; add warm yellow, orange and earth tones for steadiness.',
    items: [
      'Swap an all-white or silver phone cover or scarf for a warm yellow or orange one.',
      'Keep a simple paper diary for feelings, written once in the evening and then closed.',
    ],
    wallpaper: 'A warm yellow-orange scene such as a sunlit meadow, rather than an all-white or moonlit one.',
    give: 'Give rice or milk to someone who needs it on a Monday, and then let the matter go.',
    speak: 'Say what you feel in one calm sentence, then pause, and do not replay the conversation afterwards.',
  },
  3: {
    signs: 'Too much of Jupiter is read as over-confidence: advice given freely, large promises and ideas that spread wider than the time to finish them.',
    balance: [
      'Finish one idea before you start another, and put a date on each plan.',
      'Keep a short list of your commitments, and say no to what does not fit it.',
    ],
    colour: 'Go easy on strong yellow and saffron if your energy scatters; add white, light blue and earth shades for focus.',
    items: [
      'Swap a bright yellow notebook or pen for a plain white or light blue one, and use it for a single plan.',
      'Put a small whiteboard or checklist where you work, with at most three tasks for the day.',
    ],
    wallpaper: 'A plain white or light blue sky, rather than a bright yellow or saffron picture.',
    give: 'Give books, stationery or a student’s fees on a Thursday, and let the giving be quiet.',
    speak: 'Before you advise, ask a question; keep your promises small, and keep every one.',
  },
  4: {
    signs: 'Too much of Rahu is read as overwork and rigidity: work taken on beyond the day’s hours, and a pull towards unconventional shortcuts.',
    balance: [
      'Plan rest like a task: one full day off a week, and a fixed hour when work stops.',
      'Say yes to one change of routine a week, so that method does not turn stiff.',
    ],
    colour: 'Go easy on grey and smoky blue if work crowds out everything else; add green and soft white for ease.',
    items: [
      'Swap a grey or smoky blue desk set for a green or white one, and keep only today’s papers on the desk.',
      'Set a phone alarm that tells you when to stop work, and put the laptop away when it rings.',
    ],
    wallpaper: 'A green meadow or an open white sky, rather than grey, smoky blue or crowded images.',
    give: 'Give a meal, or food for stray animals, quietly on a Saturday, without telling anyone.',
    speak: 'Hear the other person’s plan in full before you answer, and say when you are unsure instead of pushing on alone.',
  },
  5: {
    signs: 'Too much of Mercury is read as restlessness: a quick mind that jumps, speaks before it has finished thinking and finds it hard to commit.',
    balance: [
      'Pause for three breaths before a decision, and write it down before you act.',
      'Do one thing at a time for twenty-five minutes with the phone out of reach.',
    ],
    colour: 'Go easy on bright green and busy patterns if you feel scattered; add soft white, cream and earth tones.',
    items: [
      'Swap a bright green pen or bottle for a cream, white or earth-toned one while you settle.',
      'Keep your phone in another room for one hour a day, and use a paper notebook for that hour.',
    ],
    wallpaper: 'A plain cream, white or earth-toned image, rather than a bright green one.',
    give: 'Give your time on a Wednesday, such as an hour of reading or tutoring with a child.',
    speak: 'Finish your sentence before you start the next, and keep to the plan you agreed instead of changing it midway.',
  },
  6: {
    signs: 'Too much of Venus is read as over-care and worry: taking on other people’s lives, and a pull towards comfort at the cost of effort.',
    balance: [
      'Keep one hour a day that is only yours, and one task a week that you do for no one else.',
      'Choose plain meals and regular exercise over indulgence, in a way that you can keep.',
    ],
    colour: 'Go easy on pink, pastels and all-white if you give too much of yourself; add deeper blue and green for firmness.',
    items: [
      'Swap a pink, pastel or all-white bag or wallet for a deeper blue or green one.',
      'Use a calendar with one evening a week left blank, which you never fill for anyone else.',
    ],
    wallpaper: 'A deep blue sea or a green hill, rather than a pink, pastel or all-white image.',
    give: 'Give white sweets or sugar to someone in need on a Friday, and expect no thanks.',
    speak: 'Say no kindly and once: state your limit in a sentence and do not add a long reason.',
  },
  7: {
    signs: 'Too much of Ketu is read as withdrawal: long spells alone, questions turned over without an answer, and distance from the people close to you.',
    balance: [
      'Fix one regular meeting with friends or family each week, and keep it.',
      'Walk outside each day, and give each worry ten minutes of thought before you turn to an action.',
    ],
    colour: 'Go easy on grey, smoke and off-white if you drift into yourself; add warm orange, red or yellow touches for company.',
    items: [
      'Swap grey, smoke or off-white clothes and covers for a warm orange or yellow one, and carry something bright.',
      'Put a weekly call or meal in your phone calendar, so that it is as fixed as a work meeting.',
    ],
    wallpaper: 'A warm picture of friends or family, or an orange sunrise, rather than a grey, misty or lonely scene.',
    give: 'Give time on a Tuesday, such as a weekly visit to someone who is alone.',
    speak: 'Tell people when you need quiet and when you are back, so that silence is not read as distance.',
  },
  8: {
    signs: 'Too much of Saturn is read as heaviness: worry about the long run, duty carried without rest, and a severe manner towards yourself.',
    balance: [
      'Add one light thing to every week, such as music, a game or a meal with friends.',
      'Hand one task to someone else, and let it be done in their way.',
    ],
    colour: 'Go easy on black and very dark blue if life feels heavy; add soft yellow, cream and light green.',
    items: [
      'Swap a black or dark blue wallet, bag or watch strap for a lighter cream, yellow or green one.',
      'Put a rest block or a small treat in your diary and mark it as a task, so that it gets done.',
    ],
    wallpaper: 'A light yellow or soft green scene such as a garden in the sun, rather than a black or very dark blue one.',
    give: 'Give a meal or warm clothing to a worker or an elderly person on a Saturday.',
    speak: 'Add a word of thanks or praise to every instruction you give, and say it before any criticism.',
  },
  9: {
    signs: 'Too much of Mars is read as haste and temper: a quick reaction, strong opinions and a taste for risk.',
    balance: [
      'Count to ten before you reply, and leave a quarrel for a quarter of an hour.',
      'Give the energy to sport or hard physical work, and keep a fixed time for it.',
    ],
    colour: 'Go easy on strong red and maroon if you feel fiery; add green, blue and white to cool the day.',
    items: [
      'Swap a red or maroon phone cover, strap or desk item for a green, blue or white one.',
      'Keep a gym bag or sports shoes by the door, so that the energy has somewhere to go at once.',
    ],
    wallpaper: 'A cool blue lake or a green hill, rather than a red, maroon or fiery image.',
    give: 'Give a cooling drink or a meal to a worker on a Tuesday, and let it pass without comment.',
    speak: 'State one fact and one request in every disagreement, and leave the verdict to the end.',
  },
};

/** The number's own digit in a phone, house or vehicle number: a help when the grid lacks it. */
export const missingNumbersAdvice = (d: Digit) =>
  `A phone, house or vehicle number that carries a ${d} adds one to your grid, so tradition counts it as a help.`;

/** The same digit when the grid holds it often. */
export const excessNumbersAdvice = (d: Digit) =>
  `Where the choice is yours, go lighter on ${d} in a phone, house or vehicle number; the check under Numbers and dates shows how any number sits beside yours.`;

export const MISSING_LABEL = {
  daily: 'Daily life', offering: 'Offering and mantra', wear: 'Colours to wear', items: 'Everyday items', wallpaper: 'Phone and laptop wallpaper', use: 'Things to use', give: 'Give',
  numbers: 'Numbers around you', home: 'Home',
} as const;

export const EXCESS_LABEL = {
  signs: 'What it can look like', signsTwice: 'If it tips over, it can look like', balance: 'Balance it in daily life', colour: 'Colours', items: 'Items to swap', wallpaper: 'Phone and laptop wallpaper', give: 'Give', speak: 'Speak and act',
  numbers: 'Numbers around you', home: 'Home',
} as const;

export const REPEAT_HEADING = 'Numbers you hold more than once';
export const REPEAT_INTRO = 'A number held twice is usually read as a strength. Held three or more times, tradition reads its planet as overpowering, and these customs help to balance it. Each is a custom to try, not a promise.';
export const REPEAT_TWICE = 'Held twice: usually a strength. These keep it balanced.';
export const REPEAT_OFTEN = 'Held often: worth balancing.';
export const REMEDY_PROVENANCE = 'The daily habits are ordinary advice set in each planet’s frame. The offerings, mantras, colours, days and gifts are customs common among Indian numerology and Jyotish teachers. The balancing customs for a number held often apply the same planetary logic and are this page’s own arrangement; no classical text lists them.';
