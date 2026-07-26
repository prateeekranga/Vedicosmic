import type { BlogPost } from '@/types/blog.types';

export default {
  id: 'panchang-101-tithi-nakshatra',
  slug: 'panchang-101-tithi-nakshatra',
  title: 'Panchang 101: Tithi, Nakshatra, Yoga & Karana Explained',
  seoTitle: 'Panchang 101: Tithi, Nakshatra, Yoga & Karana Explained',
  excerpt: 'A clear guide to the Hindu Panchang and its five limbs — Tithi, Vara, Nakshatra, Yoga, and Karana — and why they still guide Muhurta and Vrat dates.',
  category: 'cosmology',
  tags: ['panchang', 'hindu calendar', 'tithi', 'muhurta', 'vedic calendar', 'nakshatra'],
  authorId: 'ananya',
  publishedAt: '2026-06-29',
  heroImage: '/og/blog/panchang-101-tithi-nakshatra.png',
  keyTakeaways: [
    'The Panchang combines five limbs — Tithi, Vara, Nakshatra, Yoga and Karana — to describe the character of a single day.',
    'A Tithi is defined by a fixed 12-degree Sun-Moon angle, not by clock time, so it can run 19 to 26 hours and occasionally be skipped or repeated.',
    'Muhurta uses all five limbs together to choose an auspicious moment for weddings, housewarmings and other important events.',
    'Festival and Vrat dates shift on the Gregorian calendar every year because they\'re defined by a Tithi, not a fixed solar date.',
  ],
  content: [
    {
      type: 'paragraph',
      text: 'Open any traditional Hindu calendar and you will find far more than a date. Alongside the day and month, you will see a Tithi, a Nakshatra, a Yoga, a Karana, and often a list of auspicious and inauspicious windows for the day. This is the **Panchang** — the lunisolar almanac that has guided timing decisions across the Indian subcontinent for millennia, and one that families, temples, and astrologers still consult every single day.',
    },
    {
      type: 'paragraph',
      text: 'The word Panchang comes from Sanskrit: **pancha** (five) and **anga** (limb). It refers to five distinct astronomical measurements calculated for a given day and location, layered together to describe the quality and character of that stretch of time. Long before satellites or apps, this was calculated by hand from the observed positions of the Sun and Moon — today the same underlying mathematics runs instantly, but the five limbs and the logic behind them have not changed.',
    },
    { type: 'heading', level: 2, text: 'The Five Limbs of the Panchang' },
    {
      type: 'paragraph',
      text: 'Each of the five limbs measures something slightly different about where the Sun and Moon are, and how they relate to one another. Together they build a fuller picture of a single day than a plain calendar date ever could.',
    },
    { type: 'heading', level: 3, text: '1. Tithi — the Lunar Day' },
    {
      type: 'paragraph',
      text: 'A Tithi is defined by the angular distance between the Moon and the Sun as seen from Earth. Every time that gap widens by exactly 12 degrees, one Tithi ends and the next begins. Since a full circle is 360 degrees, one complete lunar month (from new moon to new moon) contains exactly 30 Tithis — 15 in the waxing fortnight (Shukla Paksha) and 15 in the waning fortnight (Krishna Paksha). Because the Moon and Sun do not move at constant, matched speeds, a Tithi does not neatly equal 24 hours; it can run anywhere from roughly 19 to about 26 hours, which is why the same calendar date can begin under one Tithi and end under another.',
    },
    { type: 'heading', level: 3, text: '2. Vara — the Weekday' },
    {
      type: 'paragraph',
      text: 'Vara is the familiar seven-day week, but in Jyotish each day is understood as ruled by a specific planet: Sunday by the Sun, Monday by the Moon, Tuesday by Mars, Wednesday by Mercury, Thursday by Jupiter, Friday by Venus, and Saturday by Saturn. That ruling planet is thought to color the general temperament of the day and is one factor weighed alongside the other four limbs when selecting a time for an activity.',
    },
    {
      type: 'cta-tool',
      toolSlug: 'planetary-hours',
      label: 'See which planet rules this exact hour',
    },
    { type: 'heading', level: 3, text: '3. Nakshatra — the Moon\'s Lunar Mansion' },
    {
      type: 'paragraph',
      text: 'Nakshatra marks which of the 27 lunar mansions the Moon currently occupies — a much finer division of the sky than the 12 zodiac signs, with the Moon moving through roughly one Nakshatra per day. Each Nakshatra carries its own ruling deity, symbol, and traditional temperament, and this is the same placement used to calculate a person\'s birth star. We cover the full 27 Nakshatras, their rulers, and the Pada quarter system in a dedicated guide — the Panchang simply tracks which one the Moon is passing through on any given day.',
    },
    { type: 'heading', level: 3, text: '4. Yoga — the Combined Angle' },
    {
      type: 'paragraph',
      text: 'Yoga is the limb most people find least intuitive, because unlike Tithi it is based on addition rather than a gap. The longitudes of the Sun and Moon are added together, and that combined value is divided into 27 equal segments, each named — from Vishkumbha through Vaidhriti. A new Yoga begins each time this summed angle advances by 13°20′. Because it blends both luminaries into a single figure, Yoga is traditionally read as describing the underlying atmosphere or "yoking" of solar and lunar energy for that stretch of time, separate from either the Tithi or the Nakshatra alone.',
    },
    { type: 'heading', level: 3, text: '5. Karana — Half a Tithi' },
    {
      type: 'paragraph',
      text: 'A Karana is exactly half of a Tithi — a 6-degree slice of the Sun-Moon angle rather than a full 12-degree one. Since each lunar month has 30 Tithis, it contains 60 Karana periods, but there are only 11 named Karanas in total: seven "movable" ones (Bava, Balava, Kaulava, Taitila, Garaja, Vanija, and Vishti) that repeat in rotation about eight times each per month, and four "fixed" ones (Shakuni, Chatushpada, Naga, and Kimstughna) that each occur only once, always around the new moon. Karana is often used for finer-grained timing within a single day, since it changes roughly twice as often as the Tithi itself.',
    },
    {
      type: 'callout',
      tone: 'info',
      title: 'Why a Tithi almost never matches your clock day',
      text: 'It is easy to assume a Tithi should behave like a calendar day and simply run midnight to midnight. It does not. A Tithi is defined purely by a fixed 12-degree change in the Sun-Moon angle, and the Moon\'s speed around the Earth varies through its elliptical orbit — faster at some points, slower at others. That means a Tithi can last anywhere from about 19 to 26 hours, can begin and end at any hour of the day or night, and can occasionally be **skipped entirely** (kshaya tithi) or **repeated** (vriddhi tithi) within a solar day, if the Sun-Moon angle moves unusually fast or slow. This is precisely why a Panchang lists the exact start and end time of each Tithi rather than just naming a date.',
    },
    { type: 'heading', level: 2, text: 'Why the Panchang Matters for Timing (Muhurta)' },
    {
      type: 'paragraph',
      text: 'Once all five limbs are known for a given day and place, a Vedic astrologer can assess how favorable that window of time is for a particular kind of activity. This practice is called **Muhurta** — the art of selecting an auspicious moment. Traditionally, a wedding, a housewarming (Griha Pravesh), the start of a new business, or a first day of travel is not simply scheduled whenever convenient; the Panchang is consulted so the Tithi, Vara, Nakshatra, Yoga, and Karana of the chosen moment are aligned as favorably as possible for the intention behind the event.',
    },
    {
      type: 'paragraph',
      text: 'It is worth being direct about how this practice is best understood. Muhurta is a **traditional cultural and spiritual framework**, refined and passed down across generations of Jyotish practice — it is not a scientifically validated predictor of outcomes, and no serious teacher of the tradition claims it guarantees a result. What it offers is something the tradition itself values highly: a considered, intentional beginning, chosen with care rather than left to chance, in keeping with a worldview where time itself has texture and quality worth honoring.',
    },
    {
      type: 'cta-tool',
      toolSlug: 'muhurta',
      label: 'Find an auspicious Muhurta for your event',
    },
    {
      type: 'paragraph',
      text: 'The Panchang also governs the second major reason people consult it daily: knowing exactly when a fast (Vrat) or festival falls. Observances like Ekadashi, Purnima, Amavasya, Sankashti Chaturthi, and countless regional festivals are all defined by a specific Tithi, not a fixed date on the solar calendar — which is exactly why festival dates shift each year relative to the Gregorian calendar, and why a dedicated Vrat calendar, calculated from the same Panchang mathematics, is the most reliable way to know when to observe them.',
    },
    {
      type: 'cta-tool',
      toolSlug: 'vrat-calendar',
      label: 'Check upcoming Vrat and festival dates',
    },
    { type: 'heading', level: 2, text: 'One Panchang, or Several?' },
    {
      type: 'paragraph',
      text: 'A detail that surprises many newcomers: there is not a single, universal Panchang used everywhere in India. Two main calculation methods exist. The older **Vakya** system relies on pre-computed traditional formulas and tables, still preserved in some regional and temple traditions, particularly in parts of South India. The more widely used **Drik Panchang** system calculates positions directly from precise, real-time astronomical observation and modern ephemeris data, correcting for the small discrepancies that build up in fixed formulas over centuries. Most contemporary Panchangs and calculation tools, including this site\'s, follow the Drik (observation-based) approach, which is now the mainstream standard. On top of that, regional traditions differ in how they define the start of a lunar month (Amanta, ending at new moon, common in the south and west, versus Purnimanta, ending at full moon, common in the north) — which is why a Panchang consulted in Tamil Nadu and one consulted in Uttar Pradesh can occasionally label the same lunar day slightly differently, even while agreeing on the underlying astronomy.',
    },
    {
      type: 'divider',
    },
    {
      type: 'paragraph',
      text: 'The Panchang is, at its heart, a remarkably old and remarkably precise way of describing time — not as a blank sequence of identical days, but as a rhythm with its own recurring texture, built from the real, calculable motion of the Sun and Moon. Whether you use it to plan a wedding, mark an Ekadashi fast, or simply understand why your grandmother always asks "what Tithi is it today," the five limbs give you a genuine window into one of the Vedic tradition\'s oldest living systems.',
    },
    {
      type: 'cta-course',
      courseSlug: 'intro-vedic-astrology',
      label: 'Learn to read a Panchang and birth chart together',
    },
  ],
  relatedToolSlugs: ['muhurta', 'vrat-calendar', 'planetary-hours'],
  relatedCourseSlugs: ['intro-vedic-astrology'],
  faqs: [
    {
      id: 'panchang-101-tithi-nakshatra-faq-1',
      header: 'Why does a Tithi sometimes span less than a full day, or more?',
      body: 'A Tithi is defined by a fixed 12-degree change in the angle between the Sun and Moon, not by a fixed span of clock time. Because the Moon\'s orbital speed varies throughout the month, the time it takes to cover that 12 degrees varies too — anywhere from about 19 to 26 hours. When a Tithi moves unusually quickly, it can even begin and end entirely within one sunrise-to-sunrise period, a Tithi Kshaya. When it moves unusually slowly, one Tithi can span across two sunrises, appearing to repeat, a Tithi Vriddhi.',
    },
    {
      id: 'panchang-101-tithi-nakshatra-faq-2',
      header: 'What is the difference between Nakshatra and Yoga in the Panchang?',
      body: 'Nakshatra tracks only the Moon\'s position, showing which of the 27 lunar mansions it currently occupies. Yoga is calculated differently: it adds the Sun\'s longitude and the Moon\'s longitude together and divides that combined figure into 27 named segments. So Nakshatra describes where the Moon alone is, while Yoga describes a blended solar-lunar value — two different lenses on the same moment, both expressed as one of 27 named divisions.',
    },
    {
      id: 'panchang-101-tithi-nakshatra-faq-3',
      header: 'How is the Panchang used to choose a wedding date?',
      body: 'An astrologer working in the Muhurta tradition checks the Tithi, Vara, Nakshatra, Yoga, and Karana of candidate dates and times, looking for a combination considered favorable for marriage according to classical guidelines, while also avoiding periods traditionally held to be unfavorable. This is treated as a respected cultural and spiritual practice for choosing an intentional, well-considered beginning — not as a scientific guarantee of how the marriage itself will unfold.',
    },
    {
      id: 'panchang-101-tithi-nakshatra-faq-4',
      header: 'Do different regions of India use different Panchang calculation methods?',
      body: 'Yes. Most contemporary Panchangs, including modern calculation tools, use the Drik system, which derives planetary positions from direct astronomical calculation and observation-grade ephemeris data. Some regional and temple traditions, mainly in parts of South India, still preserve the older Vakya system, based on traditional pre-set formulas. Regions also differ in how a lunar month is bounded — Amanta (ending at new moon) versus Purnimanta (ending at full moon) — which can occasionally shift how a Tithi or month is labeled from one part of the country to another, even when the underlying astronomy agrees.',
    },
    {
      id: 'panchang-101-tithi-nakshatra-faq-5',
      header: 'Why do festival and fasting dates change every year on the Gregorian calendar?',
      body: 'Hindu festivals and Vrat (fasting) days are defined by a specific Tithi in the lunisolar calendar, not by a fixed date in the solar Gregorian calendar. Because a lunar year runs shorter than a solar year and periodic adjustments (like an intercalary Adhik Maas) keep the two loosely in sync, the same Tithi lands on a different Gregorian date each year. A Panchang-based Vrat calendar recalculates these dates annually so the correct day is never missed.',
    },
  ],
} satisfies BlogPost;
