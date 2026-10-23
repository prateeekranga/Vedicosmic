import { LegalLayout } from './LegalLayout';

// Draft for lawyer review. Describes the site as it works today: no accounts, no forms,
// no analytics, no advertising. Update this page before any of that changes.
export default function PrivacyPolicy() {
  return (
    <LegalLayout
      eyebrow="Privacy"
      title="Privacy Policy"
      updated="23 October 2026"
      intro="What VediCosmic collects, what stays on your device, and which outside services your browser talks to — in plain language."
      sections={[
        {
          heading: 'What you type into a tool',
          body: (
            <p>
              Every tool runs its calculations in your browser. The name, birth date, time, place or numbers you
              enter are used on your device to compute the result and are not sent to us.
            </p>
          ),
        },
        {
          heading: 'What is kept on your device',
          body: (
            <>
              <p>
                Your practice streak, crystal kit and a few preferences (such as whether background sound is on) are
                kept in your browser’s local storage so they are still there next time. If you choose to save a reading or a journal reflection, we ask first, and it is kept in the
                same place. None of this leaves your device, and there are no accounts or passwords.
              </p>
              <p>
                You can see and delete everything saved, item by item or all at once, on the Daily Sādhana page.
                Clearing this site’s data in your browser also removes it.
              </p>
            </>
          ),
        },
        {
          heading: 'If you email us',
          body: (
            <p>
              If you write to hello@vedicosmic.com, we receive your email address and message and use them only to
              reply. We do not add you to any list.
            </p>
          ),
        },
        {
          heading: 'Outside services your browser contacts',
          body: (
            <>
              <p>
                <strong>Hosting.</strong> The site is hosted by Hostinger, whose servers keep standard request logs
                (such as IP address and browser type) to run and protect the service.
              </p>
              <p>
                <strong>Fonts.</strong> Typefaces are loaded from Google Fonts, so Google receives your IP address
                when the page loads.
              </p>
              <p>
                <strong>Blog articles.</strong> Some articles are loaded from our database at Supabase. No personal
                information is sent with that request.
              </p>
              <p>
                <strong>Video.</strong> The guided Kundalini video is embedded from YouTube’s privacy-enhanced
                domain (youtube-nocookie.com) and loads only when you choose the video option.
              </p>
            </>
          ),
        },
        {
          heading: 'No advertising, analytics or tracking cookies',
          body: (
            <p>
              VediCosmic shows no advertising, runs no analytics and sets no tracking cookies. If we add
              privacy-friendly analytics in future, this page will say so before it starts, and it will never
              include names, birth details or places.
            </p>
          ),
        },
        {
          heading: 'Children',
          body: (
            <p>
              VediCosmic is intended for people aged 16 and older.
            </p>
          ),
        },
        {
          heading: 'Changes and contact',
          body: (
            <p>
              We will update the date at the top when this policy changes. Questions about privacy can be sent to{' '}
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
