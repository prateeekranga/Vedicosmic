import { LegalLayout } from './LegalLayout';

export default function Disclaimer() {
  return (
    <LegalLayout
      eyebrow="Please read"
      title="Disclaimer"
      updated="8 July 2026"
      intro="VediCosmic offers contemplative and symbolic tools for reflection — presented honestly, with real calculations and without false certainty."
      sections={[
        {
          heading: 'Not Professional Advice',
          body: (
            <p>
              Numerology, astrology, tarot, chakra assessments and the other tools on VediCosmic are
              contemplative and symbolic traditions, offered for self-inquiry and entertainment. They are not
              scientific instruments, and nothing on this site constitutes medical, psychological, legal or
              financial advice. Please consult a qualified professional for decisions in those areas.
            </p>
          ),
        },
        {
          heading: 'No Guarantee of Outcome',
          body: (
            <p>
              Readings, charts and course content are provided for reflection. We make no guarantee that any
              practice, prediction or interpretation will produce a specific outcome in your life.
            </p>
          ),
        },
        {
          heading: 'Energy & Physical Practices',
          body: (
            <p>
              Tools and courses involving breathwork, meditation or energy practices (such as Pranayama or
              Kundalini content) should be approached gently. If you have a medical condition, are pregnant, or
              are otherwise uncertain, consult a physician before beginning any new practice.
            </p>
          ),
        },
        {
          heading: 'Third-Party Instructors',
          body: (
            <p>
              Courses are created and taught by independent instructors. Views expressed in course content are
              those of the instructor and do not necessarily represent an official VediCosmic position.
            </p>
          ),
        },
        {
          heading: 'Questions',
          body: (
            <p>
              If anything here is unclear, reach out at{' '}
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
