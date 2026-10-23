import { LegalLayout } from './LegalLayout';

// Draft for lawyer review.
export default function Disclaimer() {
  return (
    <LegalLayout
      eyebrow="Please read"
      title="Disclaimer"
      updated="23 October 2026"
      intro="VediCosmic offers traditional tools for reflection and practice. Here is what they are, and what they are not."
      sections={[
        {
          heading: 'Not professional advice',
          body: (
            <p>
              Numerology, astrology, the contemplation card, chakra assessments and the other tools on VediCosmic
              are symbolic traditions, offered for self-inquiry. They are not scientific instruments, and nothing on
              this site is medical, psychological, legal or financial advice. Please consult a qualified
              professional for decisions in those areas.
            </p>
          ),
        },
        {
          heading: 'No guarantee of outcome',
          body: (
            <p>
              Readings and charts are offered for reflection. We make no guarantee that any practice, prediction or
              interpretation will produce a particular outcome in your life.
            </p>
          ),
        },
        {
          heading: 'Approximate calculations',
          body: (
            <p>
              Some astronomical results — Sun and Moon positions, sunrise and sunset, tithi and nakshatra — come from
              simplified formulas and are approximate. Each tool says so where it matters. Check important dates
              and charts with your local panchang or astrologer.
            </p>
          ),
        },
        {
          heading: 'Breath, meditation, sound and energy practices',
          body: (
            <p>
              Breathwork, meditation, sound and energy practices (such as Pranayama, Kundalini, the sound bath and
              the chakra frequency player) are traditional wellness practices for relaxation and reflection. They do
              not diagnose, treat, cure or prevent any condition. Approach them gently, and if you have a medical
              condition, are pregnant, or are unsure, ask a doctor before starting.
            </p>
          ),
        },
        {
          heading: 'Questions',
          body: (
            <p>
              If anything here is unclear, write to{' '}
              <a href="mailto:hello@vedicosmic.com" className="text-brand-cyan-soft hover:underline">
                hello@vedicosmic.com
              </a>.
            </p>
          ),
        },
      ]}
    />
  );
}
