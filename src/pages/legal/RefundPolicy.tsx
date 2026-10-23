import { LegalLayout } from './LegalLayout';

// Draft for lawyer review. Kept at its existing URL; rewrite with real terms before
// anything is sold (see src/content/legal.ts).
export default function RefundPolicy() {
  return (
    <LegalLayout
      eyebrow="Payments"
      title="Refund Policy"
      updated="23 October 2026"
      intro="VediCosmic sells nothing at present, so there is nothing to refund."
      sections={[
        {
          heading: 'Nothing is sold today',
          body: (
            <p>
              Every tool and article on VediCosmic is free, and the site takes no payments.
            </p>
          ),
        },
        {
          heading: 'If that changes',
          body: (
            <p>
              Before anything is offered for sale, this page will set out the refund terms, and the legal and
              grievance-officer details will be published. Questions can be sent to{' '}
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
