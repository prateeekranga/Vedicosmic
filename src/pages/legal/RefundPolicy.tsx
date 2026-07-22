import { LegalLayout } from './LegalLayout';

export default function RefundPolicy() {
  return (
    <LegalLayout
      eyebrow="Payments"
      title="Refund & Cancellation Policy"
      updated="8 July 2026"
      intro="Every free tool on VediCosmic stays free, always. This policy covers refunds for paid course enrolment only."
      sections={[
        {
          heading: '14-Day Satisfaction Window',
          body: (
            <p>
              If a paid course isn't right for you, you may request a full refund within 14 days of purchase,
              provided you have not completed more than 20% of the course content.
            </p>
          ),
        },
        {
          heading: 'How to Request a Refund',
          body: (
            <p>
              Email{' '}
              <a href="mailto:hello@vedicosmic.com" className="text-brand-cyan-soft hover:underline">
                hello@vedicosmic.com
              </a>{' '}
              with your order details and the course name. Approved refunds are returned to your original
              payment method within 5-10 business days.
            </p>
          ),
        },
        {
          heading: 'Exceptions',
          body: (
            <p>
              Refunds are not available after the 14-day window, for courses purchased as part of a
              limited-time bundle explicitly marked non-refundable, or where course completion exceeds the
              threshold above.
            </p>
          ),
        },
        {
          heading: 'Cancelling Enrolment',
          body: (
            <p>
              You may stop taking a course at any time from your account. Cancelling access does not
              automatically trigger a refund outside the window described above.
            </p>
          ),
        },
        {
          heading: 'Technical Issues',
          body: (
            <p>
              If a course is unusable due to a technical fault on our end that we cannot resolve promptly,
              we'll offer a full refund or credit toward another course, regardless of the 14-day window.
            </p>
          ),
        },
      ]}
    />
  );
}
