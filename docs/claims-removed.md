# Claims removed or corrected (Phase 1, October 2026)

Every claim found that was untrue, unsourced or overstated, where it was, and what was done. The build now fails
if any of the banned patterns reaches the built site (`scripts/check-claims.mjs`, last step of `postbuild`).

## Courses that did not exist

| Claim | Where | Action |
|---|---|---|
| "8 courses" / "Guided courses" count | Homepage hero line and stats band | Removed |
| "ten free tools and eight in-depth courses" | About timeline (`aboutContent.ts`) | Timeline removed (its 2024/2025 milestones predate the repository and could not be verified) |
| "structured courses for the modern seeker" | `index.html` meta, `site.ts` (JSON-LD, llms.txt), footer tagline, Courses meta | Rewritten |
| 8 course pages with prices, ratings, enrolment counts and reviews | `src/data/courses.ts`, `/courses/<slug>` | Deleted; `/courses/<slug>` returns 410 Gone; `/courses` is a noindex "being prepared" note with an email link |
| Course JSON-LD with AggregateRating (4.7–4.9 stars, 410–2,100 reviews) | `schema.ts` | Deleted |
| "Chakra Healing" and other course links | Footer "Learn" column, nav Courses menu, tool-page "Go deeper" box | Removed; footer "Learn" now links to blog categories |
| 34 course CTA blocks and 3 course sales paragraphs | 33 blog posts | Removed; database posts with old course blocks are filtered when loaded |
| "Enroll in a course" step; "View Courses" CTA | Homepage | Removed |
| Course editor, "Total enrollments", "Est. revenue" (price × invented enrolments) | Admin dashboard | Removed |

## Numbers with no source

| Claim | Where | Action |
|---|---|---|
| "60,000+ seekers" (animated count-up) | Homepage hero line and stats band | Removed with the `CountUp` component |
| "432 Hz · Cosmic tuning" as a statistic | Homepage stats band | Removed |
| "4.9 instructor rating" and "60,000+ students taught" | Author box on all 37 posts (`authors.ts`, `AuthorBio.tsx`) | Removed |
| "27 free tools" counted Kundali Matching, which does not work yet | Homepage, nav, tools hub | All counts now use `liveTools()` from `src/content/routes.ts` (26) |
| "All fourteen tools" | Contact FAQ | Rewritten |
| "community loves most" (implied popularity) | Homepage featured tools | Removed |

## People who were not real

| Claim | Where | Action |
|---|---|---|
| Ananya Mishra (Founder & Jyotish Teacher), Rajan Verma, Meera Krishnan | About team block | Removed. About shows the mission, method and a founder note from `src/content/people.ts` |
| Eight course instructors (Ananya Devi, Rajan Nath, Meera Iyer, Kabir Sharma, Leela Krishnan, Vasanti Rao, Harish Menon …) with credentials | `authors.ts` | Removed |
| Three five-star testimonials ("Ananya R.", "David M.", "Meera K.") | Homepage | Removed |
| A quotation attributed to "Pandit Kabir Sharma" | Blog: numerology-compatibility-life-path | Kept as the article's own paragraph, without the invented attribution |
| Parikshiva as "Founder" with rating and student count | Blog bylines, Person JSON-LD | Now "Parikshiva — the spiritual name of VediCosmic's founder" (confirmed by the owner); bio shown only once the founder writes it |

## Features that did not work as described

| Claim | Where | Action |
|---|---|---|
| Contact form: "Your message has been received … We will reply within two earthly days" — nothing was sent | Contact page | Replaced by an email link |
| Newsletter sign-up — the email was discarded | Footer | Removed |
| Social icons linking to `#` | Footer, Contact | Removed |
| Site "accounts" (password hashes in this browser); FAQ said streaks sync across devices | Navbar, auth modal, 13 tools, FAQs | Accounts removed. Progress stays on the device; readings and reflections are saved only after consent and are listed, with delete, on the Daily Sādhana page |
| "Save to your journal" — saved readings and reflections were never shown anywhere | 8 tools | Saves now appear on the Daily Sādhana page |
| "Reminder bells … saved on this device" | Vrat calendar | Corrected: the markers last only while the page is open |
| Admin Courses, Tools, Site Content, SEO and Announcement panels — saved only in the admin's own browser | Admin dashboard | Removed |
| AdSense slots (dormant) on a site that claims no ads | Blog | Removed with `ads.txt` |
| "Tap to Enter" splash | Homepage (desktop) | Removed |

