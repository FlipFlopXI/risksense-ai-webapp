import type { Metadata } from 'next';
import { RegisterFlow } from '@/components/register/RegisterFlow';

export const metadata: Metadata = {
  title: 'Complete your access setup',
  description:
    'Verify your account, activate access with a clinician, and return to the mobile app for onboarding.',
  robots: { index: false, follow: false },
};

export default function RegisterCompletePage() {
  return <RegisterFlow />;
}
