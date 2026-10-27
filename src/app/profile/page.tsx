import type { Metadata } from 'next';
import { WebsiteProfile } from '@/components/profile/WebsiteProfile';

export const metadata: Metadata = {
  title: 'Profile',
  description: 'View and sign out of your RiskSense website activation session.',
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return <WebsiteProfile />;
}
