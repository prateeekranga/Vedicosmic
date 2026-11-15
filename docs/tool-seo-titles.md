# Tool page titles and descriptions

Written for: the site owner, to review on staging before the tools upgrade is merged.

These are the link label, main heading, search-result title and search-result description of
every live tool page. They lead with the words people type into a search engine (for example
"kundli", "Rahu Kaal", "hora", "Mulank") and say only what each tool actually does. The numbers
in brackets are character counts: titles stay within 30 to 60 and descriptions within 70 to 160,
which the build checks.

To change any of them, edit `src/content/routes.ts` (the `name`, `h1`, `seoTitle` and
`metaDescription` of the tool). Page addresses did not change. Kundali Matching is not listed: it
stays hidden from search until it is rebuilt.

The tools index and the four category pages are set in `src/content/toolHubs.ts`.

| Page | Link label | Main heading (H1) | Search title | Search description |
|---|---|---|---|---|
| `/tools/numerology` | Numerology Calculator | Numerology Calculator by Name and Date of Birth | Numerology Calculator by Name and Date of Birth (Free) (54) | Enter your name and date of birth to get your Life Path, Expression, Soul Urge and Personality numbers, with Mulank, Bhagyank, Kua and a Lo Shu grid. (149) |
| `/tools/mobile-numerology` | Mobile Number Numerology | Mobile Number Numerology Calculator | Mobile Number Numerology Calculator (with Date of Birth) (56) | Check the numerology of a mobile number: its root, its compatibility level with your date of birth, and a reading for every two-digit combination. Free. (152) |
| `/tools/loshu-grid` | Lo Shu Grid Calculator | Lo Shu Grid Calculator | Lo Shu Grid Calculator by Date of Birth: Missing Numbers (56) | Make your Lo Shu grid from your date of birth: see missing and repeated numbers, the planes, and your Mulank, Bhagyank and Kua number. Free, no sign-up. (152) |
| `/tools/chaldean` | Chaldean Numerology Calculator | Chaldean Numerology Calculator | Chaldean Numerology Calculator: Name Number & Compound (54) | Type a name or a business name to get its Chaldean compound and root numbers, the ruling planet and a letter-by-letter working. Free, in your browser. (150) |
| `/tools/life-path` | Life Path Number Calculator | Life Path Number Calculator | Life Path Number Calculator with Mulank & Bhagyank (50) | Work out your Life Path number from your date of birth, with Mulank, Bhagyank, lucky numbers and colours, and your personal day, month and year. (144) |
| `/tools/astrology` | Kundli (Vedic Birth Chart) | Free Kundli (Vedic Birth Chart) Online | Free Kundli Online: Lagna, Rashi, Nakshatra & Dasha (51) | Make a free kundli from your date, time and place of birth: Lagna, Moon sign, nine grahas with nakshatra and pada, houses and Vimshottari dasha. (144) |
| `/tools/planetary-hours` | Hora Calculator | Hora Calculator (Planetary Hours) | Hora Calculator: Today’s Planetary Hours for Your City (54) | See the hora running now and the planetary hours of the day and night for your city, counted from sunrise, with what each planet traditionally favours. (151) |
| `/tools/planet-mandala` | Navagraha Mandala | Navagraha: The Nine Vedic Planets | Navagraha: The Nine Planets of Vedic Astrology, Explained (57) | Meet the nine grahas, from Surya to Ketu, on an interactive mandala: each one’s nature, colour and symbolism. Illustrative, not live positions. (143) |
| `/tools/chakra-assessment` | Chakra Test | Chakra Test: 21 Questions | Chakra Test: Free 21-Question Chakra Balance Quiz (49) | Answer 21 questions to see how your seven chakras compare on a radar chart, with a practice for each. A reflection exercise, not a diagnosis. (141) |
| `/tools/mantra-timer` | Japa Counter | Online Japa Counter (108-Bead Mala) | Japa Counter Online: 108-Bead Digital Mala for Mantra Jaap (58) | Count mantra japa on a 108-bead digital mala, one tap per bead, with eight mantras to choose from and a daily streak kept on your device. Free. (143) |
| `/tools/tratak` | Trataka Meditation | Trataka (Candle Gazing) Meditation | Trataka Meditation Online: Candle Gazing Timer & Guide (54) | Practise Trataka on a candle flame, bindu, Om or Sri Yantra in full screen, with a timer, breath pacing and guidance for the closed-eye afterimage. (147) |
| `/tools/crystals` | Crystal Guide | Crystal Guide by Intention | Crystal Guide: Twelve Stones Chosen by Intention (48) | Browse twelve crystals by the intentions traditionally linked to them, such as calm, clarity and protection, and keep a kit saved on your device. (145) |
| `/tools/tarot` | Daily Contemplation Card | Daily Contemplation Card | Card of the Day: Daily Vedic Contemplation Card & Journal (57) | Draw one original contemplation card a day, reflect on its prompt and keep a private journal on your device. A reflection practice, not prediction. (147) |
| `/tools/yantra` | Sacred Geometry Lab | Yantra and Sacred Geometry Lab | Sri Yantra & Sacred Geometry: 14 Yantras Drawn Step by Step (59) | Watch fourteen classical yantras, including the Sri Yantra, draw themselves stroke by stroke, and learn the ratios and angles behind each design. (145) |
| `/tools/biorhythm` | Biorhythm Calculator | Biorhythm Calculator | Biorhythm Calculator by Date of Birth: Today’s Chart (52) | Enter your date of birth to chart your physical, emotional and intellectual biorhythm cycles for today and the weeks around it. A traditional model. (148) |
| `/tools/vastu` | Vastu Directions | Vastu Directions for Every Room | Vastu Directions for Home: Room-by-Room Vastu Shastra Guide (59) | Which direction suits the kitchen, bedroom, pooja room and entrance? A room-by-room Vastu Shastra guide with the element and reasoning for each. (144) |
| `/tools/kundalini` | Kundalini Meditation | Guided Kundalini Meditation | Guided Kundalini Meditation Online: A Seven-Chakra Journey (58) | A gentle guided Kundalini meditation: a breath-paced video or an animated journey through the seven chakras with bija mantras. Stop if uncomfortable. (149) |
| `/tools/pranayama` | Pranayama Timer | Pranayama Breathing Timer | Pranayama Breathing Timer: Box, 4-7-8 & Nadi Shodhana (53) | A guided breathing timer for Box breathing, 4-7-8, Nadi Shodhana, Bhastrika and slow belly breath, with voice cues in English or Hindi. Stop if dizzy. (150) |
| `/tools/soundbath` | Sound Bath Mixer | Online Sound Bath Mixer | Sound Bath Online: Mix Tanpura, Singing Bowls, Om & Rain (56) | Mix your own sound bath from six generated layers: tanpura, singing bowls, Om, rain, chimes and earth hum. Runs live in your browser, no recordings. (148) |
| `/tools/chakra-frequency-player` | Chakra Frequency Player | Chakra Frequency Player | Chakra Frequency Player: Solfeggio Tones & Binaural Beats (57) | Play seven chakra tones and Solfeggio frequencies with optional binaural or isochronic beats and a sleep timer. For relaxation, not treatment. (142) |
| `/tools/panchang` (was `/tools/muhurta`, which now redirects) | Panchang & Choghadiya | Today’s Panchang, Rahu Kaal and Choghadiya | Today’s Panchang: Tithi, Rahu Kaal & Choghadiya by City (55) | Today’s panchang for your city: tithi, nakshatra, yoga and karana with end times, sunrise and moonrise, Rahu Kaal, Abhijit muhurat and Choghadiya. (146) |
| `/tools/nakshatra` | Nakshatra Finder | Nakshatra Finder (Birth Star Calculator) | Nakshatra Finder by Date of Birth: Janma Nakshatra & Pada (57) | Find your janma nakshatra and pada from your date, time and place of birth, then explore all 27 nakshatras with their deities, symbols and nature. (146) |
| `/tools/urdhva` | Urdhva Shakti | Urdhva Shakti: Urge-Control Companion | Urge Control Tool to Quit Porn: Breath SOS & Streak (51) | A private companion for quitting porn: a one-tap urge SOS with guided breathing, a streak kept on your device, and daily reflections. No sign-up. (145) |
| `/tools/sadhana` | Daily Sādhana | Daily Sādhana | Daily Sadhana: Today’s Tithi, Nakshatra & Practice Flow (55) | Start your daily sadhana: today’s tithi, nakshatra and moon phase, a three-step practice flow, and a streak kept on your device. Free, no sign-up. (146) |
| `/tools/vrat-calendar` | Ekadashi & Vrat Calendar | Ekadashi and Vrat Calendar | Next Ekadashi, Purnima & Pradosh Dates: Vrat Calendar (53) | When is the next Ekadashi? See Ekadashi, Purnima, Amavasya, Pradosh and Sankashti Chaturthi dates for your city over the next 45 days. Free. (140) |
| `/tools/puja-aarti` | Virtual Puja & Aarti | Virtual Puja and Aarti | Virtual Puja & Aarti Online: Bell, Diya, Flowers & Mantras (58) | Offer a virtual puja to one of seven deities: ring the bell, offer flowers, blow the conch or perform an aarti with the traditional invocation. Free. (149) |