## Calculations presented as more accurate than they were

| Claim | Where | Action |
|---|---|---|
| Lagna (Ascendant) — always showed Mesha | Vedic Birth Chart | Hidden with the note "Lagna (Ascendant) is being rebuilt and checked against reference charts …" |
| Birth times shifted by the visitor's device time zone (5.5 h early in India) | Birth chart, Kundali Matching | Fixed; birth time read in the birth city's own IANA zone |
| One-term Moon and fixed 24.1° ayanamsa (errors up to 3.2°) | Birth chart | Replaced by the shared 6-term Moon and mean Lahiri; labelled approximate |
| "Educational approximation (±1 day)" | Birth chart | Replaced by an accurate method line |
| Rahu Kaal etc. wrong on ~54 days a year (Delhi) | Muhurta | Fixed (sunrise/sunset date wrap) |
| "exact start and end time … from real sunrise and sunset" | Muhurta FAQ | "approximate, usually within a minute or two" |
| "the same model used across … other tools" | Kundali Matching | Corrected |
| "computes … from the real positions of the Sun and Moon" | Vrat calendar FAQ | Corrected to approximate, with advice to confirm locally |
| Animated planet mandala could read as real positions | Navagraha Mandala | Labelled illustrative |

## Healing and medical language

| Claim | Where | Action |
|---|---|---|
| "Heal Your Energy", "Improve Sleep", "Reduce Stress", "Increase Focus" | Chakra Frequency Player cards | "Heart tone", "Wind down", "Settle", "Focus", with "traditionally linked with" |
| "master healer", "emotional healing", "softens grief", "shields against … electromagnetic stress", "supports … fertility", "clears stagnant energy"; "Healing" intention filter | Crystal guide (`crystals.ts`) | Rewritten as "traditionally associated with"; filter renamed "Renewal" |
| "Healing Stones by Intention"; "healing crystals" | Crystal guide title/description, FAQ | Rewritten |
| "Healing & protection" | Maha Mrityunjaya mantra | "Traditionally recited for healing and protection" |
| "a natural tranquiliser" | 4-7-8 breath | "a slow pattern many people use to wind down before sleep" |
| "strengthen the eyes" | Trataka FAQ | Removed |
| "Energy & Healing" | Tool and blog category label | "Energy & Practice" (URLs unchanged) |
| — | Every tool page | Added: "Astrology offers tradition-based reflection, not guarantees." (or the practice equivalent: "not as medical treatment") |

## Legal pages

| Claim | Where | Action |
|---|---|---|
| Payment provider, course enrolment, accounts | Privacy Policy | Rewritten for the site as it is |
| 14-day satisfaction window, 20% completion rule | Refund Policy | "VediCosmic sells nothing at present" (URL kept) |
| Paid courses, accounts | Terms | Rewritten |
| "Courses are created and taught by independent instructors" | Disclaimer | Removed |

## Dates

| Claim | Where | Action |
|---|---|---|
| 13 posts dated before they existed (10 before the repository) and 4 dated after they went live | Blog | Re-dated to the day each post first entered `main` |

## For the owner to review (not changed)

- **Urdhva Shakti** (`/tools/urdhva`) addresses porn-urge control and speaks to a "young body"
  (`UrdhvaTool.tsx:184`) on a site intended for ages 16 and older. Please decide whether the wording and the
  audience fit.
- **Pexels hotlinks:** 9 posts load hero images straight from images.pexels.com with no photographer credit
  (see `docs/inventory.md`). Phase 4 replaces imagery and adds `/attributions`.
