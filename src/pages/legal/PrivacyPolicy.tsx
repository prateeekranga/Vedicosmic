import { LegalLayout } from './LegalLayout';

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      updated="8 July 2026"
      intro="Your trust matters to us. This policy explains what information VediCosmic collects, why, and the choices you have — in plain language, not legalese."
      sections={[
        {
          heading: 'Information We Collect',
          body: (
            <>
              <p>
                Every interactive tool on VediCosmic — numerology, astrology, biorhythm, planetary hours and the
                rest — runs its calculations entirely in your browser. The name, birth date or numbers you enter
                into a tool are never sent to our servers; they exist only on your device for the duration of
                your session.
              </p>
              <p>
                If you choose to create a free account, we store your display name and email address, plus
                whatever you explicitly save — readings, journal entries, your crystal kit, and your mantra
                streak. This account data is currently kept in your browser's local storage rather than a remote
                database, so it stays on the device you created it on.
              </p>
              <p>
                If you contact us through the Contact page, we receive the name, email address, subject and
                message you submit, solely to respond to your enquiry.
              </p>
            </>
          ),
        },
        {
          heading: 'How We Use Information',
          body: (
            <p>
              We use account information to let you save and revisit your readings, track streaks, and manage
              course enrolment. We use contact-form submissions only to reply to you. We do not sell, rent, or
              share your personal information with third parties for marketing purposes.
            </p>
          ),
        },
        {
          heading: 'Cookies & Local Storage',
          body: (
            <p>
              VediCosmic uses your browser's local storage to remember preferences (such as whether ambient
              sound is enabled) and, where applicable, your saved account data. We do not use third-party
              advertising or tracking cookies. Clearing your browser's site data will remove this information.
            </p>
          ),
        },
        {
          heading: 'Payments',
          body: (
            <p>
              Paid course enrolment is processed through a third-party payment provider. VediCosmic does not
              store your card or bank details — payment information is handled directly by that provider under
              its own privacy and security practices.
            </p>
          ),
        },
        {
          heading: 'Your Rights',
          body: (
            <p>
              You may access, update, or delete your account and its saved data at any time from within the
              product, or by clearing your browser storage. To request assistance with data access or deletion,
              write to us at{' '}
              <a href="mailto:hello@vedicosmic.com" className="text-brand-cyan-soft hover:underline">
                hello@vedicosmic.com
              </a>.
            </p>
          ),
        },
        {
          heading: "Children's Privacy",
          body: (
            <p>
              VediCosmic is intended for users aged 16 and older. We do not knowingly collect personal
              information from children.
            </p>
          ),
        },
        {
          heading: 'Changes to This Policy',
          body: (
            <p>
              We may update this policy as the product evolves. Material changes will be reflected by updating
              the "Last updated" date above. Continued use of VediCosmic after a change constitutes acceptance
              of the revised policy.
            </p>
          ),
        },
        {
          heading: 'Contact Us',
          body: (
            <p>
              Questions about this policy or your data can be sent to{' '}
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
