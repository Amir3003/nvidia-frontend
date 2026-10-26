import React from 'react';
import { LegalSection, LegalShell, OperatorBlock } from '../components/legal/LegalShell';
import { legal } from '../lib/legal';

export const RefundPage: React.FC = () => (
  <LegalShell path="/refund" title="Refunds" intro="How payments and refunds work at QADAM Hub.">
    <OperatorBlock />

    <LegalSection title="No payments on this site">
      <p>
        QADAM Hub does not take card payments. Learners use it for free through their institution, and pilots for
        institutions are free.
      </p>
    </LegalSection>

    <LegalSection title="Institution subscriptions">
      <p>
        After a pilot, an institution can subscribe under a written agreement and pays by invoice. Cancellation and any
        refund follow that agreement.
      </p>
    </LegalSection>

    <LegalSection title="Questions">
      <p>
        Write to{' '}
        <a href={`mailto:${legal.contactEmail}`} className="text-emerald-700 font-semibold hover:underline">
          {legal.contactEmail}
        </a>
        . If we ever start taking payments on the site, this page will be updated first.
      </p>
    </LegalSection>
  </LegalShell>
);

export default RefundPage;
