import React from 'react';
import { Link } from 'react-router-dom';
import { LegalSection, LegalShell, OperatorBlock } from '../components/legal/LegalShell';

export const TermsPage: React.FC = () => (
  <LegalShell path="/terms" title="Terms of Service" intro="The rules for using QADAM Hub. By using the site you agree to them.">
    <OperatorBlock />

    <LegalSection title="The service">
      <p>
        QADAM Hub helps learners find internships, hackathons and grants, prepare applications and track them, and
        gives their institution staff a view of cohort progress. Learners join through an invite code from their
        institution, and individual students can also create a free profile without an institution during the beta.
        Some features are early versions and may change.
      </p>
    </LegalSection>

    <LegalSection title="Accounts">
      <ul className="list-disc pl-5 space-y-1">
        <li>Sign in with your own email address and keep access to it private.</li>
        <li>Enter true information about yourself. Your institution may remove you from its cohort.</li>
        <li>Staff accounts are created for institutions by the QADAM Hub team.</li>
      </ul>
    </LegalSection>

    <LegalSection title="Opportunity listings">
      <p>
        Listings are collected from public organizer pages and checked for a stated deadline, but organizers can change
        or close them at any time. Always confirm details and deadlines on the official page before you apply. QADAM Hub
        does not run these programs and cannot guarantee acceptance.
      </p>
    </LegalSection>

    <LegalSection title="Acceptable use">
      <ul className="list-disc pl-5 space-y-1">
        <li>Do not try to disrupt, overload, scan or gain unauthorised access to the site, its database or its API.</li>
        <li>Do not read or change other users' data, or send automated requests faster than normal use.</li>
        <li>Do not post unlawful, abusive or misleading content, or other people's personal data, in the network or forms.</li>
      </ul>
      <p>We may limit or block access to protect the service and its users.</p>
    </LegalSection>

    <LegalSection title="Your content">
      <p>
        You keep the rights to what you write, such as your profile, CV text and messages. You let us store and show it
        only as needed to run the features you use, as described in the{' '}
        <Link to="/privacy" className="text-emerald-700 font-semibold hover:underline">Privacy Policy</Link>.
      </p>
    </LegalSection>

    <LegalSection title="Intellectual property">
      <p>
        The QADAM Hub name, logo, design and original code belong to their owners. Third-party names and marks belong to
        their owners and do not mean those organizations endorse QADAM Hub.
      </p>
    </LegalSection>

    <LegalSection title="Paid plans">
      <p>
        There are no payments on this site. Institutions that subscribe after a pilot do so under a separate agreement and
        invoice. See{' '}
        <Link to="/refund" className="text-emerald-700 font-semibold hover:underline">Refunds</Link>.
      </p>
    </LegalSection>

    <LegalSection title="No warranty and liability">
      <p>
        The service is provided as is, without warranties of any kind. To the extent the law allows, we are not liable for
        losses from using the site, from missed deadlines or from decisions made on the basis of a listing.
      </p>
    </LegalSection>

    <LegalSection title="Governing law">
      <p>
        These terms are governed by the laws of the country where the operator named on this page is established,
        without limiting the mandatory consumer rights you have where you live.
      </p>
    </LegalSection>

    <LegalSection title="Changes">
      <p>We may update these terms. The date at the top shows the current version.</p>
    </LegalSection>
  </LegalShell>
);

export default TermsPage;
