import type { Metadata } from 'next';
import { RegisterFlow } from '@/components/register/RegisterFlow';

export const metadata: Metadata = {
  title: 'Complete your access setup',
  description:
    'Sign in, select a demo subscription or simulated insurance route, verify a clinician, and submit a RiskSense access request.',
  robots: { index: false, follow: false },
};

export default function RegisterCompletePage() {
  return <RegisterFlow />;
}
