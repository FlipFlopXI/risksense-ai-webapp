import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: {
    default: 'RiskSense AI — Know your risk before it becomes your reality',
    template: '%s — RiskSense AI',
  },
  description:
    'RiskSense AI turns patient health information into decision-support risk estimates for heart disease and diabetes, reviewed with a connected clinician. Walk the district to see how it works.',
  keywords: [
    'RiskSense AI',
    'health risk analysis',
    'heart disease risk',
    'diabetes risk',
    'clinical decision support',
    'zero trust healthcare',
  ],
  openGraph: {
    title: 'RiskSense AI — Know your risk before it becomes your reality',
    description:
      'Decision-support risk estimates for heart disease and diabetes, connected to your clinician. Enter the RiskSense District.',
    type: 'website',
  },
  applicationName: 'RiskSense AI',
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#08070a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
