import { LegalLayout } from './LegalLayout';

export default function TermsOfService() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms & Conditions"
      updated="8 July 2026"
      intro="These terms govern your use of VediCosmic's tools, courses and content. By using the site, you agree to them."
      sections={[
        {
          heading: 'Using VediCosmic',
          body: (
            <p>
              VediCosmic provides interactive numerology, astrology and energy-practice tools, along with paid
              and free educational courses. You may use the free tools without an account. Creating an account
              requires that the information you provide (name, email) be accurate and kept up to date.
            </p>
          ),
        },
        {
          heading: 'Accounts & Security',
          body: (
            <p>
              You are responsible for maintaining the confidentiality of your account and for all activity that
              occurs under it. Notify us immediately at{' '}
              <a href="mailto:hello@vedicosmic.com" className="text-brand-cyan-soft hover:underline">
                hello@vedicosmic.com
              </a>{' '}
              if you suspect unauthorised access.
            </p>
          ),
        },
        {
          heading: 'Courses & Payments',
          body: (
            <p>
              Paid courses are licensed to you for personal, non-commercial learning use upon successful
              payment. Course pricing, content and availability may change over time. Enrolment does not
              transfer ownership of course materials — redistribution, resale or public re-upload of course
              content is not permitted.
            </p>
          ),
        },
        {
          heading: 'Acceptable Use',
          body: (
            <p>
              You agree not to misuse the platform: no attempting to disrupt or reverse-engineer the tools, no
              scraping content at scale, no uploading unlawful or infringing material, and no impersonating
              another person when creating an account.
            </p>
          ),
        },
        {
          heading: 'Intellectual Property',
          body: (
            <p>
              The VediCosmic name, logo, tool designs, illustrations and course content are the property of
              VediCosmic or its instructors and licensors. Nothing in these terms grants you rights to our
              trademarks or brand assets beyond fair, descriptive use.
            </p>
          ),
        },
        {
          heading: 'Disclaimer of Warranties',
          body: (
            <p>
              VediCosmic's tools and courses are offered for reflection, education and self-inquiry. They are
              provided "as is," without warranties of any kind, and are not a substitute for professional
              medical, psychological, financial or legal advice. See our{' '}
              <a href="/disclaimer" className="text-brand-cyan-soft hover:underline">Disclaimer</a> for more detail.
            </p>
          ),
        },
        {
          heading: 'Limitation of Liability',
          body: (
            <p>
              To the fullest extent permitted by law, VediCosmic and its team are not liable for any indirect,
              incidental, or consequential damages arising from your use of the platform.
            </p>
          ),
        },
        {
          heading: 'Changes to These Terms',
          body: (
            <p>
              We may revise these terms from time to time. We will update the "Last updated" date above when we
              do; continued use after a revision means you accept the updated terms.
            </p>
          ),
        },
      ]}
    />
  );
}
