import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description:
    'How RiskSense AI handles patient information: what the website touches, what stays in the mobile application, and what is never stored.',
};

export default function PrivacyPage() {
  return (
    <LegalPage
      kicker="Privacy notice"
      title="What this website touches, and what it never does."
      standfirst="The RiskSense website provides public information and submits patient access requests to the FastAPI backend. It does not activate access by itself."
      updated="17 September 2026"
      sections={[
        {
          heading: 'The short version',
          list: [
            'Health data — vitals, laboratory values, risk analyses and prediction history — lives in the mobile application and the backend, not on this website.',
            'The website does not request card numbers or CVV. No real payment is processed.',
            'Insurance member details are submitted to the backend and are not repeated on the review screen.',
            'The public pages do not require an account and do not ask for health information.',
          ],
        },
        {
          heading: 'Information handled during access activation',
          paragraphs: [
            'The mobile app can obtain a one-time activation link from FastAPI. The website exchanges its short-lived token and removes it from the displayed URL. Direct visitors may sign in to initiate the same flow. No patient database ID is placed in the URL.',
            'To complete activation the website handles your chosen access method, the insurance provider and membership details you supply if you choose that route, and the RiskSense Clinician ID you enter. These are passed to the RiskSense backend, which is the authoritative record.',
          ],
        },
        {
          heading: 'Payment information',
          paragraphs: [
            'In configured demo mode, FastAPI activates a demonstration subscription without a real transaction. This website does not request card details.',
          ],
        },
        {
          heading: 'Insurance information',
          paragraphs: [
            'If you activate through insurance, RiskSense handles the provider you select and the policy or membership details required to confirm eligibility. Verification is simulated in this prototype until a real insurer integration exists.',
            'The public insurer list never exposes member information. Selecting an insurer on the landing page only explains how eligibility is confirmed during registration.',
          ],
        },
        {
          heading: 'Clinician relationships',
          paragraphs: [
            'The Clinician ID you supply is verified against approved clinicians by the backend. On success you are shown only the minimum clinician detail needed to confirm you have the right person. An invalid or unapproved identifier creates no relationship at all.',
            'What a connected clinician can see is governed by role-based access control on the backend, not by anything on this website.',
          ],
        },
        {
          heading: 'Security',
          list: [
            'Zero-trust principles: every protected request is authenticated and authorised at the backend regardless of where it came from.',
            'Role-based access control separating patient, clinician and administrator permissions.',
            'Secure authenticated sessions with backend authorisation.',
            'A short-lived, activation-only credential is held in this browser tab session so a refresh can resume the flow. It cannot authorize health-record APIs.',
            'Audit logging for sensitive system activity.',
            'Infrastructure secrets, database configuration and internal security keys are never exposed on the public website.',
          ],
        },
        {
          heading: 'The interactive district',
          paragraphs: [
            'The 3D district at /world runs entirely in your browser. It reads no health information, requires no account, and sends nothing anywhere. Your progress through it is held in memory for the length of your visit and then discarded.',
          ],
        },
        {
          heading: 'Contacting support',
          paragraphs: [
            'The contact action opens your own email application with a subject already filled in. It does not attach or transmit any patient or medical information, and RiskSense will never ask you to include health details, identifiers or test results in a support email.',
          ],
        },
        {
          heading: 'Prototype status',
          paragraphs: [
            'This deployment is an academic prototype. Insurers shown are demonstration data and do not represent commercial partnerships. Treat this notice as a description of the intended design rather than of a live production service.',
          ],
        },
      ]}
    />
  );
}
