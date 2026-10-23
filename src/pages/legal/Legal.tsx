import { LEGAL } from '@/content/legal';
import NotFound from '@/pages/NotFound';
import { LegalLayout } from './LegalLayout';

/** Legal entity and grievance officer. Renders only once the owner's details exist. */
export default function Legal() {
  if (!LEGAL) return <NotFound />;
  const { entityName, registeredAddress, grievanceOfficer, responseTimes, refundPolicy } = LEGAL;
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Legal information and grievance officer"
      updated="23 October 2026"
      intro="Who runs VediCosmic, where to reach us, and how complaints are handled."
      sections={[
        { heading: 'Who runs VediCosmic', body: <><p>{entityName}</p><p>{registeredAddress}</p></> },
        {
          heading: 'Grievance officer',
          body: (
            <>
              <p>{grievanceOfficer.name}</p>
              <p><a href={`mailto:${grievanceOfficer.email}`} className="text-brand-cyan-soft hover:underline">{grievanceOfficer.email}</a></p>
              <p>{grievanceOfficer.phone}</p>
              <p>{responseTimes}</p>
            </>
          ),
        },
        { heading: 'Refunds', body: <p>{refundPolicy}</p> },
      ]}
    />
  );
}
