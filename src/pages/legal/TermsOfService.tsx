import { LegalLayout } from './LegalLayout';

// Draft for lawyer review. Written for the site as it is: free tools and articles,
// nothing sold, no accounts.
export default function TermsOfService() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="23 October 2026"
      intro="These terms cover your use of VediCosmic’s free tools and articles. By using the site, you agree to them."
      sections={[
        {
          heading: 'Using VediCosmic',
          body: (
            <p>
              VediCosmic offers free Vedic astrology, panchang, numerology and practice tools, and articles about
              them. Nothing is sold, and there are no accounts. Anything you save stays in your own browser.
            </p>
          ),
        },
        {
          heading: 'Results are for reflection',
          body: (
            <p>
              Results come from traditional methods and simplified astronomical formulas; some are approximate, and
              each tool says so where it matters. They are offered for reflection and practice, not as predictions,
              guarantees or a substitute for medical, psychological, financial or legal advice. See the{' '}
              <a href="/disclaimer" className="text-brand-cyan-soft hover:underline">Disclaimer</a>.
            </p>
          ),
        },
        {
          heading: 'Acceptable use',
          body: (
            <p>
              Please don’t try to disrupt the site, scrape it at scale, or misuse its content.
            </p>
          ),
        },
        {
          heading: 'Intellectual property',
          body: (
            <p>
              The VediCosmic name, logo, tool designs, illustrations and articles belong to VediCosmic or their
              respective owners. Traditional texts quoted on the site, such as mantras and verses, remain part of the
              shared tradition they come from.
            </p>
          ),
        },
        {
          heading: 'Limitation of liability',
          body: (
            <p>
              The site is provided as it is. To the fullest extent the law allows, VediCosmic is not liable for
              indirect or consequential loss arising from its use.
            </p>
          ),
        },
        {
          heading: 'Changes to these terms',
          body: (
            <p>
              We will update the date at the top when these terms change.
            </p>
          ),
        },
      ]}
    />
  );
}
